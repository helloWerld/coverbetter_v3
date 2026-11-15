// Pure logic for the cover letter length checker. No React.

/** Silent reading pace used for the time estimate. It is an assumed pace, not a measured one. */
export const READING_WPM = 200;

/** Count the syllables in one word with a simple rule set. It is a heuristic: a few words come out wrong. */
export function countSyllables(word: string): number {
	let w = word.toLowerCase().replace(/[^a-z0-9]/g, '');
	if (w === '') return 0;
	if (/\d/.test(w)) return 1;
	if (w.length <= 3) return 1;
	// Drop a silent ending: "es" or "e" after a consonant (not "le"), and "ed" unless after t or d.
	w = w.replace(/(?:[^laeiouy]es|(?<![td])ed|[^laeiouy]e)$/, '').replace(/^y/, '');
	const groups = w.match(/[aeiouy]+/g);
	return groups ? groups.length : 1;
}

/** Words are chunks split by spaces that have a letter or a digit. */
export function splitWords(text: string): string[] {
	return text.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t));
}

const ABBREVIATIONS = ['mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'st', 'vs', 'etc', 'inc', 'ltd', 'co', 'no'];
const DOT = '\u0000';

function protectDots(text: string): string {
	let t = text;
	for (const a of ABBREVIATIONS) t = t.replace(new RegExp(`\\b(${a})\\.`, 'gi'), `$1${DOT}`);
	// "e.g." and "i.e.", and letters with dots, like "U.S."
	t = t.replace(/\b(e)\.(g)\./gi, `$1${DOT}$2${DOT}`).replace(/\b(i)\.(e)\./gi, `$1${DOT}$2${DOT}`);
	t = t.replace(/\b([A-Za-z])\.(?=[A-Za-z]\.)/g, `$1${DOT}`).replace(/\b([A-Za-z])\.(?=\s?[a-z])/g, `$1${DOT}`);
	// Numbers with a decimal point.
	t = t.replace(/(\d)\.(\d)/g, `$1${DOT}$2`);
	return t;
}

/** Split text into sentences. Handles ".", "!", "?", common abbreviations, and decimals. */
export function splitSentences(text: string): string[] {
	const t = protectDots(text.replace(/\s+/g, ' ').trim());
	if (t === '') return [];
	const parts = t.split(/(?<=[.!?]["')\]”’]*)\s+/);
	return parts.map((p) => p.split(DOT).join('.').trim()).filter((p) => /[\p{L}\p{N}]/u.test(p));
}

export type Paragraph = { text: string; body: boolean };

/** Split into paragraphs at blank lines. A short block with no end mark (greeting, sign-off, address) is not body text. */
export function splitParagraphs(text: string): Paragraph[] {
	return text
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter((p) => p !== '')
		.map((p) => {
			const hasEnd = /[.!?]["')\]\u201d\u2019]*$/.test(p);
			return { text: p, body: hasEnd || splitWords(p).length > 12 };
		});
}

export type Check = {
	id: 'words' | 'paragraphs' | 'page' | 'sentence' | 'grade';
	label: string;
	guideline: string;
	pass: boolean;
	detail: string;
};

export type SentenceInfo = { text: string; words: number };

export type LetterStats = {
	words: number;
	characters: number;
	charactersNoSpaces: number;
	paragraphs: number;
	sentences: number;
	avgSentenceWords: number;
	longestSentenceWords: number;
	syllables: number;
	grade: number;
	readingSeconds: number;
	longestSentences: SentenceInfo[];
	checks: Check[];
};

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Flesch-Kincaid grade level: 0.39 x (words per sentence) + 11.8 x (syllables per word) - 15.59. */
export function fleschKincaidGrade(words: number, sentences: number, syllables: number): number {
	if (words === 0 || sentences === 0) return 0;
	return 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
}

export function formatReadingTime(seconds: number): string {
	if (seconds <= 0) return '0 sec';
	if (seconds < 60) return `${Math.max(1, Math.round(seconds))} sec`;
	const m = Math.floor(seconds / 60);
	const s = Math.round(seconds % 60);
	return s === 0 ? `${m} min` : `${m} min ${s} sec`;
}

/** Analyze one letter. All numbers use the body text, so a greeting or a sign-off does not change the sentence math. */
export function analyzeLetter(text: string): LetterStats {
	const paragraphs = splitParagraphs(text);
	const body = paragraphs.filter((p) => p.body);
	const bodyText = body.map((p) => p.text).join('\n\n');
	const sentenceList = body.flatMap((p) => splitSentences(p.text));
	const sentenceInfo: SentenceInfo[] = sentenceList.map((s) => ({ text: s, words: splitWords(s).length }));
	const allWords = splitWords(text);
	const bodyWords = splitWords(bodyText);
	const syllables = bodyWords.reduce((sum, w) => sum + countSyllables(w), 0);
	const sentences = sentenceInfo.length;
	const longest = sentenceInfo.reduce((m, s) => Math.max(m, s.words), 0);
	const avg = sentences === 0 ? 0 : bodyWords.length / sentences;
	const grade = fleschKincaidGrade(bodyWords.length, sentences, syllables);
	const wordCount = allWords.length;

	const checks: Check[] = [
		{
			id: 'words',
			label: 'Word count',
			guideline: 'About 250 to 400 words',
			pass: wordCount >= 250 && wordCount <= 400,
			detail: wordCount === 0 ? 'No words yet.' : wordCount < 250 ? 'Short. Add one specific result.' : wordCount > 400 ? 'Long. Cut the least useful paragraph.' : 'In the usual range.',
		},
		{
			id: 'paragraphs',
			label: 'Paragraph count',
			guideline: '3 to 5 paragraphs',
			pass: body.length >= 3 && body.length <= 5,
			detail: body.length < 3 ? 'Few paragraphs. Split long blocks by idea.' : body.length > 5 ? 'Many paragraphs. Join related ideas.' : 'In the usual range.',
		},
		{
			id: 'page',
			label: 'Fits on one page',
			guideline: 'About 400 words or fewer, in 11 or 12 point type',
			pass: wordCount <= 400,
			detail: wordCount <= 400 ? 'Likely fits on one page.' : 'May run past one page. Check in your word processor.',
		},
		{
			id: 'sentence',
			label: 'Longest sentence',
			guideline: 'No sentence over about 30 words',
			pass: longest <= 30,
			detail: longest <= 30 ? 'No sentence is too long.' : `Your longest sentence has ${longest} words. Split it.`,
		},
		{
			id: 'grade',
			label: 'Reading grade level',
			guideline: 'About grade 8 to 12',
			pass: sentences > 0 && grade >= 8 && grade <= 12,
			detail: sentences === 0 ? 'No sentences yet.' : grade < 8 ? 'Low. Short, plain writing is fine if it is complete.' : grade > 12 ? 'High. Use shorter sentences and simpler words.' : 'In the usual range.',
		},
	];

	return {
		words: wordCount,
		characters: [...text].length,
		charactersNoSpaces: [...text.replace(/\s/g, '')].length,
		paragraphs: body.length,
		sentences,
		avgSentenceWords: round1(avg),
		longestSentenceWords: longest,
		syllables,
		grade: round1(grade),
		readingSeconds: Math.round((wordCount / READING_WPM) * 60),
		longestSentences: [...sentenceInfo].sort((a, b) => b.words - a.words).slice(0, 5),
		checks: wordCount === 0 ? checks.map((c) => ({ ...c, pass: false })) : checks,
	};
}
