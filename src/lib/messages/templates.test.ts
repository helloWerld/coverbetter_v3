import { describe, expect, it } from 'vitest';
import { MESSAGE_KINDS } from '@/lib/applications/types';
import { MESSAGE_TEMPLATES, fillTemplate, mailtoLink, type MessageInput } from './templates';

// Noon, so the local date does not move in any time zone.
const full = (kind: MessageInput['kind']): MessageInput => ({
	kind,
	applicantName: 'Alex Rivera',
	company: 'Northwind',
	jobTitle: 'Operations Analyst',
	appliedOn: new Date(2026, 10, 3, 12),
	contactName: 'Dana Whitfield',
	interviewDate: new Date(2026, 10, 10, 12),
	interviewerName: 'Sam Okoye',
	topic: 'the planned move to a new inventory system',
	clarify: 'my work on the 2023 warehouse project',
	strength: 'experience cutting order errors',
});
const minimal = (kind: MessageInput['kind']): MessageInput => ({
	kind,
	applicantName: 'Alex Rivera',
	company: 'Northwind',
	jobTitle: 'Operations Analyst',
});

const BANNED = [/hope this email finds you/i, /touch base/i, /circle back/i, /passionate/i, /reach(ing)? out/i, /wanted to reach/i];
const words = (s: string) => s.trim().split(/\s+/).length;

describe('MESSAGE_TEMPLATES', () => {
	it('has three variants for each kind', () => {
		for (const kind of MESSAGE_KINDS) {
			expect(MESSAGE_TEMPLATES[kind].map((v) => v.id)).toEqual(['short', 'warm', 'formal']);
		}
	});

	for (const kind of MESSAGE_KINDS) {
		for (const variant of ['short', 'warm', 'formal']) {
			for (const [name, make] of [['full', full], ['minimal', minimal]] as const) {
				it(`${kind} / ${variant} / ${name} input reads cleanly`, () => {
					const { subject, body } = fillTemplate(kind, variant, make(kind));
					expect(subject.trim().length).toBeGreaterThan(0);
					for (const text of [subject, body]) {
						expect(text).not.toMatch(/undefined|null|NaN/);
						expect(text).not.toMatch(/[{}[\]]/);
						expect(text).not.toMatch(/ {2,}/);
						expect(text).not.toMatch(/ +\n/);
						expect(text).not.toMatch(/\n{3,}/);
						expect(text).not.toMatch(/\s,|\s\.|,\s*\./);
						for (const re of BANNED) expect(text).not.toMatch(re);
					}
					const n = words(body);
					expect(n, `${n} words`).toBeGreaterThanOrEqual(80);
					expect(n, `${n} words`).toBeLessThanOrEqual(150);
					expect(body).toContain('Alex Rivera');
					expect(body).toContain('Northwind');
				});
			}
		}
	}

	it('uses the dates and names when they are given', () => {
		const a = fillTemplate('thank_you', 'warm', full('thank_you')).body;
		expect(a).toContain('Tuesday, November 10');
		expect(a).toContain('Hello Sam Okoye,');
		const b = fillTemplate('follow_up', 'short', full('follow_up')).body;
		expect(b).toContain('on November 3');
		expect(b).toContain('Hello Dana Whitfield,');
	});

	it('falls back to a plain greeting without a name', () => {
		expect(fillTemplate('follow_up', 'formal', minimal('follow_up')).body.startsWith('Dear Hiring Team,')).toBe(true);
		expect(fillTemplate('follow_up', 'warm', minimal('follow_up')).body.startsWith('Hello,')).toBe(true);
	});

	it('works with a blank applicant name', () => {
		const { body } = fillTemplate('follow_up', 'short', { ...minimal('follow_up'), applicantName: ' ' });
		expect(body.trim().endsWith('Best,')).toBe(true);
	});

	it('drops a trailing period from optional phrases', () => {
		const { body } = fillTemplate('thank_you', 'short', { ...full('thank_you'), topic: 'the new plan.', strength: 'my speed.' });
		expect(body).not.toMatch(/\.\./);
	});

	it('uses the kind that is passed, and the first variant for an unknown id', () => {
		expect(fillTemplate('follow_up', 'zzz', minimal('follow_up'))).toEqual(fillTemplate('follow_up', 'short', minimal('follow_up')));
	});
});

describe('mailtoLink', () => {
	it('encodes the subject and the body', () => {
		const url = mailtoLink('jo@example.com', 'Hi & bye?', 'Line one\nLine two, "quoted" é');
		expect(url.startsWith('mailto:jo@example.com?subject=Hi%20%26%20bye%3F&body=')).toBe(true);
		const body = new URL(url).searchParams.get('body');
		expect(body).toBe('Line one\r\nLine two, "quoted" é');
	});
	it('keeps a short link whole', () => {
		const url = mailtoLink('a@b.co', 'S', 'Short body.');
		expect(decodeURIComponent(url)).toContain('Short body.');
		expect(decodeURIComponent(url)).not.toContain('...');
	});
	it('cuts a long body to keep the link under 1800 characters', () => {
		const long = 'Word with accents é and emoji 😀 and spaces. '.repeat(200);
		const url = mailtoLink('a@b.co', 'Subject', long);
		expect(url.length).toBeLessThanOrEqual(1800);
		expect(url.length).toBeGreaterThan(1500);
		expect(decodeURIComponent(url).endsWith('...')).toBe(true);
	});
	it('does not throw when the cut falls inside an emoji', () => {
		for (let pad = 0; pad < 4; pad++) {
			expect(() => mailtoLink('a@b.co', 'S', 'x'.repeat(pad) + '😀'.repeat(900))).not.toThrow();
		}
	});
	it('limits a very long subject', () => {
		expect(mailtoLink('a@b.co', 'S'.repeat(5000), 'body').length).toBeLessThanOrEqual(1800);
	});
});
