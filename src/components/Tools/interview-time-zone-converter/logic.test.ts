import { describe, expect, it } from 'vitest';
import {
	COMMON_ZONES,
	allZones,
	confirmationText,
	convert,
	filterZones,
	formatInZone,
	icsFile,
	isValidZone,
	zonedTimeToUtc,
} from './logic';
import { meta } from './meta';

const DASH = new RegExp(String.fromCharCode(91, 0x2013, 0x2014, 93));
const iso = (d: Date | null) => d?.toISOString();

describe('zonedTimeToUtc', () => {
	it('handles US winter time (EST, UTC-5)', () => {
		expect(iso(zonedTimeToUtc('2026-01-15', '09:00', 'America/New_York'))).toBe('2026-01-15T14:00:00.000Z');
	});

	it('handles US summer time (EDT, UTC-4)', () => {
		expect(iso(zonedTimeToUtc('2026-07-15', '09:00', 'America/New_York'))).toBe('2026-07-15T13:00:00.000Z');
	});

	it('handles the US spring forward date (2026-03-08)', () => {
		expect(iso(zonedTimeToUtc('2026-03-08', '01:30', 'America/New_York'))).toBe('2026-03-08T06:30:00.000Z');
		expect(iso(zonedTimeToUtc('2026-03-08', '03:30', 'America/New_York'))).toBe('2026-03-08T07:30:00.000Z');
		// 02:30 does not exist. It lands after the jump.
		expect(iso(zonedTimeToUtc('2026-03-08', '02:30', 'America/New_York'))).toBe('2026-03-08T07:30:00.000Z');
	});

	it('handles the US fall back date (2026-11-01)', () => {
		expect(iso(zonedTimeToUtc('2026-11-01', '00:30', 'America/New_York'))).toBe('2026-11-01T04:30:00.000Z');
		expect(iso(zonedTimeToUtc('2026-11-01', '03:00', 'America/New_York'))).toBe('2026-11-01T08:00:00.000Z');
		// 01:30 happens twice. It uses the first one (EDT).
		expect(iso(zonedTimeToUtc('2026-11-01', '01:30', 'America/New_York'))).toBe('2026-11-01T05:30:00.000Z');
	});

	it('handles non-US zones', () => {
		expect(iso(zonedTimeToUtc('2026-06-01', '10:00', 'Asia/Kolkata'))).toBe('2026-06-01T04:30:00.000Z');
		expect(iso(zonedTimeToUtc('2026-06-01', '10:00', 'Asia/Tokyo'))).toBe('2026-06-01T01:00:00.000Z');
		// London: GMT in winter, BST in summer.
		expect(iso(zonedTimeToUtc('2026-01-10', '10:00', 'Europe/London'))).toBe('2026-01-10T10:00:00.000Z');
		expect(iso(zonedTimeToUtc('2026-07-10', '10:00', 'Europe/London'))).toBe('2026-07-10T09:00:00.000Z');
		// Sydney: summer time in January (UTC+11).
		expect(iso(zonedTimeToUtc('2026-01-10', '10:00', 'Australia/Sydney'))).toBe('2026-01-09T23:00:00.000Z');
	});

	it('handles UTC and midnight', () => {
		expect(iso(zonedTimeToUtc('2026-05-05', '00:00', 'UTC'))).toBe('2026-05-05T00:00:00.000Z');
		expect(iso(zonedTimeToUtc('2026-05-05', '00:00', 'America/Los_Angeles'))).toBe('2026-05-05T07:00:00.000Z');
	});

	it('returns null for bad input', () => {
		expect(zonedTimeToUtc('', '09:00', 'UTC')).toBeNull();
		expect(zonedTimeToUtc('2026-02-30', '09:00', 'UTC')).toBeNull();
		expect(zonedTimeToUtc('2026-05-05', '25:00', 'UTC')).toBeNull();
		expect(zonedTimeToUtc('2026-05-05', '09:00', 'Not/AZone')).toBeNull();
		expect(zonedTimeToUtc('2026-05-05', '', 'UTC')).toBeNull();
	});
});

