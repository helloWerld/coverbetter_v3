import { describe, expect, it } from 'vitest';
import { isNoResponse, reminders, sankeyData, summaryStats } from './analytics';
import { DEFAULT_SETTINGS, type AppSnapshot, type InterviewRound, type Source, type Status } from './types';

// Sunday 2026-11-15, noon UTC. The week starts Monday 2026-11-09.
const NOW = new Date('2026-11-15T12:00:00Z');
const DAY = 86_400_000;
const ago = (days: number) => new Date(NOW.getTime() - days * DAY);
const S = DEFAULT_SETTINGS; // noResponse 30, followUp 7, second 14

let seq = 0;
interface Opts {
	status?: Status;
	source?: Source;
	appliedDaysAgo?: number | null;
	fit?: number | null;
	/** [status, daysAgo] */
	statuses?: [Status, number][];
	/** [round, daysAgo] */
	interviews?: [InterviewRound, number][];
	followUps?: number[];
	thankYous?: number[];
}
function app(o: Opts = {}): AppSnapshot {
	const status = o.status ?? 'applied';
	const appliedDaysAgo = o.appliedDaysAgo === undefined ? (status === 'saved' ? null : 20) : o.appliedDaysAgo;
	const events: AppSnapshot['events'] = [
		...(o.statuses ?? []).map(([s, d]) => ({ type: 'status' as const, status: s, at: ago(d) })),
		...(o.followUps ?? []).map((d) => ({ type: 'follow_up_sent' as const, status: null, at: ago(d) })),
		...(o.thankYous ?? []).map((d) => ({ type: 'thank_you_sent' as const, status: null, at: ago(d) })),
	].sort((a, b) => a.at.getTime() - b.at.getTime());
	return {
		id: `a${++seq}`,
		status,
		source: o.source ?? 'linkedin',
		createdAt: ago(60),
		appliedAt: appliedDaysAgo === null ? null : ago(appliedDaysAgo),
		hasResume: true,
		hasLetter: true,
		fitScore: o.fit ?? null,
		events,
		interviews: (o.interviews ?? [])
			.map(([round, d]) => ({ round, at: ago(d) }))
			.sort((a, b) => a.at.getTime() - b.at.getTime()),
	};
}

describe('isNoResponse', () => {
	it('is false before N days', () => {
		expect(isNoResponse(app({ appliedDaysAgo: 29 }), NOW, 30)).toBe(false);
	});
	it('is true exactly at N days', () => {
		expect(isNoResponse(app({ appliedDaysAgo: 30 }), NOW, 30)).toBe(true);
	});
	it('measures from the latest event when it is newer than appliedAt', () => {
		expect(isNoResponse(app({ appliedDaysAgo: 40, followUps: [10] }), NOW, 30)).toBe(false);
		expect(isNoResponse(app({ appliedDaysAgo: 40, followUps: [30] }), NOW, 30)).toBe(true);
	});
	it('is false for other statuses', () => {
		for (const status of ['saved', 'interview', 'offer', 'rejected'] as Status[]) {
			expect(isNoResponse(app({ status, appliedDaysAgo: 90 }), NOW, 30)).toBe(false);
		}
	});
	it('is false when appliedAt is missing', () => {
		expect(isNoResponse(app({ appliedDaysAgo: null }), NOW, 30)).toBe(false);
	});
});

