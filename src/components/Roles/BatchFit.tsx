'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState, useTransition } from 'react';
import { batchFitAction } from '@/app/dashboard/applications/actions';
import type { BatchFitRow } from '@/lib/fit-batch';
import { MAX_BATCH_ROLES } from '@/lib/fit-batch-prompt';

export type BatchRole = { id: string; label: string; fitScore: number | null; hasPost: boolean };

const field =
	'w-full rounded-box border border-base-100/10 bg-base-300 px-4 py-3 text-base text-base-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100 disabled:opacity-60';
const smallBtn =
	'min-h-11 rounded-lg px-3 text-sm text-neutral underline underline-offset-2 hover:text-base-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral disabled:no-underline disabled:opacity-50';
const linkClass = 'inline-flex min-h-11 items-center text-neutral underline underline-offset-2 hover:text-base-100';

/** Job Fit Score for up to 20 saved roles in one AI call, 1 credit in total. */
export default function BatchFit({
	roles,
	resumes,
	paid,
}: Readonly<{ roles: BatchRole[]; resumes: { id: string; title: string }[]; paid: boolean }>) {
	const id = useId();
	const router = useRouter();
	const [resumeId, setResumeId] = useState(resumes[0]?.id ?? '');
	const [picked, setPicked] = useState<Set<string>>(new Set());
	const [results, setResults] = useState<BatchFitRow[] | null>(null);
	const [error, setError] = useState<{ text: string; buy: boolean } | null>(null);
	const [pending, startTransition] = useTransition();

	const ready = roles.filter((r) => r.hasPost);
	const n = picked.size;
	const full = n >= MAX_BATCH_ROLES;
	const byId = new Map(roles.map((r) => [r.id, r]));

	function toggle(roleId: string) {
		setPicked((prev) => {
			const next = new Set(prev);
			if (next.has(roleId)) next.delete(roleId);
			else if (next.size < MAX_BATCH_ROLES) next.add(roleId);
			return next;
		});
	}

	function run() {
		setError(null);
		setResults(null);
		const ids = roles.filter((r) => picked.has(r.id)).map((r) => r.id);
		startTransition(async () => {
			const out = await batchFitAction(ids, resumeId);
			if (!out.ok) {
				setError({ text: out.error, buy: out.code === 'no_credits' || out.code === 'pro_cap' || out.code === 'premium' });
				return;
			}
			setResults([...out.rows].sort((a, b) => (b.score ?? -1) - (a.score ?? -1)));
			setPicked(new Set());
			router.refresh();
		});
	}

	return (
		<section
			id="fit"
			aria-labelledby={`${id}-h`}
			className="flex scroll-mt-24 flex-col gap-5 rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-5 sm:p-6"
		>
			<div className="flex flex-col gap-2">
				<h2 id={`${id}-h`} className="text-xl text-base-100">
					Job Fit Score for your saved roles
				</h2>
				<p className="text-base-100/75">
					Check up to {MAX_BATCH_ROLES} saved roles against one resume for 1 credit in total. Then customize the roles with the
					best fit.
				</p>
				<p className="text-sm text-base-100/60">
					A full Job Fit Score is also included when you customize an application. It is part of the same 1 credit as the
					resume and the cover letter.
				</p>
			</div>

			{!paid ? (
				<p className="text-base-100/75">
					The Job Fit Score uses credits.{' '}
					<Link href="/dashboard/billing" className="text-neutral underline underline-offset-2">
						See plans
					</Link>
				</p>
			) : roles.length === 0 ? (
				<p className="text-base-100/75">Save a role with its job post first. Then you can check its fit here.</p>
			) : resumes.length === 0 ? (
				<p className="text-base-100/75">
					<Link href="/dashboard/profile" className="text-neutral underline underline-offset-2">
						Build your profile
					</Link>{' '}
					or{' '}
					<Link href="/dashboard/resumes" className="text-neutral underline underline-offset-2">
						upload a resume
					</Link>{' '}
					first. The check compares it with each job post.
				</p>
			) : (
				<>
					<div>
						<label htmlFor={`${id}-resume`} className="mb-2 block text-sm font-medium text-base-100">
							Resume to check
						</label>
						<select id={`${id}-resume`} value={resumeId} onChange={(e) => setResumeId(e.target.value)} disabled={pending} className={`${field} min-h-11`}>
							{resumes.map((r) => (
								<option key={r.id} value={r.id}>
									{r.title}
								</option>
							))}
						</select>
					</div>

					<fieldset disabled={pending} className="min-w-0">
						<legend className="mb-2 text-sm font-medium text-base-100">
							Saved roles ({n} of {MAX_BATCH_ROLES} picked)
						</legend>
						<div className="mb-2 flex flex-wrap gap-1">
							<button type="button" className={smallBtn} onClick={() => setPicked(new Set(ready.slice(0, MAX_BATCH_ROLES).map((r) => r.id)))}>
								{ready.length > MAX_BATCH_ROLES ? `Select the first ${MAX_BATCH_ROLES}` : 'Select all'}
							</button>
							<button type="button" className={smallBtn} onClick={() => setPicked(new Set())} disabled={n === 0}>
								Clear
							</button>
						</div>
						<ul className="flex max-h-96 flex-col divide-y divide-base-100/10 overflow-y-auto rounded-lg border border-base-100/10">
							{roles.map((r) => {
								const off = !r.hasPost || (full && !picked.has(r.id));
								return (
									<li key={r.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-1">
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
											{!r.hasPost ? (
												<Link href={`/dashboard/applications/${r.id}`} className="text-neutral underline underline-offset-2">
													Add the job post
												</Link>
											) : r.fitScore !== null ? (
												<span className="text-base-100/60">Fit {r.fitScore}/100</span>
											) : null}
										</span>
									</li>
								);
							})}
						</ul>
					</fieldset>

					{error && (
						<p role="alert" className="text-error">
							{error.text}{' '}
							{error.buy && (
								<Link href="/dashboard/billing" className="underline underline-offset-2">
									Go to Billing
								</Link>
							)}
						</p>
					)}

					<div className="flex flex-wrap items-center gap-3">
						<button type="button" onClick={run} disabled={pending || n === 0 || !resumeId} className="btn btn-secondary min-h-11">
							{pending ? `Checking ${n} ${n === 1 ? 'role' : 'roles'}…` : n === 0 ? 'Pick roles to check' : `Check ${n} ${n === 1 ? 'role' : 'roles'} · 1 credit`}
						</button>
						<p className="text-sm text-base-100/70">{pending ? 'This can take up to a minute.' : 'You pay only when the check works.'}</p>
					</div>

					<div aria-live="polite">
						{results && (
							<div className="border-t border-base-100/10 pt-4">
								<h3 className="text-lg text-base-100">Best fit first</h3>
								<ol className="mt-2 flex flex-col gap-2">
									{results.map((r) => (
										<li key={r.id} className="flex flex-col gap-1 rounded-lg bg-base-300 px-3 py-2">
											<p className="break-words text-base-100">
												<span className="tabular-nums text-neutral">{r.score === null ? 'No score' : `${r.score}/100`}</span> ·{' '}
												{byId.get(r.id)?.label ?? 'Role'}
											</p>
											{r.summary && <p className="text-sm text-base-100/70">{r.summary}</p>}
											<p className="flex flex-wrap gap-x-4">
												<Link href={`/dashboard?applicationId=${r.id}`} className={linkClass}>
													Customize the application
												</Link>
												<Link href={`/dashboard/applications/${r.id}`} className={linkClass}>
													Open the role
												</Link>
											</p>
										</li>
									))}
								</ol>
							</div>
						)}
					</div>
				</>
			)}
		</section>
	);
}
