// Builds a calendar file (.ics) in the browser. No server and no calendar API.

function pad(n: number) {
	return String(n).padStart(2, '0');
}

/** 20261114T130000Z */
export function icsUtc(d: Date): string {
	return (
		`${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
		`T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
	);
}

/** 20261114, for an all-day event. */
export function icsDate(isoDay: string): string {
	return isoDay.replace(/-/g, '');
}

function escapeText(s: string) {
	return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
}

export type IcsEvent = {
	title: string;
	description?: string;
	/** A timed event: start and end. */
	start?: Date;
	end?: Date;
	/** An all-day event: YYYY-MM-DD. */
	day?: string;
};

export function buildIcs(events: IcsEvent[], now: Date = new Date()): string {
	const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CoverBetter//Free tools//EN', 'CALSCALE:GREGORIAN'];
	events.forEach((e, i) => {
		lines.push('BEGIN:VEVENT', `UID:${icsUtc(now)}-${i}@coverbetter.io`, `DTSTAMP:${icsUtc(now)}`);
		if (e.day) {
			const next = new Date(`${e.day}T00:00:00Z`);
			next.setUTCDate(next.getUTCDate() + 1);
			lines.push(`DTSTART;VALUE=DATE:${icsDate(e.day)}`, `DTEND;VALUE=DATE:${icsDate(next.toISOString().slice(0, 10))}`);
		} else if (e.start) {
			lines.push(`DTSTART:${icsUtc(e.start)}`, `DTEND:${icsUtc(e.end ?? new Date(e.start.getTime() + 3600_000))}`);
		}
		lines.push(`SUMMARY:${escapeText(e.title)}`);
		if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`);
		lines.push('END:VEVENT');
	});
	lines.push('END:VCALENDAR');
	return lines.join('\r\n') + '\r\n';
}
