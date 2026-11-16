'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import FitScoreCard from '@/components/Fit/FitScoreCard';
import type { FitResult } from '@/lib/fit';
import { defaultSelection, selectionToDoc } from '@/lib/profile/render';
import type { Profile, TailoredSelection } from '@/lib/profile/types';
import {
	saveTailoredAction,
	tailorWithAiAction,
} from '@/app/dashboard/applications/[id]/resume/actions';
import { downloadResumeDocx, downloadResumePdf } from './download';
import { pageHint, pruneRewrites } from './helpers';
import { fieldClass, focusRing } from './parts';
import ResumePreview from './ResumePreview';
import { ExperienceGroup, ListGroups, ProjectsGroup, SkillsGroup, SummaryGroup } from './Sections';

type Props = Readonly<{
	applicationId: string;
	jobTitle: string;
	company: string;
	jobDescription: string;
	profile: Profile;
	paid: boolean;
	initialResumeId: string | null;
	initialTitle: string | null;
	initialSelection: TailoredSelection | null;
	defaultTemplate: TailoredSelection['template'];
}>;

const TEMPLATES: { id: TailoredSelection['template']; label: string }[] = [
	{ id: 'classic', label: 'Classic' },
	{ id: 'modern', label: 'Modern' },
	{ id: 'minimal', label: 'Minimal' },
];

const btn = `btn min-h-11 ${focusRing}`;

