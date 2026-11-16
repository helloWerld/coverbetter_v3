'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { tailorWithAiAction } from '@/app/dashboard/applications/[id]/resume/actions';
import FitScoreCard from '@/components/Fit/FitScoreCard';
import type { FitResult } from '@/lib/fit';
import RolePicker, { type RoleOption } from './RolePicker';

export type CustomizeRole = RoleOption & {
	hasPost: boolean;
	resumeTitle: string | null;
	hasTailoredResume: boolean;
	letterId: string | null;
	fitScore: number | null;
};

const panel = 'flex flex-col gap-3 rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-5';
const linkClass = 'inline-flex min-h-11 items-center text-neutral underline underline-offset-2 hover:text-base-100';
const outlineBtn = 'btn btn-outline min-h-11 w-fit border-base-100/30 text-base-100 hover:bg-base-200';

type Done = { resumeId: string; letterId: string | null; fit: FitResult | null };

/** Pick a role, then build the tailored resume, the cover letter, and the Job Fit Score in one AI step. */
export default function CustomizeApplication({
	roles,
	selectedId,
	paid,
	hasProfile,
}: Readonly<{ roles: CustomizeRole[]; selectedId: string | null; paid: boolean; hasProfile: boolean }>) {
	const router = useRouter();
	const [error, setError] = useState<{ text: string; buy: boolean } | null>(null);
	const [done, setDone] = useState<Done | null>(null);
	const [pending, startTransition] = useTransition();
	const role = roles.find((r) => r.id === selectedId) ?? null;

	function select(id: string | null) {
		setError(null);
		setDone(null);
		router.replace(id ? `/dashboard?applicationId=${encodeURIComponent(id)}` : '/dashboard', { scroll: false });
	}

	function customize() {
		if (!role) return;
		setError(null);
		setDone(null);
		startTransition(async () => {
			const out = await tailorWithAiAction(role.id);
			if (!out.ok) {
				setError({ text: out.error, buy: out.code === 'no_credits' || out.code === 'pro_cap' || out.code === 'premium' });
				return;
			}
			setDone({ resumeId: out.resumeId, letterId: out.letterId, fit: out.fit });
			router.refresh();
		});
	}

	return (
		<div className="flex flex-col gap-6">
			<RolePicker roles={roles} selectedId={selectedId} onSelect={select} label="Pick the role to customize" />
			{roles.length === 0 && (
				<Link href="/dashboard/applications/new" className="btn btn-secondary min-h-11 w-fit">
					Add a role
				</Link>
			)}

			{role && (
				<>
					<dl className="grid gap-x-6 gap-y-2 rounded-box border border-base-100/10 bg-base-300 p-4 text-sm sm:grid-cols-4">
						<div>
							<dt className="text-base-100/60">Job post</dt>
							<dd className="text-base-100">{role.hasPost ? 'Added' : 'Missing'}</dd>
						</div>
						<div>
							<dt className="text-base-100/60">Resume</dt>
							<dd className="break-words text-base-100">{role.resumeTitle ?? 'None yet'}</dd>
						</div>
						<div>
							<dt className="text-base-100/60">Cover letter</dt>
							<dd className="text-base-100">{role.letterId ? 'Written' : 'None yet'}</dd>
						</div>
						<div>
							<dt className="text-base-100/60">Job Fit Score</dt>
							<dd className="tabular-nums text-base-100">{role.fitScore !== null ? `${role.fitScore}/100` : 'Not checked'}</dd>
						</div>
					</dl>

					{!role.hasPost ? (
						<p className="rounded-box border border-accent/40 bg-base-300 p-4 text-base-100">
							This role has no job post. The resume and the letter need it.{' '}
							<Link href={`/dashboard/applications/${role.id}`} className="text-neutral underline underline-offset-2">
								Add the job post
							</Link>
						</p>
					) : (
						<div className="grid gap-4 lg:grid-cols-2">
							<section aria-labelledby="ai-h" className={panel}>
								<h2 id="ai-h" className="text-lg text-base-100">
									Customize with AI · 1 credit
								</h2>
								<p className="text-base-100/75">
									One step writes a tailored resume from your profile and a cover letter for this job post. It also gives
									the full Job Fit Score{role.fitScore !== null ? ', which replaces the quick score' : ''}. You pay only when it works.
								</p>
								{!paid ? (
									<Link href="/dashboard/billing" className={outlineBtn}>
										See plans
									</Link>
								) : !hasProfile ? (
									<p className="text-base-100/75">
										The AI picks from your profile.{' '}
										<Link href="/dashboard/profile" className="text-neutral underline underline-offset-2">
											Build your profile
										</Link>{' '}
										first.
									</p>
								) : (
									<button type="button" onClick={customize} disabled={pending} className="btn btn-secondary min-h-11 w-fit">
										{pending ? 'Customizing… up to a minute' : role.hasTailoredResume || role.letterId ? 'Customize again · 1 credit' : 'Customize · 1 credit'}
									</button>
								)}
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
							</section>

							<section aria-labelledby="free-h" className={panel}>
								<h2 id="free-h" className="text-lg text-base-100">
									Do it yourself · free
								</h2>
								<p className="text-base-100/75">
									Pick the jobs and bullets for this role from your profile, and put them in order. Then write the cover
									letter below.
								</p>
								<Link href={hasProfile ? `/dashboard/applications/${role.id}/resume` : '/dashboard/profile'} className={outlineBtn}>
									{hasProfile ? (role.hasTailoredResume ? 'Edit the resume' : 'Build the resume') : 'Build your profile first'}
								</Link>
							</section>
						</div>
					)}

					<div aria-live="polite">
						{done && (
							<section aria-labelledby="done-h" className="flex flex-col gap-4 rounded-box border border-secondary/50 bg-base-300 p-5">
								<h2 id="done-h" className="text-lg text-base-100">
									Your application is ready
								</h2>
								<p className="text-base-100/75">
									{done.letterId ? 'The resume and the cover letter are saved on the role.' : 'The resume is saved on the role. The letter did not work, so write it below.'}
								</p>
								<p className="flex flex-wrap gap-x-5">
									<Link href={`/dashboard/applications/${role.id}`} className={linkClass}>
										Open the role profile
									</Link>
									<Link href={`/dashboard/applications/${role.id}/resume`} className={linkClass}>
										Edit and download the resume
									</Link>
									{done.letterId && (
										<Link href={`/dashboard/letters/${done.letterId}`} className={linkClass}>
											Edit and download the letter
										</Link>
									)}
								</p>
								{done.fit && <FitScoreCard fit={done.fit} heading="Job Fit Score" headingLevel={3} />}
							</section>
						)}
					</div>
				</>
			)}
		</div>
	);
}
