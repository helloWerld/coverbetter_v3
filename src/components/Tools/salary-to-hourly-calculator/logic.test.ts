import { describe, expect, it } from 'vitest';
import { PERIODS, convertAll, formatMoney, parseNumber } from './logic';

describe('parseNumber', () => {
	it('accepts commas and dollar signs', () => {
		expect(parseNumber('60,000')).toBe(60000);
		expect(parseNumber('$60,000.50')).toBe(60000.5);
	});
	it('returns null for empty, invalid, and negative text', () => {
		expect(parseNumber('')).toBeNull();
		expect(parseNumber('abc')).toBeNull();
		expect(parseNumber('-5')).toBeNull();
	});
});

describe('convertAll', () => {
	it('converts hourly to every period', () => {
		const c = convertAll(25, 'hourly', 40, 52)!;
		expect(c.yearly).toBe(52000);
		expect(c.monthly).toBeCloseTo(4333.33, 2);
		expect(c.biweekly).toBe(2000);
		expect(c.weekly).toBe(1000);
		expect(c.daily).toBe(200);
		expect(c.hourly).toBe(25);
	});
	it('converts yearly back to hourly', () => {
		expect(convertAll(52000, 'yearly', 40, 52)!.hourly).toBe(25);
	});
	it('converts each period to the same yearly value', () => {
		expect(convertAll(1000, 'weekly', 40, 52)!.yearly).toBe(52000);
		expect(convertAll(2000, 'biweekly', 40, 52)!.yearly).toBe(52000);
		expect(convertAll(4000, 'monthly', 40, 52)!.yearly).toBe(48000);
		expect(convertAll(200, 'daily', 40, 52)!.yearly).toBe(52000);
	});
	it('round trips through every period', () => {
		for (const p of PERIODS) {
			const c = convertAll(37.5, p.value, 37.5, 50)!;
			const back = convertAll(c.monthly, 'monthly', 37.5, 50)!;
			expect(back.hourly).toBeCloseTo(c.hourly, 8);
		}
	});
	it('uses fewer weeks and fewer hours', () => {
		expect(convertAll(60000, 'yearly', 30, 48)!.hourly).toBeCloseTo(41.67, 2);
	});
	it('returns null for empty input and for zero hours or weeks', () => {
		expect(convertAll(null, 'hourly', 40, 52)).toBeNull();
		expect(convertAll(25, 'hourly', 0, 52)).toBeNull();
		expect(convertAll(25, 'hourly', 40, 0)).toBeNull();
		expect(convertAll(25, 'hourly', null, 52)).toBeNull();
	});
	it('handles zero and very large amounts', () => {
		expect(convertAll(0, 'yearly', 40, 52)!.hourly).toBe(0);
		expect(Number.isFinite(convertAll(1e12, 'yearly', 40, 52)!.hourly)).toBe(true);
	});
});

describe('formatMoney', () => {
	it('shows a dash for null and NaN', () => {
		expect(formatMoney(null)).toBe('-');
		expect(formatMoney(NaN)).toBe('-');
		expect(formatMoney(1234.5)).toBe('$1,234.50');
	});
	it('has no dashes in labels', () => {
		expect(PERIODS.map((p) => p.label).join(' ')).not.toMatch(/[\u2013\u2014]/);
	});
});