export default function ResumeBuilder(props: Props) {
	const { applicationId, jobTitle, company, jobDescription, profile, paid } = props;
	const defaultTitle = `Resume for ${[jobTitle, company].filter(Boolean).join(' at ') || 'this job'}`;

	const [sel, setSel] = useState<TailoredSelection>(
		() => props.initialSelection ?? { ...defaultSelection(profile), template: props.defaultTemplate },
	);
	const [title, setTitle] = useState(props.initialTitle ?? defaultTitle);
	const [resumeId, setResumeId] = useState<string | null>(props.initialResumeId);
	const snapshot = (s: TailoredSelection, t: string) => JSON.stringify([t, pruneRewrites(s)]);
	// A new resume starts "unsaved", so leaving the page asks first once the user changes something.
	const [saved, setSaved] = useState(() => (props.initialSelection ? snapshot(props.initialSelection, props.initialTitle ?? defaultTitle) : ''));
	const [hasEdited, setHasEdited] = useState(false);
	const [status, setStatus] = useState('');
	const [statusError, setStatusError] = useState(false);
	const [aiError, setAiError] = useState<{ error: string; code: string } | null>(null);
	const [aiResult, setAiResult] = useState<{ fit: FitResult | null; letterId: string | null } | null>(null);
	const [saving, startSave] = useTransition();
	const [tailoring, startTailor] = useTransition();
	const [exporting, setExporting] = useState(false);
	const [showJob, setShowJob] = useState(true);
	const [leftOpen, setLeftOpen] = useState(true);
	const lastSaved = useRef(saved);
	lastSaved.current = saved;

	const clean = useMemo(() => pruneRewrites(sel), [sel]);
	const doc = useMemo(() => selectionToDoc(profile, clean), [profile, clean]);
	const hint = useMemo(() => pageHint(doc), [doc]);
	const dirty = hasEdited && snapshot(sel, title) !== saved;

	const update = useCallback((fn: (s: TailoredSelection) => TailoredSelection) => {
		setHasEdited(true);
		setSel(fn);
	}, []);

	useEffect(() => {
		if (!dirty) return;
		const h = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			e.returnValue = '';
		};
		window.addEventListener('beforeunload', h);
		return () => window.removeEventListener('beforeunload', h);
	}, [dirty]);

	function save() {
		setStatus('');
		startSave(async () => {
			const out = await saveTailoredAction(applicationId, resumeId, title, JSON.stringify(clean));
			if (!out.ok) {
				setStatusError(true);
				setStatus(out.error);
				return;
			}
			setStatusError(false);
			setResumeId(out.resumeId);
			setSaved(snapshot(sel, title));
			setStatus('Resume saved.');
		});
	}

	function tailor() {
		if ((dirty || resumeId) && !window.confirm('The AI will replace your current selection with a new one. Continue?')) return;
		setAiError(null);
		setStatus('');
		startTailor(async () => {
			const out = await tailorWithAiAction(applicationId);
			if (!out.ok) {
				setAiError({ error: out.error, code: out.code });
				return;
			}
			setSel(out.selection);
			setResumeId(out.resumeId);
			setSaved(snapshot(out.selection, title));
			setHasEdited(false);
			setAiResult({ fit: out.fit, letterId: out.letterId });
			setStatusError(false);
			setStatus('The AI built your resume and saved it. You can edit it now.');
		});
	}

	async function exportAs(kind: 'pdf' | 'docx') {
		setExporting(true);
		setStatus('');
		try {
			if (kind === 'pdf') await downloadResumePdf(doc, clean.template, company);
			else await downloadResumeDocx(doc, clean.template, company);
		} catch {
			setStatusError(true);
			setStatus('We could not make the file. Try again.');
		} finally {
			setExporting(false);
		}
	}

	const billing = aiError && ['no_credits', 'pro_cap', 'premium'].includes(aiError.code);

	const jobPane = (
		<div className="whitespace-pre-wrap break-words text-base-100/80">{jobDescription || 'No job post saved for this application.'}</div>
	);

	return (
		<div className="flex flex-col gap-6">
			{/* Job post on small screens */}
			<section className="rounded-box border border-base-100/10 bg-base-300 lg:hidden">
				<h2>
					<button
						type="button"
						className={`flex min-h-11 w-full items-center justify-between px-4 py-3 text-left text-lg text-base-100 ${focusRing}`}
						aria-expanded={showJob}
						aria-controls="rb-job-mobile"
						onClick={() => setShowJob((v) => !v)}
					>
						Job post
						<span className="text-sm text-base-100/60">{showJob ? 'Hide' : 'Show'}</span>
					</button>
				</h2>
				{showJob && (
					<div id="rb-job-mobile" className="max-h-72 overflow-y-auto px-4 pb-4">
						{jobPane}
					</div>
				)}
			</section>

			<div className={`grid gap-6 ${leftOpen ? 'lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]' : 'lg:grid-cols-[auto_minmax(0,1fr)]'}`}>
				{/* Job post on desktop */}
				<aside className="hidden lg:block">
					<div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-box border border-base-100/10 bg-base-300 p-4">
						<div className="flex items-center justify-between gap-3">
							{leftOpen && <h2 className="text-xl text-base-100">Job post</h2>}
							<button
								type="button"
								className={`${btn} btn-sm btn-outline border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100`}
								aria-expanded={leftOpen}
								aria-controls="rb-job-desktop"
								onClick={() => setLeftOpen((v) => !v)}
							>
								{leftOpen ? 'Hide' : 'Show job post'}
							</button>
						</div>
						{leftOpen && (
							<div id="rb-job-desktop" className="mt-3">
								{jobPane}
							</div>
						)}
					</div>
				</aside>

				<div className="flex min-w-0 flex-col gap-6">
					<section className="rounded-box border border-base-100/10 bg-base-300 p-4 sm:p-5">
						<div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
							<div>
								<label htmlFor="rb-title" className="mb-1 block text-sm font-medium text-base-100">
									Title
								</label>
								<input
									id="rb-title"
									className={fieldClass}
									maxLength={120}
									value={title}
									onChange={(e) => {
										setHasEdited(true);
										setTitle(e.target.value);
									}}
								/>
							</div>
							<div>
								<label htmlFor="rb-template" className="mb-1 block text-sm font-medium text-base-100">
									Template
								</label>
								<select
									id="rb-template"
									className={`${fieldClass} sm:w-44`}
									value={sel.template}
									onChange={(e) => update((s) => ({ ...s, template: e.target.value as TailoredSelection['template'] }))}
								>
									{TEMPLATES.map((t) => (
										<option key={t.id} value={t.id}>
											{t.label}
										</option>
									))}
								</select>
							</div>
						</div>
					</section>

					<section className="rounded-box border border-base-100/10 bg-base-300 p-4 sm:p-5">
						<h2 className="text-xl text-base-100">Tailor with AI</h2>
						{paid ? (
							<>
								<p className="mt-1 text-base-100/70">
									The AI picks and orders your bullets for this job, writes a cover letter, and checks your fit. Uses 1
									credit. It never adds facts.
								</p>
								<button type="button" className={`${btn} btn-secondary mt-3`} onClick={tailor} disabled={tailoring}>
									{tailoring ? 'Working...' : 'Tailor with AI (1 credit)'}
								</button>
							</>
						) : (
							<p className="mt-1 text-sm text-base-100/70">With credits or Pro, the AI can match your resume to the job post.</p>
						)}
						<div aria-live="polite">
							{tailoring && <p className="mt-3 text-base-100/70">The AI is building your resume. This takes up to a minute.</p>}
							{aiError && (
								<p className="mt-3 text-error" role="alert">
									{aiError.error}{' '}
									{billing && (
										<Link href="/dashboard/billing" className="link">
											Go to Billing
										</Link>
									)}
								</p>
							)}
						</div>
					</section>

					{aiResult && (
						<>
							{aiResult.fit && <FitScoreCard fit={aiResult.fit} />}
							{aiResult.letterId && (
								<p className="text-base-100/80">
									Your cover letter is ready.{' '}
									<Link href={`/dashboard/letters/${aiResult.letterId}`} className="text-neutral underline underline-offset-2 hover:text-base-100">
										Open the cover letter
									</Link>
								</p>
							)}
						</>
					)}

					<SummaryGroup profile={profile} sel={sel} update={update} />
					<ExperienceGroup profile={profile} sel={sel} update={update} />
					<ProjectsGroup profile={profile} sel={sel} update={update} />
					<ListGroups profile={profile} sel={sel} update={update} />
					<SkillsGroup profile={profile} sel={sel} update={update} />

					<section aria-labelledby="rb-preview" className="flex flex-col gap-3">
						<h2 id="rb-preview" className="text-xl text-base-100">
							Preview
						</h2>
						<p className={hint.warn ? 'text-accent' : 'text-base-100/70'}>{hint.text}</p>
						<ResumePreview doc={doc} template={sel.template} />
					</section>

					<div className="sticky bottom-0 -mx-1 flex flex-col gap-2 border-t border-base-100/10 bg-primary px-1 py-3">
						<div className="flex flex-wrap gap-2">
							<button type="button" className={`${btn} btn-secondary`} onClick={save} disabled={saving}>
								{saving ? 'Saving...' : 'Save resume'}
							</button>
							<button type="button" className={`${btn} btn-outline border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100`} onClick={() => exportAs('pdf')} disabled={exporting}>
								Download PDF
							</button>
							<button type="button" className={`${btn} btn-outline border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100`} onClick={() => exportAs('docx')} disabled={exporting}>
								Download DOCX
							</button>
						</div>
						<p aria-live="polite" role="status" className={statusError ? 'text-error' : 'text-base-100/80'}>
							{status || (dirty ? 'You have unsaved changes.' : '')}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

