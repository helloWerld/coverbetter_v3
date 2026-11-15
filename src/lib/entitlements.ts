import { and, eq, gt, lt, sql } from 'drizzle-orm';
import { users } from '@/db/schema';
import type { Db } from '@/lib/cf';

export const FREE_LETTERS = 3;
export const PRO_MONTHLY_CAP = 200;
export const HOURLY_LIMIT = 10;

export type EntitlementSource = 'pro' | 'free' | 'credit';
export type EntitlementResult =
	| { ok: true; source: EntitlementSource }
	| { ok: false; reason: 'rate_limit' | 'no_credits' | 'pro_cap' };

type UserFields = {
	plan: 'free' | 'pro';
	freeLettersUsed: number;
	credits: number;
	proLettersThisPeriod: number;
	proPeriodEnd: Date | null;
};

export function checkEntitlement(
	user: UserFields,
	now: Date,
	lettersInLastHour: number,
): EntitlementResult {
	if (lettersInLastHour >= HOURLY_LIMIT) {
		return { ok: false, reason: 'rate_limit' };
	}
	const proActive =
		user.plan === 'pro' &&
		user.proPeriodEnd !== null &&
		user.proPeriodEnd.getTime() > now.getTime();
	if (proActive) {
		if (user.proLettersThisPeriod < PRO_MONTHLY_CAP) {
			return { ok: true, source: 'pro' };
		}
		if (user.credits > 0) return { ok: true, source: 'credit' };
		return { ok: false, reason: 'pro_cap' };
	}
	if (user.freeLettersUsed < FREE_LETTERS) return { ok: true, source: 'free' };
	if (user.credits > 0) return { ok: true, source: 'credit' };
	return { ok: false, reason: 'no_credits' };
}

/**
 * Spends one letter with a conditional UPDATE, so two parallel requests
 * cannot overspend. Returns true when a row changed.
 */
export async function consumeEntitlement(
	db: Db,
	userId: string,
	source: EntitlementSource,
	now: Date = new Date(),
): Promise<boolean> {
	const byId = eq(users.id, userId);
	let rows: { id: string }[];
	if (source === 'credit') {
		rows = await db
			.update(users)
			.set({ credits: sql`${users.credits} - 1` })
			.where(and(byId, gt(users.credits, 0)))
			.returning({ id: users.id });
	} else if (source === 'free') {
		rows = await db
			.update(users)
			.set({ freeLettersUsed: sql`${users.freeLettersUsed} + 1` })
			.where(and(byId, lt(users.freeLettersUsed, FREE_LETTERS)))
			.returning({ id: users.id });
	} else {
		rows = await db
			.update(users)
			.set({ proLettersThisPeriod: sql`${users.proLettersThisPeriod} + 1` })
			.where(
				and(
					byId,
					eq(users.plan, 'pro'),
					gt(users.proPeriodEnd, now),
					lt(users.proLettersThisPeriod, PRO_MONTHLY_CAP),
				),
			)
			.returning({ id: users.id });
	}
	return rows.length > 0;
}

/** How many letters the user can still write now, before the hourly limit. */
export function lettersLeft(user: UserFields, now: Date): number {
	const proActive =
		user.plan === 'pro' &&
		user.proPeriodEnd !== null &&
		user.proPeriodEnd.getTime() > now.getTime();
	const included = proActive
		? Math.max(0, PRO_MONTHLY_CAP - user.proLettersThisPeriod)
		: Math.max(0, FREE_LETTERS - user.freeLettersUsed);
	return included + Math.max(0, user.credits);
}
