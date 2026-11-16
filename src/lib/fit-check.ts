import 'server-only';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { fitChecks, resumes, type FitCheck, type User } from '@/db/schema';
import { getDb, getEnv } from '@/lib/cf';
import { checkFitEntitlement, consumeEntitlement } from '@/lib/entitlements';
import { serializeFit, type FitResult } from '@/lib/fit';
import { getApplication, linkToApplication } from '@/lib/applications/db';
import { usesInLastHour } from '@/lib/generate';
import { generateLetter } from '@/lib/llm';
import { getProfile } from '@/lib/profile/db';
import { profileToText } from '@/lib/profile/render';
import { buildFitPrompt, parseFitOutput } from '@/lib/prompt';

/** The resume id that means "use the career profile". */
export const PROFILE_RESUME_ID = 'profile';

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

/**
 * Checks the fit of a saved resume (or the career profile) against a job post. Uses 1 credit on success only.
 * With `applicationId`, the job post comes from that application, and the score is saved on it.
 */
export async function runFitCheck(
	user: User,
	req: { resumeId?: unknown; jobDescription?: unknown; applicationId?: unknown },
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
	let resumeText: string;
	let resumeId: string | null = null;
	if (req.resumeId === PROFILE_RESUME_ID) {
		resumeText = profileToText(await getProfile(user.id));
		if (resumeText.trim().length < 50) {
			return { ok: false, error: 'Your career profile is almost empty. Add your jobs first, or pick a saved resume.' };
		}
	} else {
		const resume = await db.query.resumes.findFirst({
			where: and(eq(resumes.id, req.resumeId.slice(0, 100)), eq(resumes.userId, user.id)),
		});
		if (!resume) return { ok: false, error: 'We could not find that resume.' };
		resumeText = resume.text;
		resumeId = resume.id;
	}

	const app = typeof req.applicationId === 'string' && req.applicationId ? await getApplication(user.id, req.applicationId.slice(0, 100)) : null;
	if (typeof req.applicationId === 'string' && req.applicationId && !app) {
		return { ok: false, error: 'We could not find that application.' };
	}
	const job = jobSchema.safeParse(app ? app.jobDescription : typeof req.jobDescription === 'string' ? req.jobDescription : '');
	if (!job.success) {
		if (app) return { ok: false, error: 'This application has no full job post. Add the job post first.' };
		return { ok: false, error: job.error.issues[0]?.message ?? 'Check your input.' };
	}

	if (env.GENERATE_LIMITER) {
		const { success } = await env.GENERATE_LIMITER.limit({ key: user.id });
		if (!success) return { ok: false, error: MESSAGES.rate_limit, code: 'rate_limit' };
	}

	let result;
	try {
		result = await generateLetter(env, buildFitPrompt({ resumeText, jobDescription: job.data }));
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
	const jobTitle = parsed.jobTitle || app?.jobTitle || '';
	const company = parsed.company || app?.company || '';
	const fitJson = serializeFit(parsed.fit);
	await db.insert(fitChecks).values({
		id,
		userId: user.id,
		resumeId,
		jobTitle,
		company,
		jobDescription: job.data,
		fitScore: parsed.fit.score,
		fitJson,
		model: result.model,
	});
	if (app) await linkToApplication(user.id, app.id, { fitScore: parsed.fit.score, fitJson });
	return { ok: true, id, jobTitle, company, fit: parsed.fit };
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
