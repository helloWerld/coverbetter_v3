import 'server-only';
import { and, count, eq, gt } from 'drizzle-orm';
import { z } from 'zod';
import { aiCalls, fitChecks, letters, resumes, type User } from '@/db/schema';
import { generateOptions, hasPaidFeatures } from '@/lib/access';
import { getDb, getEnv } from '@/lib/cf';
import { checkEntitlement, consumeEntitlement } from '@/lib/entitlements';
import { generateLetter } from '@/lib/llm';
import { canPickModel, resolveModelKey } from '@/lib/model-access';
import { LANGUAGE_CODES } from '@/lib/languages';
import { LENGTHS, TONES, buildPrompt, parseModelOutput } from '@/lib/prompt';
import { serializeFit, type FitResult } from '@/lib/fit';
import { createApplication, getApplication, linkToApplication } from '@/lib/applications/db';

export type GenerateErrorCode = 'no_credits' | 'rate_limit' | 'pro_cap';

export type GenerateOutcome =
	| {
			ok: true;
			letterId: string;
			applicationId: string;
			jobTitle: string;
			company: string;
			body: string;
			/** Null for free letters, and when the model's fit block was not valid. */
			fit: FitResult | null;
	  }
	| { ok: false; error: string; code?: GenerateErrorCode };

/** Raw input from the dashboard form or the Chrome extension. */
export interface GenerateRequest {
	resumeId?: unknown;
	resumeText?: unknown;
	jobDescription?: unknown;
	tone?: unknown;
	length?: unknown;
	language?: unknown;
	model?: unknown;
	/** Links the letter to this application. Without it, a new application is made. */
	applicationId?: unknown;
}

const inputSchema = z.object({
	resumeText: z
		.string()
		.trim()
		.min(50, 'Your resume text is too short. Paste at least 50 characters.')
		.max(30000, 'Your resume text is too long. The limit is 30,000 characters.'),
	jobDescription: z
		.string()
		.trim()
		.min(50, 'The job description is too short. Paste at least 50 characters.')
		.max(20000, 'The job description is too long. The limit is 20,000 characters.'),
	tone: z.enum(TONES as unknown as [string, ...string[]]),
	length: z.enum(LENGTHS as unknown as [string, ...string[]]),
	// A missing or unknown language falls back to English.
	language: z.enum(LANGUAGE_CODES).catch('en'),
});

const MESSAGES = {
	rate_limit:
		'You made many letters in the last hour. Wait a few minutes and try again.',
	no_credits: 'You have no credits left. Buy credits or go Pro to keep going.',
	pro_cap:
		'You reached the monthly limit of 200 credits on Pro. Buy credits or wait for the next period.',
} as const;

