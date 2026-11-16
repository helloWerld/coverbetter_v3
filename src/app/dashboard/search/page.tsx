import Link from 'next/link';
import PageShell, { Card } from '@/components/Dashboard/PageShell';
import RoleSearch, { type SearchRow } from '@/components/Analytics/RoleSearch';
import { listApplications } from '@/lib/applications/db';
import { roleKeywords } from '@/lib/applications/search';
import type { Status } from '@/lib/applications/types';
import { requireUser } from '@/lib/user';

export const metadata = { title: 'Search | CoverBetter' };

export default async function SearchPage() {
	const user = await requireUser();
	const rows = await listApplications(user.id);
	const intro = 'Find a role by job title, company, or keywords. Select a role to see everything about it.';

	if (rows.length === 0) {
		return (
			<PageShell title="Search" intro={intro}>
				<Card title="No roles yet">
					<p>Save a role first. Then you can search for it here.</p>
					<Link href="/dashboard/applications" className="btn btn-secondary mt-4 min-h-11">
						Add your first role
					</Link>
				</Card>
			</PageShell>
		);
	}

	const searchRows: SearchRow[] = rows.map((r) => ({
		id: r.id,
		company: r.company,
		jobTitle: r.jobTitle,
		status: r.status as Status,
		keywords: roleKeywords(r),
		appliedAt: r.appliedAt ? r.appliedAt.toISOString() : null,
		fitScore: r.fitScore,
	}));

	return (
		<PageShell title="Search" intro={intro}>
			<Card title="All your roles">
				<RoleSearch rows={searchRows} />
			</Card>
		</PageShell>
	);
}