describe('reminders', () => {
	it('returns nothing for no apps', () => {
		expect(reminders([], NOW, S)).toEqual([]);
	});
	it('adds follow_up at exactly followUpDays', () => {
		const a = app({ appliedDaysAgo: 7 });
		const r = reminders([a], NOW, S);
		expect(r).toEqual([{ appId: a.id, kind: 'follow_up', dueSince: ago(0) }]);
	});
	it('adds nothing before followUpDays', () => {
		expect(reminders([app({ appliedDaysAgo: 6 })], NOW, S)).toEqual([]);
	});
	it('skips follow_up once a follow-up was sent', () => {
		const a = app({ appliedDaysAgo: 10, followUps: [2] });
		expect(reminders([a], NOW, S)).toEqual([]);
	});
	it('adds follow_up_2 after one follow-up and secondFollowUpDays', () => {
		const a = app({ appliedDaysAgo: 15, followUps: [8] });
		const r = reminders([a], NOW, S);
		expect(r).toHaveLength(1);
		expect(r[0]).toMatchObject({ appId: a.id, kind: 'follow_up_2', dueSince: ago(1) });
	});
	it('adds nothing for follow_up_2 before secondFollowUpDays', () => {
		expect(reminders([app({ appliedDaysAgo: 13, followUps: [6] })], NOW, S)).toEqual([]);
	});
	it('adds nothing after two follow-ups', () => {
		expect(reminders([app({ appliedDaysAgo: 20, followUps: [13, 6] })], NOW, S)).toEqual([]);
	});
	it('adds no follow-up once the app is no-response', () => {
		expect(reminders([app({ appliedDaysAgo: 30 })], NOW, S)).toEqual([]);
	});
	it('adds no follow-up for non-applied statuses', () => {
		const apps = [
			app({ status: 'saved' }),
			app({ status: 'interview', appliedDaysAgo: 10, statuses: [['interview', 5]] }),
			app({ status: 'rejected', appliedDaysAgo: 10 }),
		];
		expect(reminders(apps, NOW, S)).toEqual([]);
	});
	it('adds thank_you one day after an interview', () => {
		const a = app({ status: 'interview', appliedDaysAgo: 10, interviews: [['first', 1]] });
		const r = reminders([a], NOW, S);
		expect(r).toEqual([{ appId: a.id, kind: 'thank_you', dueSince: ago(0) }]);
	});
	it('adds no thank_you for an interview less than a day ago or in the future', () => {
		const a = app({ status: 'interview', appliedDaysAgo: 10, interviews: [['first', 0.5]] });
		const b = app({ status: 'interview', appliedDaysAgo: 10, interviews: [['first', -3]] });
		expect(reminders([a, b], NOW, S)).toEqual([]);
	});
	it('adds no thank_you when one was sent after the interview', () => {
		const a = app({ status: 'interview', appliedDaysAgo: 10, interviews: [['first', 3]], thankYous: [2] });
		expect(reminders([a], NOW, S)).toEqual([]);
	});
	it('adds thank_you when the thank-you was sent before the interview date', () => {
		const a = app({ status: 'interview', appliedDaysAgo: 10, interviews: [['first', 3]], thankYous: [5] });
		expect(reminders([a], NOW, S).map((r) => r.kind)).toEqual(['thank_you']);
	});
	it('uses the latest past interview', () => {
		const a = app({
			status: 'interview',
			appliedDaysAgo: 20,
			interviews: [['first', 8], ['second', 2]],
			thankYous: [7],
		});
		const r = reminders([a], NOW, S);
		expect(r).toEqual([{ appId: a.id, kind: 'thank_you', dueSince: ago(1) }]);
	});
	it('adds no thank_you for closed statuses', () => {
		const apps = (['accepted', 'declined', 'rejected', 'withdrawn'] as Status[]).map((status) =>
			app({ status, appliedDaysAgo: 20, interviews: [['first', 5]] }),
		);
		expect(reminders(apps, NOW, S)).toEqual([]);
	});
	it('sorts oldest due first', () => {
		const newer = app({ appliedDaysAgo: 8 }); // due 1 day ago
		const older = app({ appliedDaysAgo: 12 }); // due 5 days ago
		const thanks = app({ status: 'interview', appliedDaysAgo: 5, interviews: [['first', 4]] }); // due 3 days ago
		const r = reminders([newer, older, thanks], NOW, S);
		expect(r.map((x) => x.appId)).toEqual([older.id, thanks.id, newer.id]);
	});
});