describe('convert and text', () => {
	const base = { date: '2026-03-09', time: '09:00', interviewerZone: 'America/New_York', yourZone: 'Asia/Tokyo', minutes: 45 };

	it('converts across zones and flags a different date', () => {
		const c = convert(base)!;
		expect(c.interviewer.day).toBe('Monday');
		expect(c.you.day).toBe('Monday');
		expect(c.you.time).toBe('10:00 PM');
		expect(c.dateDiffers).toBe(false);
		const late = convert({ ...base, time: '14:00' })!;
		expect(late.you.day).toBe('Tuesday');
		expect(late.dateDiffers).toBe(true);
	});

	it('sets the end from the length, and uses a default for bad lengths', () => {
		const c = convert(base)!;
		expect(c.end.getTime() - c.utc.getTime()).toBe(45 * 60000);
		expect(convert({ ...base, minutes: 0 })!.end.getTime() - c.utc.getTime()).toBe(30 * 60000);
		expect(convert({ ...base, minutes: NaN })!.end.getTime() - c.utc.getTime()).toBe(30 * 60000);
		expect(convert({ ...base, minutes: 1e9 })!.end.getTime() - c.utc.getTime()).toBe(1440 * 60000);
	});

	it('returns null for bad zones or dates', () => {
		expect(convert({ ...base, yourZone: 'nope' })).toBeNull();
		expect(convert({ ...base, date: '' })).toBeNull();
	});

	it('writes the confirmation line', () => {
		const text = confirmationText(convert(base)!);
		expect(text).toBe('Confirming our interview on Monday, March 9, 2026 at 9:00 AM (EDT) / 10:00 PM (GMT+9).');
		expect(confirmationText(convert({ ...base, time: '14:00' })!)).toContain('on Tuesday, March 10, 2026');
	});

	it('builds an ics file with the right UTC times', () => {
		const c = convert(base)!;
		const ics = icsFile(c, base.interviewerZone, base.yourZone, new Date('2026-03-01T00:00:00Z'));
		expect(ics).toContain('DTSTART:20260309T130000Z');
		expect(ics).toContain('DTEND:20260309T134500Z');
		expect(ics).toContain('BEGIN:VCALENDAR');
	});

	it('formats a day in a zone', () => {
		expect(formatInZone(new Date('2026-07-01T03:00:00Z'), 'America/Los_Angeles').day).toBe('Tuesday');
	});
});

describe('zone list', () => {
	it('lists US zones first and every common zone is valid', () => {
		expect(COMMON_ZONES[0].value).toBe('America/New_York');
		expect(COMMON_ZONES.every((z) => isValidZone(z.value))).toBe(true);
		expect(new Set(COMMON_ZONES.map((z) => z.value)).size).toBe(COMMON_ZONES.length);
	});

	it('adds extra zones without repeats, and works without support', () => {
		const list = allZones(['America/New_York', 'Africa/Abidjan']);
		expect(list.filter((z) => z.value === 'America/New_York').length).toBe(1);
		expect(list.some((z) => z.value === 'Africa/Abidjan')).toBe(true);
		expect(allZones([]).length).toBe(COMMON_ZONES.length);
	});

	it('searches by label or name', () => {
		expect(filterZones(COMMON_ZONES, 'tokyo')[0].value).toBe('Asia/Tokyo');
		expect(filterZones(COMMON_ZONES, 'new york')[0].value).toBe('America/New_York');
		expect(filterZones(COMMON_ZONES, '')).toHaveLength(COMMON_ZONES.length);
		expect(filterZones(COMMON_ZONES, 'zzzzz')).toHaveLength(0);
	});
});

describe('text rules', () => {
	it('uses no em dash or en dash', () => {
		expect(DASH.test(JSON.stringify([COMMON_ZONES, meta]))).toBe(false);
		expect(DASH.test(confirmationText(convert({ date: '2026-03-09', time: '09:00', interviewerZone: 'America/New_York', yourZone: 'Europe/London', minutes: 30 })!))).toBe(false);
	});

	it('has valid meta lengths', () => {
		expect(meta.title.length).toBeLessThanOrEqual(70);
		expect(meta.description.length).toBeLessThanOrEqual(160);
	});
});
