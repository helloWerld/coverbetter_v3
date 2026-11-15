import { describe, expect, it } from 'vitest';
import { ALL_VERBS, GROUPS, WEAK_PHRASES, filterVerbs, findWeakPhrases, suggestVerbs } from './logic';

describe('verb list', () => {
	it('has 300 or more unique verbs', () => {
		const unique = new Set(ALL_VERBS.map((v) => v.verb));
		expect(unique.size).toBe(ALL_VERBS.length);
		expect(unique.size).toBeGreaterThanOrEqual(300);
	});

	it('has the 11 groups, and each group has verbs', () => {
		expect(GROUPS).toHaveLength(11);
		for (const g of GROUPS) expect(g.verbs.length, g.id).toBeGreaterThanOrEqual(20);
	});

	it('keeps each verb as one plain lower case word', () => {
		for (const { verb } of ALL_VERBS) expect(verb).toMatch(/^[a-z]+$/);
	});

	it('has no dash character in the data', () => {
		const all = JSON.stringify([GROUPS, WEAK_PHRASES]);
		expect(all).not.toMatch(/[\u2014\u2013]/);
	});
});

describe('filterVerbs', () => {
	it('returns everything for an empty search and the all group', () => {
		expect(filterVerbs('', 'all')).toHaveLength(ALL_VERBS.length);
		expect(filterVerbs('   ', 'all')).toHaveLength(ALL_VERBS.length);
	});

	it('filters by search and by group', () => {
		expect(filterVerbs('LED', 'all').some((v) => v.verb === 'led')).toBe(true);
		expect(filterVerbs('', 'finance').every((v) => v.group === 'finance')).toBe(true);
		expect(filterVerbs('zzzz', 'all')).toEqual([]);
	});
});

describe('weak phrase finder', () => {
	it('flags weak openers and gives 3 to 5 suggestions', () => {
		const { lines, lineCount } = findWeakPhrases('- Helped the sales team close more deals\nIncreased revenue by 12%');
		expect(lineCount).toBe(2);
		expect(lines).toHaveLength(1);
		expect(lines[0].line).toBe('Helped the sales team close more deals');
		const f = lines[0].findings[0];
		expect(f.phrase).toBe('Helped');
		expect(f.atStart).toBe(true);
		expect(f.suggestions.length).toBeGreaterThanOrEqual(3);
		expect(f.suggestions.length).toBeLessThanOrEqual(5);
	});

	it('flags every phrase from the brief', () => {
		const lines = [
			'Helped with onboarding',
			'Worked on the billing page',
			'Responsible for the front desk',
			'Duties included filing',
			'Assisted with events',
			'Was involved in a product launch',
			'Tasked with a new report',
		];
		const { lines: found } = findWeakPhrases(lines.join('\n'));
		expect(found).toHaveLength(lines.length);
	});

	it('flags phrases in the middle of a line only when the phrase is not an opener word', () => {
		const mid = findWeakPhrases('Managed a team that was responsible for payroll');
		expect(mid.lines[0].findings[0].atStart).toBe(false);
		expect(findWeakPhrases('Led a team that helped clients save money').lines).toHaveLength(0);
	});

	it('prefers the longer phrase and does not flag a phrase twice', () => {
		const { lines } = findWeakPhrases('Helped with the audit');
		expect(lines[0].findings).toHaveLength(1);
		expect(lines[0].findings[0].phrase).toBe('Helped with');
	});

	it('handles empty text and text with no weak phrase', () => {
		expect(findWeakPhrases('')).toEqual({ lines: [], lineCount: 0 });
		expect(findWeakPhrases('\n\n  \n')).toEqual({ lines: [], lineCount: 0 });
		expect(findWeakPhrases('Built a reporting tool').lines).toEqual([]);
	});

	it('picks suggestions from the group that matches the line', () => {
		const s = suggestVerbs('Helped train new staff', ['improving']);
		const teaching = GROUPS.find((g) => g.id === 'teaching')?.verbs ?? [];
		expect(s.some((v) => teaching.includes(v))).toBe(true);
	});

	it('does not suggest a verb that the line already has', () => {
		expect(suggestVerbs('Worked on how we built the app', ['building'])).not.toContain('built');
	});

	it('handles a very long input', () => {
		const text = Array.from({ length: 2000 }, () => 'Responsible for reports').join('\n');
		expect(findWeakPhrases(text).lines).toHaveLength(2000);
	});
});
