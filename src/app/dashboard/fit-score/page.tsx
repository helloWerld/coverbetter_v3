import Link from 'next/link';
import PageShell, { Card } from '@/components/Dashboard/PageShell';
import FitScoreCard from '@/components/Fit/FitScoreCard';
import { hasPaidFeatures } from '@/lib/access';
import { deserializeFit } from '@/lib/fit';
import { listApplications } from '@/lib/applications/db';
import { listFitChecks, PROFILE_RESUME_ID } from '@/lib/fit-check';
import { hasProfile } from '@/lib/profile/db';
import { listResumes } from '@/lib/resumes';
import { requireUser } from '@/lib/user';
import BatchFitForm from './BatchFitForm';
import FitCheckForm from './FitCheckForm';

export const metadata = { title: 'Job Fit Score | CoverBetter' };

const dateFmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export default async function FitScorePage() {
	const user = await requireUser();
	const paid = hasPaidFeatures(user, new Date());
	const [resumes, checks, apps, profile] = await Promise.all([
		listResumes(user.id),
		listFitChecks(user.id),
		listApplications(user.id),
		hasProfile(user.id),
	]);
	// Base resumes only. A tailored resume belongs to one job.
	const baseResumes = resumes.filter((r) => r.kind !== 'tailored').map((r) => ({ id: r.id, title: r.title }));
	const batchResumes = profile ? [{ id: PROFILE_RESUME_ID, title: 'My career profile' }, ...baseResumes] : baseResumes;
	const savedRoles = apps
		.filter((a) => a.status === 'saved')
		.map((a) => ({
			id: a.id,
			label: [a.jobTitle || 'Untitled job', a.company].filter(Boolean).join(' at '),
			fitScore: a.fitScore,
			hasPost: a.jobDescription.trim().length >= 50,
		}));

	return (
		<PageShell
			title="Job Fit Score"
			intro="See how well your resume fits a job, before you build a tailored resume or write a letter."
		>
			<Card title="How credits work">
				<p>
					Each check uses 1 credit. When you write a cover letter with credits or Pro, the letter comes
					with a Job Fit Score at no extra cost. That is 1 credit in total for the letter and the score.
				</p>
			</Card>

			{!paid ? (
				<Card title="A paid feature">
					<p>The Job Fit Score is for accounts with credits or Pro. Free letters do not include it.</p>
					<Link href="/dashboard/billing" className="btn btn-secondary mt-4 min-h-11">
						See plans
					</Link>
				</Card>
			) : batchResumes.length === 0 ? (
				<Card title="Add a resume first">
					<p>The check compares your resume or your career profile with the job post.</p>
					<Link href="/dashboard/resumes" className="btn btn-secondary mt-4 min-h-11">
						Add a resume
					</Link>
				</Card>
			) : (
				<>
					<BatchFitForm roles={savedRoles} resumes={batchResumes} />
					{baseResumes.length > 0 && (
						<section aria-labelledby="one-post" className="flex flex-col gap-3">
							<h2 id="one-post" className="text-2xl font-extralight text-base-100">
								Check one job post
							</h2>
							<p className="text-base-100/75">Paste a job post that you did not save as an application.</p>
							<FitCheckForm resumes={baseResumes} />
						</section>
					)}
				</>
			)}

			{checks.length > 0 && (
				<section aria-labelledby="past-checks">
					<h2 id="past-checks" className="text-2xl font-extralight text-base-100">
						Past checks
					</h2>
					<ul className="mt-4 flex flex-col gap-3">
						{checks.map((c) => {
							const fit = deserializeFit(c.fitScore, c.fitJson);
							const label = [c.jobTitle || 'Untitled job', c.company].filter(Boolean).join(' at ');
							return (
								<li key={c.id}>
									<details className="group rounded-box border border-base-100/10 bg-base-300">
										<summary className="flex min-h-11 cursor-pointer flex-wrap items-center justify-between gap-2 px-5 py-3 text-base-100">
											<span className="min-w-0 break-words">{label}</span>
											<span className="text-sm text-base-100/60 tabular-nums">
												<span className="text-neutral">{c.fitScore}/100</span>
												<span aria-hidden> · </span>
												<time dateTime={c.createdAt.toISOString()}>{dateFmt.format(c.createdAt)}</time>
											</span>
										</summary>
										{fit && (
											<div className="px-2 pb-2">
												<FitScoreCard fit={fit} heading={label} headingLevel={3} />
											</div>
										)}
									</details>
								</li>
							);
						})}
					</ul>
				</section>
			)}
		</PageShell>
	);
}
