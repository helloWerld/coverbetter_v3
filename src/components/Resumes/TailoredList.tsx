'use client';

import { useState } from 'react';
import Link from 'next/link';
import { downloadResumeDocx, downloadResumePdf } from '@/components/ResumeBuilder/download';
import type { ResumeDoc } from '@/lib/profile/render';
import { formatDate } from './types';

export type TailoredView = {
	id: string;
	title: string;
	applicationId: string | null;
	/** Name of the linked application, for the link text and the file name. */
	applicationLabel: string;
	company: string;
	updatedAt: string;
	template: string;
	doc: ResumeDoc;
};

const focus =
	'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100';

export default function TailoredList({ items }: Readonly<{ items: TailoredView[] }>) {
	const [busy, setBusy] = useState<string | null>(null);
	const [error, setError] = useState('');

	async function run(id: string, fn: () => Promise<void>) {
		setBusy(id);
		setError('');
		try {
			await fn();
		} catch {
			setError('We could not make the file. Try again.');
		} finally {
			setBusy(null);
		}
	}

	if (items.length === 0) {
		return (
			<p className="rounded-box border border-dashed border-base-100/20 p-6 text-base-100/70">
				No tailored resumes yet. Open a job application and choose a tailored resume to make one.
			</p>
		);
	}

	return (
		<>
			<ul className="flex flex-col gap-4">
				{items.map((r) => (
					<li key={r.id} className="rounded-box border border-base-100/10 bg-base-300 p-4 sm:p-5">
						<h3 className="break-words text-lg text-base-100">{r.title}</h3>
						<p className="mt-1 break-words text-sm text-base-100/60">
							{r.applicationId && (
								<>
									<Link href={`/dashboard/applications/${r.applicationId}`} className="text-neutral underline underline-offset-2 hover:text-base-100">
										{r.applicationLabel || 'Application'}
									</Link>
									<span aria-hidden> · </span>
								</>
							)}
							Updated <time dateTime={r.updatedAt}>{formatDate(r.updatedAt)}</time>
						</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{r.applicationId && (
								<Link href={`/dashboard/applications/${r.applicationId}/resume`} className={`btn btn-secondary min-h-11 ${focus}`}>
									Edit
									<span className="sr-only"> {r.title}</span>
								</Link>
							)}
							<button
								type="button"
								className={`btn btn-outline border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100 min-h-11 ${focus}`}
								disabled={busy === r.id}
								onClick={() => run(r.id, () => downloadResumePdf(r.doc, r.template, r.company))}
							>
								Download PDF<span className="sr-only"> for {r.title}</span>
							</button>
							<button
								type="button"
								className={`btn btn-outline border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100 min-h-11 ${focus}`}
								disabled={busy === r.id}
								onClick={() => run(r.id, () => downloadResumeDocx(r.doc, r.template, r.company))}
							>
								Download DOCX<span className="sr-only"> for {r.title}</span>
							</button>
						</div>
					</li>
				))}
			</ul>
			<p role="alert" className="text-error">
				{error}
			</p>
		</>
	);
}
