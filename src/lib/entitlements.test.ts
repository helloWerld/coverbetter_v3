import { describe, expect, it } from 'vitest';
import {
	FREE_LETTERS,
	HOURLY_LIMIT,
	PRO_MONTHLY_CAP,
	checkEntitlement,
	lettersLeft,
} from './entitlements';

const now = new Date('2026-11-13T12:00:00Z');
const future = new Date('2026-12-01T00:00:00Z');
const past = new Date('2026-11-01T00:00:00Z');

const user = (o: Partial<Parameters<typeof checkEntitlement>[0]> = {}) => ({
	plan: 'free' as const,
	freeLettersUsed: 0,
	credits: 0,
	proLettersThisPeriod: 0,
	proPeriodEnd: null,
	...o,
});

describe('checkEntitlement', () => {
	it('exports the constants', () => {
		expect([FREE_LETTERS, PRO_MONTHLY_CAP, HOURLY_LIMIT]).toEqual([3, 200, 10]);
	});
	it('rate limits at 10 letters an hour, before anything else', () => {
		expect(checkEntitlement(user({ credits: 5 }), now, 10)).toEqual({
			ok: false,
			reason: 'rate_limit',
		});
		expect(
			checkEntitlement(user({ plan: 'pro', proPeriodEnd: future }), now, 11),
		).toEqual({ ok: false, reason: 'rate_limit' });
	});
	it('allows 9 letters in the last hour', () => {
		expect(checkEntitlement(user(), now, 9)).toEqual({ ok: true, source: 'free' });
	});
	it('uses pro under the cap', () => {
		expect(
			checkEntitlement(
				user({ plan: 'pro', proPeriodEnd: future, proLettersThisPeriod: 199 }),
				now,
				0,
			),
		).toEqual({ ok: true, source: 'pro' });
	});
	it('falls to credits at the pro cap', () => {
		expect(
			checkEntitlement(
				user({ plan: 'pro', proPeriodEnd: future, proLettersThisPeriod: 200, credits: 2 }),
				now,
				0,
			),
		).toEqual({ ok: true, source: 'credit' });
	});
	it('returns pro_cap at the cap with no credits', () => {
		expect(
			checkEntitlement(
				user({ plan: 'pro', proPeriodEnd: future, proLettersThisPeriod: 200 }),
				now,
				0,
			),
		).toEqual({ ok: false, reason: 'pro_cap' });
	});
	it('treats expired pro as free', () => {
		expect(
			checkEntitlement(user({ plan: 'pro', proPeriodEnd: past }), now, 0),
		).toEqual({ ok: true, source: 'free' });
		expect(
			checkEntitlement(user({ plan: 'pro', proPeriodEnd: null }), now, 0),
		).toEqual({ ok: true, source: 'free' });
	});
	it('uses free letters while fewer than 3 are used', () => {
		expect(checkEntitlement(user({ freeLettersUsed: 2, credits: 4 }), now, 0)).toEqual({
			ok: true,
			source: 'free',
		});
	});
	it('uses credits after the free letters', () => {
		expect(checkEntitlement(user({ freeLettersUsed: 3, credits: 1 }), now, 0)).toEqual({
			ok: true,
			source: 'credit',
		});
	});
	it('returns no_credits when nothing is left', () => {
		expect(checkEntitlement(user({ freeLettersUsed: 3 }), now, 0)).toEqual({
			ok: false,
			reason: 'no_credits',
		});
	});
});

describe('lettersLeft', () => {
	it('counts free letters and credits', () => {
		expect(lettersLeft(user(), now)).toBe(FREE_LETTERS);
		expect(lettersLeft(user({ freeLettersUsed: 2, credits: 4 }), now)).toBe(5);
		expect(lettersLeft(user({ freeLettersUsed: 9 }), now)).toBe(0);
	});

	it('counts the Pro allowance only while Pro is active', () => {
		const pro = { plan: 'pro' as const, proLettersThisPeriod: 10, credits: 1 };
		expect(lettersLeft(user({ ...pro, proPeriodEnd: future }), now)).toBe(PRO_MONTHLY_CAP - 10 + 1);
		expect(lettersLeft(user({ ...pro, proPeriodEnd: past, freeLettersUsed: 3 }), now)).toBe(1);
	});
});
