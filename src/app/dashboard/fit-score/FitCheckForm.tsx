'use client';

import { useId, useState, useTransition } from 'react';
import Link from 'next/link';
import FitScoreCard from '@/components/Fit/FitScoreCard';
import type { FitResult } from '@/lib/fit';
import { fitCheckAction } from './actions';

const field =
	'w-full rounded-box border border-base-100/10 bg-base-300 px-4 py-3 text-base text-base-100 placeholder:text-base-100/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100 disabled:opacity-60';
const labelClass = 'mb-2 block text-sm font-medium text-base-100';

type Result = { jobTitle: string; company: string; fit: FitResult };

export default function FitCheckForm({ resumes }: Readonly<{ resumes: { id: string; title: string }[] }>) {
	const id = useId();
	const [resumeId, setResumeId] = useState(resumes[0]?.id ?? '');
	const [job, setJob] = useState('');
	const [error, setError] = useState('');
	const [showBuy, setShowBuy] = useState(false);
	const [result, setResult] = useState<Result | null>(null);
	const [pending, startTransition] = useTransition();

	function submit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError('');
		setShowBuy(false);
		const data = new FormData(e.currentTarget);
		startTransition(async () => {
			const out = await fitCheckAction(data);
			if (!out.ok) {
				setError(out.error);
				setShowBuy(out.code === 'no_credits' || out.code === 'pro_cap' || out.code === 'premium');
				return;
			}
			setResult({ jobTitle: out.jobTitle, company: out.company, fit: out.fit });
		});
	}

	const label = result ? [result.jobTitle, result.company].filter(Boolean).join(' at ') : '';

	return (
		<div className="flex flex-col gap-6">
			<form onSubmit={submit} className="flex flex-col gap-5 rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-5 sm:p-6">
				<div>
					<label htmlFor={`${id}-resume`} className={labelClass}>
						Resume
					</label>
					<select
						id={`${id}-resume`}
						name="resumeId"
						value={resumeId}
						onChange={(e) => setResumeId(e.target.value)}
						className={`${field} min-h-11`}
					>
						{resumes.map((r) => (
							<option key={r.id} value={r.id}>
								{r.title}
							</option>
						))}
					</select>
				</div>
				<div>
					<label htmlFor={`${id}-job`} className={labelClass}>
						Job post
					</label>
					<textarea
						id={`${id}-job`}
						name="jobDescription"
						value={job}
						onChange={(e) => setJob(e.target.value)}
						rows={8}
						required
						minLength={50}
						maxLength={20000}
						placeholder="Paste the full job post here."
						className={field}
					/>
				</div>
				{error && (
					<p role="alert" className="text-error">
						{error}{' '}
						{showBuy && (
							<Link href="/dashboard/billing" className="underline underline-offset-2">
								Go to Billing
							</Link>
						)}
					</p>
				)}
				<div className="flex flex-wrap items-center gap-3">
					<button type="submit" disabled={pending} className="btn btn-secondary min-h-11">
						{pending ? 'Checking the fit…' : 'Check my fit'}
					</button>
					<p className="text-sm text-base-100/70">Uses 1 credit. You pay only when the check works.</p>
				</div>
			</form>
			<div aria-live="polite">
				{result && <FitScoreCard fit={result.fit} heading={label ? `Job Fit Score: ${label}` : 'Job Fit Score'} />}
			</div>
		</div>
	);
}
