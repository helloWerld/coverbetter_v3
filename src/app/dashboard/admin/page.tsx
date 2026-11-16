import PageShell, { Card } from '@/components/Dashboard/PageShell';
import { requireAdmin } from '@/lib/admin';
import { getCharges, getOverview, getSupportRequests, getUsage } from '@/lib/admin-data';
import { topicLabel } from '@/lib/support/validate';
import StatusButton from './StatusButton';

export const metadata = { title: 'Admin | CoverBetter', robots: { index: false } };
export const dynamic = 'force-dynamic';

const KIND_LABELS: Record<string, string> = {
	letter: 'Cover letter',
	fit_check: 'Job Fit Score, one role',
	fit_batch: 'Job Fit Score, saved roles',
	tailor: 'Customized application',
	prep: 'Interview prep pack',
};
const kindLabel = (k: string) => KIND_LABELS[k] ?? (k.startsWith('message:') ? `AI letter: ${k.slice(8).replace(/_/g, ' ')}` : k);

const dateTime = (s: number | Date) =>
	(s instanceof Date ? s : new Date(s * 1000)).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }) + ' UTC';
const money = (cents: number, currency: string) => (cents / 100).toLocaleString('en-US', { style: 'currency', currency: currency.toUpperCase() });

const th = 'px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-base-100/60';
const td = 'px-3 py-2 align-top';
const num = `${td} text-right tabular-nums`;

