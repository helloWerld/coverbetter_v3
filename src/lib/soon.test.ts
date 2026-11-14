import { describe, expect, it } from 'vitest';
import { SOON_FEATURES, getSoonFeature, isValidEmail } from './soon';

describe('soon features', () => {
	it('lists the five planned features', () => {
		expect(SOON_FEATURES.map((f) => f.slug)).toEqual([
			'job-fit-score',
			'follow-up-letters',
			'chrome-extension',
			'multi-language',
			'analytics',
		]);
	});

	it('maps a slug to its feature name', () => {
		expect(getSoonFeature('job-fit-score')?.name).toBe('AI Job Fit Score');
		expect(getSoonFeature('analytics')?.name).toBe('Analytics');
	});

	it('no longer lists the ATS checker', () => {
		expect(getSoonFeature('ats-resume-checker')).toBeUndefined();
	});

	it('returns undefined for an unknown slug', () => {
		expect(getSoonFeature('nope')).toBeUndefined();
	});

	it('gives every feature a name and a one-line description', () => {
		for (const f of SOON_FEATURES) {
			expect(f.name.length).toBeGreaterThan(0);
			expect(f.description.length).toBeGreaterThan(10);
			expect(f.description).not.toMatch(/\n/);
		}
	});
});

describe('isValidEmail', () => {
	it('accepts a normal address', () => {
		expect(isValidEmail('a@b.co')).toBe(true);
	});
	it('rejects bad input', () => {
		expect(isValidEmail('')).toBe(false);
		expect(isValidEmail('a@b')).toBe(false);
		expect(isValidEmail('a b@c.com')).toBe(false);
		expect(isValidEmail('x'.repeat(250) + '@b.co')).toBe(false);
	});
});
