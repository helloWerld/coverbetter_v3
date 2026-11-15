import { describe, expect, it } from 'vitest';
import { INTERVIEW_TYPES, TIMING_NOTE, TONES, buildEmail, openPlaceholders, type EmailInput } from './logic';

const empty: EmailInput = { interviewer: '', role: '', company: '', topic: '', name: '' };
const full: EmailInput = {
	interviewer: 'Ms. Ortiz',
	role: 'Data Analyst',
	company: 'Northwind',
	topic: 'the new reporting system',
	name: 'Sam Lee',
};

describe('thank-you email', () => {
	it('builds a subject and a body for every type and tone', () => {
		for (const t of INTERVIEW_TYPES) {
			for (const tone of TONES) {
				const e = buildEmail(t.value, tone.value, full);
				expect(e.subject.length).toBeGreaterThan(5);
				expect(e.body).toContain('Ms. Ortiz');
				expect(e.body).toContain('Data Analyst');
				expect(e.body).toContain('Northwind');
				expect(e.body).toContain('the new reporting system');
				expect(e.body.trim().endsWith('Sam Lee')).toBe(true);
				expect(e.text.startsWith('Subject: ')).toBe(true);
				expect(openPlaceholders(e.text)).toEqual([]);
			}
		}
	});

	it('keeps empty answers as placeholders', () => {
		const e = buildEmail('phone', 'formal', empty);
		expect(openPlaceholders(e.text)).toEqual(
			expect.arrayContaining(['Interviewer Name', 'Job Title', 'Company', 'a topic from your talk', 'Your Name']),
		);
	});

	it('treats spaces only as empty', () => {
		const e = buildEmail('video', 'warm', { ...empty, name: '   ' });
		expect(e.body).toContain('[Your Name]');
	});

	it('uses different text for each tone', () => {
		expect(buildEmail('final', 'formal', full).body).not.toBe(buildEmail('final', 'warm', full).body);
		expect(buildEmail('final', 'formal', full).body.startsWith('Dear')).toBe(true);
		expect(buildEmail('final', 'warm', full).body.startsWith('Hi')).toBe(true);
	});

	it('has no em dash or en dash in any output', () => {
		const all = [TIMING_NOTE, ...INTERVIEW_TYPES.map((t) => t.tip)];
		for (const t of INTERVIEW_TYPES) for (const tone of TONES) all.push(buildEmail(t.value, tone.value, empty).text);
		for (const s of all) expect(s).not.toMatch(/[—–]/);
	});

	it('handles a very long input without error', () => {
		const long = 'a'.repeat(5000);
		expect(buildEmail('panel', 'formal', { ...full, topic: long }).body).toContain(long);
	});
});
