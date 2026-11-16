import Link from 'next/link';
import PageShell, { Card } from '@/components/Dashboard/PageShell';
import ApplicationsList, { type AppRow } from '@/components/Applications/ApplicationsList';
import BatchFit from '@/components/Roles/BatchFit';
import { hasPaidFeatures } from '@/lib/access';
import { PROFILE_RESUME_ID } from '@/lib/fit-check';
import { hasProfile } from '@/lib/profile/db';
import { listResumes } from '@/lib/resumes';
import { isNoResponse, reminders } from '@/lib/applications/analytics';
import { getSettings, listApplications, loadSnapshots } from '@/lib/applications/db';
import type { Status } from '@/lib/applications/types';
import { requireUser } from '@/lib/user';

export const metadata = { title: 'Find Roles | CoverBetter' };

export default async function ApplicationsPage() {
	const user = await requireUser();
	const now = new Date();
	const [apps, snaps, settings, resumes, profile] = await Promise.all([
		listApplications(user.id),
		loadSnapshots(user.id),
		getSettings(user.id),
		listResumes(user.id),
		hasProfile(user.id),
	]);
	// Base resumes only. A tailored resume belongs to one role.
	const baseResumes = resumes.filter((r) => r.kind !== 'tailored').map((r) => ({ id: r.id, title: r.title }));
	const fitResumes = profile ? [{ id: PROFILE_RESUME_ID, title: 'My profile' }, ...baseResumes] : baseResumes;
	const savedRoles = apps
		.filter((a) => a.status === 'saved')
		.map((a) => ({
			id: a.id,
			label: [a.jobTitle || 'Untitled job', a.company].filter(Boolean).join(' at '),
			fitScore: a.fitScore,
			hasPost: a.jobDescription.trim().length >= 50,
		}));
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
		<PageShell title="Find Roles" intro="Save each role that you find, with its job post. Each role keeps everything about the application, from saved to offer. Tracking is free.">
			<div className="flex flex-wrap gap-3">
				<Link href="/dashboard/applications/new" className="btn btn-secondary min-h-11">
					Add a role
				</Link>
				<a href="#fit" className="btn btn-outline min-h-11 border-base-100/30 text-base-100 hover:bg-base-200">
					Check the fit of saved roles
				</a>
			</div>

			{due.length > 0 && (
				<p className="rounded-box border border-accent/40 bg-base-300 p-4 text-base-100">
					{due.length === 1 ? '1 follow-up or thank-you letter is due.' : `${due.length} follow-ups or thank-you letters are due.`}{' '}
					<Link href="/dashboard/follow-ups" className="text-neutral underline underline-offset-2">
						Open Follow-ups
					</Link>
				</p>
			)}

			{rows.length === 0 ? (
				<Card title="No roles yet">
					<p>Add a role that you want to apply for. Paste its job post. Then check the fit, customize the application, and track the answer in one place.</p>
				</Card>
			) : (
				<ApplicationsList rows={rows} />
			)}

			<BatchFit roles={savedRoles} resumes={fitResumes} paid={hasPaidFeatures(user, now)} />
		</PageShell>
	);
}
