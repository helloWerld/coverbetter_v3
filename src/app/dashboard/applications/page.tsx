import Link from 'next/link';
import PageShell, { Card } from '@/components/Dashboard/PageShell';
import ApplicationsList, { type AppRow } from '@/components/Applications/ApplicationsList';
import DueList, { appTitles } from '@/components/Applications/DueList';
import { isNoResponse, reminders } from '@/lib/applications/analytics';
import { getSettings, listApplications, loadSnapshots } from '@/lib/applications/db';
import type { Status } from '@/lib/applications/types';
import { requireUser } from '@/lib/user';

export const metadata = { title: 'Applications | CoverBetter' };

export default async function ApplicationsPage() {
	const user = await requireUser();
	const now = new Date();
	const [apps, snaps, settings] = await Promise.all([listApplications(user.id), loadSnapshots(user.id), getSettings(user.id)]);
	const snapById = new Map(snaps.map((s) => [s.id, s]));
	const due = reminders(snaps, now, settings);

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
		<PageShell title="Applications" intro="Save each role that you find. Then track it from saved to offer. Tracking is free.">
			<div className="flex flex-wrap gap-3">
				<Link href="/dashboard/applications/new" className="btn btn-secondary min-h-11">
					Add an application
				</Link>
				<Link href="/dashboard/fit-score#saved-roles" className="btn btn-outline min-h-11 border-base-100/30 text-base-100 hover:bg-base-200">
					Check the fit of saved roles
				</Link>
			</div>

			{due.length > 0 && (
				<section aria-labelledby="due-heading" className="rounded-box border border-accent/40 bg-base-300 p-5 sm:p-6">
					<h2 id="due-heading" className="text-xl text-base-100">
						Due now
					</h2>
					<DueList due={due} titles={appTitles(apps)} />
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
