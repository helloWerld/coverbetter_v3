import { describe, expect, it } from 'vitest';
import { starChecks, starToText, starWordCount, type StarAnswer } from './star';

const good: StarAnswer = {
	situation: 'Our billing export failed every Monday.',
	task: 'I had to find the cause before the quarter close.',
	action: 'I traced the job logs, I found a timeout, and I rewrote the query.',
	result: 'The export now runs in 4 minutes and has not failed in 12 weeks.',
};

describe('starToText', () => {
	it('labels each part in order', () => {
		expect(starToText(good).split('\n').map((l) => l.split(':')[0])).toEqual(['Situation', 'Task', 'Action', 'Result']);
	});
	it('skips empty parts', () => {
		expect(starToText({ ...good, task: '  ' })).not.toContain('Task:');
	});
});

describe('starWordCount', () => {
	it('counts words across all parts', () => {
		expect(starWordCount({ situation: 'a b', task: 'c', action: ' d  e ', result: '' })).toBe(5);
	});
	it('is zero for an empty answer', () => {
		expect(starWordCount({ situation: '', task: '', action: '', result: '' })).toBe(0);
	});
});

describe('starChecks', () => {
	it('gives no hints for a good answer', () => {
		expect(starChecks(good)).toEqual([]);
	});
	it('flags an empty part', () => {
		expect(starChecks({ ...good, situation: '' })).toEqual(['The Situation part is empty.']);
	});
	it('flags a result with no number', () => {
		expect(starChecks({ ...good, result: 'It worked well.' }).join(' ')).toMatch(/no number/);
	});
	it('does not flag the number of an empty result twice', () => {
		const hints = starChecks({ ...good, result: '' });
		expect(hints).toEqual(['The Result part is empty.']);
	});
	it('flags "we" used more than "I"', () => {
		const hints = starChecks({ ...good, action: 'We fixed it. We tested it. I merged it.' });
		expect(hints.join(' ')).toMatch(/"we" more than "I"/);
	});
	it('does not flag "we" when "I" leads', () => {
		expect(starChecks({ ...good, action: 'I fixed it and we tested it.' })).toEqual([]);
	});
	it('flags an answer over 300 words', () => {
		const long = { ...good, action: 'I ' + 'work '.repeat(300) };
		expect(starChecks(long).join(' ')).toMatch(/over 300 words/);
	});
});
