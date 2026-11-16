import { describe, expect, it } from 'vitest';
import { hasColumn, parseCsv, pick } from './csv';

describe('parseCsv', () => {
	it('parses a simple table keyed by the header', () => {
		expect(parseCsv('a,b\n1,2\n3,4')).toEqual([
			{ a: '1', b: '2' },
			{ a: '3', b: '4' },
		]);
	});

	it('handles quotes, escaped quotes, commas, and line breaks inside quotes', () => {
		const text = 'Title,Description\n"Dev, Senior","Said ""hi""\nsecond line"\n';
		expect(parseCsv(text)).toEqual([{ Title: 'Dev, Senior', Description: 'Said "hi"\nsecond line' }]);
	});

	it('handles CRLF and a missing final line break', () => {
		expect(parseCsv('a,b\r\n1,2\r\n3,4')).toEqual([
			{ a: '1', b: '2' },
			{ a: '3', b: '4' },
		]);
	});

	it('strips a UTF-8 BOM', () => {
		const rows = parseCsv('﻿First Name,Last Name\nAda,Lovelace');
		expect(Object.keys(rows[0])).toEqual(['First Name', 'Last Name']);
	});

	it('skips blank lines and pads short rows', () => {
		expect(parseCsv('a,b\n\n1\n')).toEqual([{ a: '1', b: '' }]);
	});

	it('returns an empty list for empty input', () => {
		expect(parseCsv('')).toEqual([]);
		expect(parseCsv('a,b\n')).toEqual([]);
	});
});

describe('pick', () => {
	const row = { 'Company Name': ' Acme ', title_: 'Dev', Empty: '' };

	it('matches ignoring case, spaces, underscores, and punctuation', () => {
		expect(pick(row, ['company-name'])).toBe('Acme');
		expect(pick(row, ['TITLE'])).toBe('Dev');
	});

	it('uses the first candidate with a value', () => {
		expect(pick(row, ['Empty', 'Missing', 'Company'.concat(' Name')])).toBe('Acme');
	});

	it('returns an empty string when nothing matches', () => {
		expect(pick(row, ['Nope'])).toBe('');
	});

	it('hasColumn reports column presence', () => {
		expect(hasColumn(row, ['company name'])).toBe(true);
		expect(hasColumn(row, ['x'])).toBe(false);
		expect(hasColumn(undefined, ['x'])).toBe(false);
	});
});
