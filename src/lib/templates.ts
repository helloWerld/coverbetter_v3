import { DEFAULT_LANGUAGE, getLanguage, isClosingLine, type LanguageCode } from './languages';

/** Letter templates. The HTML preview, the PDF, and the DOCX all read these tokens. */

export const TEMPLATE_IDS = ['classic', 'modern', 'minimal'] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export interface TemplateTokens {
	id: TemplateId;
	label: string;
	description: string;
	/** pdf-lib standard font name. */
	pdfFont: 'TimesRoman' | 'Helvetica';
	/** CSS font stack for the HTML preview. */
	cssFont: string;
	docxFont: string;
	bodyPt: number;
	/** Line height as a multiple of the font size. */
	lineHeight: number;
	paragraphGapPt: number;
	/** Page margin in inches. */
	marginIn: number;
	headerAlign: 'center' | 'left';
	namePt: number;
	nameBold: boolean;
	contactPt: number;
	nameColor: string;
	contactColor: string;
	bodyColor: string;
	/** Rule under the header. null means no rule. */
	accentRule: { color: string; widthPt: number } | null;
	/** Space after the header block, in points. */
	headerGapPt: number;
}

export const TEMPLATES: Record<TemplateId, TemplateTokens> = {
	classic: {
		id: 'classic',
		label: 'Classic',
		description: 'Serif type, centered name',
		pdfFont: 'TimesRoman',
		cssFont: '"Times New Roman", Times, serif',
		docxFont: 'Times New Roman',
		bodyPt: 12,
		lineHeight: 1.3,
		paragraphGapPt: 10,
		marginIn: 1,
		headerAlign: 'center',
		namePt: 20,
		nameBold: true,
		contactPt: 11,
		nameColor: '#000000',
		contactColor: '#333333',
		bodyColor: '#000000',
		accentRule: null,
		headerGapPt: 24,
	},
	modern: {
		id: 'modern',
		label: 'Modern',
		description: 'Sans type, purple accent line',
		pdfFont: 'Helvetica',
		cssFont: 'Helvetica, Arial, sans-serif',
		docxFont: 'Helvetica',
		bodyPt: 11,
		lineHeight: 1.4,
		paragraphGapPt: 10,
		marginIn: 1,
		headerAlign: 'left',
		namePt: 22,
		nameBold: true,
		contactPt: 10,
		nameColor: '#111111',
		contactColor: '#444444',
		bodyColor: '#222222',
		accentRule: { color: '#9333ea', widthPt: 2 },
		headerGapPt: 24,
	},
	minimal: {
		id: 'minimal',
		label: 'Minimal',
		description: 'Small grey header, wide margins',
		pdfFont: 'Helvetica',
		cssFont: 'Helvetica, Arial, sans-serif',
		docxFont: 'Helvetica',
		bodyPt: 11,
		lineHeight: 1.5,
		paragraphGapPt: 12,
		marginIn: 1.25,
		headerAlign: 'left',
		namePt: 10,
		nameBold: false,
		contactPt: 9,
		nameColor: '#777777',
		contactColor: '#777777',
		bodyColor: '#222222',
		accentRule: null,
		headerGapPt: 36,
	},
};

export function isTemplateId(value: unknown): value is TemplateId {
	return (TEMPLATE_IDS as readonly string[]).includes(value as string);
}

/** Returns the tokens for an id. Unknown ids give Classic. */
export function getTemplate(id: string): TemplateTokens {
	return isTemplateId(id) ? TEMPLATES[id] : TEMPLATES.classic;
}

export interface LetterDoc {
	/** The letter language. The exports pick fonts and direction from it. */
	language: LanguageCode;
	name: string;
	contactLine: string;
	date: string;
	paragraphs: string[];
}

const CONTACT_HINT = /@|\+?\d[\d\s().-]{6,}|https?:\/\/|linkedin\.com/i;

function looksLikeName(line: string): boolean {
	const t = line.trim();
	return (
		t.length > 0 &&
		t.length <= 50 &&
		t.split(/\s+/).length <= 5 &&
		!/[.!?:;@\d]/.test(t) &&
		!/^dear\b/i.test(t)
	);
}

function formatDate(d: Date, locale: string): string {
	return d.toLocaleDateString(locale, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

/** Builds the shared document model from a letter body. Best effort for name and contact. */
export function toLetterDoc(
	body: string,
	today: Date,
	language: LanguageCode = DEFAULT_LANGUAGE,
): LetterDoc {
	const isClosing = (line: string) => isClosingLine(line, language);
	const paragraphs = body
		.replace(/\r\n?/g, '\n')
		.split(/\n\s*\n/)
		.map((p) =>
			p
				.split('\n')
				.map((l) => l.trim())
				.join('\n')
				.trim(),
		)
		.filter(Boolean);

	let name = '';
	let contactLine = '';

	// 1. Header lines at the top: a name line, then a contact line.
	const first = paragraphs[0]?.split('\n') ?? [];
	if (
		first.length >= 1 &&
		first.length <= 2 &&
		looksLikeName(first[0]) &&
		(first.length === 1 ? false : CONTACT_HINT.test(first[1])) &&
		paragraphs.length > 1
	) {
		name = first[0];
		contactLine = first[1];
		paragraphs.shift();
	}

	// 2. Closing: a sign-off such as "Sincerely," then the name, then optional contact line.
	// Models often put a blank line after "Sincerely,". Join those two parts.
	// A sign-off can be more than one line, for example Chinese "此致" then "敬礼".
	if (
		paragraphs.length >= 2 &&
		paragraphs[paragraphs.length - 2].split('\n').every((l) => isClosing(l))
	) {
		const signature = paragraphs.pop() as string;
		paragraphs[paragraphs.length - 1] += `\n${signature}`;
	}
	const lastIdx = paragraphs.length - 1;
	if (lastIdx >= 0) {
		const lines = paragraphs[lastIdx].split('\n');
		let ci = lines.findIndex((l) => isClosing(l));
		// Skip the other lines of a multi-line sign-off.
		while (ci >= 0 && lines[ci + 1] && isClosing(lines[ci + 1])) ci++;
		if (ci >= 0 && lines[ci + 1] && looksLikeName(lines[ci + 1])) {
			if (!name) name = lines[ci + 1];
			const rest = lines.slice(ci + 2);
			if (rest.length && CONTACT_HINT.test(rest.join(' '))) {
				if (!contactLine) contactLine = rest.join(' | ');
				paragraphs[lastIdx] = lines.slice(0, ci + 2).join('\n');
			}
		}
	}

	return {
		language,
		name,
		contactLine,
		date: formatDate(today, getLanguage(language).locale),
		paragraphs,
	};
}
