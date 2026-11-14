import { describe, expect, it } from 'vitest';
import { generateOptions, hasPaidFeatures } from './access';

const now = new Date('2026-11-13T12:00:00Z');
const later = new Date('2026-12-13T12:00:00Z');
const earlier = new Date('2026-11-01T12:00:00Z');

const free = { plan: 'free' as const, proPeriodEnd: null, credits: 0 };

describe('hasPaidFeatures', () => {
	it('is false for a free user', () => {
		expect(hasPaidFeatures(free, now)).toBe(false);
	});
	it('is true for an active Pro plan', () => {
		expect(hasPaidFeatures({ ...free, plan: 'pro', proPeriodEnd: later }, now)).toBe(true);
	});
	it('is false for a Pro plan that ended', () => {
		expect(hasPaidFeatures({ ...free, plan: 'pro', proPeriodEnd: earlier }, now)).toBe(false);
	});
	it('is false for Pro with no period end yet', () => {
		expect(hasPaidFeatures({ ...free, plan: 'pro', proPeriodEnd: null }, now)).toBe(false);
	});
	it('is true with at least 1 paid letter left', () => {
		expect(hasPaidFeatures({ ...free, credits: 1 }, now)).toBe(true);
	});
});

describe('generateOptions', () => {
	it('keeps the chosen tone and length for a paid user', () => {
		expect(generateOptions(true, 'friendly', 'detailed')).toEqual({
			tone: 'friendly',
			length: 'detailed',
		});
	});
	it('uses Professional and Standard for a free user, whatever was sent', () => {
		expect(generateOptions(false, 'friendly', 'detailed')).toEqual({
			tone: 'professional',
			length: 'standard',
		});
	});
});
