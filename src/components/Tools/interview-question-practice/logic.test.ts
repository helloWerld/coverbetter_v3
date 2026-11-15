import { describe, expect, it } from 'vitest';
import { QUESTIONS, TYPES, filterQuestions, formatClock, nextQuestion, randomQuestion } from './logic';
import { meta } from './meta';

const DASH = new RegExp(String.fromCharCode(91, 0x2013, 0x2014, 93));

describe('interview question bank', () => {
	it('has 100 or more unique questions', () => {
		expect(QUESTIONS.length).toBeGreaterThanOrEqual(100);
		expect(new Set(QUESTIONS.map((q) => q.q.toLowerCase())).size).toBe(QUESTIONS.length);
		expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
	});

	it('has questions of every type, and each has a tip', () => {
		for (const t of TYPES) expect(filterQuestions(t.value).length).toBeGreaterThan(0);
		expect(QUESTIONS.every((q) => q.tip.trim().length > 0 && q.q.trim().length > 0)).toBe(true);
		expect(filterQuestions('all').length).toBe(QUESTIONS.length);
	});

	it('picks random and next questions', () => {
		const list = filterQuestions('salary');
		expect(randomQuestion([], 1)).toBeUndefined();
		expect(randomQuestion(list, list[0].id, () => 0)?.id).not.toBe(list[0].id);
		expect(randomQuestion(list, undefined, () => 0.999999)).toBeDefined();
		expect(randomQuestion([list[0]], list[0].id)?.id).toBe(list[0].id);
		expect(nextQuestion([], 1)).toBeUndefined();
		expect(nextQuestion(list, list[list.length - 1].id)?.id).toBe(list[0].id);
		expect(nextQuestion(list, 99999)?.id).toBe(list[0].id);
	});

	it('formats the clock', () => {
		expect(formatClock(0)).toBe('0:00');
		expect(formatClock(90)).toBe('1:30');
		expect(formatClock(-4)).toBe('0:00');
		expect(formatClock(NaN)).toBe('0:00');
		expect(formatClock(180)).toBe('3:00');
	});

	it('uses no em dash or en dash', () => {
		expect(DASH.test(JSON.stringify([QUESTIONS, TYPES, meta]))).toBe(false);
	});

	it('has valid meta lengths', () => {
		expect(meta.title.length).toBeLessThanOrEqual(70);
		expect(meta.description.length).toBeLessThanOrEqual(160);
	});
});
