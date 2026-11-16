'use client';

import { useId, useMemo, useState } from 'react';
import { roleLabel, searchRoles, type RoleOption } from '@/lib/applications/search';
import { STATUS_LABEL } from '@/lib/applications/types';
import AppDrawer from './AppDrawer';

export type SearchRow = RoleOption & { appliedAt: string | null; fitScore: number | null };

const PAGE = 10;
const day = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

/** All roles, with a search by job title, company, or keywords. Select a role to open its sidebar. */
export default function RoleSearch({ rows }: Readonly<{ rows: SearchRow[] }>) {
	const id = useId();
	const [query, setQuery] = useState('');
	const [shown, setShown] = useState(PAGE);
	const [open, setOpen] = useState<string | null>(null);
	const matches = useMemo(() => searchRoles(rows, query), [rows, query]);

	return (
		<div className="flex flex-col gap-3">
			<div>
				<label htmlFor={`${id}-q`} className="mb-2 block text-sm font-medium text-base-100">
					Search your roles
				</label>
				<input
					id={`${id}-q`}
					type="search"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setShown(PAGE);
					}}
					placeholder="Job title, company, or keywords from the job post"
					autoComplete="off"
					aria-describedby={`${id}-n`}
					className="min-h-11 w-full rounded-box border border-base-100/10 bg-base-300 px-4 py-3 text-base text-base-100 placeholder:text-base-100/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100"
				/>
				<p id={`${id}-n`} aria-live="polite" className="mt-2 text-sm text-base-100/60">
					{matches.length === 0 ? 'No role matches your search.' : `${matches.length} ${matches.length === 1 ? 'role' : 'roles'}.`}
				</p>
			</div>
			{matches.length > 0 && (
				<ul className="flex flex-col divide-y divide-base-100/10 rounded-lg border border-base-100/10">
					{matches.slice(0, shown).map((r) => (
						<li key={r.id}>
							<button
								type="button"
								onClick={() => setOpen(r.id)}
								className="flex min-h-11 w-full flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2 text-left hover:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-neutral"
							>
								<span className="min-w-0 break-words text-base-100">{roleLabel(r)}</span>
								<span className="flex flex-wrap gap-x-3 text-sm tabular-nums text-base-100/60">
									<span className="text-neutral">{STATUS_LABEL[r.status]}</span>
									{r.fitScore !== null && <span>Fit {r.fitScore}/100</span>}
									<span>{r.appliedAt ? `Applied ${day.format(new Date(r.appliedAt))}` : 'Not applied'}</span>
								</span>
							</button>
						</li>
					))}
				</ul>
			)}
			{matches.length > shown && (
				<button
					type="button"
					onClick={() => setShown((n) => n + PAGE)}
					className="btn btn-outline min-h-11 w-fit border-base-100/30 text-base-100 hover:bg-base-200"
				>
					Show {Math.min(PAGE, matches.length - shown)} more
				</button>
			)}
			<AppDrawer appId={open} onClose={() => setOpen(null)} />
		</div>
	);
}
