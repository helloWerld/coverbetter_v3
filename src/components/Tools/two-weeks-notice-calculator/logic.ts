// Pure date math for the two weeks notice calculator. Dates are ISO strings (YYYY-MM-DD) and use UTC, so time zones never shift a day.

export type CountMode = 'calendar' | 'business';

export type Holiday = {
	name: string;
	/** The day the holiday falls on by the calendar. */
	date: string;
	/** The weekday people get off. A Saturday holiday moves to Friday. A Sunday holiday moves to Monday. */
	observed: string;
};

const DAY_MS = 86_400_000;

export function parseIso(iso: string): Date | null {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
	const d = new Date(`${iso}T00:00:00Z`);
	if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso) return null;
	return d;
}

export function toIso(d: Date): string {
	return d.toISOString().slice(0, 10);
}

export function addDays(iso: string, n: number): string {
	const d = parseIso(iso);
	if (!d) return iso;
	return toIso(new Date(d.getTime() + n * DAY_MS));
}

function isoOf(year: number, month: number, day: number): string {
	return toIso(new Date(Date.UTC(year, month - 1, day)));
}

/** The nth weekday (0 = Sunday) of a month. n = 1 is the first one. */
function nthWeekday(year: number, month: number, weekday: number, n: number): string {
	const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
	return isoOf(year, month, 1 + ((weekday - first + 7) % 7) + (n - 1) * 7);
}

function lastWeekday(year: number, month: number, weekday: number): string {
	const last = new Date(Date.UTC(year, month, 0));
	return isoOf(year, month, last.getUTCDate() - ((last.getUTCDay() - weekday + 7) % 7));
}

/** Saturday moves to Friday. Sunday moves to Monday. */
export function observedDate(iso: string): string {
	const d = parseIso(iso);
	if (!d) return iso;
	const wd = d.getUTCDay();
	if (wd === 6) return addDays(iso, -1);
	if (wd === 0) return addDays(iso, 1);
	return iso;
}

/** The 11 US federal holidays of one year, found by rule. */
export function federalHolidays(year: number): Holiday[] {
	const list: [string, string][] = [
		["New Year's Day", isoOf(year, 1, 1)],
		['Martin Luther King Jr. Day', nthWeekday(year, 1, 1, 3)],
		["Presidents' Day", nthWeekday(year, 2, 1, 3)],
		['Memorial Day', lastWeekday(year, 5, 1)],
		['Juneteenth', isoOf(year, 6, 19)],
		['Independence Day', isoOf(year, 7, 4)],
		['Labor Day', nthWeekday(year, 9, 1, 1)],
		['Columbus Day', nthWeekday(year, 10, 1, 2)],
		['Veterans Day', isoOf(year, 11, 11)],
		['Thanksgiving Day', nthWeekday(year, 11, 4, 4)],
		['Christmas Day', isoOf(year, 12, 25)],
	];
	return list.map(([name, date]) => ({ name, date, observed: observedDate(date) }));
}

function isWeekend(iso: string): boolean {
	const wd = parseIso(iso)?.getUTCDay();
	return wd === 0 || wd === 6;
}

/** Holidays whose observed day is after `fromIso` and on or before `toIso`. */
export function holidaysBetween(fromIso: string, toIso_: string): Holiday[] {
	const from = parseIso(fromIso);
	const to = parseIso(toIso_);
	if (!from || !to) return [];
	const out: Holiday[] = [];
	for (let y = from.getUTCFullYear() - 1; y <= to.getUTCFullYear() + 1; y++) {
		for (const h of federalHolidays(y)) {
			if (h.observed > fromIso && h.observed <= toIso_) out.push(h);
		}
	}
	return out.sort((a, b) => a.observed.localeCompare(b.observed));
}

/** "Friday, December 4, 2026" */
export function formatLongDate(iso: string): string {
	const d = parseIso(iso);
	if (!d) return '';
	return new Intl.DateTimeFormat('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC',
	}).format(d);
}

/** 1 week is 7 calendar days or 5 business days. */
export function weeksToDays(weeks: number, mode: CountMode): number {
	return weeks * (mode === 'business' ? 5 : 7);
}

export const MAX_NOTICE_DAYS = 365;

export type NoticeInput = {
	/** The day you give notice. */
	startIso: string;
	/** The length of the notice in days (calendar or business, by `mode`). */
	days: number;
	mode: CountMode;
	skipHolidays: boolean;
};

export type NoticeResult = {
	/** The last day by count, before any move off a weekend or holiday. */
	endIso: string;
	/** The last working day. */
	lastDayIso: string;
	lastDayLabel: string;
	/** Working days after the notice day, up to and including the last day. */
	workingDaysLeft: number;
	holidays: Holiday[];
	skipHolidays: boolean;
};

/**
 * Counts days from the day AFTER you give notice. In calendar mode, a last day on a weekend
 * (or a skipped holiday) moves back to the last working day before it.
 */
export function calculateNotice(input: NoticeInput): NoticeResult | null {
	const { startIso, days, mode, skipHolidays } = input;
	if (!parseIso(startIso)) return null;
	if (!Number.isInteger(days) || days < 0 || days > MAX_NOTICE_DAYS) return null;

	const skipSet = new Set<string>();
	if (skipHolidays) {
		const startYear = parseIso(startIso)!.getUTCFullYear();
		for (let y = startYear - 1; y <= startYear + 3; y++) for (const h of federalHolidays(y)) skipSet.add(h.observed);
	}
	const isWorking = (iso: string) => !isWeekend(iso) && !skipSet.has(iso);

	let endIso = startIso;
	let lastDayIso = startIso;
	if (mode === 'business') {
		let counted = 0;
		while (counted < days) {
			endIso = addDays(endIso, 1);
			if (isWorking(endIso)) counted++;
		}
		lastDayIso = endIso;
	} else {
		endIso = addDays(startIso, days);
		lastDayIso = endIso;
		while (lastDayIso > startIso && !isWorking(lastDayIso)) lastDayIso = addDays(lastDayIso, -1);
	}

	let workingDaysLeft = 0;
	for (let d = addDays(startIso, 1); d <= lastDayIso; d = addDays(d, 1)) if (isWorking(d)) workingDaysLeft++;

	return {
		endIso,
		lastDayIso,
		lastDayLabel: formatLongDate(lastDayIso),
		workingDaysLeft,
		holidays: holidaysBetween(startIso, lastDayIso > endIso ? lastDayIso : endIso),
		skipHolidays,
	};
}
