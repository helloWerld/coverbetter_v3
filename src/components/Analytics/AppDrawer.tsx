'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { FaArrowUpRightFromSquare, FaXmark } from 'react-icons/fa6';
import { getApplicationSummaryAction, type AppSummary } from '@/app/dashboard/analytics/actions';
import StatusSelect from '@/components/Applications/StatusSelect';

const day = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const KIND: Record<string, string> = { follow_up: 'Follow-up', follow_up_2: 'Second follow-up', thank_you: 'Thank-you letter' };

const linkBtn =
	'inline-flex min-h-11 items-center justify-center rounded-lg border border-secondary/40 bg-secondary/10 px-3 text-sm text-base-100 transition hover:border-secondary hover:bg-secondary/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral';

function Block({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
	return (
		<section className="border-t border-secondary/20 pt-4">
			<h3 className="mb-2 text-sm font-medium text-neutral">{title}</h3>
			<div className="text-sm text-base-100/80">{children}</div>
		</section>
	);
}

/** A sidebar with everything about one role. It loads the data when it opens. */
export default function AppDrawer({ appId, onClose }: Readonly<{ appId: string | null; onClose: () => void }>) {
	const id = useId();
	const router = useRouter();
	const [data, setData] = useState<AppSummary | null>(null);
	const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
	const [showPost, setShowPost] = useState(false);
	const closeRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const returnTo = useRef<HTMLElement | null>(null);
	const open = appId !== null;

	useEffect(() => {
		if (!appId) return;
		let live = true;
		setState('loading');
		setShowPost(false);
		getApplicationSummaryAction(appId)
			.then((s) => {
				if (!live) return;
				setData(s);
				setState(s ? 'idle' : 'error');
			})
			.catch(() => live && setState('error'));
		return () => {
			live = false;
		};
	}, [appId]);

	// Focus moves into the sidebar, and back to the clicked item when it closes.
	useEffect(() => {
		if (!open) return;
		returnTo.current = document.activeElement as HTMLElement | null;
		closeRef.current?.focus();
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
			if (e.key !== 'Tab' || !panelRef.current) return;
			const f = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), select, [tabindex="0"]');
			if (f.length === 0) return;
			const first = f[0];
			const last = f[f.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		};
		document.addEventListener('keydown', onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.removeEventListener('keydown', onKey);
			document.body.style.overflow = prev;
			returnTo.current?.focus?.();
		};
	}, [open, onClose]);

	if (!open) return null;
	const d = data && data.id === appId ? data : null;
	const title = d ? d.jobTitle || 'Untitled job' : 'Role';

	return (
		<div className="fixed inset-0 z-50">
			<button type="button" aria-label="Close the role details" tabIndex={-1} onClick={onClose} className="fb-backdrop absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px]" />
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={`${id}-t`}
				className="fb-drawer absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-secondary/40 bg-[#07050c] shadow-[0_0_60px_rgba(147,51,234,0.25)]"
			>
				<div className="flex items-start justify-between gap-3 border-b border-secondary/20 p-5">
					<div className="min-w-0">
						<p className="text-xs text-neutral">Role</p>
						<h2 id={`${id}-t`} className="break-words text-xl text-base-100">
							{title}
						</h2>
						{d?.company && <p className="break-words text-base-100/70">{d.company}</p>}
					</div>
					<button
						ref={closeRef}
						type="button"
						onClick={onClose}
						aria-label="Close"
						className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-base-100 hover:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral"
					>
						<FaXmark aria-hidden="true" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto p-5" aria-busy={state === 'loading'}>
					{state === 'loading' && !d && <p className="text-base-100/70">Loading the role…</p>}
					{state === 'error' && <p role="alert" className="text-error">We could not load this role. Close the panel and try again.</p>}
					{d && (
						<div className="flex flex-col gap-4">
							<div className="flex flex-wrap items-end gap-3">
								<StatusSelect key={d.id} applicationId={d.id} status={d.status} label={`Status of ${title}`} onChanged={() => router.refresh()} />
								<dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
									<div>
										<dt className="text-base-100/50">Applied</dt>
										<dd className="text-base-100">{d.appliedAt ? day.format(new Date(d.appliedAt)) : 'Not yet'}</dd>
									</div>
									<div>
										<dt className="text-base-100/50">Source</dt>
										<dd className="text-base-100">{d.source}</dd>
									</div>
								</dl>
							</div>

							<div className="grid grid-cols-2 gap-2">
								<Link href={`/dashboard/applications/${d.id}`} className={`${linkBtn} col-span-2`}>
									Open the role profile
								</Link>
								<Link href={d.letter ? `/dashboard/letters/${d.letter.id}` : `/dashboard?applicationId=${d.id}`} className={linkBtn}>
									{d.letter ? 'Edit the letter' : 'Customize'}
								</Link>
								<Link href={`/dashboard/applications/${d.id}/resume`} className={linkBtn}>
									{d.resume?.tailored ? 'Edit the resume' : 'Build a resume'}
								</Link>
								<Link href={`/dashboard/applications/${d.id}/prep`} className={linkBtn}>
									Interview prep
								</Link>
								{d.jobUrl ? (
									<a href={d.jobUrl} target="_blank" rel="noopener noreferrer" className={`${linkBtn} gap-1`}>
										Job post <FaArrowUpRightFromSquare aria-hidden="true" className="text-xs" />
										<span className="sr-only">(opens in a new tab)</span>
									</a>
								) : (
									<Link href={`/dashboard/follow-ups?role=${encodeURIComponent(d.id)}#write`} className={linkBtn}>
										Follow-ups
									</Link>
								)}
							</div>

							{d.fit && (
								<Block title="Job Fit Score">
									<p className="mb-2">
										<span className="text-2xl tabular-nums text-base-100">{d.fit.score}</span>
										<span className="text-base-100/50">/100</span> <span className="text-neutral">{d.fit.band}</span>
									</p>
									{d.fit.summary && <p className="mb-2">{d.fit.summary}</p>}
									{d.fit.met.length > 0 && <p>Met: {d.fit.met.join(', ')}</p>}
									{d.fit.missing.length > 0 && <p className="mt-1 text-base-100/60">Gaps: {d.fit.missing.join(', ')}</p>}
								</Block>
							)}

							<Block title="Resume used">
								{d.resume ? (
									<p>
										<Link href={d.resume.tailored ? `/dashboard/applications/${d.id}/resume` : '/dashboard/resumes'} className="text-neutral underline underline-offset-2">
											{d.resume.title}
										</Link>
										{!d.resume.tailored && <span className="text-base-100/60"> (uploaded)</span>}
									</p>
								) : (
									<p className="text-base-100/60">No resume yet.</p>
								)}
							</Block>

							<Block title="Cover letter">
								{d.letter ? (
									<>
										<p className="mb-2 text-base-100/60">Written {day.format(new Date(d.letter.createdAt))}</p>
										<div tabIndex={0} role="region" aria-label="Cover letter text" className="max-h-56 overflow-y-auto whitespace-pre-line break-words rounded-lg bg-primary p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral">
											{d.letter.body}
										</div>
									</>
								) : (
									<p className="text-base-100/60">No cover letter yet.</p>
								)}
							</Block>

							<Block title="Interviews">
								{d.interviews.length === 0 ? (
									<p className="text-base-100/60">No interviews yet.</p>
								) : (
									<ul className="flex flex-col gap-1">
										{d.interviews.map((i) => (
											<li key={i.id}>
												{i.round}, {day.format(new Date(i.at))}
												{i.interviewers && <span className="text-base-100/60"> · {i.interviewers}</span>}
												{i.rating > 0 && <span className="text-base-100/60"> · {i.rating} of 5</span>}
											</li>
										))}
									</ul>
								)}
							</Block>

							<Block title="Follow-ups">
								{d.messages.length === 0 ? (
									<p className="text-base-100/60">No follow-ups yet.</p>
								) : (
									<ul className="flex flex-col gap-2">
										{d.messages.map((m) => (
											<li key={m.id}>
												<details className="rounded-lg bg-primary px-3 py-1">
													<summary className="flex min-h-11 cursor-pointer flex-wrap items-center gap-x-2">
														<span className="text-base-100">{KIND[m.kind] ?? m.kind}</span>
														<span className="text-base-100/60">
															· {m.sent ? 'sent' : 'draft'}, {day.format(new Date(m.createdAt))}
														</span>
													</summary>
													{m.subject && <p className="font-medium text-base-100">{m.subject}</p>}
													<p className="whitespace-pre-line break-words pb-2">{m.body}</p>
												</details>
											</li>
										))}
									</ul>
								)}
								<Link href={`/dashboard/follow-ups?role=${encodeURIComponent(d.id)}#write`} className="mt-2 inline-flex min-h-11 items-center text-neutral underline underline-offset-2">
									Write a follow-up
								</Link>
							</Block>

							{(d.contactName || d.contactEmail) && (
								<Block title="Contact">
									<p>
										{d.contactName}
										{d.contactEmail && (
											<>
												{d.contactName ? ' · ' : ''}
												<a href={`mailto:${d.contactEmail}`} className="text-neutral underline underline-offset-2">
													{d.contactEmail}
												</a>
											</>
										)}
									</p>
								</Block>
							)}

							{d.notes && (
								<Block title="Notes">
									<p className="whitespace-pre-line break-words">{d.notes}</p>
								</Block>
							)}

							{d.jobPost && (
								<Block title="Job post">
									<p className={`whitespace-pre-line break-words ${showPost ? '' : 'line-clamp-6'}`}>{d.jobPost}</p>
									<button type="button" onClick={() => setShowPost((v) => !v)} aria-expanded={showPost} className="mt-1 min-h-11 text-neutral underline underline-offset-2">
										{showPost ? 'Show less' : 'Show the whole post'}
									</button>
								</Block>
							)}

							<Block title="Timeline">
								<ol className="flex flex-col gap-1 border-l border-secondary/30 pl-3">
									{d.timeline.map((t, i) => (
										<li key={i}>
											<span className="text-base-100/50">{day.format(new Date(t.at))}</span> · {t.text}
										</li>
									))}
								</ol>
							</Block>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
