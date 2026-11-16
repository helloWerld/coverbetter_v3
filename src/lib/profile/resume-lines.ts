import { getDocumentProxy } from 'unpdf';
import mammoth from 'mammoth';

/**
 * A line of resume text with layout hints. The parser uses the hints to find
 * headings, job headers and bullets.
 */
export type Line = {
	text: string;
	/** Font size in points. DOCX gives an estimate. */
	size: number;
	bold: boolean;
	/** Left edge in points. */
	x: number;
	/** 1-based page number. */
	page: number;
	/** Vertical gap to the previous line, in median line heights. 1 is normal spacing. */
	gapBefore: number;
	listItem: boolean;
};

const BOLD_FONT = /bold|black|semibold|demi|heavy/i;
const Y_TOLERANCE = 2;

type RawItem = { str: string; x: number; y: number; w: number; size: number; bold: boolean };
type RawLine = { text: string; size: number; bold: boolean; x: number; y: number };

// ---------- PDF ----------

/** Minimal shape of the pdf.js objects we touch. Keeps us free of pdf.js type imports. */
type PdfPage = {
	getTextContent: () => Promise<{
		items: unknown[];
		styles?: Record<string, { fontFamily?: string }>;
	}>;
	getOperatorList?: () => Promise<unknown>;
	commonObjs?: { has: (id: string) => boolean; get: (id: string) => unknown };
};

