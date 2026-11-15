import { buildIcs } from '@/lib/tools/ics';

export type ZoneOption = { value: string; label: string };

/** US zones first, then major world cities. The value is an IANA zone name. */
export const COMMON_ZONES: readonly ZoneOption[] = [
	{ value: 'America/New_York', label: 'US Eastern (New York)' },
	{ value: 'America/Chicago', label: 'US Central (Chicago)' },
	{ value: 'America/Denver', label: 'US Mountain (Denver)' },
	{ value: 'America/Phoenix', label: 'US Mountain, no daylight time (Phoenix)' },
	{ value: 'America/Los_Angeles', label: 'US Pacific (Los Angeles)' },
	{ value: 'America/Anchorage', label: 'US Alaska (Anchorage)' },
	{ value: 'Pacific/Honolulu', label: 'US Hawaii (Honolulu)' },
	{ value: 'America/Toronto', label: 'Toronto' },
	{ value: 'America/Vancouver', label: 'Vancouver' },
	{ value: 'America/Mexico_City', label: 'Mexico City' },
	{ value: 'America/Sao_Paulo', label: 'Sao Paulo' },
	{ value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires' },
	{ value: 'Europe/London', label: 'London' },
	{ value: 'Europe/Dublin', label: 'Dublin' },
	{ value: 'Europe/Paris', label: 'Paris' },
	{ value: 'Europe/Berlin', label: 'Berlin' },
	{ value: 'Europe/Madrid', label: 'Madrid' },
	{ value: 'Europe/Amsterdam', label: 'Amsterdam' },
	{ value: 'Europe/Athens', label: 'Athens' },
	{ value: 'Europe/Istanbul', label: 'Istanbul' },
	{ value: 'Africa/Cairo', label: 'Cairo' },
	{ value: 'Africa/Lagos', label: 'Lagos' },
	{ value: 'Africa/Johannesburg', label: 'Johannesburg' },
	{ value: 'Africa/Nairobi', label: 'Nairobi' },
	{ value: 'Asia/Dubai', label: 'Dubai' },
	{ value: 'Asia/Karachi', label: 'Karachi' },
	{ value: 'Asia/Kolkata', label: 'India (Mumbai, Delhi)' },
	{ value: 'Asia/Dhaka', label: 'Dhaka' },
	{ value: 'Asia/Bangkok', label: 'Bangkok' },
	{ value: 'Asia/Singapore', label: 'Singapore' },
	{ value: 'Asia/Hong_Kong', label: 'Hong Kong' },
	{ value: 'Asia/Shanghai', label: 'Shanghai' },
	{ value: 'Asia/Manila', label: 'Manila' },
	{ value: 'Asia/Seoul', label: 'Seoul' },
	{ value: 'Asia/Tokyo', label: 'Tokyo' },
	{ value: 'Australia/Perth', label: 'Perth' },
	{ value: 'Australia/Sydney', label: 'Sydney' },
	{ value: 'Australia/Brisbane', label: 'Brisbane' },
	{ value: 'Pacific/Auckland', label: 'Auckland' },
];

/** Common zones first, then every other zone the browser knows. Safe when Intl.supportedValuesOf is missing. */
export function allZones(supported?: readonly string[]): ZoneOption[] {
	let list = supported;
	if (!list) {
		try {
			const fn = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf;
			list = fn ? fn('timeZone') : [];
		} catch {
			list = [];
		}
	}
	const known = new Set(COMMON_ZONES.map((z) => z.value));
	const rest = list.filter((z) => !known.has(z)).map((z) => ({ value: z, label: z.replace(/_/g, ' ') }));
	return [...COMMON_ZONES, ...rest];
}

export function filterZones(zones: readonly ZoneOption[], query: string): ZoneOption[] {
	const q = query.trim().toLowerCase().replace(/\s+/g, ' ');
	if (!q) return [...zones];
	return zones.filter((z) => `${z.label} ${z.value}`.toLowerCase().replace(/_/g, ' ').includes(q));
}

export function isValidZone(zone: string): boolean {
	if (!zone) return false;
	try {
		new Intl.DateTimeFormat('en-US', { timeZone: zone });
		return true;
	} catch {
		return false;
	}
}

export function browserZone(): string {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
	} catch {
		return 'UTC';
	}
}

type Parts = { year: number; month: number; day: number; hour: number; minute: number; second: number };

/** The wall clock in a zone at a UTC instant. */
function wallClock(utcMs: number, zone: string): Parts {
	const f = new Intl.DateTimeFormat('en-US', {
		timeZone: zone,
		hourCycle: 'h23',
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
	});
	const o: Record<string, number> = {};
	for (const p of f.formatToParts(new Date(utcMs))) if (p.type !== 'literal') o[p.type] = Number(p.value);
	return { year: o.year, month: o.month, day: o.day, hour: o.hour % 24, minute: o.minute, second: o.second };
}