describe('summaryStats', () => {
	it('handles no apps', () => {
		const s = summaryStats([], NOW, S);
		expect(s).toMatchObject({
			total: 0, saved: 0, applied: 0, responses: 0, interviews: 0, offers: 0,
			responseRate: 0, interviewRate: 0, offerRate: 0, medianDaysToResponse: null, noResponse: 0,
		});
		expect(s.appliesPerWeek).toHaveLength(12);
		expect(s.appliesPerWeek.every((w) => w.count === 0)).toBe(true);
	});
	it('handles all saved', () => {
		const s = summaryStats([app({ status: 'saved' }), app({ status: 'saved' })], NOW, S);
		expect(s).toMatchObject({ total: 2, saved: 2, applied: 0, responseRate: 0 });
	});
	it('counts applied as ever reached applied or later', () => {
		const s = summaryStats(
			[app({ status: 'saved' }), app(), app({ status: 'rejected' }), app({ status: 'withdrawn' })],
			NOW,
			S,
		);
		expect(s.applied).toBe(3);
		expect(s.rejected).toBe(1);
		expect(s.withdrawn).toBe(1);
	});
	it('counts responses without withdrawn or silence', () => {
		const apps = [
			app({ status: 'interview', statuses: [['interview', 5]] }),
			app({ status: 'rejected' }),
			app({ status: 'offer' }),
			app({ status: 'accepted' }),
			app({ status: 'declined' }),
			app({ status: 'withdrawn' }),
			app({ status: 'applied' }),
		];
		const s = summaryStats(apps, NOW, S);
		expect(s.applied).toBe(7);
		expect(s.responses).toBe(5);
		expect(s.responseRate).toBe(71);
		expect(s.accepted).toBe(1);
	});
	it('counts a response from history when status moved on', () => {
		const a = app({ status: 'withdrawn', statuses: [['interview', 10]] });
		const s = summaryStats([a], NOW, S);
		expect(s.responses).toBe(1);
		expect(s.interviews).toBe(1);
	});
	it('counts interviews from the interviews list alone', () => {
		const s = summaryStats([app({ status: 'rejected', interviews: [['phone_screen', 12]] })], NOW, S);
		expect(s.interviews).toBe(1);
		expect(s.responses).toBe(1);
	});
	it('counts offers for offer, accepted and declined', () => {
		const apps = [app({ status: 'offer' }), app({ status: 'accepted' }), app({ status: 'declined' }), app()];
		const s = summaryStats(apps, NOW, S);
		expect(s.offers).toBe(3);
		expect(s.offerRate).toBe(75);
	});
	it('counts noResponse with the setting', () => {
		const apps = [app({ appliedDaysAgo: 31 }), app({ appliedDaysAgo: 5 })];
		expect(summaryStats(apps, NOW, S).noResponse).toBe(1);
		expect(summaryStats(apps, NOW, { ...S, noResponseDays: 3 }).noResponse).toBe(2);
	});
	it('rounds rates to whole percents', () => {
		const apps = [
			app({ status: 'interview', statuses: [['interview', 3]] }),
			app(),
			app(),
		];
		const s = summaryStats(apps, NOW, S);
		expect(s.interviewRate).toBe(33);
		expect(s.responseRate).toBe(33);
	});
	it('computes the median days to first response', () => {
		const apps = [
			app({ status: 'interview', appliedDaysAgo: 20, statuses: [['applied', 20], ['interview', 17]] }), // 3
			app({ status: 'rejected', appliedDaysAgo: 20, statuses: [['rejected', 10]] }), // 10
			app({ status: 'offer', appliedDaysAgo: 20, statuses: [['offer', 19]] }), // 1
			app({ status: 'withdrawn', appliedDaysAgo: 20, statuses: [['withdrawn', 15]] }), // ignored
		];
		expect(summaryStats(apps, NOW, S).medianDaysToResponse).toBe(3);
	});
	it('averages the two middle values for an even count', () => {
		const apps = [
			app({ status: 'rejected', appliedDaysAgo: 20, statuses: [['rejected', 16]] }), // 4
			app({ status: 'rejected', appliedDaysAgo: 20, statuses: [['rejected', 15]] }), // 5
		];
		expect(summaryStats(apps, NOW, S).medianDaysToResponse).toBe(4.5);
	});
	it('gives null median when no app has a response event', () => {
		expect(summaryStats([app()], NOW, S).medianDaysToResponse).toBeNull();
	});
	it('builds 12 Monday weeks, oldest first, by appliedAt', () => {
		const apps = [
			app({ appliedDaysAgo: 0 }), // Sun 11-15, week of 11-09
			app({ appliedDaysAgo: 6 }), // Mon 11-09
			app({ appliedDaysAgo: 7 }), // Sun 11-08, week of 11-02
			app({ appliedDaysAgo: 77 }), // 2026-08-30, week of 08-24: oldest week
			app({ appliedDaysAgo: 84 }), // before the window
		];
		const w = summaryStats(apps, NOW, S).appliesPerWeek;
		expect(w).toHaveLength(12);
		expect(w[0]).toEqual({ weekStart: '2026-08-24', count: 1 });
		expect(w[10]).toEqual({ weekStart: '2026-11-02', count: 1 });
		expect(w[11]).toEqual({ weekStart: '2026-11-09', count: 2 });
	});
	it('groups by source', () => {
		const apps = [
			app({ source: 'referral', status: 'interview', statuses: [['interview', 4]] }),
			app({ source: 'referral' }),
			app({ source: 'indeed', status: 'rejected' }),
			app({ source: 'indeed', status: 'saved' }),
		];
		const s = summaryStats(apps, NOW, S);
		expect(s.bySource.referral).toEqual({ applied: 2, responses: 1, interviews: 1 });
		expect(s.bySource.indeed).toEqual({ applied: 1, responses: 1, interviews: 0 });
		expect(s.bySource.linkedin).toEqual({ applied: 0, responses: 0, interviews: 0 });
	});
	it('groups by fit band with the edges', () => {
		const iv = { status: 'interview' as Status, statuses: [['interview', 3]] as [Status, number][] };
		const apps = [
			app({ fit: 80, ...iv }), app({ fit: 79 }), app({ fit: 60 }), app({ fit: 59 }),
			app({ fit: 40 }), app({ fit: 39 }), app({ fit: null }), app({ fit: 90, status: 'saved' }),
		];
		const b = summaryStats(apps, NOW, S).byFitBand;
		expect(b.strong).toEqual({ applied: 1, interviews: 1 });
		expect(b.good).toEqual({ applied: 2, interviews: 0 });
		expect(b.partial).toEqual({ applied: 2, interviews: 0 });
		expect(b.low).toEqual({ applied: 1, interviews: 0 });
		expect(b.none).toEqual({ applied: 1, interviews: 0 });
	});
});

