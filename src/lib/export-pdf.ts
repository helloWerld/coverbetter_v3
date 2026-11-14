import { PDFDocument, rgb } from 'pdf-lib';
import { getLanguage } from './languages';
import { browserFontIO, notoFaces, standardFaces, type FontIO, type TextFace } from './pdf-fonts';
import { getTemplate, type LetterDoc, type TemplateId } from './templates';

const PAGE_W = 612;
const PAGE_H = 792;

function color(hex: string) {
	const n = parseInt(hex.slice(1), 16);
	return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

const CJK_CHAR = /[\u3000-\u9fff\uac00-\ud7af\uff00-\uffef]/u;
const CJK_SPLIT = /[\u3000-\u9fff\uac00-\ud7af\uff00-\uffef]|[^\u3000-\u9fff\uac00-\ud7af\uff00-\uffef]+/gu;

// Line-break rules for CJK text: these characters never start a line,
// and opening brackets never end a line.
const NO_LINE_START = new Set(Array.from('、。，．,.：:；;！!？?）)」』】〕〉》％%ー・ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ'));
const NO_LINE_END = new Set(Array.from('（(「『【〔〈《'));

/** Splits one word into break pieces: one per CJK character, with the line-break rules applied. */
export function cjkPieces(word: string): string[] {
	const out: string[] = [];
	for (const part of word.match(CJK_SPLIT) ?? [word]) {
		const prev = out[out.length - 1];
		if (prev !== undefined && (NO_LINE_START.has(part[0]) || NO_LINE_END.has(prev[prev.length - 1]))) {
			out[out.length - 1] = prev + part;
		} else {
			out.push(part);
		}
	}
	return out;
}

/** Wraps one line of text to a width. Breaks words that are too long. */
function wrap(text: string, font: TextFace, size: number, width: number) {
	const lines: string[] = [];
	let line = '';
	const push = () => {
		lines.push(line);
		line = '';
	};
	// A piece is a word. For CJK fonts a word splits into one piece per CJK character.
	const pieces: { text: string; space: boolean }[] = [];
	for (const word of text.split(/\s+/).filter(Boolean)) {
		const parts =
			font.breaksBetweenCjk && CJK_CHAR.test(word) ? cjkPieces(word) : [word];
		parts.forEach((p, i) => pieces.push({ text: p, space: i === 0 }));
	}
	for (const { text: word, space } of pieces) {
		const next = line ? (space ? `${line} ${word}` : `${line}${word}`) : word;
		if (font.width(next, size) <= width) {
			line = next;
			continue;
		}
		if (line) push();
		let rest = word;
		while (font.width(rest, size) > width) {
			let cut = rest.length - 1;
			while (cut > 1 && font.width(rest.slice(0, cut), size) > width) cut--;
			lines.push(rest.slice(0, cut));
			rest = rest.slice(cut);
		}
		line = rest;
	}
	if (line || lines.length === 0) push();
	return lines;
}

/** Renders the letter as a US Letter PDF. Works in the browser and in Node. */
export async function renderPdf(
	doc: LetterDoc,
	templateId: TemplateId | string,
	io: FontIO = browserFontIO,
): Promise<Uint8Array> {
	const t = getTemplate(templateId);
	const lang = getLanguage(doc.language);
	const rtl = lang.dir === 'rtl';
	const pdf = await PDFDocument.create();
	const serif = t.pdfFont === 'TimesRoman';
	const { regular, bold } =
		lang.fontSet === 'standard'
			? await standardFaces(pdf, serif)
			: await notoFaces(
					pdf,
					lang.fontSet,
					serif,
					[doc.name, doc.contactLine, doc.date, ...doc.paragraphs].join(' '),
					io,
					rtl,
				);

	const margin = t.marginIn * 72;
	const width = PAGE_W - margin * 2;
	const lead = t.bodyPt * t.lineHeight;

	let page = pdf.addPage([PAGE_W, PAGE_H]);
	let y = PAGE_H - margin;

	const ensure = (needed: number) => {
		if (y - needed < margin) {
			page = pdf.addPage([PAGE_W, PAGE_H]);
			y = PAGE_H - margin;
		}
	};

	const drawLine = (
		text: string,
		font: TextFace,
		size: number,
		hex: string,
		align: 'left' | 'center',
		leading: number,
	) => {
		ensure(leading);
		y -= size;
		const w = font.width(text, size);
		const x =
			align === 'center'
				? margin + (width - w) / 2
				: rtl
					? margin + width - w
					: margin;
		font.draw(page, text, x, y, size, hex);
		y -= leading - size;
	};

	// Header
	if (doc.name) {
		const font = t.nameBold ? bold : regular;
		for (const l of wrap(font.clean(doc.name), font, t.namePt, width))
			drawLine(l, font, t.namePt, t.nameColor, t.headerAlign, t.namePt * 1.25);
	}
	if (doc.contactLine) {
		for (const l of wrap(regular.clean(doc.contactLine), regular, t.contactPt, width))
			drawLine(l, regular, t.contactPt, t.contactColor, t.headerAlign, t.contactPt * 1.4);
	}
	if (doc.name || doc.contactLine) {
		if (t.accentRule) {
			y -= 8;
			page.drawLine({
				start: { x: margin, y },
				end: { x: margin + width, y },
				thickness: t.accentRule.widthPt,
				color: color(t.accentRule.color),
			});
			y -= t.accentRule.widthPt;
		}
		y -= t.headerGapPt;
	}

	// Date
	drawLine(regular.clean(doc.date), regular, t.bodyPt, t.bodyColor, 'left', lead);
	y -= t.paragraphGapPt;

	// Body
	for (const para of doc.paragraphs) {
		for (const raw of para.split('\n')) {
			for (const l of wrap(regular.clean(raw), regular, t.bodyPt, width))
				drawLine(l, regular, t.bodyPt, t.bodyColor, 'left', lead);
		}
		y -= t.paragraphGapPt;
	}

	return pdf.save();
}
