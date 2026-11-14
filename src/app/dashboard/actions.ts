'use server';

import { and, count, eq, gt } from 'drizzle-orm';
import { z } from 'zod';
import { letters, resumes } from '@/db/schema';
import { generateOptions, hasPaidFeatures } from '@/lib/access';
import { getDb, getEnv } from '@/lib/cf';
import { checkEntitlement, consumeEntitlement } from '@/lib/entitlements';
import { generateLetter } from '@/lib/llm';
import { canPickModel, resolveModelKey } from '@/lib/model-access';
import { LANGUAGE_CODES } from '@/lib/languages';
import { LENGTHS, TONES, buildPrompt, parseModelOutput } from '@/lib/prompt';
import { requireUser } from '@/lib/user';

export type GenerateResult =
	| { ok: true; letterId: string }
	| { ok: false; error: string; code?: 'no_credits' | 'rate_limit' | 'pro_cap' };

const emptyToUndefined = (v: unknown) =>
	typeof v === 'string' && v.trim() === '' ? undefined : v;

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
	resumeId: z.preprocess(emptyToUndefined, z.string().max(100).optional()),
	// A missing or unknown language falls back to English.
	language: z.enum(LANGUAGE_CODES).catch('en'),
});

const MESSAGES = {
	rate_limit:
		'You made many letters in the last hour. Wait a few minutes and try again.',
	no_credits: 'You have no letters left. Buy letters or go Pro to keep going.',
	pro_cap:
		'You reached the monthly limit of 200 letters on Pro. Buy letters or wait for the next period.',
} as const;

export async function generateLetterAction(
	formData: FormData,
): Promise<GenerateResult> {
	const user = await requireUser();
	const db = getDb();
	const env = getEnv();

	// Resume text comes from the database when a saved resume is chosen.
	const rawResumeId = formData.get('resumeId');
	let resumeId: string | null = null;
	let resumeText = String(formData.get('resumeText') ?? '');
	if (typeof rawResumeId === 'string' && rawResumeId.trim() !== '') {
		const saved = await db.query.resumes.findFirst({
			where: and(eq(resumes.id, rawResumeId), eq(resumes.userId, user.id)),
		});
		if (!saved) return { ok: false, error: 'We could not find that resume.' };
		resumeId = saved.id;
		resumeText = saved.text;
	}

	const parsed = inputSchema.safeParse({
		resumeText,
		jobDescription: formData.get('jobDescription') ?? '',
		tone: formData.get('tone'),
		length: formData.get('length'),
		language: formData.get('language') ?? undefined,
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
	const [{ n }] = await db
		.select({ n: count() })
		.from(letters)
		.where(
			and(
				eq(letters.userId, user.id),
				gt(letters.createdAt, new Date(now.getTime() - 60 * 60 * 1000)),
			),
		);

	const check = checkEntitlement(user, now, n);
	if (!check.ok) {
		return { ok: false, error: MESSAGES[check.reason], code: check.reason };
	}

	// Free users always get Professional and Standard, whatever the form sent.
	const { tone, length } = generateOptions(
		hasPaidFeatures(user, now),
		input.tone as (typeof TONES)[number],
		input.length as (typeof LENGTHS)[number],
	);

	const prompt = buildPrompt({
		resumeText: input.resumeText,
		jobDescription: input.jobDescription,
		tone,
		length,
		language: input.language,
	});

	let result;
	try {
		// Only allowed users may choose. Everyone else gets Sonnet.
		const modelKey = resolveModelKey(
			formData.get('model'),
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
	});

	return { ok: true, letterId };
}

