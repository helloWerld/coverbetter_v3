import { describe, expect, it } from 'vitest';
import {
	analyzeLetter,
	countSyllables,
	fleschKincaidGrade,
	formatReadingTime,
	splitParagraphs,
	splitSentences,
	splitWords,
} from './logic';

describe('countSyllables', () => {
	it('counts common words', () => {
		const cases: Record<string, number> = {
			the: 1,
			cat: 1,
			world: 1,
			hello: 2,
			table: 2,
			letter: 2,
			banana: 3,
			beautiful: 3,
			worked: 1,
			wanted: 2,
			queue: 1,
			manager: 3,
			reports: 2,
			I: 1,
			'250': 1,
		};
		for (const [word, n] of Object.entries(cases)) expect(countSyllables(word), word).toBe(n);
	});

	it('ignores marks and gives 0 for no letters', () => {
		expect(countSyllables('hello,')).toBe(2);
		expect(countSyllables('...')).toBe(0);
		expect(countSyllables('')).toBe(0);
	});

	it('gives at least 1 for a word that has letters', () => {
		for (const w of ['rhythm', 'hmm', 'strengths', 'brrr']) expect(countSyllables(w), w).toBeGreaterThanOrEqual(1);
	});
});

describe('splitWords and splitSentences', () => {
	it('counts words and skips lone marks', () => {
		expect(splitWords('one  two\nthree - four')).toHaveLength(4);
		expect(splitWords('')).toEqual([]);
	});

	it('splits at . ! ?', () => {
		expect(splitSentences('I came. I saw! Did I win? Yes.')).toHaveLength(4);
	});

	it('keeps common abbreviations and decimals inside a sentence', () => {
		expect(splitSentences('Dear Ms. Ortiz, I met Dr. Lee. We grew sales 2.5 times.')).toEqual([
			'Dear Ms. Ortiz, I met Dr. Lee.',
			'We grew sales 2.5 times.',
		]);
		expect(splitSentences('I know e.g. SQL. I like it.')).toHaveLength(2);
	});

	it('handles text with no end mark and empty text', () => {
		expect(splitSentences('No end mark here')).toEqual(['No end mark here']);
		expect(splitSentences('   ')).toEqual([]);
	});
});

describe('splitParagraphs', () => {
	it('marks a short greeting and sign-off as not body', () => {
		const p = splitParagraphs('Dear Ms. Ortiz,\n\nI want this job. I am ready.\n\nSincerely,\nSam Lee');
		expect(p.map((x) => x.body)).toEqual([false, true, false]);
	});
});

describe('fleschKincaidGrade', () => {
	it('uses the standard formula and returns 0 when there is nothing to measure', () => {
		expect(fleschKincaidGrade(9, 2, 9)).toBeCloseTo(-2.035, 3);
		expect(fleschKincaidGrade(0, 0, 0)).toBe(0);
		expect(fleschKincaidGrade(10, 0, 10)).toBe(0);
	});
});

describe('analyzeLetter on a known text', () => {
	it('counts a short text', () => {
		const s = analyzeLetter('The cat sat on the mat. It was happy.');
		expect(s.words).toBe(9);
		expect(s.sentences).toBe(2);
		expect(s.paragraphs).toBe(1);
		expect(s.characters).toBe(37);
		expect(s.charactersNoSpaces).toBe(29);
		expect(s.avgSentenceWords).toBe(4.5);
		expect(s.longestSentenceWords).toBe(6);
		expect(s.syllables).toBe(10); // "happy" has 2
		expect(s.grade).toBe(-0.7);
		expect(s.readingSeconds).toBe(3);
	});

	it('counts a letter with a greeting, 2 paragraphs, and a sign-off', () => {
		const letter = 'Dear Ms. Ortiz,\n\nI am a data analyst. I like clear reports.\n\nI would like to talk.\n\nSincerely,\nSam Lee';
		const s = analyzeLetter(letter);
		expect(s.paragraphs).toBe(2);
		expect(s.sentences).toBe(3);
		expect(s.longestSentences[0].text).toBe('I am a data analyst.');
		expect(s.words).toBe(20);
	});

	it('returns zeros and no NaN for empty text', () => {
		const s = analyzeLetter('');
		expect(s).toMatchObject({ words: 0, characters: 0, paragraphs: 0, sentences: 0, avgSentenceWords: 0, grade: 0, readingSeconds: 0 });
		expect(s.checks.every((c) => !c.pass)).toBe(true);
		expect(Object.values(s).every((v) => typeof v !== 'number' || Number.isFinite(v))).toBe(true);
	});

	it('passes each check for a letter in the usual range', () => {
		const para = 'I build reports that people use every day, and I explain the numbers in plain words. '.repeat(0) +
			'I work as a data analyst at a clinic. I build weekly reports for the care team. I check each number twice before I send it. ' +
			'Last year I cut the time to make a report from three days to one day. The team now reviews the results on Monday morning. ' +
			'I want to bring the same care to your team. I enjoy teaching other people how to read a chart. ' +
			'This work taught me how to explain hard ideas in a simple way. I like to ask questions until the data makes sense.';
		const letter = Array.from({ length: 4 }, () => para).join('\n\n');
		const s = analyzeLetter(letter);
		expect(s.paragraphs).toBe(4);
		expect(s.words).toBeGreaterThanOrEqual(250);
		expect(s.words).toBeLessThanOrEqual(400);
		for (const id of ['words', 'paragraphs', 'page', 'sentence'] as const) {
			expect(s.checks.find((c) => c.id === id)?.pass, id).toBe(true);
		}
	});

	it('flags a very long sentence and a very long letter', () => {
		const long = Array.from({ length: 45 }, () => 'word').join(' ') + '.';
		const s = analyzeLetter(long);
		expect(s.longestSentenceWords).toBe(45);
		expect(s.checks.find((c) => c.id === 'sentence')?.pass).toBe(false);
		const big = analyzeLetter(('Short one here. ').repeat(500));
		expect(big.words).toBe(1500);
		expect(big.checks.find((c) => c.id === 'page')?.pass).toBe(false);
	});

	it('lists the longest sentences first, at most 5', () => {
		const s = analyzeLetter('A b. A b c d. A b c. A b c d e f. A. A b c d e. A b c d e f g.');
		expect(s.longestSentences).toHaveLength(5);
		expect(s.longestSentences.map((x) => x.words)).toEqual([7, 6, 5, 4, 3]);
	});

	it('has no em dash or en dash in any check text', () => {
		const s = analyzeLetter('Hello there. ' + 'word '.repeat(500));
		for (const c of s.checks) expect(JSON.stringify(c)).not.toMatch(/[\u2014\u2013]/);
	});
});

describe('formatReadingTime', () => {
	it('formats seconds and minutes', () => {
		expect(formatReadingTime(0)).toBe('0 sec');
		expect(formatReadingTime(30)).toBe('30 sec');
		expect(formatReadingTime(60)).toBe('1 min');
		expect(formatReadingTime(90)).toBe('1 min 30 sec');
	});
});
