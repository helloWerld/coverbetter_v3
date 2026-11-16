import 'server-only';
import { aiCalls, type User } from '@/db/schema';
import { getDb, getEnv } from '@/lib/cf';
import { checkFitEntitlement, consumeEntitlement } from '@/lib/entitlements';
import { usesInLastHour } from '@/lib/generate';

export type PaidAiErrorCode = 'premium' | 'no_credits' | 'pro_cap' | 'rate_limit' | 'failed';
export type PaidAiResult<T> = { ok: true; value: T } | { ok: false; error: string; code: PaidAiErrorCode };

export const PAID_AI_MESSAGES: Record<Exclude<PaidAiErrorCode, 'failed'>, string> = {
	premium: 'This is a paid feature. Buy credits or go Pro to use it. Each AI action uses 1 credit.',
	no_credits: 'You have no credits left. Buy credits or go Pro to keep going.',
	pro_cap: 'You reached the monthly limit of 200 credits on Pro. Buy credits or wait for the next period.',
	rate_limit: 'You used many credits in the last hour. Wait a few minutes and try again.',
};

/**
 * Runs one paid AI action for 1 credit: a Pro credit first, then a bought credit, never a free letter.
 * The credit is used only when `run` succeeds. The call is logged for the hourly limit.
 */
export async function runPaidAi<T>(
	user: User,
	kind: string,
	run: () => Promise<{ ok: true; value: T } | { ok: false; error: string }>,
): Promise<PaidAiResult<T>> {
	const now = new Date();
	const check = checkFitEntitlement(user, now, await usesInLastHour(user.id, now));
	if (!check.ok) return { ok: false, error: PAID_AI_MESSAGES[check.reason], code: check.reason };

	const env = getEnv();
	if (env.GENERATE_LIMITER) {
		const { success } = await env.GENERATE_LIMITER.limit({ key: user.id });
		if (!success) return { ok: false, error: PAID_AI_MESSAGES.rate_limit, code: 'rate_limit' };
	}

	let out: { ok: true; value: T } | { ok: false; error: string };
	try {
		out = await run();
	} catch (e) {
		console.error(`paid AI action ${kind} failed`, e);
		return { ok: false, error: 'The AI could not finish right now. You were not charged. Try again.', code: 'failed' };
	}
	if (!out.ok) return { ok: false, error: out.error, code: 'failed' };

	const db = getDb();
	const consumed = await consumeEntitlement(db, user.id, check.source, now);
	if (!consumed) return { ok: false, error: PAID_AI_MESSAGES.no_credits, code: 'no_credits' };
	await db.insert(aiCalls).values({ id: crypto.randomUUID(), userId: user.id, kind });
	return { ok: true, value: out.value };
}
