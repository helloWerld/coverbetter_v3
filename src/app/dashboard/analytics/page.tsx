import Link from 'next/link';
import PageShell, { Card } from '@/components/Dashboard/PageShell';
import Breakdowns from '@/components/Analytics/Breakdowns';
import SankeyChart from '@/components/Analytics/SankeyChart';
import StatCards from '@/components/Analytics/StatCards';
import WeeklyBars from '@/components/Analytics/WeeklyBars';
import { sankeyData, summaryStats } from '@/lib/applications/analytics';
import { getSettings, loadSnapshots } from '@/lib/applications/db';
import { requireUser } from '@/lib/user';

export const metadata = { title: 'Analytics | CoverBetter' };

export default async function AnalyticsPage() {
	const user = await requireUser();
	const [apps, settings] = await Promise.all([loadSnapshots(user.id), getSettings(user.id)]);
	const intro = 'See how your applications move from saved to offer.';

	if (apps.length < 1) {
		return (
			<PageShell title="Analytics" intro={intro}>
				<Card title="No data yet">
					<p>This page shows your response rate, your interview rate, and the path of each application.</p>
					<p className="mt-2">Add an application to see your numbers.</p>
					<Link href="/dashboard/applications" className="btn btn-secondary mt-4 min-h-11">
						Add your first application
					</Link>
				</Card>
			</PageShell>
		);
	}

	const now = new Date();
	const stats = summaryStats(apps, now, settings);
	const flow = sankeyData(apps, now, settings);

	return (
		<PageShell title="Analytics" intro={intro}>
			<StatCards stats={stats} />
			<Card title="How your applications moved">
				<SankeyChart nodes={flow.nodes} links={flow.links} total={stats.total} />
			</Card>
			<Card title="Applications per week">
				<WeeklyBars weeks={stats.appliesPerWeek} />
			</Card>
			<Breakdowns stats={stats} />
		</PageShell>
	);
}
