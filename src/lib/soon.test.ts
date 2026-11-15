import { describe, expect, it } from 'vitest';
import { SOON_FEATURES, getSoonFeature, isValidEmail } from './soon';

describe('soon features', () => {
	it('lists the three planned features', () => {
		expect(SOON_FEATURES.map((f) => f.slug)).toEqual([
			'follow-up-letters',
			'chrome-extension',
			'analytics',
		]);
	});

	it('maps a slug to its feature name', () => {
		expect(getSoonFeature('analytics')?.name).toBe('Analytics');
	});

	it('no longer lists the ATS checker or the live Job Fit Score', () => {
		expect(getSoonFeature('ats-resume-checker')).toBeUndefined();
		expect(getSoonFeature('job-fit-score')).toBeUndefined();
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
