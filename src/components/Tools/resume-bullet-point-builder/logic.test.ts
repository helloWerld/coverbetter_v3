import { describe, expect, it } from 'vitest';
import { buildBullets, charCount, looksPastTense, type BulletInput } from './logic';

const full: BulletInput = {
	verb: 'reduced',
	what: 'invoice errors',
	result: 'less rework for the billing team',
	measure: '40% fewer corrections each month',
	how: 'adding a review checklist',
};

describe('buildBullets', () => {
	it('makes 3 versions with every part', () => {
		const v = buildBullets(full);
		expect(v).toHaveLength(3);
		expect(v[0].text).toBe(
			'Reduced invoice errors, resulting in less rework for the billing team, as measured by 40% fewer corrections each month, by adding a review checklist.',
		);
		expect(v[1].text).toBe(
			'Reduced invoice errors by adding a review checklist, resulting in less rework for the billing team (40% fewer corrections each month).',
		);
		expect(v[2].text).toBe(
			'Less rework for the billing team (40% fewer corrections each month): reduced invoice errors by adding a review checklist.',
		);
		for (const x of v) expect(x.text.endsWith('.')).toBe(true);
	});

	it('drops the optional parts cleanly', () => {
		const v = buildBullets({ ...full, measure: '', how: '' });
		expect(v[0].text).toBe('Reduced invoice errors, resulting in less rework for the billing team.');
		expect(v[1].text).toBe('Reduced invoice errors, resulting in less rework for the billing team.');
		expect(v[2].text).toBe('Less rework for the billing team: reduced invoice errors.');
	});

	it('keeps empty required parts as placeholders', () => {
		const v = buildBullets({ verb: '', what: '', result: '', measure: '', how: '' });
		expect(v[0].text).toBe('[Action Verb] [What You Did], resulting in [Result].');
		expect(v[2].text).toContain('[Result]');
	});

	it('cleans spaces, end marks, and a leading "by"', () => {
		const v = buildBullets({ ...full, verb: '  reduced ', how: 'by  adding a checklist.', what: 'invoice   errors;' });
		expect(v[1].text).toContain('Reduced invoice errors by adding a checklist,');
		expect(v[1].text).not.toContain('by by');
	});

	it('does not add a number the user did not give', () => {
		const v = buildBullets({ ...full, measure: '' });
		for (const x of v) expect(x.text).not.toMatch(/\d/);
	});

	it('has no em dash or en dash in any output', () => {
		for (const input of [full, { ...full, measure: '', how: '' }, { verb: '', what: '', result: '', measure: '', how: '' }]) {
			for (const x of buildBullets(input)) {
				expect(x.text).not.toMatch(/[\u2014\u2013]/);
				expect(x.label).not.toMatch(/[\u2014\u2013]/);
			}
		}
	});

	it('handles very long input', () => {
		const long = 'x'.repeat(5000);
		expect(buildBullets({ ...full, what: long })[0].text.length).toBeGreaterThan(5000);
	});
});

describe('helpers', () => {
	it('counts characters', () => {
		expect(charCount('')).toBe(0);
		expect(charCount('abc')).toBe(3);
		expect(charCount('a b')).toBe(3);
	});

	it('checks for past tense', () => {
		expect(looksPastTense('Reduced')).toBe(true);
		expect(looksPastTense('led')).toBe(true);
		expect(looksPastTense('lead')).toBe(false);
		expect(looksPastTense('')).toBe(true);
	});
});
