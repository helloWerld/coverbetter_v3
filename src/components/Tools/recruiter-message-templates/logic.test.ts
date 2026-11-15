import { describe, expect, it } from 'vitest';
import {
	CONNECTION_LIMIT,
	LIMITS,
	TEMPLATE_LIST,
	buildMessage,
	counter,
	countChars,
	greetingName,
	openPlaceholders,
	type MessageInput,
} from './logic';

const empty: MessageInput = { recipient: '', name: '', role: '', company: '', background: '', reason: '' };
const full: MessageInput = {
	recipient: 'Maria Ortiz',
	name: 'Sam Lee',
	role: 'Data Analyst',
	company: 'Northwind',
	background: 'a data analyst with 4 years in retail',
	reason: 'your team builds tools that stores use every day',
};

describe('recruiter message templates', () => {
	it('fills every template with the answers', () => {
		for (const t of TEMPLATE_LIST) {
			const text = buildMessage(t.id, full);
			expect(text).toContain('Hi Maria,');
			expect(text).toContain('Sam Lee');
			expect(text).toContain('Northwind');
			expect(text).toContain('Data Analyst');
			expect(openPlaceholders(text)).toEqual([]);
		}
	});

	it('keeps empty answers as placeholders', () => {
		const text = buildMessage('cold', empty);
		expect(openPlaceholders(text)).toEqual(
			expect.arrayContaining(['First Name', 'Job Title', 'Company', 'Your Name']),
		);
	});

	it('uses the first name, and keeps a title as typed', () => {
		expect(greetingName('Maria Ortiz')).toBe('Maria');
		expect(greetingName('  Maria  ')).toBe('Maria');
		expect(greetingName('Ms. Ortiz')).toBe('Ms. Ortiz');
		expect(greetingName('Dr Ortiz')).toBe('Dr Ortiz');
		expect(greetingName('')).toBe('[First Name]');
	});

	it('keeps the connection note with full answers under the limit', () => {
		const c = counter(buildMessage('connection', full), 'connection');
		expect(c.count).toBeLessThanOrEqual(CONNECTION_LIMIT);
		expect(c.status).toBe('ok');
		expect(c.over).toBe(0);
	});

	it('warns when a text is over the connection limit', () => {
		const c = counter('a'.repeat(CONNECTION_LIMIT + 7), 'connection');
		expect(c.status).toBe('over');
		expect(c.over).toBe(7);
		expect(counter('a'.repeat(CONNECTION_LIMIT), 'connection').status).toBe('ok');
		expect(counter('', 'connection')).toEqual({ count: 0, limit: CONNECTION_LIMIT, over: 0, status: 'ok' });
	});

	it('has no strict limit for a message', () => {
		const c = counter('a'.repeat(5000), 'message');
		expect(c).toEqual({ count: 5000, limit: null, over: 0, status: 'info' });
	});

	it('counts an emoji as one character', () => {
		expect(countChars('a\u{1F600}')).toBe(2);
	});

	it('names the 300 character limit in its option', () => {
		expect(LIMITS[0].label).toContain('300 characters');
	});

	it('has no em dash or en dash in any output', () => {
		const all = LIMITS.map((l) => l.label);
		for (const t of TEMPLATE_LIST) {
			all.push(t.label, t.when, buildMessage(t.id, empty), buildMessage(t.id, full));
		}
		for (const s of all) expect(s).not.toMatch(/[—–]/);
	});
});
