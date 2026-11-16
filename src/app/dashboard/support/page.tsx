import { desc, eq } from 'drizzle-orm';
import PageShell, { Card } from '@/components/Dashboard/PageShell';
import { supportRequests } from '@/db/schema';
import { getDb } from '@/lib/cf';
import { topicLabel } from '@/lib/support/validate';
import { requireUser } from '@/lib/user';
import SupportForm from './SupportForm';

export const metadata = { title: 'Support | CoverBetter' };

const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default async function SupportPage() {
	const user = await requireUser();
	const mine = await getDb()
		.select()
		.from(supportRequests)
		.where(eq(supportRequests.userId, user.id))
		.orderBy(desc(supportRequests.createdAt))
		.limit(10);

	return (
		<PageShell title="Support" intro="Ask a question or tell us about a problem. We answer by email.">
			<Card title="Send a request">
				<SupportForm email={user.email} />
			</Card>
			{mine.length > 0 && (
				<Card title="Your requests">
					<ul className="flex flex-col divide-y divide-base-100/10">
						{mine.map((r) => (
							<li key={r.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
								<span className="min-w-0 break-words text-base-100">{r.subject}</span>
								<span className="text-sm text-base-100/60">
									{topicLabel(r.topic)} · {fmt(r.createdAt)} · {r.status === 'open' ? 'Open' : 'Closed'}
								</span>
							</li>
						))}
					</ul>
				</Card>
			)}
		</PageShell>
	);
}