type Flow = ReturnType<typeof sankeyData>;
const link = (f: Flow, source: string, target: string) =>
	f.links.find((l) => l.source === source && l.target === target)?.value ?? 0;
const node = (f: Flow, id: string) => f.nodes.find((n) => n.id === id);

function expectConserved(f: Flow, total: number) {
	for (const n of f.nodes) {
		const out = f.links.filter((l) => l.source === n.id).reduce((s, l) => s + l.value, 0);
		const inn = f.links.filter((l) => l.target === n.id).reduce((s, l) => s + l.value, 0);
		if (out > 0) expect(n.id === 'saved' ? total : inn, `inflow of ${n.id}`).toBe(out);
		expect(n.value, `value of ${n.id}`).toBe(n.id === 'saved' ? total : inn);
	}
	for (const l of f.links) expect(l.value).toBeGreaterThan(0);
	const ids = new Set(f.links.flatMap((l) => [l.source, l.target]));
	expect(f.nodes.map((n) => n.id).sort()).toEqual([...ids].sort());
}

describe('sankeyData', () => {
	it('is empty with no apps', () => {
		expect(sankeyData([], NOW, S)).toEqual({ nodes: [], links: [] });
	});
	it('sends all saved apps to Not applied yet', () => {
		const f = sankeyData([app({ status: 'saved' }), app({ status: 'saved' })], NOW, S);
		expect(f.links).toEqual([
			{ source: 'saved', target: 'not-applied', value: 2 },
		]);
		expect(node(f, 'saved')?.value).toBe(2);
		expect(node(f, 'not-applied')).toMatchObject({ label: 'Not applied yet', kind: 'end', value: 2 });
	});
	it('splits applied into waiting and no response', () => {
		const f = sankeyData([app({ appliedDaysAgo: 5 }), app({ appliedDaysAgo: 30 }), app({ appliedDaysAgo: 40 })], NOW, S);
		expect(link(f, 'applied', 'waiting')).toBe(1);
		expect(link(f, 'applied', 'no-response')).toBe(2);
		expect(node(f, 'waiting')?.kind).toBe('go');
		expect(node(f, 'no-response')).toMatchObject({ label: 'No response', kind: 'end' });
		expectConserved(f, 3);
	});
	it('sends an offer without interview data straight from Applied', () => {
		const f = sankeyData([app({ status: 'offer' })], NOW, S);
		expect(link(f, 'applied', 'offer')).toBe(1);
		expect(link(f, 'offer', 'deciding')).toBe(1);
		expect(node(f, 'interview')).toBeUndefined();
		expectConserved(f, 1);
	});
	it('sends an offer from Interview when there is no final round', () => {
		const f = sankeyData([app({ status: 'offer', interviews: [['first', 9]] })], NOW, S);
		expect(link(f, 'applied', 'interview')).toBe(1);
		expect(link(f, 'interview', 'offer')).toBe(1);
		expect(node(f, 'final')).toBeUndefined();
	});
	it('sends an offer from Final interview', () => {
		const f = sankeyData([app({ status: 'offer', interviews: [['first', 12], ['final', 5]] })], NOW, S);
		expect(link(f, 'interview', 'final')).toBe(1);
		expect(link(f, 'final', 'offer')).toBe(1);
		expect(link(f, 'interview', 'offer')).toBe(0);
		expectConserved(f, 1);
	});
	it('ends rejected after a final interview at the final stage', () => {
		const f = sankeyData([app({ status: 'rejected', interviews: [['first', 12], ['final', 5]] })], NOW, S);
		expect(link(f, 'final', 'rejected@final')).toBe(1);
		expect(node(f, 'rejected@final')).toMatchObject({ label: 'Rejected', kind: 'end' });
		expectConserved(f, 1);
	});
	it('treats rejected with an interview as reached Interview', () => {
		const f = sankeyData([app({ status: 'rejected', interviews: [['phone_screen', 12]] })], NOW, S);
		expect(link(f, 'interview', 'rejected@interview')).toBe(1);
	});
	it('treats rejected from a status event as reached Interview', () => {
		const f = sankeyData([app({ status: 'rejected', statuses: [['interview', 9]] })], NOW, S);
		expect(link(f, 'interview', 'rejected@interview')).toBe(1);
	});
	it('uses separate end node ids per stage with the same label', () => {
		const f = sankeyData(
			[
				app({ status: 'rejected' }),
				app({ status: 'rejected', interviews: [['first', 9]] }),
				app({ status: 'withdrawn' }),
				app({ status: 'withdrawn', interviews: [['first', 9], ['final', 3]] }),
			],
			NOW,
			S,
		);
		expect(node(f, 'rejected@applied')?.label).toBe('Rejected');
		expect(node(f, 'rejected@interview')?.label).toBe('Rejected');
		expect(node(f, 'withdrawn@applied')?.label).toBe('Withdrawn');
		expect(node(f, 'withdrawn@final')?.label).toBe('Withdrawn');
		expectConserved(f, 4);
	});
	it('keeps active interviews in progress', () => {
		const f = sankeyData(
			[
				app({ status: 'interview', statuses: [['interview', 5]] }),
				app({ status: 'interview', interviews: [['first', 9], ['final', 2]] }),
			],
			NOW,
			S,
		);
		expect(link(f, 'interview', 'in-progress@interview')).toBe(1);
		expect(link(f, 'final', 'in-progress@final')).toBe(1);
		expect(node(f, 'in-progress@final')).toMatchObject({ label: 'In progress', kind: 'go' });
		expectConserved(f, 2);
	});
	it('ends offers as accepted, declined or deciding', () => {
		const f = sankeyData([app({ status: 'accepted' }), app({ status: 'declined' }), app({ status: 'offer' })], NOW, S);
		expect(link(f, 'offer', 'accepted')).toBe(1);
		expect(link(f, 'offer', 'declined')).toBe(1);
		expect(link(f, 'offer', 'deciding')).toBe(1);
		expect(node(f, 'accepted')?.kind).toBe('win');
		expect(node(f, 'offer')?.kind).toBe('win');
		expect(node(f, 'declined')?.kind).toBe('end');
		expect(node(f, 'saved')?.kind).toBe('go');
		expect(node(f, 'applied')?.kind).toBe('go');
		expectConserved(f, 3);
	});
	it('ends at the stage before the offer when the offer was withdrawn', () => {
		const f = sankeyData([app({ status: 'withdrawn', statuses: [['offer', 4]], interviews: [['first', 9]] })], NOW, S);
		expect(link(f, 'interview', 'withdrawn@interview')).toBe(1);
		expect(node(f, 'offer')).toBeUndefined();
	});
	it('conserves flow on a mixed set of apps', () => {
		const apps: AppSnapshot[] = [
			app({ status: 'saved' }), app({ status: 'saved' }),
			app({ appliedDaysAgo: 3 }), app({ appliedDaysAgo: 45 }), app({ appliedDaysAgo: 31 }),
			app({ status: 'rejected' }), app({ status: 'withdrawn' }),
			app({ status: 'interview', statuses: [['interview', 4]] }),
			app({ status: 'interview', interviews: [['first', 8]] }),
			app({ status: 'interview', interviews: [['first', 8], ['final', 1]] }),
			app({ status: 'rejected', interviews: [['first', 8]] }),
			app({ status: 'rejected', interviews: [['first', 8], ['final', 2]] }),
			app({ status: 'withdrawn', interviews: [['second', 8]] }),
			app({ status: 'offer' }),
			app({ status: 'offer', interviews: [['first', 8]] }),
			app({ status: 'offer', interviews: [['final', 8]] }),
			app({ status: 'accepted', interviews: [['final', 8]] }),
			app({ status: 'declined', interviews: [['first', 8]] }),
			app({ status: 'accepted' }),
		];
		const f = sankeyData(apps, NOW, S);
		expectConserved(f, apps.length);
		expect(node(f, 'saved')?.value).toBe(apps.length);
		expect(link(f, 'saved', 'applied') + link(f, 'saved', 'not-applied')).toBe(apps.length);
	});
});
