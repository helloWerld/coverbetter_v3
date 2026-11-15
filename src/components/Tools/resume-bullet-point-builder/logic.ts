// Pure logic for the resume bullet point builder. No React.

export type BulletInput = {
	verb: string;
	what: string;
	result: string;
	measure: string;
	how: string;
};

export type BulletVersion = { id: 'xyz' | 'how-first' | 'result-first'; label: string; text: string };

const clean = (s: string) => s.trim().replace(/\s+/g, ' ').replace(/[.;,:\s]+$/, '');

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const lowerFirst = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

/** Count characters the way a person sees them: one emoji or symbol is one character. */
export function charCount(text: string): number {
	return [...text].length;
}

/** Make the 3 versions of one bullet. Missing required parts stay as [Placeholders]. */
export function buildBullets(input: BulletInput): BulletVersion[] {
	const verb = cap(clean(input.verb)) || '[Action Verb]';
	const what = clean(input.what) || '[What You Did]';
	const result = clean(input.result) || '[Result]';
	const measure = clean(input.measure);
	const how = clean(input.how).replace(/^by\s+/i, '');

	const asMeasured = measure ? `, as measured by ${measure}` : '';
	const byHow = how ? `, by ${how}` : '';
	const xyz = `${verb} ${what}, resulting in ${result}${asMeasured}${byHow}.`;

	const howFirst = `${verb} ${what}${how ? ` by ${how}` : ''}, resulting in ${result}${measure ? ` (${measure})` : ''}.`;

	const resultFirst = `${cap(result)}${measure ? ` (${measure})` : ''}: ${lowerFirst(verb)} ${what}${how ? ` by ${how}` : ''}.`;

	return [
		{ id: 'xyz', label: 'Accomplished [X] as measured by [Y] by doing [Z]', text: xyz },
		{ id: 'how-first', label: 'Action, then how, then result', text: howFirst },
		{ id: 'result-first', label: 'Result first', text: resultFirst },
	];
}

const IRREGULAR_PAST = new Set([
	'led', 'built', 'ran', 'won', 'sold', 'wrote', 'taught', 'drove', 'grew', 'cut', 'made', 'set', 'spent', 'brought',
	'began', 'kept', 'met', 'put', 'held', 'sent', 'saw', 'found', 'chose', 'gave', 'got', 'shut', 'read', 'paid',
	'bought', 'caught', 'fed', 'hired', 'oversaw', 'undertook', 'overcame', 'withdrew', 'rebuilt', 'rewrote', 'upsold',
	'outsold', 'broke', 'drew', 'knew', 'lost', 'sought', 'wove',
]);

/** A rough check. True when the word looks like a past tense verb. It is a hint, not a grammar check. */
export function looksPastTense(verb: string): boolean {
	const w = verb.trim().toLowerCase();
	if (!w) return true;
	return w.endsWith('ed') || IRREGULAR_PAST.has(w);
}
