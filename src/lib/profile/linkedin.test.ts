import { zipSync, strToU8 } from 'fflate';
import { describe, expect, it } from 'vitest';
import { parseLinkedInFiles, parseDate, splitBullets } from './linkedin';
import { readLinkedInZip } from './linkedin-zip';
import { profileSchema } from './types';

const PROFILE = `First Name,Last Name,Headline,Summary,Geo Location,Websites
Ada,Lovelace,Engineer,"Builds engines.
Writes notes.",London,"[PERSONAL:https://ada.dev],[BLOG:https://blog.ada.dev]"
`;

const POSITIONS = `﻿Company Name,Title,Description,Location,Started On,Finished On
Acme,Engineer,"• Built the API
• Cut costs by 20%
- Led a team of 4",Remote,Jan 2020,
Old Co,Intern,"Did tasks.",Paris,"Jun 2015","Aug 2015"
Mid Co,Developer,"1. Wrote code
2. Fixed bugs",Berlin,2016-03,2019
`;

const FULL: Record<string, string> = {
	'export/Profile.csv': PROFILE,
	'export/Email Addresses.csv': 'Email Address,Confirmed,Primary,Updated On\nold@x.com,Yes,No,2020\nada@x.com,Yes,Yes,2021\n',
	'PhoneNumbers.csv': 'Extension,Number,Type\n,+44 1234,Mobile\n',
	'Positions.csv': POSITIONS,
	'Education.csv': 'School Name,Start Date,End Date,Notes,Degree Name,Activities\nMIT,2010,2014,Dean list,BSc,Chess club\n',
	'Skills.csv': 'Name\nPython\npython\nSQL\n',
	'Certifications.csv': 'Name,Url,Authority,Started On,Finished On,License Number\nAWS SA,https://c.example,Amazon,Mar 2021,Mar 2024,ABC123\n',
	'Projects.csv': 'Title,Description,Url,Started On,Finished On\nEngine,"Analytical engine.",https://e.example,2018,2019\n',
	'Languages.csv': 'Name,Proficiency\nFrench,Professional working\n',
	'Honors.csv': 'Title,Description,Issued On\nBest Paper,For the paper,"Oct 05, 2019"\n',
	'Volunteering.csv': 'Company Name,Role,Description,Started On,Finished On\nFood Bank,Helper,Packed boxes,01/2018,\n',
	'Courses.csv': 'Name,Number\nAlgorithms,CS101\n',
};

describe('parseDate', () => {
	it.each([
		['Jan 2020', '2020-01'],
		['2020', '2020'],
		['Jan 01, 2020', '2020-01'],
		['2020-01', '2020-01'],
		['01/2020', '2020-01'],
		['September 2019', '2019-09'],
		['', ''],
		['soon', ''],
		['13/2020', '2020'],
	])('%s -> %s', (input, out) => {
		expect(parseDate(input)).toBe(out);
	});
});

describe('splitBullets', () => {
	it('splits on line breaks and marks', () => {
		expect(splitBullets('• One\n• Two\n- Three\n* Four\n– Five\n1. Six\n\n')).toEqual([
			'One',
			'Two',
			'Three',
			'Four',
			'Five',
			'Six',
		]);
	});

	it('splits inline bullet marks', () => {
		expect(splitBullets('• One • Two · Three')).toEqual(['One', 'Two', 'Three']);
	});

	it('keeps short text without line breaks as one bullet', () => {
		expect(splitBullets('Did A. Did B.')).toEqual(['Did A. Did B.']);
	});

	it('splits long text without line breaks on sentence ends', () => {
		const sentence = 'I improved the build pipeline for the whole team this year.';
		const text = Array(8).fill(sentence).join(' ');
		const out = splitBullets(text);
		expect(out).toHaveLength(8);
		expect(out[0]).toBe(sentence);
	});

	it('cuts a bullet at 500 characters on a word', () => {
		const out = splitBullets(`${'word '.repeat(200)}`);
		expect(out.every((b) => b.length <= 500)).toBe(true);
		expect(out.join(' ').endsWith('word')).toBe(true);
	});

	it('returns nothing for blank text', () => {
		expect(splitBullets('  \n \n')).toEqual([]);
	});
});

