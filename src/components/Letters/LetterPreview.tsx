import { getTemplate, type LetterDoc, type TemplateId } from '@/lib/templates';

/** 1 pt on a 612 pt wide page, as a share of the paper width. */
const pt = (n: number) => `calc(${n} * 100cqw / 612)`;

/** White paper card. Sizes come from the same tokens as the PDF and DOCX. */
export default function LetterPreview({
	doc,
	template,
	id,
}: Readonly<{ doc: LetterDoc; template: TemplateId; id?: string }>) {
	const t = getTemplate(template);
	const align = t.headerAlign;
	return (
		<div
			id={id}
			className="w-full overflow-hidden rounded-lg bg-white shadow-xl shadow-black/40"
			style={{ containerType: 'inline-size' }}
		>
			<div
				data-template={t.id}
				style={{
					aspectRatio: '8.5 / 11',
					padding: pt(t.marginIn * 72),
					fontFamily: t.cssFont,
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
				<p style={{ margin: 0, marginBottom: pt(t.paragraphGapPt) }}>
					{doc.date}
				</p>
				{doc.paragraphs.map((p, i) => (
					<p
						key={i}
						style={{
							margin: 0,
							marginBottom: pt(t.paragraphGapPt),
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
