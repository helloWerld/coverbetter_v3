import { describe, expect, it } from 'vitest';
import { TEMPLATES, fillTemplate, greeting, openPlaceholders, type LetterInput } from './logic';

const empty: LetterInput = {
	name: '',
	role: '',
	company: '',
	hiringManager: '',
	strength1: '',
	strength2: '',
	achievement: '',
	referrer: '',
};

const full: LetterInput = {
	name: 'Sam Lee',
	role: 'Data Analyst',
	company: 'Northwind',
	hiringManager: 'Ms. Ortiz',
	strength1: 'SQL',
	strength2: 'clear reporting',
	achievement: 'I cut the monthly report time from 3 days to 1 day',
	referrer: 'Ana Ruiz',
};

describe('cover letter templates', () => {
	it('picks the greeting from what the user knows', () => {
		expect(greeting('Ms. Ortiz', 'Northwind')).toBe('Dear Ms. Ortiz,');
		expect(greeting('', 'Northwind')).toBe('Dear Northwind Hiring Team,');
		expect(greeting(' ', ' ')).toBe('Dear Hiring Manager,');
	});

	it('keeps empty answers as placeholders', () => {
		const text = fillTemplate('standard', empty);
		expect(text).toContain('[Job Title]');
		expect(text).toContain('[Company]');
		expect(openPlaceholders(text)).toContain('Your Name');
	});

	it('fills every template with the answers', () => {
		for (const t of TEMPLATES) {
			const text = fillTemplate(t.id, full);
			expect(text, t.id).toContain('Northwind');
			expect(text, t.id).toContain('Sam Lee');
			expect(text, t.id).not.toContain('[Job Title]');
			expect(text, t.id).not.toMatch(/[—–]/);
		}
		expect(fillTemplate('referral', full)).toContain('Ana Ruiz');
		expect(fillTemplate('email', full).startsWith('Subject: Application for Data Analyst: Sam Lee')).toBe(true);
	});
});
