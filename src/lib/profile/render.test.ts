import { describe, expect, it } from 'vitest';
import { defaultSelection, docToText, profileToText, selectionToDoc } from './render';
import { profileSchema, type Profile } from './types';

function profile(): Profile {
	return profileSchema.parse({
		basics: {
			name: 'Ada Lovelace', headline: 'Data analyst', email: 'ada@example.com', phone: '555-0100',
			location: 'London', links: [{ label: 'Site', url: 'ada.dev' }],
		},
		summaries: [{ id: 's1', text: 'First summary.' }, { id: 's2', text: 'Second summary.' }],
		positions: [
			{
				id: 'p1', company: 'Northwind', title: 'Analyst', location: 'Remote', start: '2020-01', current: true,
				bullets: [
					{ id: 'b1', text: 'Cut costs 20%' },
					{ id: 'b2', text: 'Hidden one', hidden: true },
					{ id: 'b3', text: 'Led a team' },
				],
			},
			{ id: 'p2', company: 'Contoso', title: 'Intern', start: '2018', end: '2021', bullets: [{ id: 'b4', text: 'Wrote docs' }] },
		],
		education: [{ id: 'e1', school: 'MIT', degree: 'BS', field: 'Math', start: '2014', end: '2018', gpa: '3.9' }],
		certifications: [{ id: 'c1', name: 'PMP', issuer: 'PMI', date: '2022-05' }],
		skills: [{ id: 'k1', name: 'SQL', group: 'technical' }, { id: 'k2', name: 'Excel', group: 'tool' }],
		projects: [{ id: 'j1', name: 'Dash', role: 'Lead', start: '2023', end: '2024', bullets: [{ id: 'jb1', text: 'Shipped it' }] }],
		other: [{ id: 'o1', kind: 'award', title: 'Award', organization: 'Org', date: '2021', description: 'Won it' }],
	});
}

describe('selectionToDoc', () => {
	it('follows selection order and section order', () => {
		const p = profile();
		const s = { ...defaultSelection(p), positions: [{ id: 'p2', bullets: ['b4'] }, { id: 'p1', bullets: ['b3', 'b1'] }] };
		const doc = selectionToDoc(p, s);
		expect(doc.sections.map((x) => x.title)).toEqual(['Experience', 'Projects', 'Education', 'Certifications', 'Skills', 'Other']);
		const exp = doc.sections[0].items;
		expect(exp.map((i) => i.heading)).toEqual(['Intern', 'Analyst']);
		expect(exp[1].bullets).toEqual(['Led a team', 'Cut costs 20%']);
	});

	it('formats dates', () => {
		const doc = selectionToDoc(profile(), defaultSelection(profile()));
		const exp = doc.sections[0].items;
		expect(exp[0].dates).toBe('Jan 2020 – Present');
		expect(exp[1].dates).toBe('2018 – 2021');
		expect(exp[0].subheading).toBe('Northwind, Remote');
	});

	it('uses rewrites and skips hidden bullets and unknown ids', () => {
		const p = profile();
		const s = {
			...defaultSelection(p),
			positions: [{ id: 'p1', bullets: ['b1', 'b2', 'nope', 'b3'] }, { id: 'ghost', bullets: [] }],
			education: ['e1', 'zzz'],
			skills: ['k2', 'unknown'],
			rewrites: { b1: 'Cut costs by 20% in a year', b2: 'should not show' },
		};
		const doc = selectionToDoc(p, s);
		expect(doc.sections[0].items).toHaveLength(1);
		expect(doc.sections[0].items[0].bullets).toEqual(['Cut costs by 20% in a year', 'Led a team']);
		expect(doc.sections.find((x) => x.title === 'Education')!.items).toHaveLength(1);
		expect(doc.sections.find((x) => x.title === 'Skills')!.items[0].text).toBe('Excel');
	});

	it('leaves out empty sections and has skills as one comma list', () => {
		const p = profile();
		const s = { ...defaultSelection(p), projects: [], other: [], certifications: [] };
		const doc = selectionToDoc(p, s);
		expect(doc.sections.map((x) => x.title)).toEqual(['Experience', 'Education', 'Skills']);
		expect(doc.sections[2].items[0].text).toBe('SQL, Excel');
	});
});

describe('defaultSelection and text', () => {
	it('shows everything visible with the first summary', () => {
		const s = defaultSelection(profile());
		expect(s.summary).toBe('First summary.');
		expect(s.positions[0].bullets).toEqual(['b1', 'b3']);
	});

	it('makes compact plain text', () => {
		const text = profileToText(profile());
		expect(text.startsWith('Ada Lovelace\nData analyst\nada@example.com | 555-0100 | London | ada.dev')).toBe(true);
		expect(text).toContain('SUMMARY\nFirst summary.');
		expect(text).toContain('Analyst | Northwind, Remote | Jan 2020 – Present\n- Cut costs 20%\n- Led a team');
		expect(text).toContain('SKILLS\nSQL, Excel');
		expect(text).not.toContain('Hidden one');
		expect(text).not.toMatch(/\n{3}/);
	});

	it('handles an empty doc', () => {
		expect(docToText({ name: '', headline: '', contactLine: '', summary: '', sections: [] })).toBe('');
	});
});
