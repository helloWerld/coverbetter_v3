import { describe, expect, it } from 'vitest';
import { CATEGORIES, FLAGS, FLAGS_BY_ID, analyze, findMatches, hasPayFigure, segments } from './logic';

const ids = (text: string) => findMatches(text).map((m) => m.flagId);

describe('the flag list', () => {
	it('has 40 or more flags with unique ids, a note, and a question', () => {
		expect(FLAGS.length).toBeGreaterThanOrEqual(40);
		expect(new Set(FLAGS.map((f) => f.id)).size).toBe(FLAGS.length);
		const categories = new Set(CATEGORIES.map((c) => c.id));
		for (const f of FLAGS) {
			expect(categories.has(f.category), f.id).toBe(true);
			expect(f.canMean.length, f.id).toBeGreaterThan(20);
			expect(f.ask.length, f.id).toBeGreaterThan(10);
		}
	});

	it('has no dash characters in any text', () => {
		for (const f of FLAGS) expect(`${f.label}${f.canMean}${f.ask}`, f.id).not.toMatch(/[—–]/);
		for (const c of CATEGORIES) expect(c.label).not.toMatch(/[—–]/);
	});

	it('compiles every pattern and none matches an empty string', () => {
		for (const f of FLAGS) {
			if (!f.pattern) continue;
			const re = new RegExp(f.pattern, 'i');
			expect(re.test(''), f.id).toBe(false);
		}
	});

	it('puts scam signs first', () => {
		expect(CATEGORIES[0].id).toBe('scam');
	});
});

describe('matching', () => {
	it('ignores case', () => {
		expect(ids('We are a FAST-PACED team.')).toEqual(['work-fast-paced']);
		expect(ids('You will Wear Many Hats here.')).toEqual(['work-many-hats']);
	});

	it('finds the main workload phrases', () => {
		const text = 'Fast paced, work hard play hard, like a family, self-starter, rockstar, high-pressure.';
		expect(ids(text)).toEqual([
			'work-fast-paced',
			'work-hard-play-hard',
			'work-family',
			'work-self-starter',
			'work-rockstar',
			'work-pressure',
		]);
	});

	it('uses word boundaries', () => {
		expect(ids('We value ninjas')).toEqual(['work-rockstar']);
		expect(ids('The Ninjago set')).toEqual([]);
		expect(ids('A rockstarlike pace')).toEqual([]);
		expect(ids('Use a signalling device')).toEqual([]);
		expect(ids('We work on a gigantic grinder')).toEqual([]);
		expect(ids('Tell us about Signal app chats')).toEqual(['scam-chat']);
		expect(ids('Please unfamiliar')).toEqual([]);
		expect(ids('Contact: ssn123')).toEqual([]);
		expect(ids('Send your SSN today')).toEqual(['scam-bank']);
	});

	it('finds scam signs', () => {
		expect(ids('Pay a training fee of 50 dollars')).toContain('scam-fee');
		expect(ids('Buy your own laptop and we will reimburse you')).toContain('scam-equipment');
		expect(ids('We will send you a check to deposit')).toContain('scam-check');
		expect(ids('Interview on Telegram or WhatsApp')).toEqual(['scam-chat', 'scam-chat']);
		expect(ids('Send your bank account number')).toContain('scam-bank');
		expect(ids('Email hr.acme@gmail.com')).toEqual(['scam-email']);
		expect(ids('You are hired today')).toEqual(['scam-urgent']);
	});

	it('does not run two matches over the same text', () => {
		const m = findMatches('unlimited earning potential');
		expect(m).toHaveLength(1);
		expect(m[0].text).toBe('unlimited earning potential');
	});

	it('returns the exact original text of a match', () => {
		const text = 'Join our Fast-Paced team';
		const m = findMatches(text)[0];
		expect(text.slice(m.start, m.end)).toBe('Fast-Paced');
	});
});

describe('pay checks', () => {
	const longPost =
		'We are hiring a customer support specialist to answer questions from our customers by email and chat. You will work with a friendly team in a remote setting and help us improve our help articles every month.';

	it('detects a pay figure', () => {
		expect(hasPayFigure('Pay: $80,000 to $95,000')).toBe(true);
		expect(hasPayFigure('25 per hour')).toBe(true);
		expect(hasPayFigure('$ 25/hr')).toBe(true);
		expect(hasPayFigure('We have 50,000 customers')).toBe(false);
		expect(hasPayFigure('')).toBe(false);
	});

	it('flags a missing pay range in a real post', () => {
		const a = analyze(longPost);
		expect(a.findings.map((f) => f.flag.id)).toEqual(['pay-no-range']);
		expect(a.counts.pay).toBe(1);
	});

	it('does not flag a post with a pay range, and ignores very short text', () => {
		expect(analyze(`${longPost} Pay range: $52,000 to $64,000 a year.`).findings).toEqual([]);
		expect(analyze('Hello').findings).toEqual([]);
		expect(analyze('').hasText).toBe(false);
	});

	it('flags "competitive salary" only with no pay figure', () => {
		expect(ids('We offer a competitive salary.')).toEqual(['pay-competitive']);
		expect(ids('We offer a competitive salary of $70,000.')).toEqual([]);
	});

	it('combines no experience with very high pay', () => {
		const a = analyze('No experience needed! Earn $200 per hour from home.');
		const found = a.findings.map((f) => f.flag.id);
		expect(found).toContain('scam-no-exp-high-pay');
		expect(found).toContain('scam-no-exp');
		expect(found).toContain('scam-high-pay');
		expect(analyze('No experience needed. Pay is $18 per hour.').findings.map((f) => f.flag.id)).not.toContain('scam-no-exp-high-pay');
	});
});

describe('analyze and segments', () => {
	it('counts findings per category and counts each phrase once', () => {
		const a = analyze('Fast-paced and fast paced. Commission only. Telegram interview. Other duties as assigned. $20 per hour.');
		expect(a.counts).toEqual({ scam: 1, pay: 1, workload: 1, role: 1 });
		expect(a.findings.find((f) => f.flag.id === 'work-fast-paced')?.count).toBe(2);
	});

	it('splits the text into parts that join back to the original', () => {
		const text = 'We are fast-paced.\nWe are like a family. The end';
		const parts = segments(text, findMatches(text));
		expect(parts.map((p) => p.text).join('')).toBe(text);
		expect(parts.filter((p) => p.flagId).map((p) => p.text)).toEqual(['fast-paced', 'like a family']);
		for (const p of parts) if (p.flagId) expect(FLAGS_BY_ID[p.flagId]).toBeDefined();
	});

	it('keeps HTML as plain text parts', () => {
		const text = '<img src=x onerror=alert(1)> fast-paced';
		const parts = segments(text, findMatches(text));
		expect(parts[0].text).toBe('<img src=x onerror=alert(1)> ');
	});
});
