import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaArrowUpRightFromSquare } from 'react-icons/fa6';
import PageShell from '@/components/Dashboard/PageShell';
import ApplicationForm from '@/components/Applications/ApplicationForm';
import DeleteApplicationButton from '@/components/Applications/DeleteApplicationButton';
import InterviewsPanel, { type InterviewView } from '@/components/Applications/InterviewsPanel';
import MessagesPanel, { type MessageView } from '@/components/Applications/MessagesPanel';
import StatusSelect from '@/components/Applications/StatusSelect';
import FitScoreCard from '@/components/Fit/FitScoreCard';
import { hasPaidFeatures } from '@/lib/access';
import { reminders } from '@/lib/applications/analytics';
import { getApplicationDetail, getSettings, loadSnapshots } from '@/lib/applications/db';
import { SOURCE_LABEL, STATUS_LABEL, type InterviewFormat, type InterviewRound, type MessageKind, type Source, type Status } from '@/lib/applications/types';
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

	const interviewViews: InterviewView[] = interviews.map((i) => ({
		id: i.id,
		at: i.at.toISOString(),
		round: i.round as InterviewRound,
		format: i.format as InterviewFormat,
		interviewers: i.interviewers,
		topics: i.topics,
		wentWell: i.wentWell,
		clarify: i.clarify,
		rating: i.rating,
	}));
	const messageViews: MessageView[] = messages.map((m) => ({
		id: m.id,
		kind: m.kind as MessageKind,
		subject: m.subject,
		body: m.body,
		mode: m.mode === 'ai' ? 'ai' : 'template',
		sentAt: m.sentAt ? m.sentAt.toISOString() : null,
		createdAt: m.createdAt.toISOString(),
	}));
	const suggestedKind: MessageKind = due?.kind ?? (interviews.length > 0 ? 'thank_you' : 'follow_up');
	const strength = fit?.requirements.find((r) => r.status === 'met')?.requirement ?? '';

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
				<Step n={1} title="Tailored resume">
					{resume ? (
						<p>
							<span className="text-base-100">{resume.title}</span>
							{resume.kind === 'uploaded' && <span> (an uploaded resume)</span>}
						</p>
					) : (
						<p>{hasProfile ? 'Pick the experience for this job from your career profile.' : 'Fill in your career profile first. Then build a resume for this job.'}</p>
					)}
					<Link href={hasProfile ? `/dashboard/applications/${app.id}/resume` : '/dashboard/profile'} className={resume ? btnOutline : `${btn} btn-secondary`}>
						{hasProfile ? (resume?.kind === 'tailored' ? 'Edit the resume' : 'Build the resume') : 'Open career profile'}
					</Link>
					{paid && hasProfile && !resume && <p className="text-sm">Tip: the AI can build the resume, the letter, and the fit score together for 1 credit.</p>}
				</Step>
				<Step n={2} title="Cover letter">
					{letter ? (
						<p>
							Written {dateFmt.format(letter.createdAt)}
							{letter.fitScore !== null ? `, fit ${letter.fitScore}/100` : ''}.
						</p>
					) : (
						<p>Write a letter for this job post.</p>
					)}
					<Link
						href={letter ? `/dashboard/letters/${letter.id}` : `/dashboard?applicationId=${app.id}`}
						className={letter ? btnOutline : `${btn} btn-secondary`}
					>
						{letter ? 'Open the letter' : 'Write the letter'}
					</Link>
				</Step>
				<Step n={3} title="Interview prep">
					<p>Practice likely questions for this job. The question bank is free.</p>
					<Link href={`/dashboard/applications/${app.id}/prep`} className={btnOutline}>
						Open interview prep
					</Link>
				</Step>
			</div>

			{fit && <FitScoreCard fit={fit} heading={`Job Fit Score: ${label}`} />}

			<section aria-labelledby="interviews-h" className="flex flex-col gap-3">
				<h2 id="interviews-h" className="text-2xl font-extralight text-base-100">
					Interviews
				</h2>
				<InterviewsPanel applicationId={app.id} interviews={interviewViews} />
			</section>

			<section id="letters" aria-labelledby="letters-h" className="flex scroll-mt-24 flex-col gap-3">
				<h2 id="letters-h" className="text-2xl font-extralight text-base-100">
					Follow-up and thank-you letters
				</h2>
				<MessagesPanel
					applicationId={app.id}
					messages={messageViews}
					interviews={interviewViews}
					paid={paid}
					suggestedKind={suggestedKind}
					template={{
						applicantName: profile.basics.name || '',
						company: app.company,
						jobTitle: app.jobTitle,
						appliedOn: app.appliedAt ? app.appliedAt.toISOString() : null,
						contactName: app.contactName,
						contactEmail: app.contactEmail,
						strength,
					}}
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
					Edit the job details and the job post
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
