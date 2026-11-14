import { getLanguage, type FontSet } from '@/lib/languages';
import { getTemplate, type LetterDoc, type TemplateId } from '@/lib/templates';

/** 1 pt on a 612 pt wide page, as a share of the paper width. */
const pt = (n: number) => `calc(${n} * 100cqw / 612)`;

/** System fonts for each script, added after the template font. */
const SCRIPT_FONTS: Record<FontSet, string> = {
	standard: '',
	'noto-latin': '',
	'noto-sc': '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
	'noto-jp': '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", Meiryo, sans-serif',
	'noto-kr': '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
	'noto-arabic': '"Geeza Pro", "Noto Naskh Arabic", "Noto Sans Arabic", Arial, sans-serif',
	'noto-devanagari': '"Kohinoor Devanagari", "Noto Sans Devanagari", Mangal, sans-serif',
};

/** White paper card. Sizes come from the same tokens as the PDF and DOCX. */
export default function LetterPreview({
	doc,
	template,
	id,
}: Readonly<{ doc: LetterDoc; template: TemplateId; id?: string }>) {
	const t = getTemplate(template);
	const lang = getLanguage(doc.language);
	const rtl = lang.dir === 'rtl';
	// In a right-to-left letter the header and the body start at the right edge.
	const align = t.headerAlign === 'center' ? 'center' : rtl ? 'right' : 'left';
	const bodyAlign = rtl ? 'right' : undefined;
	const extra = SCRIPT_FONTS[lang.fontSet];
	const fontFamily = extra ? `${t.cssFont}, ${extra}` : t.cssFont;
	return (
		<div
			id={id}
			lang={lang.locale}
			dir={lang.dir}
			className="w-full overflow-hidden rounded-lg bg-white shadow-xl shadow-black/40"
			style={{ containerType: 'inline-size' }}
		>
			<div
				data-template={t.id}
				style={{
					aspectRatio: '8.5 / 11',
					padding: pt(t.marginIn * 72),
					fontFamily,
					fontSize: pt(t.bodyPt),
					lineHeight: t.lineHeight,
					color: t.bodyColor,
				}}
			>
				{(doc.name || doc.contactLine) && (
					<header
						style={{
							textAlign: align,
							marginBottom: pt(t.headerGapPt),
							paddingBottom: t.accentRule ? pt(8) : 0,
							borderBottom: t.accentRule
								? `${pt(t.accentRule.widthPt)} solid ${t.accentRule.color}`
								: undefined,
						}}
					>
						{doc.name && (
							<p
								style={{
									margin: 0,
									fontSize: pt(t.namePt),
									fontWeight: t.nameBold ? 700 : 400,
									lineHeight: 1.25,
									color: t.nameColor,
								}}
							>
								{doc.name}
							</p>
						)}
						{doc.contactLine && (
							<p
								style={{
									margin: 0,
									fontSize: pt(t.contactPt),
									lineHeight: 1.4,
									color: t.contactColor,
								}}
							>
								{doc.contactLine}
							</p>
						)}
					</header>
				)}
				<p style={{ margin: 0, marginBottom: pt(t.paragraphGapPt), textAlign: bodyAlign }}>
					{doc.date}
				</p>
				{doc.paragraphs.map((p, i) => (
					<p
						key={i}
						style={{
							margin: 0,
							marginBottom: pt(t.paragraphGapPt),
							textAlign: bodyAlign,
							whiteSpace: 'pre-line',
							overflowWrap: 'anywhere',
						}}
					>
						{p}
					</p>
				))}
			</div>
		</div>
	);
}
