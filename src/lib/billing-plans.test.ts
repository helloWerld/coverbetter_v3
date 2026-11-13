import { describe, expect, it } from 'vitest';
import {
	PACK_DISPLAY,
	formatUsd,
	isProductKey,
	perLetterLabel,
} from './billing-plans';

describe('per-letter price labels', () => {
	it('shows $1.00 per letter for the 5 pack', () => {
		const p = PACK_DISPLAY.pack5;
		expect(perLetterLabel(p.priceCents, p.credits)).toBe('$1.00 per letter');
	});
	it('shows $0.80 per letter for the 15 pack', () => {
		const p = PACK_DISPLAY.pack15;
		expect(perLetterLabel(p.priceCents, p.credits)).toBe('$0.80 per letter');
	});
	it('formats whole dollars without cents', () => {
		expect(formatUsd(500)).toBe('$5');
		expect(formatUsd(1200)).toBe('$12');
		expect(formatUsd(1990)).toBe('$19.90');
	});
	it('accepts only known product keys', () => {
		expect(isProductKey('pro')).toBe(true);
		expect(isProductKey('pack100')).toBe(false);
	});
});
