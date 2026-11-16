import Link from 'next/link';
import PageShell, { Card } from '@/components/Dashboard/PageShell';
import ApplicationsList, { type AppRow } from '@/components/Applications/ApplicationsList';
import { isNoResponse, reminders } from '@/lib/applications/analytics';
import { getSettings, listApplications, loadSnapshots } from '@/lib/applications/db';
import type { Status } from '@/lib/applications/types';
import { requireUser } from '@/lib/user';

export const metadata = { title: 'Applications | CoverBetter' };

const KIND_LABEL = {
	follow_up: 'Send a follow-up',
	follow_up_2: 'Send a second follow-up',
	thank_you: 'Send a thank-you letter',
} as const;

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

export default async function ApplicationsPage() {
	const user = await requireUser();
	const now = new Date();
	const [apps, snaps, settings] = await Promise.all([listApplications(user.id), loadSnapshots(user.id), getSettings(user.id)]);
	const snapById = new Map(snaps.map((s) => [s.id, s]));
	const due = reminders(snaps, now, settings);
	const byId = new Map(apps.map((a) => [a.id, a]));

	const rows: AppRow[] = apps.map((a) => {
		const snap = snapById.get(a.id);
		return {
			id: a.id,
			company: a.company,
			jobTitle: a.jobTitle,
			status: a.status as Status,
			appliedAt: a.appliedAt ? a.appliedAt.toISOString() : null,
			updatedAt: a.updatedAt.toISOString(),
			fitScore: a.fitScore,
			hasResume: Boolean(a.resumeId),
			hasLetter: Boolean(a.letterId),
			noResponse: snap ? isNoResponse(snap, now, settings.noResponseDays) : false,
		};
	});

	return (
		<PageShell title="Applications" intro="Track every job from saved to offer. Tracking is free.">
			<div className="flex flex-wrap gap-3">
				<Link href="/dashboard/applications/new" className="btn btn-secondary min-h-11">
					Add an application
				</Link>
				<Link href="/dashboard/analytics" className="btn btn-outline min-h-11 border-base-100/30 text-base-100 hover:bg-base-200">
					See analytics
				</Link>
			</div>

			{due.length > 0 && (
				<section aria-labelledby="due-heading" className="rounded-box border border-accent/40 bg-base-300 p-5 sm:p-6">
					<h2 id="due-heading" className="text-xl text-base-100">
						Due now
					</h2>
					<ul className="mt-3 flex flex-col gap-2">
						{due.slice(0, 8).map((r) => {
							const a = byId.get(r.appId);
							if (!a) return null;
							const label = [a.jobTitle || 'Untitled job', a.company].filter(Boolean).join(' at ');
							return (
								<li key={`${r.appId}-${r.kind}`}>
									<Link
										href={`/dashboard/applications/${a.id}#letters`}
										className="flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 text-base-100 hover:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral"
									>
										<span className="min-w-0 break-words">
											<span className="font-medium">{KIND_LABEL[r.kind]}</span>
											<span className="text-base-100/70"> · {label}</span>
										</span>
										<span className="text-sm text-base-100/60">Due since {dateFmt.format(r.dueSince)}</span>
									</Link>
								</li>
							);
						})}
					</ul>
				</section>
			)}

			{rows.length === 0 ? (
				<Card title="No applications yet">
					<p>
						Add a job that you want to apply for. Then build a tailored resume, write the cover letter, and track the answer in one place.
					</p>
					<p className="mt-2">Each cover letter that you write also adds an application.</p>
				</Card>
			) : (
				<ApplicationsList rows={rows} />
			)}
		</PageShell>
	);
}
