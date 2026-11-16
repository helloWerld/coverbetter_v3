import {
	CLOSED_STATUSES,
	SOURCES,
	type AppSnapshot,
	type MessageKind,
	type Source,
	type Status,
	type UserSettings,
} from './types';

const DAY = 24 * 60 * 60 * 1000;
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY);

const RESPONSE_STATUSES: readonly Status[] = ['interview', 'offer', 'rejected', 'accepted', 'declined'];
const OFFER_STATUSES: readonly Status[] = ['offer', 'accepted', 'declined'];

/** Every status the app has shown: the current one plus all status events. */
function seenStatuses(a: AppSnapshot): Set<Status> {
	const seen = new Set<Status>([a.status]);
	for (const e of a.events) if (e.status) seen.add(e.status);
	return seen;
}

interface Reach {
	applied: boolean;
	interview: boolean;
	final: boolean;
	offer: boolean;
	responded: boolean;
}

function reach(a: AppSnapshot): Reach {
	const seen = seenStatuses(a);
	const hasInterview = a.interviews.length > 0;
	const offer = OFFER_STATUSES.some((s) => seen.has(s));
	const interview = seen.has('interview') || hasInterview;
	const applied = [...seen].some((s) => s !== 'saved') || hasInterview;
	const responded = RESPONSE_STATUSES.some((s) => seen.has(s)) || hasInterview;
	return {
		applied,
		interview,
		final: a.interviews.some((i) => i.round === 'final'),
		offer,
		responded: applied && responded,
	};
}

/** True when the app is still "applied" and nothing happened for `days` days. */
export function isNoResponse(a: AppSnapshot, now: Date, days: number): boolean {
	if (a.status !== 'applied' || !a.appliedAt) return false;
	let last = a.appliedAt.getTime();
	for (const e of a.events) last = Math.max(last, e.at.getTime());
	return now.getTime() - last >= days * DAY;
}

export interface Reminder {
	appId: string;
	kind: Extract<MessageKind, 'follow_up' | 'follow_up_2' | 'thank_you'>;
	dueSince: Date;
}

export function reminders(apps: AppSnapshot[], now: Date, settings: UserSettings): Reminder[] {
	const out: Reminder[] = [];
	for (const a of apps) {
		if (a.status === 'applied' && a.appliedAt && !isNoResponse(a, now, settings.noResponseDays)) {
			const sent = a.events.filter((e) => e.type === 'follow_up_sent').length;
			if (sent === 0) {
				const due = addDays(a.appliedAt, settings.followUpDays);
				if (now >= due) out.push({ appId: a.id, kind: 'follow_up', dueSince: due });
			} else if (sent === 1) {
				const due = addDays(a.appliedAt, settings.secondFollowUpDays);
				if (now >= due) out.push({ appId: a.id, kind: 'follow_up_2', dueSince: due });
			}
		}
		if (!CLOSED_STATUSES.includes(a.status)) {
			// The latest interview that is at least a day old.
			const past = a.interviews.filter((i) => now.getTime() - i.at.getTime() >= DAY);
			if (past.length > 0) {
				const latest = past.reduce((m, i) => (i.at > m.at ? i : m));
				const thanked = a.events.some((e) => e.type === 'thank_you_sent' && e.at > latest.at);
				if (!thanked) out.push({ appId: a.id, kind: 'thank_you', dueSince: addDays(latest.at, 1) });
			}
		}
	}
	return out.sort(
		(x, y) =>
			x.dueSince.getTime() - y.dueSince.getTime() ||
			x.appId.localeCompare(y.appId) ||
			x.kind.localeCompare(y.kind),
	);
}

export type FitBand = 'strong' | 'good' | 'partial' | 'low' | 'none';

export function fitBand(score: number | null): FitBand {
	if (score === null) return 'none';
	if (score >= 80) return 'strong';
	if (score >= 60) return 'good';
	if (score >= 40) return 'partial';
	return 'low';
}

const FIT_BANDS: readonly FitBand[] = ['strong', 'good', 'partial', 'low', 'none'];

