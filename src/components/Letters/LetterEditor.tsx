'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { FaCheck, FaLock, FaRegCopy } from 'react-icons/fa6';
import {
	saveLetter,
	setLetterTemplate,
} from '@/app/dashboard/letters/actions';
import type { LanguageCode } from '@/lib/languages';
import { toLetterDoc, type TemplateId } from '@/lib/templates';
import DownloadButtons from './DownloadButtons';
import LetterPreview from './LetterPreview';
import TemplateSwitcher from './TemplateSwitcher';

type Status = 'idle' | 'saving' | 'saved' | 'error';

const field =
	'input input-bordered min-h-11 w-full border-base-100/20 bg-base-300 text-base-100 focus:border-neutral';

export default function LetterEditor({
	id,
	initialBody,
	initialTemplate,
	initialJobTitle,
	initialCompany,
	language = 'en',
	paid = false,
}: Readonly<{
	id: string;
	initialBody: string;
	initialTemplate: TemplateId;
	initialJobTitle: string;
	initialCompany: string;
	language?: LanguageCode;
	/** Editing, templates, and export are paid features. Free users read and copy. */
	paid?: boolean;
}>) {
	const [body, setBody] = useState(initialBody);
	const [jobTitle, setJobTitle] = useState(initialJobTitle);
	const [company, setCompany] = useState(initialCompany);
	const [template, setTemplate] = useState(initialTemplate);
	const [status, setStatus] = useState<Status>('idle');
	const [error, setError] = useState('');
	const [copied, setCopied] = useState(false);
	const [view, setView] = useState<'edit' | 'preview'>('edit');
	const [today] = useState(() => new Date());

	const saved = useRef({ body: initialBody, jobTitle: initialJobTitle, company: initialCompany });
	const area = useRef<HTMLTextAreaElement>(null);
	const doc = useMemo(() => toLetterDoc(body, today, language), [body, today, language]);

	const save = useCallback(async () => {
		setStatus('saving');
		setError('');
		const res = await saveLetter({ id, body, jobTitle, company });
		if (res.ok) {
			saved.current = { body, jobTitle, company };
			setStatus('saved');
		} else {
			setStatus('error');
			setError(res.error);
		}
	}, [id, body, jobTitle, company]);

	// Autosave 1.5 s after the last change.
	useEffect(() => {
		const s = saved.current;
		if (s.body === body && s.jobTitle === jobTitle && s.company === company) return;
		setStatus('idle');
		const timer = setTimeout(save, 1500);
		return () => clearTimeout(timer);
	}, [body, jobTitle, company, save]);

	// Grow the textarea with its text.
	useEffect(() => {
		const el = area.current;
		if (!el) return;
		el.style.height = 'auto';
		el.style.height = `${Math.max(el.scrollHeight, 320)}px`;
	}, [body, view]);

	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), 2000);
		return () => clearTimeout(timer);
	}, [copied]);

	async function changeTemplate(next: TemplateId) {
		const prev = template;
		setTemplate(next);
		const res = await setLetterTemplate({ id, template: next });
		if (!res.ok) {
			setTemplate(prev);
			setStatus('error');
			setError(res.error);
		}
	}

	async function copy() {
		try {
			await navigator.clipboard.writeText(body);
			setCopied(true);
		} catch {
			setError('Copy failed. Select the text and copy it by hand.');
		}
	}

	const statusText =
		status === 'saving'
			? 'Saving...'
			: status === 'saved'
				? 'Saved'
				: status === 'error'
					? error
					: '';

	return (
		<div className="flex flex-col gap-6">
			{!paid && (
				<p className="flex items-start gap-2 rounded-box border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-base-100">
					<FaLock aria-hidden className="mt-0.5 shrink-0 text-accent" />
					<span>
						You can read and copy this letter. Editing, templates, and PDF or DOCX
						downloads come with Pro or paid letters.{' '}
						<Link
							href="/dashboard/billing"
							className="underline underline-offset-2 hover:text-base-100"
						>
							Go to Billing
						</Link>
					</span>
				</p>
			)}
			<div className="flex flex-col gap-4 rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-4 md:p-6">
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label htmlFor="job-title" className="mb-1 block text-sm text-base-100/70">
							Job title
						</label>
						<input
							id="job-title"
							className={field}
							value={jobTitle}
							maxLength={200}
							readOnly={!paid}
							onChange={(e) => setJobTitle(e.target.value)}
						/>
					</div>
					<div>
						<label htmlFor="company" className="mb-1 block text-sm text-base-100/70">
							Company
						</label>
						<input
							id="company"
							className={field}
							value={company}
							maxLength={200}
							readOnly={!paid}
							onChange={(e) => setCompany(e.target.value)}
						/>
					</div>
				</div>
				<TemplateSwitcher value={template} onChange={changeTemplate} disabled={!paid} />
				<div className="flex flex-wrap items-center gap-2">
					{paid && (
						<button
							type="button"
							className="btn btn-secondary min-h-11"
							onClick={save}
							disabled={status === 'saving'}
						>
							Save
						</button>
					)}
					<button
						type="button"
						className="btn btn-outline min-h-11 border-base-100/30 text-base-100 hover:border-base-100 hover:bg-base-100/10"
						onClick={copy}
					>
						{copied ? <FaCheck aria-hidden /> : <FaRegCopy aria-hidden />}
						{copied ? 'Copied' : 'Copy'}
					</button>
					<DownloadButtons
						getDoc={() => doc}
						template={template}
						company={company}
						locked={!paid}
					/>
					<p
						role="status"
						aria-live="polite"
						className={`text-sm ${status === 'error' ? 'text-red-300' : 'text-base-100/60'}`}
					>
						{statusText}
					</p>
					<p role="status" aria-live="polite" className="sr-only">
						{copied ? 'Copied to clipboard' : ''}
					</p>
				</div>
			</div>

			<div
				role="group"
				aria-label="Show"
				className="grid grid-cols-2 gap-2 lg:hidden"
			>
				{(['edit', 'preview'] as const).map((v) => (
					<button
						key={v}
						type="button"
						aria-pressed={view === v}
						onClick={() => setView(v)}
						className={`btn min-h-11 ${view === v ? 'btn-secondary' : 'btn-outline border-base-100/30 text-base-100'}`}
					>
						{v === 'edit' ? 'Edit' : 'Preview'}
					</button>
				))}
			</div>

			<div className="grid items-start gap-6 lg:grid-cols-2">
				<div className={view === 'edit' ? 'block' : 'hidden lg:block'}>
					<label htmlFor="letter-body" className="mb-1 block text-sm text-base-100/70">
						Letter text
					</label>
					<textarea
						id="letter-body"
						ref={area}
						value={body}
						readOnly={!paid}
						onChange={(e) => setBody(e.target.value)}
						className="textarea textarea-bordered w-full resize-none border-base-100/20 bg-base-300 text-base leading-relaxed text-base-100 focus:border-neutral"
						style={{ minHeight: 320 }}
					/>
				</div>
				<div className={view === 'preview' ? 'block' : 'hidden lg:block'}>
					<p className="mb-1 text-sm text-base-100/70">Preview</p>
					<LetterPreview doc={doc} template={template} />
				</div>
			</div>
		</div>
	);
}
