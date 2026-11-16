import Link from 'next/link';
import PageShell, { Card } from '@/components/Dashboard/PageShell';
import DueList, { appTitles } from '@/components/Applications/DueList';
import { reminders, upcomingFollowUps } from '@/lib/applications/analytics';
import { getSettings, listApplications, listMessages, loadSnapshots } from '@/lib/applications/db';
import { requireUser } from '@/lib/user';

export const metadata = { title: 'Follow-ups | CoverBetter' };

const KIND: Record<string, string> = { follow_up: 'Follow-up', follow_up_2: 'Second follow-up', thank_you: 'Thank-you letter' };
const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const rowLink =
	'flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 text-base-100 hover:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral';

export default async function FollowUpsPage() {
	const user = await requireUser();
	const now = new Date();
	const [apps, snaps, settings, msgs] = await Promise.all([
		listApplications(user.id),
		loadSnapshots(user.id),
		getSettings(user.id),
		listMessages(user.id),
	]);
	const titles = appTitles(apps);
	const due = reminders(snaps, now, settings);
	const upcoming = upcomingFollowUps(snaps, now, settings);

	return (
		<PageShell
			title="Follow-ups"
			intro="After you apply, send a short follow-up when the company does not answer. After an interview, send a thank-you letter."
		>
			<section aria-labelledby="due-heading" className="rounded-box border border-accent/40 bg-base-300 p-5 sm:p-6">
				<h2 id="due-heading" className="text-xl text-base-100">
					Due now
				</h2>
				{due.length === 0 ? (
					<p className="mt-2 text-base-100/70">Nothing is due now.</p>
				) : (
					<DueList due={due} titles={titles} limit={50} />
				)}
			</section>

			{upcoming.length > 0 && (
				<Card title="Coming up">
					<ul className="flex flex-col gap-1">
						{upcoming.map((u) => (
							<li key={`${u.appId}-${u.kind}`}>
								<Link href={`/dashboard/applications/${u.appId}#letters`} className={rowLink}>
									<span className="min-w-0 break-words">
										<span className="font-medium">{KIND[u.kind]}</span>
										<span className="text-base-100/70"> · {titles.get(u.appId)}</span>
									</span>
									<span className="text-sm text-base-100/60">{dateFmt.format(u.dueOn)}</span>
								</Link>
							</li>
						))}
					</ul>
				</Card>
			)}

			<Card title="Your letters">
				{msgs.length === 0 ? (
					<p>
						You have no follow-up or thank-you letters yet. Open an application to write one from a free template, or let
						the AI write it for 1 credit.
					</p>
				) : (
					<ul className="flex flex-col gap-1">
						{msgs.map((m) => (
							<li key={m.id}>
								<Link href={`/dashboard/applications/${m.applicationId}#letters`} className={rowLink}>
									<span className="min-w-0 break-words">
										<span className="font-medium">{KIND[m.kind] ?? m.kind}</span>
										<span className="text-base-100/70"> · {titles.get(m.applicationId) ?? 'Deleted application'}</span>
									</span>
									<span className="text-sm text-base-100/60">
										{m.sentAt ? `Sent ${dateFmt.format(m.sentAt)}` : `Draft, ${dateFmt.format(m.createdAt)}`}
									</span>
								</Link>
							</li>
						))}
					</ul>
				)}
			</Card>

			<Card title="How follow-ups work">
				<ul className="list-inside list-disc space-y-1">
					<li>
						A follow-up is due {settings.followUpDays} days after you apply. A second follow-up is due after{' '}
						{settings.secondFollowUpDays} days.
					</li>
					<li>A thank-you letter is due one day after each interview.</li>
					<li>Start from a free template, or let the AI write the letter for 1 credit.</li>
					<li>Send the letter from your own email. Then mark it as sent, so the reminder stops.</li>
				</ul>
				<p className="mt-3">
					<Link href="/dashboard/settings" className="text-neutral underline underline-offset-2">
						Change the number of days in Settings
					</Link>
				</p>
			</Card>
		</PageShell>
	);
}