describe('parseLinkedInFiles', () => {
	const { profile, found, warnings } = parseLinkedInFiles(FULL);

	it('passes the schema', () => {
		expect(() => profileSchema.parse(profile)).not.toThrow();
		expect(warnings).toEqual([]);
	});

	it('lists the recognized files', () => {
		expect(found).toHaveLength(12);
		expect(found).toContain('Email Addresses.csv');
	});

	it('reads basics', () => {
		expect(profile.basics).toMatchObject({
			name: 'Ada Lovelace',
			headline: 'Engineer',
			location: 'London',
			email: 'ada@x.com',
			phone: '+44 1234',
		});
		expect(profile.basics.links).toEqual([
			{ label: 'PERSONAL', url: 'https://ada.dev' },
			{ label: 'BLOG', url: 'https://blog.ada.dev' },
		]);
		expect(profile.summaries[0].text).toBe('Builds engines.\nWrites notes.');
		expect(profile.summaries[0].id).toMatch(/^sum_/);
	});

	it('sorts positions newest first with current on top', () => {
		expect(profile.positions.map((p) => p.company)).toEqual(['Acme', 'Mid Co', 'Old Co']);
		expect(profile.positions[0]).toMatchObject({ current: true, start: '2020-01', end: '' });
		expect(profile.positions[1]).toMatchObject({ current: false, start: '2016-03', end: '2019' });
		expect(profile.positions[0].id).toMatch(/^pos_/);
	});

	it('builds bullets with ids', () => {
		const acme = profile.positions[0];
		expect(acme.bullets.map((b) => b.text)).toEqual(['Built the API', 'Cut costs by 20%', 'Led a team of 4']);
		expect(acme.bullets[0].id).toMatch(/^b_/);
		expect(profile.positions[1].bullets.map((b) => b.text)).toEqual(['Wrote code', 'Fixed bugs']);
	});

	it('reads the other sections', () => {
		expect(profile.education[0]).toMatchObject({ school: 'MIT', degree: 'BSc', start: '2010', end: '2014' });
		expect(profile.education[0].honors).toBe('Dean list. Chess club');
		expect(profile.skills.map((s) => s.name)).toEqual(['Python', 'SQL']);
		expect(profile.certifications[0]).toMatchObject({
			name: 'AWS SA',
			issuer: 'Amazon',
			date: '2021-03',
			expires: '2024-03',
			credentialId: 'ABC123',
		});
		expect(profile.projects[0]).toMatchObject({ name: 'Engine', start: '2018', url: 'https://e.example' });
		expect(profile.other.map((o) => o.kind)).toEqual(['volunteer', 'award', 'language', 'other']);
		expect(profile.other[1].date).toBe('2019-10');
		expect(profile.other[0].id).toMatch(/^oth_/);
	});

	it('works when every file is missing', () => {
		const r = parseLinkedInFiles({});
		expect(r.found).toEqual([]);
		expect(r.profile.positions).toEqual([]);
		expect(() => profileSchema.parse(r.profile)).not.toThrow();
	});

	it('works with only one file and matches names in any case or folder', () => {
		const r = parseLinkedInFiles({ 'a/b/SKILLS.CSV': 'Name\nGo\n' });
		expect(r.found).toEqual(['Skills.csv']);
		expect(r.profile.skills[0].name).toBe('Go');
	});

	it('uses renamed columns', () => {
		const r = parseLinkedInFiles({
			'Positions.csv': 'Company,Position,Summary,Start Date,End Date\nZed,Chef,Cooks,"Feb 2022","Mar 2023"\n',
		});
		expect(r.profile.positions[0]).toMatchObject({ company: 'Zed', title: 'Chef', start: '2022-02', end: '2023-03' });
		expect(r.warnings).toEqual([]);
	});

	it('warns about a missing column', () => {
		const r = parseLinkedInFiles({ 'Positions.csv': 'Company Name,Started On\nAcme,2020\n' });
		expect(r.warnings).toContain('Positions.csv had no Title column.');
	});

	it('warns about an empty file', () => {
		const r = parseLinkedInFiles({ 'Skills.csv': 'Name\n' });
		expect(r.warnings).toContain('Skills.csv had no rows.');
	});

	it('cuts values to the schema limits instead of throwing', () => {
		const rows = ['Name'];
		for (let i = 0; i < 300; i++) rows.push(`Skill ${i}`);
		const positions = ['Company Name,Title,Description,Started On,Finished On'];
		for (let i = 0; i < 80; i++) positions.push(`C${i},T${i},"${'x '.repeat(400)}",2000,2001`);
		const bullets = Array.from({ length: 60 }, (_, i) => `• b${i}`).join('\n');
		positions.push(`Big,Big,"${bullets}",2010,2011`);
		const r = parseLinkedInFiles({
			'Skills.csv': rows.join('\n'),
			'Positions.csv': positions.join('\n'),
			'Profile.csv': `First Name,Last Name,Headline,Summary\n${'A'.repeat(500)},B,${'h'.repeat(500)},${'s'.repeat(3000)}\n`,
		});
		expect(r.profile.skills).toHaveLength(200);
		expect(r.profile.positions).toHaveLength(60);
		expect(Math.max(...r.profile.positions.map((p) => p.bullets.length))).toBeLessThanOrEqual(40);
		expect(r.profile.summaries[0].text.length).toBe(1500);
		expect(r.profile.basics.headline.length).toBe(200);
	});
});

describe('readLinkedInZip', () => {
	it('round-trips CSV files and ignores other files', () => {
		const zip = zipSync({
			'Positions.csv': strToU8(POSITIONS),
			'sub/Skills.csv': strToU8('Name\nGo\n'),
			'readme.txt': strToU8('hello'),
		});
		const files = readLinkedInZip(zip);
		expect(Object.keys(files).sort()).toEqual(['Positions.csv', 'sub/Skills.csv']);
		expect(files['sub/Skills.csv']).toBe('Name\nGo\n');
		const r = parseLinkedInFiles(files);
		expect(r.profile.positions).toHaveLength(3);
	});

	it('skips files over 5 MB', () => {
		const big = 'a'.repeat(5 * 1024 * 1024 + 1);
		const files = readLinkedInZip(zipSync({ 'Big.csv': strToU8(big), 'Skills.csv': strToU8('Name\nGo\n') }));
		expect(Object.keys(files)).toEqual(['Skills.csv']);
	});

	it('reads at most 60 files', () => {
		const entries: Record<string, Uint8Array> = {};
		for (let i = 0; i < 70; i++) entries[`f${i}.csv`] = strToU8('a\n1\n');
		expect(Object.keys(readLinkedInZip(zipSync(entries)))).toHaveLength(60);
	});
});
