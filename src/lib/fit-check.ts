import 'server-only';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { fitChecks, resumes, type FitCheck, type User } from '@/db/schema';
import { getDb, getEnv } from '@/lib/cf';
import { checkFitEntitlement, consumeEntitlement } from '@/lib/entitlements';
import { serializeFit, type FitResult } from '@/lib/fit';
import { usesInLastHour } from '@/lib/generate';
import { generateLetter } from '@/lib/llm';
import { buildFitPrompt, parseFitOutput } from '@/lib/prompt';

export type FitCheckErrorCode = 'premium' | 'no_credits' | 'pro_cap' | 'rate_limit';

export type FitCheckOutcome =
	| { ok: true; id: string; jobTitle: string; company: string; fit: FitResult }
	| { ok: false; error: string; code?: FitCheckErrorCode };

const MESSAGES: Record<FitCheckErrorCode, string> = {
	premium:
		'The Job Fit Score is a paid feature. Buy credits or go Pro to use it. Each check uses 1 credit.',
	no_credits: 'You have no credits left. Buy credits or go Pro to keep going.',
	pro_cap:
		'You reached the monthly limit of 200 credits on Pro. Buy credits or wait for the next period.',
	rate_limit: 'You used many credits in the last hour. Wait a few minutes and try again.',
};

const jobSchema = z
	.string()
	.trim()
	.min(50, 'The job description is too short. Paste at least 50 characters.')
	.max(20000, 'The job description is too long. The limit is 20,000 characters.');

/** Checks the fit of a saved resume against a job post. Uses 1 credit on success only. */
export async function runFitCheck(
	user: User,
	req: { resumeId?: unknown; jobDescription?: unknown },
): Promise<FitCheckOutcome> {
	const db = getDb();
	const env = getEnv();
	const now = new Date();

	// Check access first, so a free user learns about the paid feature before any other error.
	const check = checkFitEntitlement(user, now, await usesInLastHour(user.id, now));
	if (!check.ok) return { ok: false, error: MESSAGES[check.reason], code: check.reason };

	if (typeof req.resumeId !== 'string' || !req.resumeId) {
		return { ok: false, error: 'Pick a saved resume first.' };
	}
	const resume = await db.query.resumes.findFirst({
		where: and(eq(resumes.id, req.resumeId.slice(0, 100)), eq(resumes.userId, user.id)),
	});
	if (!resume) return { ok: false, error: 'We could not find that resume.' };

	const job = jobSchema.safeParse(typeof req.jobDescription === 'string' ? req.jobDescription : '');
	if (!job.success) return { ok: false, error: job.error.issues[0]?.message ?? 'Check your input.' };

	if (env.GENERATE_LIMITER) {
		const { success } = await env.GENERATE_LIMITER.limit({ key: user.id });
		if (!success) return { ok: false, error: MESSAGES.rate_limit, code: 'rate_limit' };
	}

	let result;
	try {
		result = await generateLetter(env, buildFitPrompt({ resumeText: resume.text, jobDescription: job.data }));
	} catch (e) {
		console.error('fit check failed', e);
		return { ok: false, error: 'We could not check the fit right now. You were not charged. Try again.' };
	}

	const parsed = parseFitOutput(result.text);
	if (!parsed.fit) {
		return { ok: false, error: 'The check did not return a valid result. You were not charged. Try again.' };
	}

	const consumed = await consumeEntitlement(db, user.id, check.source, now);
	if (!consumed) return { ok: false, error: MESSAGES.no_credits, code: 'no_credits' };

	const id = crypto.randomUUID();
	await db.insert(fitChecks).values({
		id,
		userId: user.id,
		resumeId: resume.id,
		jobTitle: parsed.jobTitle,
		company: parsed.company,
		jobDescription: job.data,
		fitScore: parsed.fit.score,
		fitJson: serializeFit(parsed.fit),
		model: result.model,
	});
	return { ok: true, id, jobTitle: parsed.jobTitle, company: parsed.company, fit: parsed.fit };
}

/** The user's fit checks, newest first. */
export async function listFitChecks(userId: string, limit = 20): Promise<FitCheck[]> {
	return getDb()
		.select()
		.from(fitChecks)
		.where(eq(fitChecks.userId, userId))
		.orderBy(desc(fitChecks.createdAt), desc(fitChecks.id))
		.limit(limit);
}
