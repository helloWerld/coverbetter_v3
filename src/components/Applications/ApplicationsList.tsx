'use client';

import Link from 'next/link';
import { useId, useMemo, useState } from 'react';
import { FaEnvelopeOpenText, FaFileLines } from 'react-icons/fa6';
import { CLOSED_STATUSES, type Status } from '@/lib/applications/types';
import StatusSelect from './StatusSelect';

export type AppRow = {
	id: string;
	company: string;
	jobTitle: string;
	status: Status;
	appliedAt: string | null;
	updatedAt: string;
	fitScore: number | null;
	hasResume: boolean;
	hasLetter: boolean;
	noResponse: boolean;
};

const FILTERS = [
	{ id: 'active', label: 'Active' },
	{ id: 'saved', label: 'Saved' },
	{ id: 'applied', label: 'Applied' },
	{ id: 'interview', label: 'Interview' },
	{ id: 'offer', label: 'Offer' },
	{ id: 'closed', label: 'Closed' },
	{ id: 'all', label: 'All' },
] as const;
type Filter = (typeof FILTERS)[number]['id'];

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function matchesFilter(r: Pick<AppRow, 'status'>, f: Filter): boolean {
	if (f === 'all') return true;
	if (f === 'active') return !CLOSED_STATUSES.includes(r.status);
	if (f === 'closed') return CLOSED_STATUSES.includes(r.status);
	if (f === 'offer') return r.status === 'offer' || r.status === 'accepted' || r.status === 'declined';
	return r.status === f;
}

export default function ApplicationsList({ rows }: Readonly<{ rows: AppRow[] }>) {
	const id = useId();
	const [filter, setFilter] = useState<Filter>('active');
	const [query, setQuery] = useState('');

	const counts = useMemo(() => Object.fromEntries(FILTERS.map((f) => [f.id, rows.filter((r) => matchesFilter(r, f.id)).length])), [rows]);
	const shown = useMemo(() => {
		const q = query.trim().toLowerCase();
		return rows.filter((r) => matchesFilter(r, filter) && (!q || `${r.company} ${r.jobTitle}`.toLowerCase().includes(q)));
	}, [rows, filter, query]);

	return (
		<section aria-labelledby={`${id}-h`} className="flex flex-col gap-4">
			<h2 id={`${id}-h`} className="sr-only">
				Your applications
			</h2>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
					{FILTERS.map((f) => (
						<button
							key={f.id}
							type="button"
							aria-pressed={filter === f.id}
							onClick={() => setFilter(f.id)}
							className={`min-h-11 rounded-lg px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral ${
								filter === f.id ? 'bg-secondary text-base-100' : 'bg-base-300 text-base-100/70 hover:bg-base-200 hover:text-base-100'
							}`}
						>
							{f.label} <span className="tabular-nums opacity-70">{counts[f.id]}</span>
						</button>
					))}
				</div>
				<div className="sm:w-64">
					<label htmlFor={`${id}-q`} className="sr-only">
						Search by company or job title
					</label>
					<input
						id={`${id}-q`}
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search company or job"
						className="min-h-11 w-full rounded-lg border border-base-100/10 bg-base-300 px-3 text-base text-base-100 placeholder:text-base-100/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-base-100"
					/>
				</div>
			</div>

			{shown.length === 0 ? (
				<p className="text-base-100/70">No applications match this filter.</p>
			) : (
				<ul className="flex flex-col gap-3">
					{shown.map((r) => {
						const title = r.jobTitle || 'Untitled job';
						return (
							<li key={r.id} className="flex flex-col gap-3 rounded-box border border-base-100/10 bg-base-300 p-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="min-w-0">
									<Link
										href={`/dashboard/applications/${r.id}`}
										className="break-words text-lg text-base-100 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral"
									>
										{title}
									</Link>
									<p className="break-words text-base-100/70">{r.company || 'No company'}</p>
									<p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-100/60">
										<span>{r.appliedAt ? `Applied ${dateFmt.format(new Date(r.appliedAt))}` : 'Not applied yet'}</span>
										{r.fitScore !== null && <span className="tabular-nums text-neutral">Fit {r.fitScore}/100</span>}
										{r.hasResume && (
											<span className="inline-flex items-center gap-1">
												<FaFileLines aria-hidden="true" /> Resume
											</span>
										)}
										{r.hasLetter && (
											<span className="inline-flex items-center gap-1">
												<FaEnvelopeOpenText aria-hidden="true" /> Letter
											</span>
										)}
										{r.noResponse && <span className="badge badge-outline border-base-100/30 text-base-100/70">No response</span>}
									</p>
								</div>
								<StatusSelect applicationId={r.id} status={r.status} label={`Status of ${title}${r.company ? ` at ${r.company}` : ''}`} />
							</li>
						);
					})}
				</ul>
			)}
			<p className="sr-only" aria-live="polite">
				{shown.length} applications shown. Filter: {FILTERS.find((f) => f.id === filter)?.label}.
			</p>
		</section>
	);
}
