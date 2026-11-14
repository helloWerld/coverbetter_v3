import { describe, expect, it } from 'vitest';
import {
	LETTER_PRICE_CENTS,
	formatUsd,
	isProductKey,
	lettersTotalCents,
	parseLetterQuantity,
} from './billing-plans';

describe('letter pricing', () => {
	it('costs $1.50 for one letter', () => {
		expect(LETTER_PRICE_CENTS).toBe(150);
		expect(formatUsd(LETTER_PRICE_CENTS)).toBe('$1.50');
	});
	it('totals the price for n letters', () => {
		expect(lettersTotalCents(1)).toBe(150);
		expect(lettersTotalCents(5)).toBe(750);
		expect(lettersTotalCents(50)).toBe(7500);
		expect(formatUsd(lettersTotalCents(5))).toBe('$7.50');
	});
	it('formats whole dollars without cents', () => {
		expect(formatUsd(1900)).toBe('$19');
		expect(formatUsd(1990)).toBe('$19.90');
	});
});

describe('parseLetterQuantity', () => {
	it('accepts integers 1 to 50', () => {
		expect(parseLetterQuantity('1')).toBe(1);
		expect(parseLetterQuantity('50')).toBe(50);
		expect(parseLetterQuantity(7)).toBe(7);
	});
	it('rejects everything else', () => {
		for (const v of ['0', '51', '2.5', '', 'abc', null, undefined, -3, NaN, '1e1']) {
			expect(parseLetterQuantity(v)).toBeNull();
		}
	});
});

describe('isProductKey', () => {
	it('accepts only letters and pro', () => {
		expect(isProductKey('letters')).toBe(true);
		expect(isProductKey('pro')).toBe(true);
		expect(isProductKey('pack5')).toBe(false);
	});
});
