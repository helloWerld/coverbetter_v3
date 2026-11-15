import Link from 'next/link';
import PageShell, { Card } from '@/components/Dashboard/PageShell';
import FitScoreCard from '@/components/Fit/FitScoreCard';
import { hasPaidFeatures } from '@/lib/access';
import { deserializeFit } from '@/lib/fit';
import { listFitChecks } from '@/lib/fit-check';
import { listResumes } from '@/lib/resumes';
import { requireUser } from '@/lib/user';
import FitCheckForm from './FitCheckForm';

export const metadata = { title: 'Job Fit Score | CoverBetter' };

const dateFmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export default async function FitScorePage() {
	const user = await requireUser();
	const paid = hasPaidFeatures(user, new Date());
	const [resumes, checks] = await Promise.all([listResumes(user.id), listFitChecks(user.id)]);

	return (
		<PageShell
			title="Job Fit Score"
			intro="See how well one of your resumes fits a job post, before you write a letter."
		>
			<Card title="How credits work">
				<p>
					A check on this page uses 1 credit. When you write a cover letter with credits or Pro, the letter comes
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
			) : resumes.length === 0 ? (
				<Card title="Add a resume first">
					<p>The check compares a saved resume with the job post.</p>
					<Link href="/dashboard/resumes" className="btn btn-secondary mt-4 min-h-11">
						Add a resume
					</Link>
				</Card>
			) : (
				<FitCheckForm resumes={resumes.map((r) => ({ id: r.id, title: r.title }))} />
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
