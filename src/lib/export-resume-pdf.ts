import { PDFDocument, rgb } from 'pdf-lib';
import { standardFaces, type TextFace } from './pdf-fonts';
import { getTemplate } from './templates';
import type { ResumeDoc } from './profile/render';

const PAGE_W = 612;
const PAGE_H = 792;

function color(hex: string) {
	const n = parseInt(hex.slice(1), 16);
	return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/** Wraps text to a width. Breaks words that are too long. */
function wrap(text: string, font: TextFace, size: number, width: number): string[] {
	const lines: string[] = [];
	let line = '';
	for (const word of text.split(/\s+/).filter(Boolean)) {
		const next = line ? `${line} ${word}` : word;
		if (font.width(next, size) <= width) {
			line = next;
			continue;
		}
		if (line) lines.push(line);
		let rest = word;
		while (font.width(rest, size) > width) {
			let cut = rest.length - 1;
			while (cut > 1 && font.width(rest.slice(0, cut), size) > width) cut--;
			lines.push(rest.slice(0, cut));
			rest = rest.slice(cut);
		}
		line = rest;
	}
	if (line) lines.push(line);
	return lines;
}

/** Renders the resume as a one-column US Letter PDF with real text. Works in the browser and in Node. */
export async function renderResumePdf(doc: ResumeDoc, templateId: string): Promise<Uint8Array> {
	const t = getTemplate(templateId);
	const pdf = await PDFDocument.create();
	const { regular, bold } = await standardFaces(pdf, t.pdfFont === 'TimesRoman');

	const margin = t.marginIn * 72;
	const width = PAGE_W - margin * 2;
	const size = t.bodyPt;
	// Resumes are denser than letters, so cap the line height.
	const lead = size * Math.min(t.lineHeight, 1.3);
	const indent = 14;
	const center = t.headerAlign === 'center';
	const accent = t.accentRule?.color ?? t.nameColor;

	let page = pdf.addPage([PAGE_W, PAGE_H]);
	let y = PAGE_H - margin;
	const ensure = (needed: number) => {
		if (y - needed < margin) {
			page = pdf.addPage([PAGE_W, PAGE_H]);
			y = PAGE_H - margin;
		}
	};

	const drawLine = (text: string, font: TextFace, pt: number, hex: string, leading: number, x = margin, w = width, centered = false) => {
		ensure(leading);
		y -= pt;
		font.draw(page, text, centered ? x + (w - font.width(text, pt)) / 2 : x, y, pt, hex);
		y -= leading - pt;
	};
	const paragraph = (text: string, font: TextFace, pt: number, hex: string, leading: number, centered = false) => {
		for (const raw of text.split('\n'))
			for (const l of wrap(font.clean(raw), font, pt, width)) drawLine(l, font, pt, hex, leading, margin, width, centered);
	};

	// Header
	if (doc.name) paragraph(doc.name, t.nameBold ? bold : regular, t.namePt, t.nameColor, t.namePt * 1.25, center);
	if (doc.headline) paragraph(doc.headline, regular, t.contactPt + 1, t.contactColor, (t.contactPt + 1) * 1.4, center);
	if (doc.contactLine) paragraph(doc.contactLine, regular, t.contactPt, t.contactColor, t.contactPt * 1.4, center);
	if (doc.name || doc.headline || doc.contactLine) {
		if (t.accentRule) {
			y -= 6;
			page.drawLine({
				start: { x: margin, y },
				end: { x: margin + width, y },
				thickness: t.accentRule.widthPt,
				color: color(t.accentRule.color),
			});
		}
		y -= t.headerGapPt * 0.6;
	}

	const sectionTitle = (title: string) => {
		ensure(lead * 4); // keep the title with the first lines under it
		y -= t.paragraphGapPt * 0.6;
		drawLine(bold.clean(title.toUpperCase()), bold, size, accent, lead);
		page.drawLine({
			start: { x: margin, y: y + 2 },
			end: { x: margin + width, y: y + 2 },
			thickness: 0.5,
			color: color('#999999'),
		});
		y -= 4;
	};

	if (doc.summary) {
		sectionTitle('Summary');
		paragraph(doc.summary, regular, size, t.bodyColor, lead);
	}

	for (const sec of doc.sections) {
		sectionTitle(sec.title);
		for (const it of sec.items) {
			const heading = bold.clean(it.heading);
			const dates = regular.clean(it.dates);
			if (heading || dates) {
				ensure(lead * 3);
				const dw = dates ? regular.width(dates, size) + 12 : 0;
				const lines = heading ? wrap(heading, bold, size, width - dw) : [''];
				lines.forEach((l, i) => {
					if (i === 0 && dates) {
						ensure(lead);
						regular.draw(page, dates, margin + width - (dw - 12), y - size, size, t.contactColor);
					}
					if (l) drawLine(l, bold, size, t.bodyColor, lead);
					else drawLine('', regular, size, t.bodyColor, lead);
				});
			}
			if (it.subheading) paragraph(it.subheading, regular, size, t.contactColor, lead);
			if (it.text) paragraph(it.text, regular, size, t.bodyColor, lead);
			for (const b of it.bullets) {
				const lines = wrap(regular.clean(b), regular, size, width - indent);
				lines.forEach((l, i) => {
					ensure(lead);
					if (i === 0) regular.draw(page, regular.clean('•'), margin + 2, y - size, size, t.bodyColor);
					drawLine(l, regular, size, t.bodyColor, lead, margin + indent, width - indent);
				});
			}
			y -= t.paragraphGapPt * 0.5;
		}
	}

	return pdf.save();
}
