'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { fitCheckRoleAction } from './actions';

/** The hourly limit for AI actions is 10, so one batch checks 10 roles at most. */
export const MAX_BATCH = 10;

export type BatchRole = { id: string; label: string; fitScore: number | null; hasPost: boolean };
type RowState = { state: 'waiting' | 'checking' | 'done' | 'error'; score?: number; error?: string };

const field =
	'w-full rounded-box border border-base-100/10 bg-base-300 px-4 py-3 text-base text-base-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100 disabled:opacity-60';
const smallBtn =
	'min-h-11 rounded-lg px-3 text-sm text-neutral underline underline-offset-2 hover:text-base-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral disabled:no-underline disabled:opacity-50';
const STOP_CODES = new Set(['premium', 'no_credits', 'pro_cap', 'rate_limit']);

export default function BatchFitForm({
	roles,
	resumes,
}: Readonly<{ roles: BatchRole[]; resumes: { id: string; title: string }[] }>) {
	const id = useId();
	const router = useRouter();
	const [resumeId, setResumeId] = useState(resumes[0]?.id ?? '');
	const [picked, setPicked] = useState<Set<string>>(new Set());
	const [rows, setRows] = useState<Record<string, RowState>>({});
	const [running, setRunning] = useState(false);
	const [stop, setStop] = useState<{ error: string; buy: boolean } | null>(null);

	const ready = roles.filter((r) => r.hasPost);
	const n = picked.size;
	const full = n >= MAX_BATCH;
	const done = Object.values(rows).filter((r) => r.state === 'done' || r.state === 'error').length;
	const queued = Object.keys(rows).length;

	function toggle(roleId: string) {
		setPicked((prev) => {
			const next = new Set(prev);
			if (next.has(roleId)) next.delete(roleId);
			else if (next.size < MAX_BATCH) next.add(roleId);
			return next;
		});
	}

	async function run() {
		const ids = roles.filter((r) => picked.has(r.id)).map((r) => r.id);
		if (ids.length === 0 || !resumeId) return;
		setRunning(true);
		setStop(null);
		setRows(Object.fromEntries(ids.map((i) => [i, { state: 'waiting' } as RowState])));
		// One role at a time: each check is charged on its own, and a stop (no credits) ends the batch.
		for (const roleId of ids) {
			setRows((r) => ({ ...r, [roleId]: { state: 'checking' } }));
			let out;
			try {
				out = await fitCheckRoleAction(roleId, resumeId);
			} catch {
				out = { ok: false as const, error: 'The check did not work. You were not charged.' };
			}
			if (out.ok) {
				setRows((r) => ({ ...r, [roleId]: { state: 'done', score: out.fit.score } }));
				continue;
			}
			setRows((r) => ({ ...r, [roleId]: { state: 'error', error: out.error } }));
			if (out.code && STOP_CODES.has(out.code)) {
				setStop({ error: out.error, buy: out.code !== 'rate_limit' });
				setRows((r) => Object.fromEntries(Object.entries(r).filter(([, v]) => v.state !== 'waiting')));
				break;
			}
		}
		setRunning(false);
		setPicked(new Set());
		router.refresh();
	}

	const ranked = roles
		.filter((r) => rows[r.id]?.state === 'done')
		.map((r) => ({ ...r, score: rows[r.id].score ?? 0 }))
		.sort((a, b) => b.score - a.score);

	return (
		<section
			id="saved-roles"
			aria-labelledby={`${id}-h`}
			className="flex scroll-mt-24 flex-col gap-5 rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-5 sm:p-6"
		>
			<div>
				<h2 id={`${id}-h`} className="text-xl text-base-100">
					Check your saved roles
				</h2>
				<p className="mt-1 text-base-100/75">
					Check several saved roles against one resume. Then pick the best roles for a tailored resume and a cover letter.
				</p>
			</div>

			{roles.length === 0 ? (
				<p className="text-base-100/75">
					You have no saved roles.{' '}
					<Link href="/dashboard/applications/new" className="text-neutral underline underline-offset-2">
						Add an application
					</Link>{' '}
					with the job post first.
				</p>
			) : (
				<>
					<div>
						<label htmlFor={`${id}-resume`} className="mb-2 block text-sm font-medium text-base-100">
							Resume
						</label>
						<select
							id={`${id}-resume`}
							value={resumeId}
							onChange={(e) => setResumeId(e.target.value)}
							disabled={running}
							className={`${field} min-h-11`}
						>
							{resumes.map((r) => (
								<option key={r.id} value={r.id}>
									{r.title}
								</option>
							))}
						</select>
					</div>

					<fieldset disabled={running} className="min-w-0">
						<legend className="mb-2 text-sm font-medium text-base-100">Saved roles</legend>
						<div className="mb-2 flex flex-wrap gap-1">
							<button type="button" className={smallBtn} onClick={() => setPicked(new Set(ready.slice(0, MAX_BATCH).map((r) => r.id)))}>
								Select {ready.length > MAX_BATCH ? `the first ${MAX_BATCH}` : 'all'}
							</button>
							<button type="button" className={smallBtn} onClick={() => setPicked(new Set())} disabled={n === 0}>
								Clear
							</button>
						</div>
						<ul className="flex flex-col divide-y divide-base-100/10 rounded-lg border border-base-100/10">
							{roles.map((r) => {
								const row = rows[r.id];
								const off = !r.hasPost || (full && !picked.has(r.id));
								return (
									<li key={r.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2">
										<label className={`flex min-h-11 min-w-0 flex-1 items-center gap-3 ${off ? 'text-base-100/50' : 'cursor-pointer text-base-100'}`}>
											<input
												type="checkbox"
												checked={picked.has(r.id)}
												onChange={() => toggle(r.id)}
												disabled={off}
												className="checkbox checkbox-secondary shrink-0 border-base-100/40 disabled:!opacity-40"
											/>
											<span className="min-w-0 break-words">{r.label}</span>
										</label>
										<span className="text-sm tabular-nums">
											{row?.state === 'checking' ? (
												<span className="text-accent">Checking…</span>
											) : row?.state === 'waiting' ? (
												<span className="text-base-100/60">Waiting</span>
											) : row?.state === 'done' ? (
												<span className="text-neutral">Fit {row.score}/100</span>
											) : row?.state === 'error' ? (
												<span className="text-error">{row.error}</span>
											) : !r.hasPost ? (
												<Link href={`/dashboard/applications/${r.id}`} className="text-neutral underline underline-offset-2">
													Add the job post
												</Link>
											) : r.fitScore !== null ? (
												<span className="text-base-100/60">Last fit {r.fitScore}/100</span>
											) : null}
										</span>
									</li>
								);
							})}
						</ul>
					</fieldset>

					{stop && (
						<p role="alert" className="text-error">
							{stop.error}{' '}
							{stop.buy && (
								<Link href="/dashboard/billing" className="underline underline-offset-2">
									Go to Billing
								</Link>
							)}
						</p>
					)}

					<div className="flex flex-wrap items-center gap-3">
						<button type="button" onClick={run} disabled={running || n === 0 || !resumeId} className="btn btn-secondary min-h-11">
							{running
								? `Checking ${Math.min(done + 1, queued)} of ${queued}…`
								: n === 0
									? 'Pick roles to check'
									: `Check ${n} ${n === 1 ? 'role' : 'roles'} · ${n} ${n === 1 ? 'credit' : 'credits'}`}
						</button>
						<p className="text-sm text-base-100/70">
							Each role uses 1 credit. You pay only for the checks that work. You can check {MAX_BATCH} roles each hour.
						</p>
					</div>
					<p aria-live="polite" className="sr-only">
						{running ? `Checked ${done} of ${queued} roles.` : queued > 0 ? `Done. Checked ${done} of ${queued} roles.` : ''}
					</p>

					{!running && ranked.length > 0 && (
						<div className="border-t border-base-100/10 pt-4">
							<h3 className="text-lg text-base-100">Best fit first</h3>
							<ol className="mt-2 flex flex-col gap-2">
								{ranked.map((r) => (
									<li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-base-300 px-3 py-2">
										<span className="min-w-0 break-words text-base-100">
											<span className="tabular-nums text-neutral">{r.score}/100</span> · {r.label}
										</span>
										<span className="flex flex-wrap gap-x-4">
											<Link href={`/dashboard/applications/${r.id}/resume`} className="inline-flex min-h-11 items-center text-neutral underline underline-offset-2">
												Build a resume
											</Link>
											<Link href={`/dashboard?applicationId=${r.id}`} className="inline-flex min-h-11 items-center text-neutral underline underline-offset-2">
												Write a letter
											</Link>
										</span>
									</li>
								))}
							</ol>
						</div>
					)}
				</>
			)}
		</section>
	);
}
