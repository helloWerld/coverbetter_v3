import {
	AlignmentType,
	BorderStyle,
	Document,
	HeadingLevel,
	LevelFormat,
	Packer,
	Paragraph,
	TabStopType,
	TextRun,
} from 'docx';
import { getTemplate } from './templates';
import type { ResumeDoc } from './profile/render';

const hex = (c: string) => c.replace('#', '').toUpperCase();
const twips = (pt: number) => Math.round(pt * 20);

function buildDocx(doc: ResumeDoc, templateId: string): Document {
	const t = getTemplate(templateId);
	const font = t.docxFont;
	const margin = Math.round(t.marginIn * 1440);
	const textWidth = 12240 - margin * 2;
	const center = t.headerAlign === 'center';
	const accent = t.accentRule?.color ?? t.nameColor;
	const run = (text: string, o: { bold?: boolean; pt?: number; color?: string } = {}) =>
		new TextRun({ text, font, bold: o.bold, size: (o.pt ?? t.bodyPt) * 2, color: hex(o.color ?? t.bodyColor) });
	const align = center ? AlignmentType.CENTER : AlignmentType.LEFT;
	const children: Paragraph[] = [];

	if (doc.name)
		children.push(
			new Paragraph({
				alignment: align,
				spacing: { after: twips(2) },
				children: [run(doc.name, { bold: t.nameBold, pt: t.namePt, color: t.nameColor })],
			}),
		);
	if (doc.headline)
		children.push(
			new Paragraph({ alignment: align, children: [run(doc.headline, { pt: t.contactPt + 1, color: t.contactColor })] }),
		);
	if (doc.contactLine)
		children.push(
			new Paragraph({
				alignment: align,
				spacing: { after: twips(t.headerGapPt * 0.5) },
				border: t.accentRule
					? { bottom: { style: BorderStyle.SINGLE, size: t.accentRule.widthPt * 8, space: 6, color: hex(t.accentRule.color) } }
					: undefined,
				children: [run(doc.contactLine, { pt: t.contactPt, color: t.contactColor })],
			}),
		);

	const heading = (title: string) =>
		new Paragraph({
			heading: HeadingLevel.HEADING_1,
			keepNext: true,
			spacing: { before: twips(t.paragraphGapPt), after: twips(3) },
			border: { bottom: { style: BorderStyle.SINGLE, size: 4, space: 1, color: '999999' } },
			children: [run(title.toUpperCase(), { bold: true, color: accent })],
		});

	if (doc.summary) {
		children.push(heading('Summary'));
		children.push(new Paragraph({ children: [run(doc.summary)] }));
	}

	for (const sec of doc.sections) {
		children.push(heading(sec.title));
		for (const it of sec.items) {
			if (it.heading || it.dates) {
				children.push(
					new Paragraph({
						heading: HeadingLevel.HEADING_2,
						keepNext: true,
						spacing: { before: twips(4) },
						tabStops: [{ type: TabStopType.RIGHT, position: textWidth }],
						children: [
							run(it.heading, { bold: true }),
							...(it.dates ? [new TextRun({ text: `\t${it.dates}`, font, size: t.bodyPt * 2, color: hex(t.contactColor) })] : []),
						],
					}),
				);
			}
			if (it.subheading)
				children.push(new Paragraph({ keepNext: it.bullets.length > 0, children: [run(it.subheading, { color: t.contactColor })] }));
			if (it.text) children.push(new Paragraph({ children: [run(it.text)] }));
			for (const b of it.bullets)
				children.push(new Paragraph({ numbering: { reference: 'resume-bullets', level: 0 }, children: [run(b)] }));
		}
	}

	return new Document({
		creator: 'CoverBetter',
		title: doc.name ? `${doc.name} Resume` : 'Resume',
		styles: { default: { document: { run: { font, size: t.bodyPt * 2 } } } },
		numbering: {
			config: [
				{
					reference: 'resume-bullets',
					levels: [
						{
							level: 0,
							format: LevelFormat.BULLET,
							text: '•',
							alignment: AlignmentType.LEFT,
							style: { paragraph: { indent: { left: 360, hanging: 260 } } },
						},
					],
				},
			],
		},
		sections: [
			{
				properties: {
					page: {
						size: { width: 12240, height: 15840 },
						margin: { top: margin, bottom: margin, left: margin, right: margin },
					},
				},
				children,
			},
		],
	});
}

/** DOCX as bytes. Works in Node and in the browser. */
export async function renderResumeDocxBytes(doc: ResumeDoc, templateId: string): Promise<Uint8Array> {
	return Packer.toBuffer(buildDocx(doc, templateId));
}

/** DOCX as a Blob for a browser download. */
export async function renderResumeDocx(doc: ResumeDoc, templateId: string): Promise<Blob> {
	return Packer.toBlob(buildDocx(doc, templateId));
}
