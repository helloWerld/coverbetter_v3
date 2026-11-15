export type StarKey = 'situation' | 'task' | 'action' | 'result';

export type StarAnswer = {
	question: string;
	situation: string;
	task: string;
	action: string;
	result: string;
};

export type SavedAnswer = StarAnswer & { id: string; savedAt: number };

export const EMPTY_ANSWER: StarAnswer = { question: '', situation: '', task: '', action: '', result: '' };

export const STAR_PARTS: readonly { key: StarKey; label: string; tip: string; placeholder: string }[] = [
	{
		key: 'situation',
		label: 'Situation',
		tip: 'Set the scene in 1 or 2 sentences: where, when, and what was going on.',
		placeholder: 'Last spring, our team had to ship a report with two days left.',
	},
	{
		key: 'task',
		label: 'Task',
		tip: 'Say what you had to do, and why it was your job.',
		placeholder: 'I owned the final numbers and had to check them.',
	},
	{
		key: 'action',
		label: 'Action',
		tip: 'Say what you did, step by step. Use "I", not "we". This part is usually the longest.',
		placeholder: 'I listed the open items, asked for help on two, and checked every total.',
	},
	{
		key: 'result',
		label: 'Result',
		tip: 'Say what happened. Add a number if you have one, and what you learned.',
		placeholder: 'We shipped on time and the client sent no corrections.',
	},
];

/** Counts words. Splits on any white space. */
export function countWords(text: string): number {
	const t = text.trim();
	return t === '' ? 0 : t.split(/\s+/).length;
}

/** The answer as one block of text, in order. Empty parts are skipped. */
export function buildAnswer(a: StarAnswer): string {
	return [a.situation, a.task, a.action, a.result]
		.map((s) => s.trim())
		.filter(Boolean)
		.join(' ');
}

export function totalWords(a: StarAnswer): number {
	return countWords(buildAnswer(a));
}

/** A rough speaking time range in seconds, from 130 to 150 words per minute. */
export function speakingSeconds(words: number): { min: number; max: number } {
	if (!Number.isFinite(words) || words <= 0) return { min: 0, max: 0 };
	return { min: Math.round((words / 150) * 60), max: Math.round((words / 130) * 60) };
}

export function formatSeconds(s: number): string {
	if (s < 60) return `${s} sec`;
	const m = Math.floor(s / 60);
	const r = s % 60;
	return r === 0 ? `${m} min` : `${m} min ${r} sec`;
}

export function speakingTimeText(words: number): string {
	const { min, max } = speakingSeconds(words);
	if (max === 0) return '-';
	const a = formatSeconds(min);
	const b = formatSeconds(max);
	return a === b ? `about ${a}` : `about ${a} to ${b}`;
}

/** A hint when Action is shorter than Situation. Returns null when no hint is needed. */
export function actionHint(a: StarAnswer): string | null {
	const sit = countWords(a.situation);
	const act = countWords(a.action);
	if (sit === 0 || act >= sit) return null;
	return 'Your Action part is shorter than your Situation part. The Action part should usually be the longest. Say more about what you did.';
}

/** The answer with the question on top, for copy and for download. */
export function formatSaved(a: StarAnswer): string {
	const body = buildAnswer(a);
	const q = a.question.trim();
	return q ? `Question: ${q}\n\n${body}` : body;
}

export function formatAll(list: readonly StarAnswer[]): string {
	return list.map(formatSaved).join('\n\n---\n\n');
}

export function newId(now = Date.now(), rand = Math.random()): string {
	return `${now.toString(36)}-${Math.floor(rand * 1e6).toString(36)}`;
}

/** True when the answer has no text at all. */
export function isEmptyAnswer(a: StarAnswer): boolean {
	return buildAnswer(a) === '' && a.question.trim() === '';
}
