import { describe, expect, it } from 'vitest';
import { buildIcs, icsUtc } from './ics';

describe('ics', () => {
	it('formats UTC times', () => {
		expect(icsUtc(new Date('2026-11-14T13:05:09Z'))).toBe('20261114T130509Z');
	});

	it('builds a timed event and an all-day event', () => {
		const ics = buildIcs(
			[
				{ title: 'Interview, Acme; round 2', start: new Date('2026-12-01T15:00:00Z') },
				{ title: 'Last day', day: '2026-12-31' },
			],
			new Date('2026-11-14T00:00:00Z'),
		);
		expect(ics).toContain('DTSTART:20261201T150000Z');
		expect(ics).toContain('DTEND:20261201T160000Z');
		expect(ics).toContain('SUMMARY:Interview\\, Acme\\; round 2');
		expect(ics).toContain('DTSTART;VALUE=DATE:20261231');
		expect(ics).toContain('DTEND;VALUE=DATE:20270101');
		expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
	});
});
