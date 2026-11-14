import {
	AlignmentType,
	BorderStyle,
	Document,
	Packer,
	Paragraph,
	TextRun,
} from 'docx';
import { getLanguage, type FontSet } from './languages';
import { getTemplate, type LetterDoc, type TemplateId } from './templates';

const hex = (c: string) => c.replace('#', '').toUpperCase();
const twips = (pt: number) => Math.round(pt * 20);

/** Fonts that exist on Windows and on Mac for each script. Word falls back per script. */
function scriptFonts(set: FontSet, latin: string) {
	const f = { ascii: latin, hAnsi: latin, eastAsia: latin, cs: latin };
	switch (set) {
		case 'noto-sc':
			return { ...f, eastAsia: 'Microsoft YaHei' };
		case 'noto-jp':
			return { ...f, eastAsia: 'Yu Gothic' };
		case 'noto-kr':
			return { ...f, eastAsia: 'Malgun Gothic' };
		case 'noto-arabic':
			return { ...f, cs: 'Arial' };
		case 'noto-devanagari':
			return { ...f, cs: 'Mangal' };
		default:
			return f;
	}
}

function buildDocx(doc: LetterDoc, templateId: TemplateId | string): Document {
	const t = getTemplate(templateId);
	const lang = getLanguage(doc.language);
	const rtl = lang.dir === 'rtl';
	const standard = lang.fontSet === 'standard';
	// Standard languages keep the exact run options they always had.
	const fontOpts = standard
		? { font: t.docxFont }
		: {
				font: scriptFonts(lang.fontSet, t.docxFont),
				language: {
					value: lang.locale,
					eastAsia: lang.locale,
					bidirectional: lang.locale,
				},
				...(rtl ? { rightToLeft: true } : {}),
			};
	const csSize = (pt: number) => (standard ? {} : { sizeComplexScript: pt * 2 });
	const csBold = (b: boolean) => (standard || !b ? {} : { boldComplexScript: true });
	const start = rtl ? AlignmentType.RIGHT : AlignmentType.LEFT;
	const para = rtl ? { bidirectional: true } : {};
	const line = Math.round(t.lineHeight * 240);
	const center = t.headerAlign === 'center';
	const children: Paragraph[] = [];

	const hasHeader = Boolean(doc.name || doc.contactLine);
	if (doc.name) {
		children.push(
			new Paragraph({
				alignment: center ? AlignmentType.CENTER : start,
				...para,
				spacing: { after: twips(2) },
				children: [
					new TextRun({
						text: doc.name,
						bold: t.nameBold,
						...fontOpts,
						...csSize(t.namePt),
						...csBold(t.nameBold),
						size: t.namePt * 2,
						color: hex(t.nameColor),
					}),
				],
			}),
		);
	}
	if (doc.contactLine) {
		children.push(
			new Paragraph({
				alignment: center ? AlignmentType.CENTER : start,
				spacing: { after: 0 },
				border: t.accentRule
					? {
							bottom: {
								style: BorderStyle.SINGLE,
								size: t.accentRule.widthPt * 8,
								space: 6,
								color: hex(t.accentRule.color),
							},
						}
					: undefined,
				children: [
					new TextRun({
						text: doc.contactLine,
						...fontOpts,
						...csSize(t.contactPt),
						size: t.contactPt * 2,
						color: hex(t.contactColor),
					}),
				],
			}),
		);
	} else if (doc.name && t.accentRule) {
		// Put the rule on the name line when no contact line exists.
		children[children.length - 1] = new Paragraph({
			...(rtl ? { alignment: AlignmentType.RIGHT } : {}),
			...para,
			spacing: { after: 0 },
			border: {
				bottom: {
					style: BorderStyle.SINGLE,
					size: t.accentRule.widthPt * 8,
					space: 6,
					color: hex(t.accentRule.color),
				},
			},
			children: [
				new TextRun({
					text: doc.name,
					bold: t.nameBold,
					...fontOpts,
					...csSize(t.namePt),
					...csBold(t.nameBold),
					size: t.namePt * 2,
					color: hex(t.nameColor),
				}),
			],
		});
	}

	const body = (text: string, after: number, before = 0) => {
		const runs: TextRun[] = text.split('\n').map(
			(l, i) =>
				new TextRun({
					text: l,
					break: i > 0 ? 1 : undefined,
					...fontOpts,
					...csSize(t.bodyPt),
					size: t.bodyPt * 2,
					color: hex(t.bodyColor),
				}),
		);
		return new Paragraph({
			...(rtl ? { alignment: AlignmentType.RIGHT } : {}),
			...para,
			spacing: { line, before, after: twips(after) },
			children: runs,
		});
	};

	children.push(body(doc.date, t.paragraphGapPt, hasHeader ? twips(t.headerGapPt) : 0));
	for (const p of doc.paragraphs) children.push(body(p, t.paragraphGapPt));

	const margin = Math.round(t.marginIn * 1440);
	return new Document({
		creator: 'CoverBetter',
		title: 'Cover Letter',
		styles: {
			default: {
				document: {
					run: standard
						? { font: t.docxFont, size: t.bodyPt * 2 }
						: { ...fontOpts, size: t.bodyPt * 2 },
				},
			},
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
export async function renderDocxBytes(
	doc: LetterDoc,
	templateId: TemplateId | string,
): Promise<Uint8Array> {
	return Packer.toBuffer(buildDocx(doc, templateId));
}

/** DOCX as a Blob for a browser download. */
export async function renderDocx(
	doc: LetterDoc,
	templateId: TemplateId | string,
): Promise<Blob> {
	return Packer.toBlob(buildDocx(doc, templateId));
}
