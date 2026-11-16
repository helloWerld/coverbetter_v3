import Link from 'next/link';
import PageShell, { Card } from '@/components/Dashboard/PageShell';
import DueList, { appTitles } from '@/components/Applications/DueList';
import MessagesPanel from '@/components/Applications/MessagesPanel';
import RoutedRolePicker from '@/components/Roles/RoutedRolePicker';
import { hasPaidFeatures } from '@/lib/access';
import { reminders, upcomingFollowUps } from '@/lib/applications/analytics';
import { getApplicationDetail, getSettings, listApplications, listMessages, loadSnapshots } from '@/lib/applications/db';
import { followUpView } from '@/lib/applications/messages-view';
import type { Status } from '@/lib/applications/types';
import { getProfile } from '@/lib/profile/db';
import { requireUser } from '@/lib/user';

export const metadata = { title: 'Follow-ups | CoverBetter' };

const KIND: Record<string, string> = { follow_up: 'Follow-up', follow_up_2: 'Second follow-up', thank_you: 'Thank-you letter' };
const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const rowLink =
	'flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 text-base-100 hover:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral';

// Roles that are waiting for an answer come first in the search.
const ORDER: Record<string, number> = { interview: 0, applied: 1, offer: 2, saved: 3 };
const writeHref = (id: string) => `/dashboard/follow-ups?role=${encodeURIComponent(id)}#write`;

export default async function FollowUpsPage({
	searchParams,
}: Readonly<{ searchParams: Promise<{ role?: string | string[] }> }>) {
	const user = await requireUser();
	const now = new Date();
	const sp = await searchParams;
	const roleId = typeof sp.role === 'string' ? sp.role.slice(0, 100) : '';
	const [apps, snaps, settings, msgs, profile, detail] = await Promise.all([
		listApplications(user.id),
		loadSnapshots(user.id),
		getSettings(user.id),
		listMessages(user.id),
		getProfile(user.id),
		roleId ? getApplicationDetail(user.id, roleId) : Promise.resolve(null),
	]);
	const titles = appTitles(apps);
	const due = reminders(snaps, now, settings);
	const upcoming = upcomingFollowUps(snaps, now, settings);
	const roles = apps
		.map((a) => ({ id: a.id, company: a.company, jobTitle: a.jobTitle, status: a.status as Status }))
		.sort((x, y) => (ORDER[x.status] ?? 4) - (ORDER[y.status] ?? 4));
	const view = detail
		? followUpView(detail.app, detail.interviews, detail.messages, profile, due.find((d) => d.appId === detail.app.id))
		: null;

	return (
		<PageShell
			title="Follow-ups"
			intro="After you apply, send a short follow-up when the company does not answer. After an interview, send a thank-you letter."
		>
			<section id="write" aria-labelledby="write-h" className="flex scroll-mt-24 flex-col gap-4 rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-5 sm:p-6">
				<div>
					<h2 id="write-h" className="text-xl text-base-100">
						Write a follow-up
					</h2>
					<p className="mt-1 text-base-100/75">
						Find the role, pick the type of letter, and add the recipient and any details. Use a free template, or let the AI
						write it for 1 credit.
					</p>
				</div>
				<RoutedRolePicker roles={roles} selectedId={detail?.app.id ?? null} path="/dashboard/follow-ups" label="Find the role" />
				{detail && view && (
					<>
						<Link href={`/dashboard/applications/${detail.app.id}`} className="w-fit text-neutral underline underline-offset-2">
							Open the role profile
						</Link>
						<MessagesPanel
							key={detail.app.id}
							applicationId={detail.app.id}
							messages={view.messageViews}
							interviews={view.interviewViews}
							paid={hasPaidFeatures(user, now)}
							suggestedKind={view.suggestedKind}
							template={view.template}
						/>
					</>
				)}
			</section>

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
								<Link href={writeHref(u.appId)} className={rowLink}>
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
						You have no follow-up or thank-you letters yet. Find a role above to write one.
					</p>
				) : (
					<ul className="flex flex-col gap-1">
						{msgs.map((m) => (
							<li key={m.id}>
								<Link href={writeHref(m.applicationId)} className={rowLink}>
									<span className="min-w-0 break-words">
										<span className="font-medium">{KIND[m.kind] ?? m.kind}</span>
										<span className="text-base-100/70"> · {titles.get(m.applicationId) ?? 'Deleted role'}</span>
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
