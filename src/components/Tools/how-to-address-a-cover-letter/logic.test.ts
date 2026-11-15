import { describe, expect, it } from 'vitest';
import { AVOID, KNOWN, PRONOUN_ADVICE, greetings, type GreetingInput } from './logic';

const empty: GreetingInput = { fullName: '', title: 'Ms.', lastName: '', jobTitle: '', team: '', company: '' };
const full: GreetingInput = {
	fullName: 'Jordan Smith',
	title: 'Dr.',
	lastName: 'Smith',
	jobTitle: 'Marketing Manager',
	team: 'Marketing',
	company: 'Northwind',
};

describe('how to address a cover letter', () => {
	it('gives a recommended greeting and 2 or 3 other options for every case', () => {
		for (const k of KNOWN) {
			for (const input of [empty, full]) {
				const r = greetings(k.value, input);
				expect(r.recommended.text.endsWith(',')).toBe(true);
				expect(r.others.length).toBeGreaterThanOrEqual(2);
				expect(r.others.length).toBeLessThanOrEqual(3);
				expect(r.tips.length).toBeGreaterThan(0);
			}
		}
	});

	it('uses what the user knows', () => {
		expect(greetings('full', full).recommended.text).toBe('Dear Jordan Smith,');
		expect(greetings('title-last', full).recommended.text).toBe('Dear Dr. Smith,');
		expect(greetings('job-title', full).recommended.text).toBe('Dear Marketing Manager,');
		expect(greetings('team', full).recommended.text).toBe('Dear Marketing Hiring Team,');
		expect(greetings('nothing', full).recommended.text).toBe('Dear Northwind Hiring Team,');
	});

	it('keeps empty answers as placeholders', () => {
		expect(greetings('full', empty).recommended.text).toBe('Dear [Full Name],');
		expect(greetings('full', empty).others[1].text).toBe('Hi [First Name],');
		expect(greetings('title-last', empty).recommended.text).toBe('Dear Ms. [Last Name],');
		expect(greetings('nothing', empty).recommended.text).toBe('Dear [Company] Hiring Team,');
	});

	it('uses the first name for the casual greeting', () => {
		expect(greetings('full', { ...full, fullName: '  Jordan   Smith ' }).others[1].text).toBe('Hi Jordan,');
	});

	it('lists the greetings to avoid with a reason', () => {
		const texts = AVOID.map((a) => a.text);
		expect(texts).toContain('To Whom It May Concern,');
		expect(texts).toContain('Dear Sir or Madam,');
		for (const a of AVOID) expect(a.reason.length).toBeGreaterThan(10);
		expect(greetings('nothing', full).avoid).toHaveLength(AVOID.length);
	});

	it('never recommends a greeting that it says to avoid', () => {
		for (const k of KNOWN) {
			const r = greetings(k.value, full);
			const good = [r.recommended.text, ...r.others.map((o) => o.text)];
			for (const a of AVOID) expect(good).not.toContain(a.text);
		}
	});

	it('gives the full name advice for unknown pronouns', () => {
		expect(PRONOUN_ADVICE).toContain('Dear Jordan Smith,');
		expect(greetings('full', full).tips).toContain(PRONOUN_ADVICE);
	});

	it('has no em dash or en dash in any output', () => {
		const all: string[] = [PRONOUN_ADVICE];
		for (const k of KNOWN) {
			for (const input of [empty, full]) {
				const r = greetings(k.value, input);
				all.push(r.recommended.text, r.recommended.note, ...r.others.flatMap((o) => [o.text, o.note]), ...r.tips);
				all.push(...r.avoid.flatMap((a) => [a.text, a.reason]));
			}
		}
		for (const s of all) expect(s).not.toMatch(/[—–]/);
	});
});
