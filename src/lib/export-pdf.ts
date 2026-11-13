import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import { getTemplate, type LetterDoc, type TemplateId } from './templates';

const PAGE_W = 612;
const PAGE_H = 792;

function color(hex: string) {
	const n = parseInt(hex.slice(1), 16);
	return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/** Replaces characters the standard fonts cannot encode. */
function clean(text: string, font: PDFFont): string {
	const ok = new Set(font.getCharacterSet());
	return Array.from(text.replace(/\t/g, '    '))
		.map((ch) => {
			if (ok.has(ch.codePointAt(0)!)) return ch;
			if (ch === '→') return '->';
			return '?';
		})
		.join('');
}

/** Wraps one line of text to a width. Breaks words that are too long. */
function wrap(text: string, font: PDFFont, size: number, width: number) {
	const lines: string[] = [];
	let line = '';
	const push = () => {
		lines.push(line);
		line = '';
	};
	for (const word of text.split(/\s+/).filter(Boolean)) {
		const next = line ? `${line} ${word}` : word;
		if (font.widthOfTextAtSize(next, size) <= width) {
			line = next;
			continue;
		}
		if (line) push();
		let rest = word;
		while (font.widthOfTextAtSize(rest, size) > width) {
			let cut = rest.length - 1;
			while (cut > 1 && font.widthOfTextAtSize(rest.slice(0, cut), size) > width)
				cut--;
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
): Promise<Uint8Array> {
	const t = getTemplate(templateId);
	const pdf = await PDFDocument.create();
	const regular = await pdf.embedFont(StandardFonts[t.pdfFont]);
	const bold = await pdf.embedFont(
		StandardFonts[t.pdfFont === 'TimesRoman' ? 'TimesRomanBold' : 'HelveticaBold'],
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
		font: PDFFont,
		size: number,
		hex: string,
		align: 'left' | 'center',
		leading: number,
	) => {
		ensure(leading);
		y -= size;
		const w = font.widthOfTextAtSize(text, size);
		const x = align === 'center' ? margin + (width - w) / 2 : margin;
		page.drawText(text, { x, y, size, font, color: color(hex) });
		y -= leading - size;
	};

	// Header
	if (doc.name) {
		const font = t.nameBold ? bold : regular;
		for (const l of wrap(clean(doc.name, font), font, t.namePt, width))
			drawLine(l, font, t.namePt, t.nameColor, t.headerAlign, t.namePt * 1.25);
	}
	if (doc.contactLine) {
		for (const l of wrap(clean(doc.contactLine, regular), regular, t.contactPt, width))
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
	drawLine(clean(doc.date, regular), regular, t.bodyPt, t.bodyColor, 'left', lead);
	y -= t.paragraphGapPt;

	// Body
	for (const para of doc.paragraphs) {
		for (const raw of para.split('\n')) {
			for (const l of wrap(clean(raw, regular), regular, t.bodyPt, width))
				drawLine(l, regular, t.bodyPt, t.bodyColor, 'left', lead);
		}
		y -= t.paragraphGapPt;
	}

	return pdf.save();
}
