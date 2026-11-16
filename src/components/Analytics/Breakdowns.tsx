import type { FitBand, SummaryStats } from '@/lib/applications/analytics';
import { SOURCES, SOURCE_LABEL } from '@/lib/applications/types';
import { Card } from '@/components/Dashboard/PageShell';
import { FIT_BAND_LABEL, formatRate, percentOf } from './helpers';

const BANDS: readonly FitBand[] = ['strong', 'good', 'partial', 'low', 'none'];

function Meter({ value, max, color }: Readonly<{ value: number; max: number; color: string }>) {
	return (
		<div className="h-1.5 w-full rounded-full bg-base-100/10" aria-hidden>
			<div className={`h-full rounded-full ${color}`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
		</div>
	);
}

function Metric({
	label,
	value,
	max,
	color,
}: Readonly<{ label: string; value: number; max: number; color: string }>) {
	return (
		<div className="min-w-0">
			<div className="flex items-baseline justify-between gap-2 text-sm">
				<span className="text-base-100/70">{label}</span>
				<span className="tabular-nums text-base-100">{value}</span>
			</div>
			<div className="mt-1">
				<Meter value={value} max={max} color={color} />
			</div>
		</div>
	);
}

export function BySource({ stats }: Readonly<{ stats: SummaryStats }>) {
	const rows = SOURCES.filter((s) => stats.bySource[s].applied > 0);
	const max = Math.max(1, ...rows.map((s) => stats.bySource[s].applied));
	return (
		<Card title="By source">
			{rows.length === 0 ? (
				<p>No applied jobs yet.</p>
			) : (
				<ul className="flex flex-col gap-5">
					{rows.map((s) => {
						const r = stats.bySource[s];
						return (
							<li key={s}>
								<p className="text-base text-base-100">{SOURCE_LABEL[s]}</p>
								<div className="mt-2 grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
									<Metric label="Applied" value={r.applied} max={max} color="bg-secondary" />
									<Metric label="Answers" value={r.responses} max={max} color="bg-neutral" />
									<Metric label="Interviews" value={r.interviews} max={max} color="bg-accent" />
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</Card>
	);
}

export function ByFitBand({ stats }: Readonly<{ stats: SummaryStats }>) {
	const rows = BANDS.filter((b) => stats.byFitBand[b].applied > 0);
	const max = Math.max(1, ...rows.map((b) => stats.byFitBand[b].applied));
	return (
		<Card title="By Job Fit Score">
			{rows.length === 0 ? (
				<p>No applied jobs yet.</p>
			) : (
				<ul className="flex flex-col gap-5">
					{rows.map((b) => {
						const r = stats.byFitBand[b];
						return (
							<li key={b}>
								<div className="flex items-baseline justify-between gap-3">
									<p className="text-base text-base-100">{FIT_BAND_LABEL[b]}</p>
									<p className="text-sm tabular-nums text-base-100/70">
										Interview rate{' '}
										<span className="text-base-100">{formatRate(percentOf(r.interviews, r.applied), r.applied)}</span>
									</p>
								</div>
								<div className="mt-2 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
									<Metric label="Applied" value={r.applied} max={max} color="bg-secondary" />
									<Metric label="Interviews" value={r.interviews} max={max} color="bg-accent" />
								</div>
							</li>
						);
					})}
				</ul>
			)}
			<p className="mt-5 text-sm text-base-100/70">Bands come from the AI Job Fit Score.</p>
		</Card>
	);
}

export default function Breakdowns({ stats }: Readonly<{ stats: SummaryStats }>) {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<BySource stats={stats} />
			<ByFitBand stats={stats} />
		</div>
	);
}
