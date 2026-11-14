import { FREE_LETTERS, PRO_MONTHLY_CAP } from '@/lib/entitlements';

export type StatusUser = {
	plan: 'free' | 'pro';
	freeLettersUsed: number;
	credits: number;
	proLettersThisPeriod: number;
	proPeriodEnd: Date | null;
};

/** Text for the "what is left" line. `empty` is true when the user cannot generate. */
export function letterStatus(
	u: StatusUser,
	now: Date = new Date(),
): { text: string; empty: boolean } {
	const proActive =
		u.plan === 'pro' && u.proPeriodEnd !== null && u.proPeriodEnd > now;
	if (proActive) {
		if (u.proLettersThisPeriod >= PRO_MONTHLY_CAP && u.credits === 0) {
			return { text: 'Pro: monthly limit reached', empty: true };
		}
		const left = PRO_MONTHLY_CAP - u.proLettersThisPeriod;
		return {
			text: `Pro: ${left} of ${PRO_MONTHLY_CAP} credits left this month`,
			empty: false,
		};
	}
	const free = Math.max(0, FREE_LETTERS - u.freeLettersUsed);
	const parts: string[] = [];
	if (free > 0) parts.push(`${free} free ${free === 1 ? 'credit' : 'credits'} left`);
	if (u.credits > 0) parts.push(`${u.credits} paid ${u.credits === 1 ? 'credit' : 'credits'}`);
	if (parts.length === 0) return { text: 'No credits left', empty: true };
	return { text: parts.join(', '), empty: false };
}
