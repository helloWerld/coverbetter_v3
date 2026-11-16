'use client';

import { useId, useMemo, useState } from 'react';
import { roleLabel, searchRoles, type RoleOption } from '@/lib/applications/search';
import { STATUS_LABEL } from '@/lib/applications/types';

export type { RoleOption };

const field =
	'w-full rounded-box border border-base-100/10 bg-base-300 px-4 py-3 text-base text-base-100 placeholder:text-base-100/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100';

/** A search box and a list of matching roles. Select a role to pick it. */
export default function RolePicker({
	roles,
	selectedId,
	onSelect,
	label = 'Find a role',
	placeholder = 'Search by job title or company',
	limit = 8,
}: Readonly<{
	roles: RoleOption[];
	selectedId: string | null;
	onSelect: (id: string | null) => void;
	label?: string;
	placeholder?: string;
	limit?: number;
}>) {
	const id = useId();
	const [query, setQuery] = useState('');
	const selected = roles.find((r) => r.id === selectedId) ?? null;
	const matches = useMemo(() => searchRoles(roles, query), [roles, query]);

	if (selected) {
		return (
			<div className="flex flex-wrap items-center justify-between gap-3 rounded-box border border-secondary/50 bg-secondary/10 px-4 py-3">
				<p className="min-w-0 break-words text-base-100">
					<span className="sr-only">Selected role: </span>
					{roleLabel(selected)} <span className="text-sm text-base-100/60">· {STATUS_LABEL[selected.status]}</span>
				</p>
				<button
					type="button"
					onClick={() => onSelect(null)}
					className="min-h-11 rounded-lg px-3 text-neutral underline underline-offset-2 hover:text-base-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral"
				>
					Pick another role
				</button>
			</div>
		);
	}

	return (
		<div>
			<label htmlFor={`${id}-q`} className="mb-2 block text-sm font-medium text-base-100">
				{label}
			</label>
			<input
				id={`${id}-q`}
				type="search"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder={placeholder}
				autoComplete="off"
				aria-describedby={`${id}-n`}
				className={`${field} min-h-11`}
			/>
			<p id={`${id}-n`} aria-live="polite" className="mt-2 text-sm text-base-100/60">
				{roles.length === 0
					? 'You have no roles yet.'
					: matches.length === 0
						? 'No role matches your search.'
						: `${matches.length} ${matches.length === 1 ? 'role' : 'roles'}${matches.length > limit ? `. The first ${limit} show.` : '.'}`}
			</p>
			{matches.length > 0 && (
				<ul className="mt-2 flex flex-col divide-y divide-base-100/10 rounded-lg border border-base-100/10">
					{matches.slice(0, limit).map((r) => (
						<li key={r.id}>
							<button
								type="button"
								onClick={() => onSelect(r.id)}
								className="flex min-h-11 w-full flex-wrap items-center justify-between gap-2 px-3 py-2 text-left text-base-100 hover:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-neutral"
							>
								<span className="min-w-0 break-words">{roleLabel(r)}</span>
								<span className="text-sm text-base-100/60">{STATUS_LABEL[r.status]}</span>
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
