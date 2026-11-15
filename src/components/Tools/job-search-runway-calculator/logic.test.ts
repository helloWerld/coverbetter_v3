import { describe, expect, it } from 'vitest';
import { MAX_MONTHS, computeRunway, formatDate, formatMoney, formatMonths, parseMoney } from './logic';

const today = new Date('2026-01-01T12:00:00Z');

describe('parseMoney', () => {
	it('accepts commas and dollar signs', () => {
		expect(parseMoney('$12,000')).toBe(12000);
		expect(parseMoney('')).toBeNull();
		expect(parseMoney('abc')).toBeNull();
	});
});

describe('computeRunway', () => {
	it('counts months from savings and monthly drain', () => {
		const r = computeRunway({ savings: 12000, monthlyCosts: 3000, monthlyIncome: 1000, oneTimeCosts: 0 }, today);
		expect(r.monthlyDrain).toBe(2000);
		expect(r.months).toBe(6);
		expect(r.lasts).toBe(false);
		expect(r.runOutDate!.getTime()).toBeGreaterThan(today.getTime());
		expect(r.rows[0]).toEqual({ month: 1, balance: 10000 });
		expect(r.rows[5]).toEqual({ month: 6, balance: 0 });
		expect(r.rows).toHaveLength(7);
		expect(r.rows[6].balance).toBe(-2000);
	});
	it('subtracts one-time costs first', () => {
		const r = computeRunway({ savings: 10000, monthlyCosts: 2000, monthlyIncome: 0, oneTimeCosts: 2000 }, today);
		expect(r.startBalance).toBe(8000);
		expect(r.months).toBe(4);
	});
	it('says savings do not go down when income covers costs', () => {
		const r = computeRunway({ savings: 5000, monthlyCosts: 2000, monthlyIncome: 2000, oneTimeCosts: 0 }, today);
		expect(r.lasts).toBe(true);
		expect(r.months).toBeNull();
		expect(r.runOutDate).toBeNull();
		expect(r.rows).toHaveLength(MAX_MONTHS);
		const more = computeRunway({ savings: 5000, monthlyCosts: 2000, monthlyIncome: 3000, oneTimeCosts: 0 }, today);
		expect(more.rows[MAX_MONTHS - 1].balance).toBe(5000 + 1000 * MAX_MONTHS);
	});
	it('limits the table to 24 months', () => {
		const r = computeRunway({ savings: 1000000, monthlyCosts: 1000, monthlyIncome: 0, oneTimeCosts: 0 }, today);
		expect(r.rows).toHaveLength(MAX_MONTHS);
		expect(r.months).toBe(1000);
	});
	it('gives 0 months when one-time costs use all savings', () => {
		const r = computeRunway({ savings: 1000, monthlyCosts: 2000, monthlyIncome: 0, oneTimeCosts: 1500 }, today);
		expect(r.months).toBe(0);
		expect(r.lasts).toBe(false);
	});
	it('handles zero savings', () => {
		const r = computeRunway({ savings: 0, monthlyCosts: 2000, monthlyIncome: 0, oneTimeCosts: 0 }, today);
		expect(r.months).toBe(0);
	});
	it('does not say lasts when one-time costs are above savings even with enough income', () => {
		const r = computeRunway({ savings: 100, monthlyCosts: 0, monthlyIncome: 0, oneTimeCosts: 500 }, today);
		expect(r.lasts).toBe(false);
	});
});

describe('formatting', () => {
	it('formats months, money, and dates', () => {
		expect(formatMonths(1)).toBe('1 month');
		expect(formatMonths(5.46)).toBe('5.5 months');
		expect(formatMoney(null)).toBe('-');
		expect(formatMoney(1500)).toBe('$1,500');
		expect(formatDate(null)).toBe('-');
		expect(formatDate(new Date(NaN))).toBe('-');
	});
});
