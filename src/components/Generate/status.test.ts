import { describe, expect, it } from 'vitest';
import { letterStatus } from './status';

const base = {
	plan: 'pro' as const,
	freeLettersUsed: 3,
	credits: 0,
	proLettersThisPeriod: 0,
	proPeriodEnd: new Date('2030-01-01'),
};

describe('letterStatus for Pro', () => {
	it('shows letters left this month', () => {
		const r = letterStatus({ ...base, proLettersThisPeriod: 12 });
		expect(r).toEqual({ text: 'Pro: 188 of 200 letters left this month', empty: false });
	});
	it('says the limit is reached at 200 with no paid letters', () => {
		expect(letterStatus({ ...base, proLettersThisPeriod: 200 }).empty).toBe(true);
	});
	it('never says unlimited', () => {
		expect(letterStatus(base).text.toLowerCase()).not.toContain('unlimited');
	});
});
