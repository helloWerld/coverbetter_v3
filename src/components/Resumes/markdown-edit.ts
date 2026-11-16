/** Text and selection of the Markdown editor. */
export type Edit = { text: string; start: number; end: number };

/** Puts `mark` on both sides of the selection, for bold or italic. With no selection it adds a placeholder. */
export function wrap(e: Edit, mark: string, placeholder: string): Edit {
	// A second click on the same text takes the marks off.
	const before = e.text.slice(Math.max(0, e.start - mark.length), e.start);
	const after = e.text.slice(e.end, e.end + mark.length);
	// A single * next to another * is part of ** (bold), so it is not italic to take off.
	const single = mark === '*' && (e.text[e.start - 2] === '*' || e.text[e.end + 1] === '*');
	if (e.end > e.start && before === mark && after === mark && !single) {
		const text = e.text.slice(0, e.start - mark.length) + e.text.slice(e.start, e.end) + e.text.slice(e.end + mark.length);
		return { text, start: e.start - mark.length, end: e.end - mark.length };
	}
	const sel = e.text.slice(e.start, e.end) || placeholder;
	const text = e.text.slice(0, e.start) + mark + sel + mark + e.text.slice(e.end);
	return { text, start: e.start + mark.length, end: e.start + mark.length + sel.length };
}

/** Starts each selected line with `prefix` ("## " or "- "). When all lines have it, a second click takes it off. */
export function prefixLines(e: Edit, prefix: string): Edit {
	const from = e.text.lastIndexOf('\n', e.start - 1) + 1;
	const nl = e.text.indexOf('\n', e.end);
	const to = nl === -1 ? e.text.length : nl;
	const original = e.text.slice(from, to);
	const lines = original.split('\n');
	const all = lines.every((l) => l.startsWith(prefix));
	const next = lines.map((l) => {
		const bare = l.replace(/^(#{1,6}\s+|[-*+]\s+|\d+[.)]\s+)/, '');
		return all ? bare : prefix + bare;
	});
	const block = next.join('\n');
	// Keep the selection on the same words, after the new mark.
	const start = Math.max(from + (all ? 0 : prefix.length), e.start + next[0].length - lines[0].length);
	const end = Math.max(start, e.end + block.length - original.length);
	return { text: e.text.slice(0, from) + block + e.text.slice(to), start, end };
}