function median(values: number[]): number {
	if (values.length === 0) return 0;
	const s = [...values].sort((a, b) => a - b);
	const mid = Math.floor(s.length / 2);
	return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

type FontObj = { name?: string; loadedName?: string; bold?: boolean; black?: boolean };

/**
 * Tell which fonts are bold. The font object is only in commonObjs after pdf.js has read the
 * page operators. It has bold/black flags and a name. The style family is the last fallback.
 */
async function readBoldFonts(
	page: PdfPage,
	styles: Record<string, { fontFamily?: string }>,
	ids: Set<string>,
): Promise<Map<string, boolean>> {
	try {
		await page.getOperatorList?.();
	} catch {
		// Without operators we can still use the style names below.
	}
	const out = new Map<string, boolean>();
	for (const id of ids) {
		let bold = false;
		try {
			if (page.commonObjs?.has(id)) {
				const f = page.commonObjs.get(id) as FontObj | undefined;
				bold = !!(f?.bold || f?.black) || BOLD_FONT.test(`${f?.name ?? ''} ${f?.loadedName ?? ''}`);
			}
		} catch {
			// The font object may not be resolved. Fall through.
		}
		if (!bold) bold = BOLD_FONT.test(styles[id]?.fontFamily ?? '');
		out.set(id, bold);
	}
	return out;
}

/** Group items into lines by y position, then order each line by x. */
function groupItems(items: RawItem[]): RawLine[] {
	const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
	const clusters: RawItem[][] = [];
	let anchor = Number.NaN;
	for (const it of sorted) {
		if (clusters.length === 0 || Math.abs(it.y - anchor) > Y_TOLERANCE) {
			clusters.push([it]);
			anchor = it.y;
		} else {
			clusters[clusters.length - 1].push(it);
		}
	}
	const lines: RawLine[] = [];
	for (const cluster of clusters) {
		cluster.sort((a, b) => a.x - b.x);
		let text = '';
		let prevEnd: number | null = null;
		let chars = 0;
		let boldChars = 0;
		let best = cluster[0];
		for (const it of cluster) {
			const n = it.str.replace(/\s/g, '').length;
			chars += n;
			if (it.bold) boldChars += n;
			if (it.str.length > best.str.length) best = it;
			if (prevEnd !== null && it.x - prevEnd > it.size * 0.18 && !/\s$/.test(text) && !/^\s/.test(it.str)) {
				text += ' ';
			}
			text += it.str;
			prevEnd = it.x + it.w;
		}
		text = text.replace(/\s+/g, ' ').trim();
		if (!text) continue;
		lines.push({
			text,
			size: best.size,
			bold: chars > 0 && boldChars / chars > 0.5,
			x: cluster[0].x,
			y: cluster[0].y,
		});
	}
	return lines;
}

/**
 * Find the x position of a gutter between two text columns, or null.
 * A gutter is a vertical strip that almost no item crosses, with a steady left edge
 * of text on its right side (right-aligned dates do not have a steady left edge).
 */
function findGutter(items: RawItem[], pageWidth: number): number | null {
	if (items.length < 12 || pageWidth <= 0) return null;
	const lo = Math.floor(pageWidth * 0.2);
	const hi = Math.ceil(pageWidth * 0.8);
	const maxCross = Math.max(1, Math.floor(items.length * 0.15));
	const open: boolean[] = [];
	for (let g = lo; g <= hi; g++) {
		let cross = 0;
		for (const it of items) if (it.x < g && it.x + it.w > g) cross++;
		open.push(cross <= maxCross);
	}
	// Longest run of open positions.
	let bestStart = -1;
	let bestLen = 0;
	for (let i = 0; i < open.length; ) {
		if (!open[i]) {
			i++;
			continue;
		}
		let j = i;
		while (j < open.length && open[j]) j++;
		if (j - i > bestLen) {
			bestLen = j - i;
			bestStart = i;
		}
		i = j;
	}
	if (bestLen < 12) return null;
	const g = lo + bestStart + bestLen / 2;
	const left = items.filter((it) => it.x + it.w <= g + 1);
	const right = items.filter((it) => it.x >= g - 1);
	if (left.length < items.length * 0.25 || right.length < items.length * 0.25) return null;
	const rightEdges = new Map<number, number>();
	for (const it of right) {
		const k = Math.round(it.x / 3);
		rightEdges.set(k, (rightEdges.get(k) ?? 0) + 1);
	}
	const topEdge = Math.max(...rightEdges.values());
	if (topEdge < 4 || topEdge < right.length * 0.4) return null;
	return g;
}

/** Order the items of one page. Two-column pages: left column first, then right. */
function pageLines(items: RawItem[], pageWidth: number): RawLine[] {
	const gutter = findGutter(items, pageWidth);
	if (gutter === null) return groupItems(items);

	const crossing = items.filter((it) => it.x < gutter && it.x + it.w > gutter);
	const rest = items.filter((it) => !(it.x < gutter && it.x + it.w > gutter));
	const fullLines = groupItems(crossing);
	// Full-width lines split the page into bands. Inside a band: left column, then right.
	const bandOf = (y: number) => fullLines.filter((l) => l.y > y + Y_TOLERANCE).length;
	const out: RawLine[] = [];
	for (let band = 0; band <= fullLines.length; band++) {
		const inBand = rest.filter((it) => bandOf(it.y) === band);
		out.push(...groupItems(inBand.filter((it) => it.x + it.w / 2 < gutter)));
		out.push(...groupItems(inBand.filter((it) => it.x + it.w / 2 >= gutter)));
		if (band < fullLines.length) out.push(fullLines[band]);
	}
	return out;
}

export async function pdfToLines(bytes: Uint8Array): Promise<Line[]> {
	// unpdf may detach the buffer, so give it a copy.
	const pdf = await getDocumentProxy(new Uint8Array(bytes));
	const pages: { lines: RawLine[]; page: number }[] = [];

	for (let p = 1; p <= pdf.numPages; p++) {
		const page = (await pdf.getPage(p)) as unknown as PdfPage & {
			getViewport: (o: { scale: number }) => { width: number };
		};
		const content = await page.getTextContent();
		const styles = content.styles ?? {};
		const raw = content.items.filter(
			(i): i is { str: string; transform: number[]; width: number; height: number; fontName?: string } =>
				typeof (i as { str?: unknown }).str === 'string' &&
				Array.isArray((i as { transform?: unknown }).transform),
		);
		const ids = new Set<string>();
		for (const i of raw) if (i.fontName) ids.add(i.fontName);
		const boldFonts = await readBoldFonts(page, styles, ids);

		const items: RawItem[] = [];
		for (const i of raw) {
			if (!i.str.trim()) continue;
			const t = i.transform;
			const size = Math.hypot(t[0], t[1]) || i.height || 0;
			items.push({
				str: i.str,
				x: t[4],
				y: t[5],
				w: i.width,
				size: Math.round(size * 10) / 10,
				bold: i.fontName ? (boldFonts.get(i.fontName) ?? false) : false,
			});
		}
		pages.push({ lines: pageLines(items, page.getViewport({ scale: 1 }).width), page: p });
	}

	// Line height: the median gap between neighbouring lines in reading order.
	const diffs: number[] = [];
	for (const { lines } of pages) {
		for (let i = 1; i < lines.length; i++) {
			const d = lines[i - 1].y - lines[i].y;
			if (d > 0.5) diffs.push(d);
		}
	}
	const lineHeight = median(diffs) || 12;

	const out: Line[] = [];
	for (const { lines, page } of pages) {
		lines.forEach((l, i) => {
			const d = i === 0 ? 0 : lines[i - 1].y - l.y;
			// A jump back up the page (new column) counts as normal spacing.
			const gap = i === 0 ? (out.length === 0 ? 0 : 1) : d > 0 ? d / lineHeight : 1;
			out.push({
				text: l.text,
				size: l.size,
				bold: l.bold,
				x: l.x,
				page,
				gapBefore: Math.round(gap * 100) / 100,
				listItem: false,
			});
		});
	}
	return out;
}

// ---------- DOCX ----------

/**
 * mammoth reads `buffer` in its Node build and `arrayBuffer` in its browser
 * build. A bundler can pick either, so try both.
 */
async function docxToHtml(bytes: Uint8Array): Promise<string> {
	try {
		const res = await mammoth.convertToHtml({ buffer: Buffer.from(bytes) });
		return res.value;
	} catch (err) {
		if (!String(err).includes('Could not find file')) throw err;
		const arrayBuffer = bytes.slice().buffer as ArrayBuffer;
		const res = await mammoth.convertToHtml({ arrayBuffer });
		return res.value;
	}
}

function decodeEntities(s: string): string {
	return s
		.replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
		.replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(parseInt(d, 10)))
		.replace(/&nbsp;/g, ' ')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&amp;/g, '&');
}

