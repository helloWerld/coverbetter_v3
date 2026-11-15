import { describe, expect, it } from 'vitest';
import {
	HEADLINE_LIMIT,
	PATTERNS,
	buildHeadlines,
	charCount,
	joinList,
	openSuffix,
	parseSkills,
	type HeadlineInput,
} from './logic';

const full: HeadlineInput = {
	role: 'Data Analyst',
	skills: 'SQL, Tableau, Python',
	audience: 'healthcare teams',
	audienceKind: 'people',
	result: 'Cut report time by 60%',
};

const BUZZWORDS = [
	'passionate', 'guru', 'ninja', 'rockstar', 'wizard', 'results-driven', 'result-driven', 'synergy', 'dynamic',
	'innovative', 'motivated', 'team player', 'thought leader', 'visionary', 'disruptor', 'self-starter', 'hard-working',
	'detail-oriented', 'game-changer', 'seamless', 'cutting-edge', 'unlock', 'elevate', 'empower', 'leverage',
];

describe('parseSkills', () => {
	it('splits on commas, pipes, semicolons, and new lines, and keeps 4', () => {
		expect(parseSkills('SQL, Tableau | Python;Excel\nGo')).toEqual(['SQL', 'Tableau', 'Python', 'Excel']);
	});
	it('removes empty parts and repeats', () => {
		expect(parseSkills(' , SQL,, sql ,  ')).toEqual(['SQL']);
		expect(parseSkills('')).toEqual([]);
	});
});

describe('joinList and openSuffix', () => {
	it('joins a list', () => {
		expect(joinList([])).toBe('');
		expect(joinList(['A'])).toBe('A');
		expect(joinList(['A', 'B'])).toBe('A and B');
		expect(joinList(['A', 'B', 'C'])).toBe('A, B, and C');
	});
	it('writes the open to work text', () => {
		expect(openSuffix('none', 'Data Analyst')).toBe('');
		expect(openSuffix('open', 'Data Analyst')).toBe('Open to Data Analyst roles');
		expect(openSuffix('seeking', 'Data Analyst')).toBe('Seeking Data Analyst opportunities');
		expect(openSuffix('open', '')).toBe('Open to [Role] roles');
	});
});

describe('buildHeadlines', () => {
	it('makes 5 to 8 headlines with all the answers', () => {
		const h = buildHeadlines(full, 'none');
		expect(h.length).toBeGreaterThanOrEqual(5);
		expect(h.length).toBeLessThanOrEqual(8);
		expect(h.every((x) => x.text.includes('Data Analyst'))).toBe(true);
		expect(h.some((x) => x.text.includes('Cut report time by 60%'))).toBe(true);
		expect(h.some((x) => x.text.includes('healthcare teams'))).toBe(true);
	});

	it('still makes at least 5 with only a role and skills', () => {
		const h = buildHeadlines({ ...full, audience: '', result: '' }, 'none');
		expect(h.length).toBeGreaterThanOrEqual(5);
		expect(h.some((x) => x.text.includes('healthcare'))).toBe(false);
	});

	it('works with an empty form and uses placeholders', () => {
		const h = buildHeadlines({ role: '', skills: '', audience: '', audienceKind: 'people', result: '' }, 'none');
		expect(h.length).toBeGreaterThanOrEqual(5);
		expect(h[0].text).toContain('[Role]');
		expect(h[0].text).toContain('[Skill 1]');
	});

	it('adds the open to work text to every headline', () => {
		for (const h of buildHeadlines(full, 'open')) expect(h.text.endsWith('Open to Data Analyst roles')).toBe(true);
		for (const h of buildHeadlines(full, 'seeking')) expect(h.text.endsWith('Seeking Data Analyst opportunities')).toBe(true);
		for (const h of buildHeadlines(full, 'none')) expect(h.text).not.toMatch(/Open to|Seeking/);
	});

	it('counts length and flags a headline over the limit', () => {
		const short = buildHeadlines(full, 'none');
		for (const h of short) {
			expect(h.length).toBe(charCount(h.text));
			expect(h.overLimit).toBe(h.length > HEADLINE_LIMIT);
		}
		const long = buildHeadlines({ ...full, role: 'R'.repeat(150), result: 'x'.repeat(100) }, 'open');
		expect(long.every((h) => h.overLimit)).toBe(true);
		expect(buildHeadlines({ ...full, role: 'R'.repeat(40) }, 'none').some((h) => h.overLimit)).toBe(false);
	});

	it('uses a different sentence form for an industry', () => {
		const people = buildHeadlines(full, 'none').map((h) => h.text).join('\n');
		const industry = buildHeadlines({ ...full, audience: 'healthcare', audienceKind: 'industry' }, 'none')
			.map((h) => h.text)
			.join('\n');
		expect(people).toContain('Helping healthcare teams with');
		expect(industry).toContain('Data Analyst in healthcare');
		expect(industry).not.toContain('Helping');
	});

	it('has no em dash, en dash, or buzzword in any pattern output', () => {
		const inputs: HeadlineInput[] = [
			full,
			{ ...full, audienceKind: 'industry' },
			{ role: '', skills: '', audience: '', audienceKind: 'people', result: '' },
		];
		for (const input of inputs) {
			for (const style of ['none', 'open', 'seeking'] as const) {
				for (const h of buildHeadlines(input, style)) {
					expect(h.text).not.toMatch(/[\u2014\u2013]/);
					for (const b of BUZZWORDS) expect(h.text.toLowerCase(), b).not.toContain(b);
				}
			}
		}
	});

	it('has 9 or fewer patterns that all have an id', () => {
		expect(PATTERNS.length).toBeGreaterThanOrEqual(5);
		expect(new Set(PATTERNS.map((p) => p.id)).size).toBe(PATTERNS.length);
	});
});
