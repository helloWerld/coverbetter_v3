export type StarAnswer = { situation: string; task: string; action: string; result: string };

const PARTS = [
	['situation', 'Situation'],
	['task', 'Task'],
	['action', 'Action'],
	['result', 'Result'],
] as const;

/** The answer as labeled lines. Empty parts are skipped. */
export function starToText(a: StarAnswer): string {
	return PARTS.map(([key, label]) => [label, a[key].trim()] as const)
		.filter(([, text]) => text !== '')
		.map(([label, text]) => `${label}: ${text}`)
		.join('\n');
}

function words(text: string): number {
	const t = text.trim();
	return t === '' ? 0 : t.split(/\s+/).length;
}

export function starWordCount(a: StarAnswer): number {
	return PARTS.reduce((sum, [key]) => sum + words(a[key]), 0);
}

/** Short hints for the writer. An empty list means no hint. */
export function starChecks(a: StarAnswer): string[] {
	const hints: string[] = [];
	for (const [key, label] of PARTS) {
		if (words(a[key]) === 0) hints.push(`The ${label} part is empty.`);
	}

	const result = a.result.trim();
	if (result && !/\d/.test(result)) {
		hints.push('The result has no number. Add a count, a percent, or a time if you can.');
	}

	const action = a.action;
	const i = action.match(/\bI(?:'m|'ve|'ll|'d|’m|’ve|’ll|’d)?\b/g)?.length ?? 0;
	const we = action.match(/\b(?:we|we're|we've|we'll|our|us)\b/gi)?.length ?? 0;
	if (we > i) hints.push('The action uses "we" more than "I". Say what you did yourself.');

	if (starWordCount(a) > 300) hints.push('The answer is over 300 words. Cut it to about two minutes of speech.');
	return hints;
}