/** Checks the input and the user's credits, writes the letter, and saves it. */
export async function generateForUser(
	user: User,
	req: GenerateRequest,
): Promise<GenerateOutcome> {
	const db = getDb();
	const env = getEnv();

	// Resume text comes from the database when a saved resume is chosen.
	let resumeId: string | null = null;
	let resumeText = typeof req.resumeText === 'string' ? req.resumeText : '';
	if (typeof req.resumeId === 'string' && req.resumeId.trim() !== '') {
		const saved = await db.query.resumes.findFirst({
			where: and(eq(resumes.id, req.resumeId.slice(0, 100)), eq(resumes.userId, user.id)),
		});
		if (!saved) return { ok: false, error: 'We could not find that resume.' };
		resumeId = saved.id;
		resumeText = saved.text;
	}

	const parsed = inputSchema.safeParse({
		resumeText,
		jobDescription: typeof req.jobDescription === 'string' ? req.jobDescription : '',
		tone: req.tone,
		length: req.length,
		language: req.language ?? undefined,
	});
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check your input.' };
	}
	const input = parsed.data;

	// Burst guard. The binding does not exist in some local runs.
	if (env.GENERATE_LIMITER) {
		const { success } = await env.GENERATE_LIMITER.limit({ key: user.id });
		if (!success) return { ok: false, error: MESSAGES.rate_limit, code: 'rate_limit' };
	}

	const now = new Date();
	const n = await usesInLastHour(user.id, now);

	const check = checkEntitlement(user, now, n);
	if (!check.ok) {
		return { ok: false, error: MESSAGES[check.reason], code: check.reason };
	}

	// Free users always get Professional and Standard, whatever the form sent.
	// The Job Fit Score is also a paid feature.
	const paid = hasPaidFeatures(user, now);
	const { tone, length } = generateOptions(
		paid,
		input.tone as (typeof TONES)[number],
		input.length as (typeof LENGTHS)[number],
	);

	const prompt = buildPrompt({
		resumeText: input.resumeText,
		jobDescription: input.jobDescription,
		tone,
		length,
		language: input.language,
		fit: paid,
	});

	let result;
	try {
		// Only allowed users may choose. Everyone else gets Sonnet.
		const modelKey = resolveModelKey(
			req.model ?? null,
			canPickModel(user.email, env.MODEL_PICKER_EMAILS),
		);
		result = await generateLetter(env, prompt, modelKey);
	} catch (e) {
		console.error('generateLetter failed', e);
		// Nothing was consumed, so the user keeps the letter.
		return {
			ok: false,
			error: 'We could not write your letter right now. You were not charged. Try again.',
		};
	}

	const parsedOut = parseModelOutput(result.text);
	if (!parsedOut.body) {
		return {
			ok: false,
			error: 'The writer returned an empty letter. You were not charged. Try again.',
		};
	}

	const consumed = await consumeEntitlement(db, user.id, check.source, now);
	if (!consumed) {
		return { ok: false, error: MESSAGES.no_credits, code: 'no_credits' };
	}

	const app =
		typeof req.applicationId === 'string' && req.applicationId
			? await getApplication(user.id, req.applicationId)
			: null;

	const letterId = crypto.randomUUID();
	await db.insert(letters).values({
		id: letterId,
		userId: user.id,
		resumeId,
		jobTitle: parsedOut.jobTitle,
		company: parsedOut.company,
		jobDescription: input.jobDescription,
		tone,
		length,
		template: 'classic',
		language: input.language,
		body: parsedOut.body,
		model: result.model,
		fitScore: parsedOut.fit?.score ?? null,
		fitJson: parsedOut.fit ? serializeFit(parsedOut.fit) : null,
		applicationId: app?.id ?? null,
	});

	// Every letter belongs to an application, so the tracker sees it.
	let applicationId = app?.id ?? '';
	const fitLink = parsedOut.fit ? { fitScore: parsedOut.fit.score, fitJson: serializeFit(parsedOut.fit) } : {};
	try {
		if (app) {
			await linkToApplication(user.id, app.id, { letterId, ...(resumeId && !app.resumeId ? { resumeId } : {}), ...fitLink });
		} else {
			const created = await createApplication(
				user.id,
				{
					company: parsedOut.company,
					jobTitle: parsedOut.jobTitle,
					jobUrl: '',
					source: 'other',
					jobDescription: input.jobDescription,
					notes: '',
					contactName: '',
					contactEmail: '',
				},
				{ letterId, resumeId, fitScore: parsedOut.fit?.score ?? null, fitJson: fitLink.fitJson ?? null },
			);
			applicationId = created.id;
			await db.update(letters).set({ applicationId }).where(eq(letters.id, letterId));
		}
	} catch (e) {
		// The user paid for the letter. A tracker error must not lose it.
		console.error('could not link the letter to an application', e);
	}

	return {
		ok: true,
		letterId,
		applicationId,
		jobTitle: parsedOut.jobTitle,
		company: parsedOut.company,
		body: parsedOut.body,
		fit: parsedOut.fit,
	};
}

/** Letters, fit checks, and other AI calls in the last hour, for the hourly limit. */
export async function usesInLastHour(userId: string, now: Date): Promise<number> {
	const db = getDb();
	const since = new Date(now.getTime() - 60 * 60 * 1000);
	const [[l], [f], [c]] = await Promise.all([
		db
			.select({ n: count() })
			.from(letters)
			.where(and(eq(letters.userId, userId), gt(letters.createdAt, since))),
		db
			.select({ n: count() })
			.from(fitChecks)
			.where(and(eq(fitChecks.userId, userId), gt(fitChecks.createdAt, since))),
		db
			.select({ n: count() })
			.from(aiCalls)
			.where(and(eq(aiCalls.userId, userId), gt(aiCalls.createdAt, since))),
	]);
	return l.n + f.n + c.n;
}
