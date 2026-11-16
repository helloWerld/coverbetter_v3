export interface FlowLink {
	source: string;
	target: string;
	value: number;
}

/** A rate in whole percents, or an em dash when there is nothing to divide by. */
export function formatRate(rate: number, applied: number): string {
	return applied > 0 ? `${rate}%` : '—';
}

export function formatDays(days: number | null): string {
	if (days === null) return '—';
	return Number.isInteger(days) ? String(days) : days.toFixed(1);
}

/** Whole percent of `of`, or 0 when `of` is 0. */
export function percentOf(n: number, of: number): number {
	return of <= 0 ? 0 : Math.round((n / of) * 100);
}

export interface ChartSize {
	width: number;
	height: number;
	marginLeft: number;
	marginRight: number;
	marginTop: number;
	marginBottom: number;
	nodeWidth: number;
	nodePadding: number;
	short: boolean;
}

/** Layout sizes. The compact layout is taller and has narrower margins and shorter labels. */
export function chartSize(compact: boolean): ChartSize {
	return compact
		? {
				width: 560,
				height: 560,
				marginLeft: 8,
				marginRight: 96,
				marginTop: 12,
				marginBottom: 12,
				nodeWidth: 8,
				nodePadding: 18,
				short: true,
			}
		: {
				width: 960,
				height: 480,
				marginLeft: 12,
				marginRight: 150,
				marginTop: 14,
				marginBottom: 14,
				nodeWidth: 10,
				nodePadding: 20,
				short: false,
			};
}

const SHORT_LABELS: Record<string, string> = {
	'Final interview': 'Final',
	'Not applied yet': 'Not applied',
	'No response': 'No reply',
	'In progress': 'Active',
};

export function nodeLabel(label: string, short: boolean): string {
	return short ? (SHORT_LABELS[label] ?? label) : label;
}

/**
 * The node ids and link indexes on every path through `nodeId`:
 * all links upstream of the node and all links downstream of it.
 */
export function highlightPath(
	nodeId: string,
	links: readonly FlowLink[],
): { nodes: Set<string>; links: Set<number> } {
	const nodes = new Set<string>([nodeId]);
	const linkIdx = new Set<number>();

	const walk = (dir: 'up' | 'down') => {
		const seen = new Set<string>([nodeId]);
		const queue = [nodeId];
		while (queue.length > 0) {
			const cur = queue.shift()!;
			links.forEach((l, i) => {
				const from = dir === 'down' ? l.source : l.target;
				const to = dir === 'down' ? l.target : l.source;
				if (from !== cur) return;
				linkIdx.add(i);
				nodes.add(to);
				if (!seen.has(to)) {
					seen.add(to);
					queue.push(to);
				}
			});
		}
	};
	walk('up');
	walk('down');
	return { nodes, links: linkIdx };
}

/** "Applied → Interview: 9 (28%)". The percent is of the source node total. */
export function linkText(from: string, to: string, value: number, sourceTotal: number): string {
	return `${from} → ${to}: ${value} (${percentOf(value, sourceTotal)}%)`;
}

const monthDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

/** "Nov 10" for an ISO day such as "2026-11-10". */
export function weekLabel(isoDay: string): string {
	return monthDay.format(new Date(`${isoDay}T00:00:00Z`));
}

export function pluralize(n: number, one: string, many: string): string {
	return n === 1 ? one : many;
}

/** Text summary of the flow for the chart's aria-label. */
export function flowSummary(
	nodes: readonly { id: string; label: string; value: number }[],
	total: number,
): string {
	const get = (id: string) => nodes.find((n) => n.id === id)?.value ?? 0;
	const parts = [`${total} ${pluralize(total, 'application', 'applications')}`];
	for (const [id, label] of [
		['applied', 'applied'],
		['interview', 'reached an interview'],
		['offer', 'got an offer'],
	] as const) {
		parts.push(`${get(id)} ${label}`);
	}
	return `Flow chart of your applications. ${parts.join(', ')}. A table with all the data follows the chart.`;
}

const STAGE_NAME: Record<string, string> = {
	applied: 'Applied',
	interview: 'Interview',
	final: 'Final interview',
};

/** Full node name for tooltips and the table. "rejected@interview" becomes "Rejected after Interview". */
export function fullName(id: string, label: string): string {
	const at = id.indexOf('@');
	if (at < 0) return label;
	const stage = id.slice(at + 1);
	const prefix = label === 'In progress' ? 'In progress at' : `${label} after`;
	return `${prefix} ${STAGE_NAME[stage] ?? stage}`;
}

export const FIT_BAND_LABEL = {
	strong: '80 to 100 (strong)',
	good: '60 to 79 (good)',
	partial: '40 to 59 (partial)',
	low: '0 to 39 (low)',
	none: 'No score',
} as const;
