import { describe, expect, it } from 'vitest';
import {
	LANGUAGES,
	LANGUAGE_CODES,
	getLanguage,
	isClosingLine,
	isLanguageCode,
} from './languages';

describe('languages', () => {
	it('lists 12 languages, English first', () => {
		expect(LANGUAGES.map((l) => l.code)).toEqual([...LANGUAGE_CODES]);
		expect(LANGUAGES).toHaveLength(12);
		expect(LANGUAGES[0].code).toBe('en');
	});

	it('marks only Arabic as right to left', () => {
		expect(LANGUAGES.filter((l) => l.dir === 'rtl').map((l) => l.code)).toEqual(['ar']);
	});

	it('keeps English on the standard PDF fonts', () => {
		expect(getLanguage('en').fontSet).toBe('standard');
	});

	it('gives every language a valid date locale', () => {
		for (const l of LANGUAGES) {
			expect(() => new Date(2026, 10, 14).toLocaleDateString(l.locale)).not.toThrow();
		}
	});

	it('falls back to English for unknown codes', () => {
		expect(getLanguage('xx').code).toBe('en');
		expect(getLanguage(undefined).code).toBe('en');
	});

	it('checks language codes', () => {
		expect(isLanguageCode('ja')).toBe(true);
		expect(isLanguageCode('xx')).toBe(false);
		expect(isLanguageCode(3)).toBe(false);
	});
});

describe('isClosingLine', () => {
	it('matches English sign-offs with end punctuation', () => {
		expect(isClosingLine('Sincerely,')).toBe(true);
		expect(isClosingLine('Best regards')).toBe(true);
		expect(isClosingLine('I am writing to apply.')).toBe(false);
	});

	it('matches sign-offs in each language', () => {
		expect(isClosingLine('Atentamente,', 'es')).toBe(true);
		expect(isClosingLine('Mit freundlichen Grüßen', 'de')).toBe(true);
		expect(isClosingLine('Z poważaniem,', 'pl')).toBe(true);
		expect(isClosingLine('此致，', 'zh')).toBe(true);
		expect(isClosingLine('敬具', 'ja')).toBe(true);
		expect(isClosingLine('감사합니다.', 'ko')).toBe(true);
		expect(isClosingLine('مع خالص التحية،', 'ar')).toBe(true);
		expect(isClosingLine('सादर,', 'hi')).toBe(true);
	});

	it('also accepts an English sign-off in another language', () => {
		expect(isClosingLine('Sincerely,', 'fr')).toBe(true);
	});

	it('matches a longer sign-off that starts with a known one', () => {
		expect(isClosingLine('وتفضلوا بقبول فائق الاحترام والتقدير،', 'ar')).toBe(true);
		expect(isClosingLine('Atentamente y con gratitud,', 'es')).toBe(true);
	});

	it('does not match a long sentence that starts with a sign-off word', () => {
		expect(
			isClosingLine(
				'Cordialmente invito a su equipo a revisar mi experiencia en productos móviles y pagos digitales.',
				'es',
			),
		).toBe(false);
		expect(isClosingLine('Best of all, I shipped the app early.')).toBe(false);
	});

	it('does not match another language sign-off', () => {
		expect(isClosingLine('Atentamente,', 'de')).toBe(false);
	});
});
