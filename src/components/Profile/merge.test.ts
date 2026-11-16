import { describe, expect, it } from 'vitest';
import { emptyProfile, profileSchema, type Profile } from '@/lib/profile/types';
import { cleanProfile, mergeProfiles } from './merge';

const b = (id: string, text: string) => ({ id, text, hidden: false });

function make(over: Record<string, unknown>): Profile {
	return profileSchema.parse(over);
}

describe('mergeProfiles', () => {
	it('keeps filled basics and fills empty ones', () => {
		const cur = make({ basics: { name: 'Ann', email: '' } });
		const inc = make({ basics: { name: 'Anna B', email: 'a@b.co', phone: '123' } });
		const out = mergeProfiles(cur, inc);
		expect(out.basics.name).toBe('Ann');
		expect(out.basics.email).toBe('a@b.co');
		expect(out.basics.phone).toBe('123');
	});

	it('adds links that are new by url', () => {
		const cur = make({ basics: { links: [{ label: 'Site', url: 'https://a.co' }] } });
		const inc = make({
			basics: {
				links: [
					{ label: 'Site 2', url: 'HTTPS://a.co' },
					{ label: 'Git', url: 'https://g.co' },
				],
			},
		});
		expect(mergeProfiles(cur, inc).basics.links.map((l) => l.url)).toEqual(['https://a.co', 'https://g.co']);
	});

	it('skips a position with the same company, title and start', () => {
		const cur = make({ positions: [{ id: 'p1', company: 'Acme', title: 'Dev', start: '2020-01', bullets: [b('b1', 'x')] }] });
		const inc = make({
			positions: [
				{ id: 'p9', company: ' acme ', title: 'DEV', start: '2020-01', bullets: [b('b9', 'y')] },
				{ id: 'p8', company: 'Beta', title: 'Dev', start: '2021-01' },
			],
		});
		const out = mergeProfiles(cur, inc);
		expect(out.positions.map((p) => p.id)).toEqual(['p1', 'p8']);
		expect(out.positions[0].bullets).toHaveLength(1);
	});

	it('gives a new id when an incoming id is already in use', () => {
		const cur = make({ education: [{ id: 'e1', school: 'A', degree: 'BS' }] });
		const inc = make({ education: [{ id: 'e1', school: 'B', degree: 'MS' }] });
		const out = mergeProfiles(cur, inc);
		expect(out.education).toHaveLength(2);
		expect(new Set(out.education.map((e) => e.id)).size).toBe(2);
	});

	it('joins skills by name without case', () => {
		const cur = make({ skills: [{ id: 's1', name: 'SQL', group: 'technical' }] });
		const inc = make({
			skills: [
				{ id: 's2', name: 'sql', group: 'tool' },
				{ id: 's3', name: 'Go', group: 'technical' },
			],
		});
		expect(mergeProfiles(cur, inc).skills.map((s) => s.name)).toEqual(['SQL', 'Go']);
	});

	it('does not change an empty profile when the import is empty', () => {
		expect(mergeProfiles(emptyProfile(), emptyProfile())).toEqual(emptyProfile());
	});
});

describe('cleanProfile', () => {
	it('drops empty bullets, summaries and skills', () => {
		const p = make({
			summaries: [
				{ id: 'a', text: 'Hi' },
				{ id: 'b', text: 'x' },
			],
			positions: [{ id: 'p', bullets: [b('1', 'x'), b('2', 'Cut cost 20%')] }],
			skills: [{ id: 's', name: 'x', group: 'tool' }],
		});
		// Zod rejects empty text, so make the empty rows by hand, as the editor does.
		p.summaries[1].text = ' ';
		p.positions[0].bullets[0].text = ' ';
		p.skills[0].name = ' ';
		const out = cleanProfile(p);
		expect(out.summaries).toHaveLength(1);
		expect(out.positions[0].bullets.map((x) => x.id)).toEqual(['2']);
		expect(out.skills).toHaveLength(0);
	});
});

describe('headlines', () => {
	it('adds new headlines from an import, drops repeats, and cleans empty ones', () => {
		// The editor can hold an empty headline before it is saved.
		const current = { ...emptyProfile(), headlines: [{ id: 'hl_a', text: 'Data analyst' }, { id: 'hl_b', text: ' ' }] };
		const incoming = profileSchema.parse({ headlines: [{ id: 'hl_c', text: 'data  analyst' }, { id: 'hl_d', text: 'BI developer' }] });
		const merged = mergeProfiles(current, incoming);
		expect(cleanProfile(merged).headlines.map((h) => h.text)).toEqual(['Data analyst', 'BI developer']);
	});
});
