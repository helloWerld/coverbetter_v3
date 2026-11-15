import { describe, expect, it } from 'vitest';
import {
	EMPTY_ANSWER,
	STAR_PARTS,
	actionHint,
	buildAnswer,
	countWords,
	formatAll,
	formatSaved,
	isEmptyAnswer,
	newId,
	speakingSeconds,
	speakingTimeText,
	totalWords,
} from './logic';
import { meta } from './meta';

const DASH = new RegExp(String.fromCharCode(91, 0x2013, 0x2014, 93));

describe('star answer builder', () => {
	it('counts words, including empty and very large input', () => {
		expect(countWords('')).toBe(0);
		expect(countWords('   \n ')).toBe(0);
		expect(countWords(' one  two\nthree ')).toBe(3);
		expect(countWords('word '.repeat(100000))).toBe(100000);
	});

	it('joins the parts in order and skips empty parts', () => {
		const a = { ...EMPTY_ANSWER, situation: 'S.', action: 'A.', result: 'R.' };
		expect(buildAnswer(a)).toBe('S. A. R.');
		expect(buildAnswer(EMPTY_ANSWER)).toBe('');
		expect(totalWords(a)).toBe(3);
	});

	it('gives a speaking time range from 130 to 150 words per minute', () => {
		expect(speakingSeconds(0)).toEqual({ min: 0, max: 0 });
		expect(speakingSeconds(-5)).toEqual({ min: 0, max: 0 });
		expect(speakingSeconds(NaN)).toEqual({ min: 0, max: 0 });
		expect(speakingSeconds(150)).toEqual({ min: 60, max: 69 });
		expect(speakingTimeText(0)).toBe('-');
		expect(speakingTimeText(150)).toBe('about 1 min to 1 min 9 sec');
		expect(speakingTimeText(1000000)).toContain('min');
	});

	it('hints when Action is shorter than Situation', () => {
		expect(actionHint({ ...EMPTY_ANSWER, situation: 'a b c', action: 'a b' })).toMatch(/longest/);
		expect(actionHint({ ...EMPTY_ANSWER, situation: 'a b c', action: 'a b c' })).toBeNull();
		expect(actionHint({ ...EMPTY_ANSWER, situation: '', action: '' })).toBeNull();
	});

	it('formats saved answers with the question', () => {
		const a = { ...EMPTY_ANSWER, question: 'Q?', situation: 'S.' };
		expect(formatSaved(a)).toBe('Question: Q?\n\nS.');
		expect(formatSaved({ ...a, question: '' })).toBe('S.');
		expect(formatAll([a, a])).toContain('---');
		expect(isEmptyAnswer(EMPTY_ANSWER)).toBe(true);
		expect(isEmptyAnswer(a)).toBe(false);
	});

	it('makes different ids', () => {
		expect(newId(1, 0.1)).not.toBe(newId(1, 0.2));
	});

	it('uses no em dash or en dash', () => {
		const text = JSON.stringify([STAR_PARTS, actionHint({ ...EMPTY_ANSWER, situation: 'a b', action: 'a' }), meta]);
		expect(DASH.test(text)).toBe(false);
	});

	it('has valid meta lengths', () => {
		expect(meta.title.length).toBeLessThanOrEqual(70);
		expect(meta.description.length).toBeLessThanOrEqual(160);
	});
});
