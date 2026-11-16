/** Turns the text of an uploaded resume into Markdown, so the editor keeps some formatting. */

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };
const decode = (s: string) =>
	s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e: string) => {
		if (e[0] === '#') {
			const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
			return Number.isFinite(code) ? String.fromCodePoint(code) : m;
		}
		return ENTITIES[e.toLowerCase()] ?? m;
	});

/** The inline part of one HTML element: bold, italic, and line breaks. Other tags go away. */
function inline(html: string): string {
	return decode(
		html
			.replace(/<br\s*\/?>/gi, '\n')
			.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t: string) => (t.trim() ? `**${t.trim()}**` : ''))
			.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t: string) => (t.trim() ? `*${t.trim()}*` : ''))
			.replace(/<[^>]+>/g, ''),
	)
		.replace(/[ \t]+/g, ' ')
		.trim();
}

/** Simple HTML (from mammoth, for a DOCX file) to Markdown. */
export function htmlToMarkdown(html: string): string {
	const out: string[] = [];
	const re = /<(h[1-6]|p|ul|ol|table)\b[^>]*>([\s\S]*?)<\/\1>/gi;
	for (const m of html.matchAll(re)) {
		const tag = m[1].toLowerCase();
		const body = m[2];
		if (tag[0] === 'h') {
			const text = inline(body).replace(/\*\*/g, '');
			if (text) out.push(`${'#'.repeat(Math.min(Number(tag[1]), 3))} ${text}`);
		} else if (tag === 'ul' || tag === 'ol') {
			const items = [...body.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((x) => inline(x[1].replace(/<\/?(ul|ol)\b[^>]*>/gi, ' ')));
			out.push(items.filter(Boolean).map((t, i) => (tag === 'ol' ? `${i + 1}. ${t}` : `- ${t}`)).join('\n'));
		} else if (tag === 'table') {
			for (const cell of body.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
				const t = inline(cell[1]);
				if (t) out.push(t);
			}
		} else {
			const t = inline(body);
			if (t) out.push(t);
		}
	}
	return out.filter(Boolean).join('\n\n');
}

const BULLET_CHARS = /^[•·▪●◦‣○■□➢➤►▸\-–*]\s*/;

/** Plain text (from a PDF) to Markdown: bullet characters become "- ", and short ALL CAPS lines become headings. */
export function textToMarkdown(text: string): string {
	return text
		.split('\n')
		.map((raw) => {
			const line = raw.trim();
			if (!line) return '';
			if (BULLET_CHARS.test(line) && line.replace(BULLET_CHARS, '').length > 0) return `- ${line.replace(BULLET_CHARS, '')}`;
			const letters = line.replace(/[^A-Za-z]/g, '');
			if (letters.length >= 3 && line.length <= 40 && letters === letters.toUpperCase() && !/[.,;:]$/.test(line)) return `## ${line}`;
			return line;
		})
		.join('\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}