export interface SummaryStats {
	total: number;
	saved: number;
	applied: number;
	responses: number;
	interviews: number;
	offers: number;
	accepted: number;
	rejected: number;
	withdrawn: number;
	noResponse: number;
	/** Whole percents of `applied`. */
	responseRate: number;
	interviewRate: number;
	offerRate: number;
	medianDaysToResponse: number | null;
	appliesPerWeek: { weekStart: string; count: number }[];
	bySource: Record<Source, { applied: number; responses: number; interviews: number }>;
	byFitBand: Record<FitBand, { applied: number; interviews: number }>;
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** Monday 00:00 UTC of the week that holds `d`. */
function weekStartUtc(d: Date): Date {
	const day = (d.getUTCDay() + 6) % 7; // Monday = 0
	return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day));
}

function median(values: number[]): number | null {
	if (values.length === 0) return null;
	const s = [...values].sort((a, b) => a - b);
	const mid = Math.floor(s.length / 2);
	return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

const pct = (n: number, of: number) => (of === 0 ? 0 : Math.round((n / of) * 100));

export function summaryStats(apps: AppSnapshot[], now: Date, settings: UserSettings): SummaryStats {
	const bySource = Object.fromEntries(
		SOURCES.map((s) => [s, { applied: 0, responses: 0, interviews: 0 }]),
	) as SummaryStats['bySource'];
	const byFitBand = Object.fromEntries(
		FIT_BANDS.map((b) => [b, { applied: 0, interviews: 0 }]),
	) as SummaryStats['byFitBand'];

	let saved = 0, applied = 0, responses = 0, interviews = 0, offers = 0;
	let accepted = 0, rejected = 0, withdrawn = 0, noResponse = 0;
	const days: number[] = [];

	const thisWeek = weekStartUtc(now);
	const weeks = new Map<string, number>();
	for (let i = 11; i >= 0; i--) weeks.set(isoDay(addDays(thisWeek, -7 * i)), 0);

	for (const a of apps) {
		const r = reach(a);
		if (a.status === 'saved') saved++;
		if (a.status === 'accepted') accepted++;
		if (a.status === 'rejected') rejected++;
		if (a.status === 'withdrawn') withdrawn++;
		if (isNoResponse(a, now, settings.noResponseDays)) noResponse++;
		if (r.offer) offers++;
		if (r.interview) interviews++;
		if (!r.applied) continue;

		applied++;
		if (r.responded) responses++;
		const band = byFitBand[fitBand(a.fitScore)];
		band.applied++;
		bySource[a.source].applied++;
		if (r.responded) bySource[a.source].responses++;
		if (r.interview) {
			bySource[a.source].interviews++;
			band.interviews++;
		}

		if (a.appliedAt) {
			const key = isoDay(weekStartUtc(a.appliedAt));
			if (weeks.has(key)) weeks.set(key, weeks.get(key)! + 1);
			const first = a.events.find(
				(e) =>
					e.type === 'status' &&
					e.at >= a.appliedAt! &&
					(e.status === 'interview' || e.status === 'rejected' || e.status === 'offer'),
			);
			if (first) days.push((first.at.getTime() - a.appliedAt.getTime()) / DAY);
		}
	}

	const med = median(days);
	return {
		total: apps.length,
		saved,
		applied,
		responses,
		interviews,
		offers,
		accepted,
		rejected,
		withdrawn,
		noResponse,
		responseRate: pct(responses, applied),
		interviewRate: pct(interviews, applied),
		offerRate: pct(offers, applied),
		medianDaysToResponse: med === null ? null : Math.round(med * 10) / 10,
		appliesPerWeek: [...weeks].map(([weekStart, count]) => ({ weekStart, count })),
		bySource,
		byFitBand,
	};
}

export interface SankeyNode {
	id: string;
	label: string;
	kind: 'go' | 'win' | 'end';
	value: number;
}
export interface SankeyLink {
	source: string;
	target: string;
	value: number;
}

type NodeDef = { label: string; kind: SankeyNode['kind'] };
const NODE_DEFS: Record<string, NodeDef> = {
	saved: { label: 'Saved', kind: 'go' },
	applied: { label: 'Applied', kind: 'go' },
	interview: { label: 'Interview', kind: 'go' },
	final: { label: 'Final interview', kind: 'go' },
	offer: { label: 'Offer', kind: 'win' },
	accepted: { label: 'Accepted', kind: 'win' },
	declined: { label: 'Declined', kind: 'end' },
	deciding: { label: 'Deciding', kind: 'go' },
	waiting: { label: 'Waiting', kind: 'go' },
	'no-response': { label: 'No response', kind: 'end' },
	'not-applied': { label: 'Not applied yet', kind: 'end' },
};
for (const stage of ['applied', 'interview', 'final']) {
	NODE_DEFS[`rejected@${stage}`] = { label: 'Rejected', kind: 'end' };
	NODE_DEFS[`withdrawn@${stage}`] = { label: 'Withdrawn', kind: 'end' };
}
for (const stage of ['interview', 'final']) {
	NODE_DEFS[`in-progress@${stage}`] = { label: 'In progress', kind: 'go' };
}
const NODE_ORDER = Object.keys(NODE_DEFS);

/** The path one application takes through the flow, as node ids. */
function flowPath(a: AppSnapshot, now: Date, settings: UserSettings): string[] {
	const r = reach(a);
	if (!r.applied) return ['saved', 'not-applied'];

	const path = ['saved', 'applied'];
	// An offer counts only while it is the current state. A later rejection or withdrawal
	// ends at the stage before the offer, because the chart has no end nodes after Offer.
	const atOffer = OFFER_STATUSES.includes(a.status);
	if (r.interview) path.push('interview');
	if (r.final) path.push('final');
	const stage = path[path.length - 1];

	if (atOffer) {
		path.push('offer');
		if (a.status === 'accepted') path.push('accepted');
		else if (a.status === 'declined') path.push('declined');
		else path.push('deciding');
	} else if (a.status === 'rejected' || a.status === 'withdrawn') {
		path.push(`${a.status}@${stage}`);
	} else if (stage === 'applied') {
		path.push(isNoResponse(a, now, settings.noResponseDays) ? 'no-response' : 'waiting');
	} else {
		path.push(`in-progress@${stage}`);
	}
	return path;
}

export function sankeyData(
	apps: AppSnapshot[],
	now: Date,
	settings: UserSettings,
): { nodes: SankeyNode[]; links: SankeyLink[] } {
	const counts = new Map<string, number>();
	for (const a of apps) {
		const path = flowPath(a, now, settings);
		for (let i = 0; i < path.length - 1; i++) {
			const key = `${path[i]}\u0000${path[i + 1]}`;
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}
	}

	const idx = (id: string) => NODE_ORDER.indexOf(id);
	const links = [...counts]
		.map(([key, value]) => {
			const [source, target] = key.split('\u0000');
			return { source, target, value };
		})
		.filter((l) => l.value > 0)
		.sort((x, y) => idx(x.source) - idx(y.source) || idx(x.target) - idx(y.target));

	const inflow = new Map<string, number>();
	for (const l of links) inflow.set(l.target, (inflow.get(l.target) ?? 0) + l.value);
	if (links.length > 0) inflow.set('saved', apps.length);

	const used = new Set(links.flatMap((l) => [l.source, l.target]));
	const nodes = NODE_ORDER.filter((id) => used.has(id)).map((id) => ({
		id,
		label: NODE_DEFS[id].label,
		kind: NODE_DEFS[id].kind,
		value: inflow.get(id) ?? 0,
	}));
	return { nodes, links };
}

/** The application ids that pass through each flow-chart node, in input order. Same paths as sankeyData. */
export function sankeyMembers(apps: AppSnapshot[], now: Date, settings: UserSettings): Record<string, string[]> {
	const out: Record<string, string[]> = {};
	for (const a of apps) {
		for (const id of flowPath(a, now, settings)) (out[id] ??= []).push(a.id);
	}
	return out;
}
