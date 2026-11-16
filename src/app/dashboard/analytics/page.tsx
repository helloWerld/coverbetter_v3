import Link from 'next/link';
import PageShell, { Card } from '@/components/Dashboard/PageShell';
import Breakdowns from '@/components/Analytics/Breakdowns';
import FlowMap, { type AppBrief } from '@/components/Analytics/FlowMap';
import RoleSearch, { type SearchRow } from '@/components/Analytics/RoleSearch';
import StatCards from '@/components/Analytics/StatCards';
import WeeklyBars from '@/components/Analytics/WeeklyBars';
import { sankeyData, sankeyMembers, summaryStats } from '@/lib/applications/analytics';
import { getSettings, listApplications, loadSnapshots } from '@/lib/applications/db';
import { roleKeywords } from '@/lib/applications/search';
import type { Status } from '@/lib/applications/types';
import { requireUser } from '@/lib/user';

export const metadata = { title: 'Analytics | CoverBetter' };

export default async function AnalyticsPage() {
	const user = await requireUser();
	const [apps, settings, rows] = await Promise.all([loadSnapshots(user.id), getSettings(user.id), listApplications(user.id)]);
	const intro = 'Track all your roles, from saved to offer. Select a role to see everything about it.';

	if (apps.length < 1) {
		return (
			<PageShell title="Analytics" intro={intro}>
				<Card title="No data yet">
					<p>This page shows your response rate, your interview rate, and the path of each application.</p>
					<p className="mt-2">Add a role to see your numbers.</p>
					<Link href="/dashboard/applications" className="btn btn-secondary mt-4 min-h-11">
						Add your first role
					</Link>
				</Card>
			</PageShell>
		);
	}

	const now = new Date();
	const stats = summaryStats(apps, now, settings);
	const flow = sankeyData(apps, now, settings);
	// Only the short fields go to the browser. The sidebar loads the rest on demand.
	const brief = new Map<string, AppBrief>(
		rows.map((r) => [r.id, { id: r.id, company: r.company, jobTitle: r.jobTitle, status: r.status as Status }]),
	);
	const members = Object.fromEntries(
		Object.entries(sankeyMembers(apps, now, settings)).map(([node, ids]) => [
			node,
			ids.map((id) => brief.get(id)).filter((b): b is AppBrief => Boolean(b)),
		]),
	);

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
		<PageShell title="Analytics" intro={intro}>
			<StatCards stats={stats} />
			<Card title="All your roles">
				<RoleSearch rows={searchRows} />
			</Card>
			<Card title="How your applications moved">
				<FlowMap nodes={flow.nodes} links={flow.links} total={stats.total} members={members} />
			</Card>
			<Card title="Applications per week">
				<WeeklyBars weeks={stats.appliesPerWeek} />
			</Card>
			<Breakdowns stats={stats} />
		</PageShell>
	);
}
