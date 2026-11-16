import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaArrowUpRightFromSquare } from 'react-icons/fa6';
import PageShell from '@/components/Dashboard/PageShell';
import ApplicationForm from '@/components/Applications/ApplicationForm';
import DeleteApplicationButton from '@/components/Applications/DeleteApplicationButton';
import InterviewsPanel from '@/components/Applications/InterviewsPanel';
import MessagesPanel from '@/components/Applications/MessagesPanel';
import StatusSelect from '@/components/Applications/StatusSelect';
import FitScoreCard from '@/components/Fit/FitScoreCard';
import { hasPaidFeatures } from '@/lib/access';
import { reminders } from '@/lib/applications/analytics';
import { getApplicationDetail, getSettings, loadSnapshots } from '@/lib/applications/db';
import { followUpView } from '@/lib/applications/messages-view';
import { SOURCE_LABEL, STATUS_LABEL, type Source, type Status } from '@/lib/applications/types';
import { deserializeFit } from '@/lib/fit';
import { getLetter } from '@/lib/letters';
import { getProfile } from '@/lib/profile/db';
import { getResume } from '@/lib/resumes';
import { requireUser } from '@/lib/user';

export const metadata = { title: 'Role profile | CoverBetter' };

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const EVENT_LABEL: Record<string, string> = {
	follow_up_sent: 'Follow-up sent',
	thank_you_sent: 'Thank-you letter sent',
	interview_added: 'Interview added',
};

function Step({ n, title, children }: Readonly<{ n: number; title: string; children: React.ReactNode }>) {
	return (
		<section className="flex flex-col gap-3 rounded-box border border-base-100/10 bg-gradient-to-br from-primary to-base-300 p-5">
			<h2 className="flex items-center gap-3 text-lg text-base-100">
				<span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm tabular-nums">
					{n}
				</span>
				{title}
			</h2>
			<div className="flex flex-col gap-3 text-base-100/70">{children}</div>
		</section>
	);
}

const btn = 'btn min-h-11 w-fit';
const btnOutline = `${btn} btn-outline border-base-100/30 text-base-100 hover:bg-base-200`;

