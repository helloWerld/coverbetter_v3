'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { generateLetterAction } from '@/app/dashboard/actions';
import type { Length, Tone } from '@/lib/prompt';
import GenerateProgress from './GenerateProgress';
import SegmentedControl from './SegmentedControl';

export type SavedResume = { id: string; title: string; text: string };

const PASTE = '';

const TONE_OPTIONS = [
	{ value: 'professional', label: 'Professional' },
	{ value: 'friendly', label: 'Friendly' },
	{ value: 'confident', label: 'Confident' },
	{ value: 'enthusiastic', label: 'Enthusiastic' },
] as const;

const LENGTH_OPTIONS = [
	{ value: 'short', label: 'Short', hint: '~200 words' },
	{ value: 'standard', label: 'Standard', hint: '~300 words' },
	{ value: 'detailed', label: 'Detailed', hint: '~400 words' },
] as const;

const field =
	'w-full rounded-box border border-base-100/10 bg-base-300 px-4 py-3 text-base text-base-100 placeholder:text-base-100/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100 disabled:opacity-60';
const link =
	'underline underline-offset-2 hover:text-base-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-100';

export default function GenerateForm({
	resumes,
	status,
	empty,
}: Readonly<{ resumes: SavedResume[]; status: string; empty: boolean }>) {
	const router = useRouter();
	const id = useId();
	const [resumeId, setResumeId] = useState(resumes[0]?.id ?? PASTE);
	const [pasted, setPasted] = useState('');
	const [job, setJob] = useState('');
	const [tone, setTone] = useState<Tone>('professional');
	const [length, setLength] = useState<Length>('standard');
	const [running, setRunning] = useState(false);
	const [done, setDone] = useState(false);
	const [error, setError] = useState<{ message: string; billing: boolean } | null>(
		null,
	);

	const saved = resumes.find((r) => r.id === resumeId);
	const usePaste = !saved;

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (running) return;
		setError(null);
		setDone(false);
		setRunning(true);

		const fd = new FormData();
		fd.set('resumeId', saved ? saved.id : '');
		fd.set('resumeText', usePaste ? pasted : '');
		fd.set('jobDescription', job);
		fd.set('tone', tone);
		fd.set('length', length);

		try {
			const res = await generateLetterAction(fd);
			if (res.ok) {
				setDone(true);
				router.push('/dashboard/letters/' + res.letterId);
				return;
			}
			setError({
				message: res.error,
				billing: res.code === 'no_credits' || res.code === 'pro_cap',
			});
		} catch {
			setError({
				message: 'Something went wrong. You were not charged. Try again.',
				billing: false,
			});
		}
		setRunning(false);
	}

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
			<fieldset disabled={running} className="flex min-w-0 flex-col gap-6">
				<div className="flex flex-wrap items-center justify-between gap-2 rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 px-4 py-3 text-sm">
					<p className="text-base-100">{status}</p>
					{empty && (
						<Link href="/dashboard/billing" className={`${link} text-base-100/80`}>
							Go to Billing
						</Link>
					)}
				</div>

				<section className="rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-4 sm:p-6">
					<div className="flex flex-col gap-4">
						{resumes.length > 0 && (
							<div>
								<label htmlFor={`${id}-resume`} className="mb-2 block text-sm font-medium text-base-100">
									Resume
								</label>
								<select
									id={`${id}-resume`}
									value={resumeId}
									onChange={(e) => setResumeId(e.target.value)}
									className={`${field} min-h-11`}
								>
									{resumes.map((r) => (
										<option key={r.id} value={r.id}>
											{r.title}
										</option>
									))}
									<option value={PASTE}>Paste a resume</option>
								</select>
							</div>
						)}

						{saved ? (
							<div>
								<label htmlFor={`${id}-saved`} className="mb-2 block text-sm font-medium text-base-100">
									Resume text
								</label>
								<textarea
									id={`${id}-saved`}
									readOnly
									value={saved.text}
									rows={8}
									className={`${field} resize-y text-base-100/70`}
								/>
								<p className="mt-2 text-sm text-base-100/70">
									<Link href="/dashboard/resumes" className={link}>
										Edit on Resumes page
									</Link>
								</p>
							</div>
						) : (
							<div>
								<label htmlFor={`${id}-paste`} className="mb-2 block text-sm font-medium text-base-100">
									{resumes.length > 0 ? 'Paste your resume' : 'Your resume'}
								</label>
								<textarea
									id={`${id}-paste`}
									value={pasted}
									onChange={(e) => setPasted(e.target.value)}
									rows={8}
									maxLength={30000}
									placeholder="Paste the text of your resume here."
									className={`${field} resize-y`}
								/>
								{resumes.length === 0 && (
									<p className="mt-2 text-sm text-base-100/70">
										<Link href="/dashboard/resumes" className={link}>
											Upload a PDF or DOCX on the Resumes page
										</Link>
									</p>
								)}
							</div>
						)}

						<div>
							<label htmlFor={`${id}-job`} className="mb-2 block text-sm font-medium text-base-100">
								Job description
							</label>
							<textarea
								id={`${id}-job`}
								value={job}
								onChange={(e) => setJob(e.target.value)}
								rows={8}
								maxLength={20000}
								placeholder="Paste the full job post here."
								className={`${field} resize-y`}
							/>
						</div>
					</div>
				</section>

				<section className="grid gap-6 rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-4 sm:p-6 md:grid-cols-2">
					<SegmentedControl
						legend="Tone"
						name="tone"
						options={TONE_OPTIONS}
						value={tone}
						onChange={setTone}
					/>
					<SegmentedControl
						legend="Length"
						name="length"
						options={LENGTH_OPTIONS}
						value={length}
						onChange={setLength}
					/>
				</section>
			</fieldset>

			{error && (
				<div
					role="alert"
					className="rounded-box border border-error/40 bg-error/10 px-4 py-3 text-sm text-base-100"
				>
					<p>{error.message}</p>
					{error.billing && (
						<p className="mt-1">
							<Link href="/dashboard/billing" className={link}>
								Go to Billing
							</Link>
						</p>
					)}
				</div>
			)}

			{running ? (
				<GenerateProgress done={done} />
			) : (
				<button
					type="submit"
					className="btn btn-secondary min-h-11 w-full sm:w-auto sm:self-start sm:px-10"
				>
					Generate cover letter
				</button>
			)}
		</form>
	);
}