const HEADING_SIZE: Record<string, number> = { h1: 20, h2: 16, h3: 14, h4: 12.5, h5: 12.5, h6: 12.5 };
const BODY_SIZE = 11;
const BLOCK_TAGS = new Set(['p', 'li', 'td', 'th', 'tr', 'ul', 'ol', 'table', 'div', 'br', ...Object.keys(HEADING_SIZE)]);

export function htmlToLines(html: string): Line[] {
	const out: Line[] = [];
	let heading: string | null = null;
	let liDepth = 0;
	let strongDepth = 0;
	let buf = '';
	let strongChars = 0;
	let blockIsList = false;
	let blockHeading: string | null = null;

	const flush = () => {
		const text = decodeEntities(buf).replace(/\s+/g, ' ').trim();
		if (text) {
			const chars = text.replace(/\s/g, '').length;
			const isHeading = blockHeading !== null;
			out.push({
				text,
				size: isHeading ? HEADING_SIZE[blockHeading as string] : BODY_SIZE,
				bold: isHeading || (chars > 0 && strongChars / chars > 0.6),
				x: blockIsList ? 18 : 0,
				page: 1,
				gapBefore: out.length === 0 ? 0 : 1,
				listItem: blockIsList,
			});
		}
		buf = '';
		strongChars = 0;
		// A line break inside a list item gives a plain line.
		blockIsList = false;
		blockHeading = heading;
	};

	const tag = /<(\/?)([a-z][a-z0-9]*)\b[^>]*?(\/?)>|([^<]+)/gi;
	let m: RegExpExecArray | null;
	while ((m = tag.exec(html)) !== null) {
		if (m[4] !== undefined) {
			buf += m[4];
			if (strongDepth > 0) strongChars += decodeEntities(m[4]).replace(/\s/g, '').length;
			continue;
		}
		const closing = m[1] === '/';
		const name = m[2].toLowerCase();
		if (name === 'strong' || name === 'b') {
			strongDepth = Math.max(0, strongDepth + (closing ? -1 : 1));
			continue;
		}
		if (!BLOCK_TAGS.has(name)) continue;
		if (name === 'br') {
			flush();
			continue;
		}
		flush();
		if (name in HEADING_SIZE) {
			heading = closing ? null : name;
			blockHeading = heading;
		} else if (name === 'li') {
			liDepth = Math.max(0, liDepth + (closing ? -1 : 1));
			blockIsList = !closing;
		}
		if (!closing && liDepth > 0 && name === 'p') blockIsList = true;
	}
	flush();
	return out;
}

export async function docxToLines(bytes: Uint8Array): Promise<Line[]> {
	return htmlToLines(await docxToHtml(bytes));
}