export default async function ApplicationPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
	const { id } = await params;
	const user = await requireUser();
	const detail = await getApplicationDetail(user.id, id);
	if (!detail) notFound();
	const { app, events, interviews, messages } = detail;
	const now = new Date();

	const [resume, letter, profile, settings, snaps] = await Promise.all([
		app.resumeId ? getResume(user.id, app.resumeId) : Promise.resolve(null),
		app.letterId ? getLetter(user.id, app.letterId) : Promise.resolve(undefined),
		getProfile(user.id),
		getSettings(user.id),
		loadSnapshots(user.id),
	]);
	const paid = hasPaidFeatures(user, now);
	const fit = deserializeFit(app.fitScore, app.fitJson);
	const title = app.jobTitle || 'Untitled job';
	const label = [title, app.company].filter(Boolean).join(' at ');
	const due = reminders(snaps.filter((s) => s.id === app.id), now, settings)[0];
	const hasProfile = profile.positions.length > 0;

	const { interviewViews, messageViews, suggestedKind, template } = followUpView(app, interviews, messages, profile, due);

	return (
		<PageShell title={title} intro={app.company || undefined}>
			<Link href="/dashboard/applications" className="w-fit text-neutral underline underline-offset-2">
				Back to Find Roles
			</Link>

			<div className="flex flex-col gap-4 rounded-box border border-base-100/10 bg-base-300 p-5 sm:flex-row sm:items-center sm:justify-between">
				<dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:flex sm:flex-wrap">
					<div>
						<dt className="text-base-100/60">Applied</dt>
						<dd className="text-base-100">{app.appliedAt ? dateFmt.format(app.appliedAt) : 'Not yet'}</dd>
					</div>
					<div>
						<dt className="text-base-100/60">Source</dt>
						<dd className="text-base-100">{SOURCE_LABEL[app.source as Source] ?? 'Other'}</dd>
					</div>
					{fit && (
						<div>
							<dt className="text-base-100/60">Job Fit Score</dt>
							<dd className="tabular-nums text-neutral">{fit.score}/100</dd>
						</div>
					)}
					{app.jobUrl && (
						<div>
							<dt className="text-base-100/60">Job post</dt>
							<dd>
								<a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-neutral underline underline-offset-2">
									Open <FaArrowUpRightFromSquare aria-hidden="true" className="text-xs" />
									<span className="sr-only">(opens in a new tab)</span>
								</a>
							</dd>
						</div>
					)}
				</dl>
				<StatusSelect applicationId={app.id} status={app.status as Status} label={`Status of ${label}`} />
			</div>

			{due && (
				<p className="rounded-box border border-accent/40 bg-base-300 p-4 text-base-100">
					{due.kind === 'thank_you' ? 'Send a thank-you letter for your last interview.' : due.kind === 'follow_up_2' ? 'Send a second follow-up.' : 'Send a follow-up. You have had no answer yet.'}{' '}
					<a href="#letters" className="text-neutral underline underline-offset-2">
						Write it now
					</a>
				</p>
			)}

			<div className="grid gap-4 lg:grid-cols-3">
				<Step n={1} title="Resume used">
					{resume ? (
						<p>
							<span className="text-base-100">{resume.title}</span>
							{resume.kind === 'uploaded' && <span> (an uploaded resume)</span>}
						</p>
					) : (
						<p>{hasProfile ? 'No resume yet. Pick the experience for this role from your profile.' : 'Build your profile first. Then build a resume for this role.'}</p>
					)}
					<Link href={hasProfile ? `/dashboard/applications/${app.id}/resume` : '/dashboard/profile'} className={resume ? btnOutline : `${btn} btn-secondary`}>
						{hasProfile ? (resume?.kind === 'tailored' ? 'Edit and download' : 'Build the resume') : 'Build your profile'}
					</Link>
				</Step>
				<Step n={2} title="Cover letter">
					{letter ? (
						<p>
							Written {dateFmt.format(letter.createdAt)}
							{letter.fitScore !== null ? `, fit ${letter.fitScore}/100` : ''}.
						</p>
					) : (
						<p>No cover letter yet.</p>
					)}
					<Link
						href={letter ? `/dashboard/letters/${letter.id}` : `/dashboard?applicationId=${app.id}`}
						className={letter ? btnOutline : `${btn} btn-secondary`}
					>
						{letter ? 'Edit and download' : 'Customize the application'}
					</Link>
				</Step>
				<Step n={3} title="Interview prep">
					<p>Practice likely questions for this job. The question bank is free.</p>
					<Link href={`/dashboard/applications/${app.id}/prep`} className={btnOutline}>
						Open interview prep
					</Link>
				</Step>
			</div>

			{!resume && !letter && app.jobDescription.trim().length >= 50 && (
				<p className="rounded-box border border-secondary/40 bg-base-300 p-4 text-base-100">
					{paid ? 'Get the tailored resume, the cover letter, and the full Job Fit Score in one step for 1 credit.' : 'Build the resume and write the cover letter for this role.'}{' '}
					<Link href={`/dashboard?applicationId=${app.id}`} className="text-neutral underline underline-offset-2">
						Customize the application
					</Link>
				</p>
			)}

			{letter && (
				<section id="letter" aria-labelledby="letter-h" className="flex scroll-mt-24 flex-col gap-3 rounded-box border border-base-100/10 bg-base-300 p-5">
					<h2 id="letter-h" className="text-2xl font-extralight text-base-100">
						Cover letter
					</h2>
					{/* The letter scrolls inside its box, so a long letter does not push the page down. */}
					<div tabIndex={0} role="region" aria-label="Cover letter text" className="max-h-72 overflow-y-auto whitespace-pre-line break-words rounded-lg bg-primary p-4 text-base-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral">
						{letter.body}
					</div>
				</section>
			)}

			<section aria-labelledby="role-h" className="flex flex-col gap-3 rounded-box border border-base-100/10 bg-base-300 p-5">
				<h2 id="role-h" className="text-2xl font-extralight text-base-100">
					Role and company
				</h2>
				<dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
					<div>
						<dt className="text-base-100/60">Job title</dt>
						<dd className="break-words text-base-100">{app.jobTitle || 'Not given'}</dd>
					</div>
					<div>
						<dt className="text-base-100/60">Company</dt>
						<dd className="break-words text-base-100">{app.company || 'Not given'}</dd>
					</div>
					<div>
						<dt className="text-base-100/60">Contact</dt>
						<dd className="break-words text-base-100">{[app.contactName, app.contactEmail].filter(Boolean).join(' · ') || 'None yet'}</dd>
					</div>
					<div>
						<dt className="text-base-100/60">Added</dt>
						<dd className="text-base-100">{dateFmt.format(app.createdAt)}</dd>
					</div>
					{app.notes && (
						<div className="sm:col-span-2">
							<dt className="text-base-100/60">Notes</dt>
							<dd className="whitespace-pre-line break-words text-base-100">{app.notes}</dd>
						</div>
					)}
				</dl>
				{app.jobDescription ? (
					<details className="group">
						<summary className="flex min-h-11 cursor-pointer items-center text-neutral underline underline-offset-2">
							<span className="group-open:hidden">Show the job post</span>
							<span className="hidden group-open:inline">Hide the job post</span>
						</summary>
						<p className="mt-2 whitespace-pre-line break-words text-sm text-base-100/80">{app.jobDescription}</p>
					</details>
				) : (
					<p className="text-sm text-base-100/70">No job post yet. Add it with “Edit the role details” below.</p>
				)}
			</section>

			{fit && <FitScoreCard fit={fit} heading={`Job Fit Score: ${label}`} />}

			<section aria-labelledby="interviews-h" className="flex flex-col gap-3">
				<h2 id="interviews-h" className="text-2xl font-extralight text-base-100">
					Interviews
				</h2>
				<InterviewsPanel applicationId={app.id} interviews={interviewViews} />
			</section>

			<section id="letters" aria-labelledby="letters-h" className="flex scroll-mt-24 flex-col gap-3">
				<h2 id="letters-h" className="text-2xl font-extralight text-base-100">
					Follow-ups
				</h2>
				<MessagesPanel
					applicationId={app.id}
					messages={messageViews}
					interviews={interviewViews}
					paid={paid}
					suggestedKind={suggestedKind}
					template={template}
				/>
			</section>

			<section aria-labelledby="timeline-h" className="flex flex-col gap-3">
				<h2 id="timeline-h" className="text-2xl font-extralight text-base-100">
					Timeline
				</h2>
				<ol className="flex flex-col gap-2 border-l border-base-100/20 pl-4">
					{events.map((e) => (
						<li key={e.id} className="text-base-100/80">
							<time dateTime={e.at.toISOString()} className="text-sm text-base-100/60">
								{dateFmt.format(e.at)}
							</time>{' '}
							· {e.type === 'status' ? `Status: ${STATUS_LABEL[e.status as Status] ?? e.status}` : (EVENT_LABEL[e.type] ?? e.type)}
						</li>
					))}
				</ol>
			</section>

			<details className="rounded-box border border-base-100/10 bg-base-300 p-5">
				<summary className="flex min-h-11 cursor-pointer items-center text-lg text-base-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral">
					Edit the role details
				</summary>
				<div className="mt-4">
					<ApplicationForm
						applicationId={app.id}
						values={{
							company: app.company,
							jobTitle: app.jobTitle,
							jobUrl: app.jobUrl,
							source: app.source,
							jobDescription: app.jobDescription,
							notes: app.notes,
							contactName: app.contactName,
							contactEmail: app.contactEmail,
						}}
					/>
				</div>
			</details>

			<DeleteApplicationButton applicationId={app.id} label={label} />
		</PageShell>
	);
}