/** Zone offset in ms (zone wall clock minus UTC) at a UTC instant. */
function offsetAt(utcMs: number, zone: string): number {
	const p = wallClock(utcMs, zone);
	return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(utcMs / 1000) * 1000;
}

/**
 * Turns a wall clock time in a zone into the UTC instant.
 * For a time that does not exist (spring forward), it uses the time after the jump.
 * For a time that happens twice (fall back), it uses the first one.
 * Returns null when the input or the zone is not valid.
 */
export function zonedTimeToUtc(date: string, time: string, zone: string): Date | null {
	const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
	const t = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
	if (!d || !t || !isValidZone(zone)) return null;
	const [y, mo, da, h, mi] = [Number(d[1]), Number(d[2]), Number(d[3]), Number(t[1]), Number(t[2])];
	if (mo < 1 || mo > 12 || da < 1 || h > 23 || mi > 59) return null;
	const asUtc = Date.UTC(y, mo - 1, da, h, mi);
	const check = new Date(asUtc);
	if (check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== da) return null;
	// Try the offsets around the date. Keep the ones that give back the same wall clock.
	const candidates = new Set<number>();
	for (const shift of [-86400000, 0, 86400000]) candidates.add(offsetAt(asUtc + shift, zone));
	const hits: number[] = [];
	for (const off of candidates) {
		const utc = asUtc - off;
		if (offsetAt(utc, zone) === off) hits.push(utc);
	}
	if (hits.length > 0) return new Date(Math.min(...hits));
	// The time does not exist. Use the offset from before the jump, which lands after the jump.
	const before = offsetAt(asUtc - 86400000, zone);
	return new Date(asUtc - before);
}

export type Shown = { day: string; date: string; time: string; zoneName: string; isoDay: string };

/** How a UTC instant looks in a zone. */
export function formatInZone(utc: Date, zone: string): Shown {
	const base = { timeZone: zone, hourCycle: 'h23' as const };
	const day = new Intl.DateTimeFormat('en-US', { ...base, weekday: 'long' }).format(utc);
	const date = new Intl.DateTimeFormat('en-US', { ...base, month: 'long', day: 'numeric', year: 'numeric' }).format(utc);
	const time = new Intl.DateTimeFormat('en-US', { ...base, hourCycle: 'h12', hour: 'numeric', minute: '2-digit' }).format(utc);
	const zoneName = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'short' })
		.formatToParts(utc)
		.find((p) => p.type === 'timeZoneName')?.value ?? zone;
	const p = wallClock(utc.getTime(), zone);
	const isoDay = `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
	return { day, date, time, zoneName, isoDay };
}

export type Conversion = {
	utc: Date;
	end: Date;
	interviewer: Shown;
	you: Shown;
	/** True when the date in your zone differs from the date in the interviewer's zone. */
	dateDiffers: boolean;
};

export function convert(input: {
	date: string;
	time: string;
	interviewerZone: string;
	yourZone: string;
	minutes: number;
}): Conversion | null {
	const utc = zonedTimeToUtc(input.date, input.time, input.interviewerZone);
	if (!utc || !isValidZone(input.yourZone)) return null;
	const mins = Number.isFinite(input.minutes) && input.minutes > 0 ? Math.min(input.minutes, 1440) : 30;
	const interviewer = formatInZone(utc, input.interviewerZone);
	const you = formatInZone(utc, input.yourZone);
	return { utc, end: new Date(utc.getTime() + mins * 60000), interviewer, you, dateDiffers: interviewer.isoDay !== you.isoDay };
}

function zoneLabel(zones: readonly ZoneOption[], zone: string): string {
	return zones.find((z) => z.value === zone)?.label ?? zone.replace(/_/g, ' ');
}

/** One line to paste into an email. Times are in the interviewer's zone first, then yours. */
export function confirmationText(c: Conversion): string {
	const i = c.interviewer;
	const y = c.you;
	const second = c.dateDiffers ? `${y.time} (${y.zoneName}) on ${y.day}, ${y.date}` : `${y.time} (${y.zoneName})`;
	return `Confirming our interview on ${i.day}, ${i.date} at ${i.time} (${i.zoneName}) / ${second}.`;
}

export function icsFile(c: Conversion, interviewerZone: string, yourZone: string, now = new Date()): string {
	const zones = COMMON_ZONES;
	return buildIcs(
		[
			{
				title: 'Interview',
				description: `Interview time: ${c.interviewer.time} ${c.interviewer.zoneName} (${zoneLabel(zones, interviewerZone)}). Your time: ${c.you.time} ${c.you.zoneName} (${zoneLabel(zones, yourZone)}).`,
				start: c.utc,
				end: c.end,
			},
		],
		now,
	);
}

export function todayIso(now = new Date()): string {
	const p = (n: number) => String(n).padStart(2, '0');
	return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}
