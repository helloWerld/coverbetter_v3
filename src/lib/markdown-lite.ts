/**
 * A small Markdown reader for resumes: headings (#, ##, ###), bullet and numbered lists,
 * bold (**x**), italic (*x* or _x_), and paragraphs. It makes data, not HTML,
 * so text from an uploaded file can never run as code in the page.
 */

export type Inline = { text: string; bold?: boolean; italic?: boolean };
export type Block =
	| { type: 'heading'; level: 1 | 2 | 3; content: Inline[] }
	| { type: 'list'; ordered: boolean; items: Inline[][] }
	| { type: 'paragraph'; lines: Inline[][] };

/** Splits one line into plain, bold, and italic parts. */
export function parseInline(line: string): Inline[] {
	const out: Inline[] = [];
	const re = /\*\*(.+?)\*\*|(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])|(?<![\w_])_(?!\s)(.+?)(?<!\s)_(?![\w_])/g;
	let last = 0;
	for (const m of line.matchAll(re)) {
		if (m.index > last) out.push({ text: line.slice(last, m.index) });
		if (m[1] !== undefined) out.push({ text: m[1], bold: true });
		else out.push({ text: m[2] ?? m[3], italic: true });
		last = m.index + m[0].length;
	}
	if (last < line.length) out.push({ text: line.slice(last) });
	return out.filter((x) => x.text.length > 0);
}

const BULLET = /^\s*[-*+•]\s+(.*)$/;
const NUMBER = /^\s*\d+[.)]\s+(.*)$/;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;

export function parseMarkdown(src: string): Block[] {
	const blocks: Block[] = [];
	let para: Inline[][] = [];
	let list: { ordered: boolean; items: Inline[][] } | null = null;
	const flush = () => {
		if (para.length) blocks.push({ type: 'paragraph', lines: para });
		if (list) blocks.push({ type: 'list', ...list });
		para = [];
		list = null;
	};
	for (const raw of src.replace(/\r\n?/g, '\n').split('\n')) {
		const line = raw.trimEnd();
		if (!line.trim()) {
			flush();
			continue;
		}
		const h = HEADING.exec(line);
		if (h) {
			flush();
			blocks.push({ type: 'heading', level: Math.min(h[1].length, 3) as 1 | 2 | 3, content: parseInline(h[2]) });
			continue;
		}
		const b = BULLET.exec(line);
		const n = b ? null : NUMBER.exec(line);
		if (b || n) {
			const ordered = Boolean(n);
			if (para.length || (list && list.ordered !== ordered)) flush();
			list ??= { ordered, items: [] };
			list.items.push(parseInline((b ?? n)![1]));
			continue;
		}
		if (list) flush();
		para.push(parseInline(line.trim()));
	}
	flush();
	return blocks;
}
