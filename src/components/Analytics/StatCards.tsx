import type { SummaryStats } from '@/lib/applications/analytics';
import { formatDays, formatRate } from './helpers';

const card =
	'rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300';

function Hero({
	label,
	value,
	note,
	tone = 'purple',
}: Readonly<{ label: string; value: string; note: string; tone?: 'purple' | 'yellow' }>) {
	return (
		<div className={`${card} relative overflow-hidden p-5`}>
			<span
				aria-hidden
				className={`absolute inset-x-0 top-0 h-0.5 ${tone === 'yellow' ? 'bg-accent' : 'bg-secondary'}`}
			/>
			<dt className="text-sm text-base-100/70">{label}</dt>
			<dd className="mt-2">
				<span
					className={`block text-4xl font-extralight tabular-nums md:text-5xl ${
						tone === 'yellow' ? 'text-accent' : 'text-base-100'
					}`}
				>
					{value}
				</span>
				<span className="mt-1 block text-sm text-base-100/70">{note}</span>
			</dd>
		</div>
	);
}

function Small({ label, value, unit }: Readonly<{ label: string; value: string; unit?: string }>) {
	return (
		<div className={`${card} p-4`}>
			<dt className="text-sm text-base-100/70">{label}</dt>
			<dd className="mt-1 text-2xl font-light tabular-nums text-base-100">
				{value}
				{unit && <span className="ml-1 text-sm font-extralight text-base-100/70">{unit}</span>}
			</dd>
		</div>
	);
}

export default function StatCards({ stats }: Readonly<{ stats: SummaryStats }>) {
	const { applied } = stats;
	const median = stats.medianDaysToResponse;
	return (
		<div className="flex flex-col gap-4">
			<dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
				<Hero label="Applied" value={String(applied)} note={`of ${stats.total} in your list`} />
				<Hero
					label="Response rate"
					value={formatRate(stats.responseRate, applied)}
					note={applied > 0 ? `${stats.responses} of ${applied} got an answer` : 'Apply to a job to see this'}
				/>
				<Hero
					label="Interview rate"
					value={formatRate(stats.interviewRate, applied)}
					note={applied > 0 ? `${stats.interviews} of ${applied} had an interview` : 'Apply to a job to see this'}
				/>
				<Hero
					label="Offers"
					value={String(stats.offers)}
					note={applied > 0 ? `${formatRate(stats.offerRate, applied)} of applied` : 'Apply to a job to see this'}
					tone="yellow"
				/>
			</dl>
			<dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<Small label="Saved" value={String(stats.saved)} />
				<Small label="No response" value={String(stats.noResponse)} />
				<Small label="Rejected" value={String(stats.rejected)} />
				<Small
					label="Median days to an answer"
					value={formatDays(median)}
					unit={median === null ? undefined : median === 1 ? 'day' : 'days'}
				/>
			</dl>
		</div>
	);
}