export default async function AdminPage() {
	await requireAdmin();
	const now = Math.floor(Date.now() / 1000);
	const [overview, usage, charges, requests] = await Promise.all([getOverview(now), getUsage(now), getCharges(), getSupportRequests()]);
	const open = requests.filter((r) => r.status === 'open').length;

	const paid30 = charges.ok
		? charges.charges.filter((c) => c.created >= now - 30 * 86400 && c.status !== 'failed' && c.status !== 'pending').reduce((sum, c) => sum + c.amount - c.refunded, 0)
		: 0;
	const currency = charges.ok ? (charges.charges[0]?.currency ?? 'usd') : 'usd';

	const stats = [
		{ label: 'Users', value: overview.users.toLocaleString('en-US') },
		{ label: 'Pro users', value: overview.pro.toLocaleString('en-US') },
		{ label: 'New users, 30 days', value: overview.newUsers30.toLocaleString('en-US') },
		{ label: 'Credits not used yet', value: overview.creditsHeld.toLocaleString('en-US') },
		{ label: 'Paid, 30 days', value: charges.ok ? money(paid30, currency) : 'No data' },
		{ label: 'Open support requests', value: open.toLocaleString('en-US') },
	];

	return (
		<PageShell title="Admin" intro="Payments, AI use, and support requests for all users. Only your account can open this page.">
			<dl className="grid grid-cols-2 gap-3 md:grid-cols-3">
				{stats.map((s) => (
					<div key={s.label} className="rounded-box border border-base-100/10 bg-base-300 p-4">
						<dt className="text-sm text-base-100/60">{s.label}</dt>
						<dd className="mt-1 text-2xl tabular-nums text-base-100">{s.value}</dd>
					</div>
				))}
			</dl>

			<Card title={`Support requests (${open} open)`}>
				{requests.length === 0 ? (
					<p>No requests yet. They show here when a user sends the form on the Support page.</p>
				) : (
					<ul className="flex flex-col gap-3">
						{requests.map((r) => (
							<li key={r.id} className={`flex flex-col gap-2 rounded-lg border p-4 ${r.status === 'open' ? 'border-secondary/50 bg-base-300' : 'border-base-100/10 opacity-70'}`}>
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div className="min-w-0">
										<h3 className="break-words text-lg text-base-100">{r.subject}</h3>
										<p className="text-sm text-base-100/60">
											{topicLabel(r.topic)} · {dateTime(r.createdAt)} · {r.status === 'open' ? 'Open' : 'Closed'}
										</p>
									</div>
									<div className="flex flex-wrap gap-2">
										{r.email && (
											<a
												href={`mailto:${r.email}?subject=${encodeURIComponent(`Re: ${r.subject}`)}`}
												className="btn btn-sm btn-secondary min-h-11"
											>
												Reply by email
											</a>
										)}
										<StatusButton id={r.id} status={r.status} subject={r.subject} />
									</div>
								</div>
								<p className="break-all text-sm text-base-100/80">{r.email || r.userId}</p>
								<p className="whitespace-pre-wrap break-words text-base-100/90">{r.message}</p>
							</li>
						))}
					</ul>
				)}
			</Card>

			<Card title="Transactions">
				{!charges.ok ? (
					<p role="alert">{charges.error}</p>
				) : (
					<>
						<p className="mb-3 text-sm">
							The last {charges.charges.length} charges, read live from Stripe.{charges.testMode && ' Stripe is in test mode.'}{' '}
							<a href="https://dashboard.stripe.com/payments" target="_blank" rel="noreferrer" className="text-neutral underline underline-offset-2">
								Open Stripe
							</a>
						</p>
						{charges.charges.length === 0 ? (
							<p>No charges yet.</p>
						) : (
							<div className="overflow-x-auto rounded-lg border border-base-100/10">
								<table className="w-full min-w-[40rem] text-sm">
									<thead className="bg-base-300">
										<tr>
											<th scope="col" className={th}>Date</th>
											<th scope="col" className={th}>User</th>
											<th scope="col" className={th}>For</th>
											<th scope="col" className={`${th} text-right`}>Amount</th>
											<th scope="col" className={th}>Status</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-base-100/10 text-base-100">
										{charges.charges.map((c) => (
											<tr key={c.id}>
												<td className={`${td} whitespace-nowrap`}>{dateTime(c.created)}</td>
												<td className={`${td} break-all`}>{c.email || 'Unknown'}</td>
												<td className={td}>{c.description || 'Not given'}</td>
												<td className={num}>
													{money(c.amount, c.currency)}
													{c.refunded > 0 && <span className="block text-xs text-base-100/60">−{money(c.refunded, c.currency)} refunded</span>}
												</td>
												<td className={td}>
													{c.receiptUrl ? (
														<a href={c.receiptUrl} target="_blank" rel="noreferrer" className="text-neutral underline underline-offset-2">
															{c.status}
														</a>
													) : (
														c.status
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</>
				)}
			</Card>

			<Card title="AI use">
				<p className="mb-3 text-sm">Each row counts successful AI calls. Free cover letters are included.</p>
				{usage.rows.length === 0 ? (
					<p>No AI calls yet.</p>
				) : (
					<div className="overflow-x-auto rounded-lg border border-base-100/10">
						<table className="w-full min-w-[32rem] text-sm">
							<thead className="bg-base-300">
								<tr>
									<th scope="col" className={th}>Type</th>
									<th scope="col" className={`${th} text-right`}>24 hours</th>
									<th scope="col" className={`${th} text-right`}>7 days</th>
									<th scope="col" className={`${th} text-right`}>30 days</th>
									<th scope="col" className={`${th} text-right`}>All time</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-base-100/10 text-base-100">
								{usage.rows.map((r) => (
									<tr key={r.kind}>
										<th scope="row" className={`${td} text-left font-normal`}>{kindLabel(r.kind)}</th>
										<td className={num}>{r.d1}</td>
										<td className={num}>{r.d7}</td>
										<td className={num}>{r.d30}</td>
										<td className={num}>{r.total}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				{usage.top.length > 0 && (
					<>
						<h3 className="mb-2 mt-5 text-lg text-base-100">Most AI calls, 30 days</h3>
						<ol className="flex flex-col divide-y divide-base-100/10 rounded-lg border border-base-100/10">
							{usage.top.map((u) => (
								<li key={u.email} className="flex items-baseline justify-between gap-4 px-3 py-2">
									<span className="min-w-0 break-all text-base-100">{u.email}</span>
									<span className="tabular-nums">{u.n}</span>
								</li>
							))}
						</ol>
					</>
				)}
			</Card>
		</PageShell>
	);
}
