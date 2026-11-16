import { describe, expect, it } from 'vitest';
import { profileStrength } from './strength';
import { emptyProfile, profileSchema, type Profile } from './types';

const now = new Date('2026-06-15T00:00:00Z');

function bullets(prefix: string, texts: string[]) {
	return texts.map((text, i) => ({ id: `${prefix}${i}`, text, hidden: false }));
}

function full(): Profile {
	return profileSchema.parse({
		basics: { name: 'Ada Lovelace', email: 'ada@example.com' },
		summaries: [{ id: 's1', text: 'Analyst.' }],
		positions: [
			{
				id: 'p1', company: 'Northwind', title: 'Analyst', start: '2022-01', current: true,
				bullets: bullets('a', ['Cut costs 20%', 'Saved $5k a month', 'Led 4 people']),
			},
			{
				id: 'p2', company: 'Contoso', title: 'Intern', start: '2020-01', end: '2021-12',
				bullets: bullets('b', ['Built 3 reports', 'Wrote docs', 'Ran 10 tests']),
			},
		],
		education: [{ id: 'e1', school: 'MIT' }],
		skills: Array.from({ length: 10 }, (_, i) => ({ id: `k${i}`, name: `Skill ${i}`, group: 'technical' })),
		certifications: [{ id: 'c1', name: 'PMP' }],
	});
}

describe('profileStrength', () => {
	it('scores an empty profile low with at most 6 tips', () => {
		const r = profileStrength(emptyProfile(), now);
		expect(r.score).toBe(0);
		expect(r.tips.length).toBeLessThanOrEqual(6);
		expect(r.tips.length).toBeGreaterThan(0);
	});

	it('scores a complete profile 100 with no tips', () => {
		const r = profileStrength(full(), now);
		expect(r.score).toBe(100);
		expect(r.tips).toEqual([]);
	});

	it('tips for a thin position and targets it', () => {
		const p = full();
		p.positions[0].bullets = p.positions[0].bullets.slice(0, 1);
		const r = profileStrength(p, now);
		expect(r.score).toBeLessThan(100);
		const tip = r.tips.find((t) => t.target === 'p1');
		expect(tip?.text).toBe('Add 2 more bullets to Analyst at Northwind.');
	});

	it('does not count hidden bullets', () => {
		const p = full();
		p.positions[1].bullets[0].hidden = true;
		const r = profileStrength(p, now);
		expect(r.tips.some((t) => t.text === 'Add 1 more bullet to Intern at Contoso.')).toBe(true);
	});

	it('flags a gap longer than 6 months', () => {
		const p = full();
		p.positions[1].end = '2021-01';
		const r = profileStrength(p, now);
		expect(r.score).toBe(95);
		expect(r.tips[0].id).toBe('gap');
		expect(r.tips[0].target).toBe('p1');
	});

	it('flags missing dates and numbers', () => {
		const p = full();
		p.positions[1].end = '';
		p.positions.forEach((x) => x.bullets.forEach((b) => (b.text = 'Did work')));
		const ids = profileStrength(p, now).tips.map((t) => t.id);
		expect(ids).toContain('numbers');
		expect(ids).toContain('dates-p2');
	});

	it('prorates skills', () => {
		const p = full();
		p.skills = p.skills.slice(0, 5);
		const r = profileStrength(p, now);
		expect(r.score).toBe(95);
		expect(r.tips[0].text).toBe('Add 5 more skills.');
	});
});
