import { describe, expect, it } from 'vitest';
import {
	calculateNotice,
	federalHolidays,
	formatLongDate,
	holidaysBetween,
	observedDate,
	weeksToDays,
} from './logic';

const observed = (year: number) => Object.fromEntries(federalHolidays(year).map((h) => [h.name, h.observed]));

describe('federal holidays by rule', () => {
	it('finds the 2026 holidays', () => {
		const h = observed(2026);
		expect(Object.keys(h)).toHaveLength(11);
		expect(h["New Year's Day"]).toBe('2026-01-01');
		expect(h['Martin Luther King Jr. Day']).toBe('2026-01-19');
		expect(h["Presidents' Day"]).toBe('2026-02-16');
		expect(h['Memorial Day']).toBe('2026-05-25');
		expect(h['Juneteenth']).toBe('2026-06-19');
		expect(h['Independence Day']).toBe('2026-07-03'); // July 4 is a Saturday
		expect(h['Labor Day']).toBe('2026-09-07');
		expect(h['Columbus Day']).toBe('2026-10-12');
		expect(h['Veterans Day']).toBe('2026-11-11');
		expect(h['Thanksgiving Day']).toBe('2026-11-26');
		expect(h['Christmas Day']).toBe('2026-12-25');
	});

	it('finds the 2027 holidays and the observed dates', () => {
		const h = observed(2027);
		expect(h['Martin Luther King Jr. Day']).toBe('2027-01-18');
		expect(h['Memorial Day']).toBe('2027-05-31');
		expect(h['Juneteenth']).toBe('2027-06-18'); // Saturday to Friday
		expect(h['Independence Day']).toBe('2027-07-05'); // Sunday to Monday
		expect(h['Thanksgiving Day']).toBe('2027-11-25');
		expect(h['Christmas Day']).toBe('2027-12-24'); // Saturday to Friday
	});

	it('moves a Saturday New Year to the Friday before, and tests other years', () => {
		expect(observed(2028)["New Year's Day"]).toBe('2027-12-31');
		expect(observed(2024)['Memorial Day']).toBe('2024-05-27');
		expect(observed(2025)['Thanksgiving Day']).toBe('2025-11-27');
		expect(observedDate('2026-07-04')).toBe('2026-07-03');
		expect(observedDate('2021-07-04')).toBe('2021-07-05');
		expect(observedDate('2026-07-06')).toBe('2026-07-06');
	});

	it('lists holidays in a range and catches the observed day from the next year', () => {
		expect(holidaysBetween('2027-12-20', '2027-12-31').map((h) => h.observed)).toEqual(['2027-12-24', '2027-12-31']);
	});
});

describe('formatLongDate', () => {
	it('writes the weekday, month, day, and year', () => {
		expect(formatLongDate('2026-12-04')).toBe('Friday, December 4, 2026');
		expect(formatLongDate('nope')).toBe('');
	});
});

describe('calculateNotice', () => {
	it('counts 14 calendar days', () => {
		const r = calculateNotice({ startIso: '2026-11-16', days: weeksToDays(2, 'calendar'), mode: 'calendar', skipHolidays: true })!;
		expect(r.lastDayIso).toBe('2026-11-30'); // Monday
		expect(r.lastDayLabel).toBe('Monday, November 30, 2026');
		expect(r.workingDaysLeft).toBe(9); // Thanksgiving is off
		expect(r.holidays.map((h) => h.observed)).toEqual(['2026-11-26']);
		const plain = calculateNotice({ startIso: '2026-10-19', days: 14, mode: 'calendar', skipHolidays: true })!;
		expect(plain.workingDaysLeft).toBe(10);
		expect(plain.holidays).toEqual([]);
	});

	it('moves a weekend end date back to Friday', () => {
		const r = calculateNotice({ startIso: '2026-11-18', days: 14, mode: 'calendar', skipHolidays: false })!;
		expect(r.endIso).toBe('2026-12-02');
		const w = calculateNotice({ startIso: '2026-11-21', days: 14, mode: 'calendar', skipHolidays: false })!;
		expect(w.endIso).toBe('2026-12-05'); // Saturday
		expect(w.lastDayIso).toBe('2026-12-04'); // Friday
	});

	it('skips Thanksgiving in business days', () => {
		const skip = calculateNotice({ startIso: '2026-11-16', days: 10, mode: 'business', skipHolidays: true })!;
		const noSkip = calculateNotice({ startIso: '2026-11-16', days: 10, mode: 'business', skipHolidays: false })!;
		expect(noSkip.lastDayIso).toBe('2026-11-30');
		expect(skip.lastDayIso).toBe('2026-12-01');
		expect(skip.workingDaysLeft).toBe(10);
		expect(skip.holidays.map((h) => h.name)).toEqual(['Thanksgiving Day']);
	});

	it('works across the year end into 2027', () => {
		const r = calculateNotice({ startIso: '2026-12-21', days: 10, mode: 'business', skipHolidays: true })!;
		// Dec 25 and Jan 1 are off. 22,23,24,28,29,30,31, Jan 4,5,6.
		expect(r.lastDayIso).toBe('2027-01-06');
		expect(r.holidays.map((h) => h.observed)).toEqual(['2026-12-25', '2027-01-01']);
	});

	it('handles 0 days, one custom day, and a big number', () => {
		expect(calculateNotice({ startIso: '2026-11-16', days: 0, mode: 'business', skipHolidays: true })!.workingDaysLeft).toBe(0);
		expect(calculateNotice({ startIso: '2026-11-16', days: 0, mode: 'calendar', skipHolidays: true })!.lastDayIso).toBe('2026-11-16');
		expect(calculateNotice({ startIso: '2026-11-16', days: 1, mode: 'business', skipHolidays: true })!.lastDayIso).toBe('2026-11-17');
		expect(calculateNotice({ startIso: '2026-11-16', days: 365, mode: 'calendar', skipHolidays: false })!.endIso).toBe('2027-11-16');
		expect(calculateNotice({ startIso: '2026-11-16', days: 365, mode: 'business', skipHolidays: true })!.workingDaysLeft).toBe(365);
	});

	it('returns null for bad input', () => {
		expect(calculateNotice({ startIso: '', days: 14, mode: 'calendar', skipHolidays: true })).toBeNull();
		expect(calculateNotice({ startIso: '2026-02-30', days: 14, mode: 'calendar', skipHolidays: true })).toBeNull();
		expect(calculateNotice({ startIso: '2026-11-16', days: -1, mode: 'calendar', skipHolidays: true })).toBeNull();
		expect(calculateNotice({ startIso: '2026-11-16', days: 1.5, mode: 'calendar', skipHolidays: true })).toBeNull();
		expect(calculateNotice({ startIso: '2026-11-16', days: 9999, mode: 'calendar', skipHolidays: true })).toBeNull();
	});

	it('uses no dash characters in any holiday name', () => {
		for (const h of federalHolidays(2026)) expect(h.name).not.toMatch(/[—–]/);
	});
});
