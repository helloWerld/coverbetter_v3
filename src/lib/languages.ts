/**
 * Letter languages. The app interface stays in English; only the letter changes.
 * All languages are free for all users.
 */

/** Which font set the PDF uses. `standard` is the built-in PDF fonts (no download). */
export type FontSet =
	| 'standard'
	| 'noto-latin'
	| 'noto-sc'
	| 'noto-jp'
	| 'noto-kr'
	| 'noto-arabic'
	| 'noto-devanagari';

export const LANGUAGE_CODES = [
	'en',
	'es',
	'fr',
	'de',
	'pt',
	'it',
	'pl',
	'zh',
	'ja',
	'ko',
	'ar',
	'hi',
] as const;
export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export interface Language {
	code: LanguageCode;
	/** English name, shown in the dropdown. */
	label: string;
	/** Name in the language itself, shown next to the English name. */
	nativeLabel: string;
	/** Name used in the AI prompt. */
	promptName: string;
	/** BCP 47 locale for the letter date and the HTML `lang` attribute. */
	locale: string;
	dir: 'ltr' | 'rtl';
	fontSet: FontSet;
	/** Common sign-off lines, lower case, without the end punctuation. */
	closings: readonly string[];
}

export const LANGUAGES: readonly Language[] = [
	{
		code: 'en',
		label: 'English',
		nativeLabel: 'English',
		promptName: 'English',
		locale: 'en-US',
		dir: 'ltr',
		fontSet: 'standard',
		closings: [
			'sincerely',
			'best regards',
			'kind regards',
			'regards',
			'best',
			'warm regards',
			'respectfully',
			'yours truly',
			'yours sincerely',
			'thank you',
			'thanks',
		],
	},
	{
		code: 'es',
		label: 'Spanish',
		nativeLabel: 'Español',
		promptName: 'Spanish',
		locale: 'es-ES',
		dir: 'ltr',
		fontSet: 'standard',
		closings: ['atentamente', 'saludos cordiales', 'un cordial saludo', 'cordialmente', 'un saludo'],
	},
	{
		code: 'fr',
		label: 'French',
		nativeLabel: 'Français',
		promptName: 'French',
		locale: 'fr-FR',
		dir: 'ltr',
		fontSet: 'standard',
		closings: ['cordialement', 'bien cordialement', 'sincères salutations', 'respectueusement'],
	},
	{
		code: 'de',
		label: 'German',
		nativeLabel: 'Deutsch',
		promptName: 'German',
		locale: 'de-DE',
		dir: 'ltr',
		fontSet: 'standard',
		closings: ['mit freundlichen grüßen', 'freundliche grüße', 'beste grüße', 'viele grüße'],
	},
	{
		code: 'pt',
		label: 'Portuguese',
		nativeLabel: 'Português',
		promptName: 'Portuguese',
		locale: 'pt-BR',
		dir: 'ltr',
		fontSet: 'standard',
		closings: ['atenciosamente', 'cordialmente', 'com os melhores cumprimentos', 'cumprimentos', 'abraços'],
	},
	{
		code: 'it',
		label: 'Italian',
		nativeLabel: 'Italiano',
		promptName: 'Italian',
		locale: 'it-IT',
		dir: 'ltr',
		fontSet: 'standard',
		closings: ['cordiali saluti', 'distinti saluti', 'cordialmente', 'un cordiale saluto'],
	},
	{
		code: 'pl',
		label: 'Polish',
		nativeLabel: 'Polski',
		promptName: 'Polish',
		locale: 'pl-PL',
		dir: 'ltr',
		fontSet: 'noto-latin',
		closings: ['z poważaniem', 'z wyrazami szacunku', 'pozdrawiam', 'łączę wyrazy szacunku'],
	},
	{
		code: 'zh',
		label: 'Chinese (Simplified)',
		nativeLabel: '简体中文',
		promptName: 'Simplified Chinese',
		locale: 'zh-CN',
		dir: 'ltr',
		fontSet: 'noto-sc',
		closings: ['此致', '此致敬礼', '此致 敬礼', '敬礼', '顺祝商祺', '谢谢'],
	},
	{
		code: 'ja',
		label: 'Japanese',
		nativeLabel: '日本語',
		promptName: 'Japanese',
		locale: 'ja-JP',
		dir: 'ltr',
		fontSet: 'noto-jp',
		closings: ['敬具', '以上', 'よろしくお願いいたします', '何卒よろしくお願い申し上げます'],
	},
	{
		code: 'ko',
		label: 'Korean',
		nativeLabel: '한국어',
		promptName: 'Korean',
		locale: 'ko-KR',
		dir: 'ltr',
		fontSet: 'noto-kr',
		closings: ['감사합니다', '진심으로 감사드립니다', '드림', '올림'],
	},
	{
		code: 'ar',
		label: 'Arabic',
		nativeLabel: 'العربية',
		promptName: 'Modern Standard Arabic',
		locale: 'ar',
		dir: 'rtl',
		fontSet: 'noto-arabic',
		closings: ['مع خالص التحية', 'مع التحية', 'مع خالص التقدير', 'مع التقدير', 'وتفضلوا بقبول فائق الاحترام', 'شكرا', 'شكرًا'],
	},
	{
		code: 'hi',
		label: 'Hindi',
		nativeLabel: 'हिन्दी',
		promptName: 'Hindi',
		locale: 'hi-IN',
		dir: 'ltr',
		fontSet: 'noto-devanagari',
		closings: ['सादर', 'भवदीय', 'भवदीया', 'धन्यवाद', 'शुभकामनाओं सहित'],
	},
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export function isLanguageCode(value: unknown): value is LanguageCode {
	return typeof value === 'string' && (LANGUAGE_CODES as readonly string[]).includes(value);
}

/** Returns the language for a code. Unknown or empty codes give English. */
export function getLanguage(code: string | null | undefined): Language {
	return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

/** End punctuation that can follow a sign-off: Latin, CJK, and Arabic commas and stops. */
const END_PUNCT = /[\s,.!，。、،]+$/u;

/**
 * True when the line is a sign-off in the given language or in English.
 * English is always checked, because a letter can use an English sign-off.
 */
export function isClosingLine(line: string, code: LanguageCode = DEFAULT_LANGUAGE): boolean {
	const t = line.trim().replace(END_PUNCT, '').toLowerCase();
	if (!t) return false;
	const lists = code === 'en' ? [LANGUAGES[0].closings] : [getLanguage(code).closings, LANGUAGES[0].closings];
	return lists.some((list) => list.includes(t));
}
