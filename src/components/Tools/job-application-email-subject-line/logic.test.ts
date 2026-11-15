import { describe, expect, it } from 'vitest';
import { EMAIL_TYPES, LENGTH_GUIDELINE, buildSubjects, countChars, type SubjectInput } from './logic';

const empty: SubjectInput = { role: '', name: '', jobId: '', referrer: '' };
const full: SubjectInput = { role: 'Data Analyst', name: 'Sam Lee', jobId: 'R-1042', referrer: 'Ana Ruiz' };

describe('email subject lines', () => {
	it('gives 3 to 5 lines for every type, with and without a job ID', () => {
		for (const t of EMAIL_TYPES) {
			for (const input of [empty, full, { ...full, jobId: '' }, { ...full, referrer: '' }]) {
				const n = buildSubjects(t.value, input).length;
				expect(n).toBeGreaterThanOrEqual(3);
				expect(n).toBeLessThanOrEqual(5);
			}
		}
	});

	it('adds job ID lines only when a job ID is given', () => {
		const without = buildSubjects('application', { ...full, jobId: '' });
		const withId = buildSubjects('application', full);
		expect(without.some((s) => s.text.includes('R-1042'))).toBe(false);
		expect(withId.some((s) => s.text.includes('R-1042'))).toBe(true);
		expect(withId.length).toBeGreaterThan(without.length);
	});

	it('names the referrer in referral lines', () => {
		for (const s of buildSubjects('referral', full)) expect(s.text).toContain('Ana Ruiz');
		expect(buildSubjects('referral', empty)[0].text).toContain('[Referrer Name]');
	});

	it('keeps empty answers as placeholders', () => {
		expect(buildSubjects('application', empty)[0].text).toBe('Application for [Job Title]: [Your Name]');
	});

	it('counts characters and flags lines over the guideline', () => {
		const long = buildSubjects('application', { ...full, role: 'Senior Customer Success Operations Analyst', jobId: 'R-1042' });
		for (const s of long) {
			expect(s.length).toBe(s.text.length);
			expect(s.long).toBe(s.length > LENGTH_GUIDELINE);
		}
		expect(long.some((s) => s.long)).toBe(true);
		expect(buildSubjects('accept', { ...empty, role: 'QA', name: 'Al' }).every((s) => !s.long)).toBe(true);
	});

	it('counts an emoji as one character', () => {
		expect(countChars('')).toBe(0);
		expect(countChars('a\u{1F600}b')).toBe(3);
	});

	it('has no em dash or en dash in any output', () => {
		for (const t of EMAIL_TYPES) {
			for (const input of [empty, full]) for (const s of buildSubjects(t.value, input)) expect(s.text).not.toMatch(/[—–]/);
			expect(t.label + t.roleLabel).not.toMatch(/[—–]/);
		}
	});
});
