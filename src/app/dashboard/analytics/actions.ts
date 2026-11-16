'use server';

import { getApplicationDetail } from '@/lib/applications/db';
import { ROUND_LABEL, SOURCE_LABEL, STATUS_LABEL, type InterviewRound, type Source, type Status } from '@/lib/applications/types';
import { BAND_LABEL, deserializeFit, fitBand } from '@/lib/fit';
import { getLetter } from '@/lib/letters';
import { getResume } from '@/lib/resumes';
import { requireUser } from '@/lib/user';

export type AppSummary = {
	id: string;
	company: string;
	jobTitle: string;
	status: Status;
	source: string;
	jobUrl: string;
	appliedAt: string | null;
	createdAt: string;
	contactName: string;
	contactEmail: string;
	notes: string;
	jobPost: string;
	fit: { score: number; band: string; summary: string; met: string[]; missing: string[] } | null;
	resume: { id: string; title: string; tailored: boolean } | null;
	letter: { id: string; createdAt: string } | null;
	interviews: { id: string; at: string; round: string; interviewers: string; rating: number }[];
	messages: { kind: string; sent: boolean; createdAt: string }[];
	timeline: { at: string; text: string }[];
};

const EVENT_TEXT: Record<string, string> = {
	follow_up_sent: 'Follow-up sent',
	thank_you_sent: 'Thank-you letter sent',
	interview_added: 'Interview added',
};

/** Everything the analytics sidebar shows about one application. */
export async function getApplicationSummaryAction(id: string): Promise<AppSummary | null> {
	const user = await requireUser();
	const detail = await getApplicationDetail(user.id, id);
	if (!detail) return null;
	const { app, events, interviews, messages } = detail;
	const [resume, letter] = await Promise.all([
		app.resumeId ? getResume(user.id, app.resumeId) : Promise.resolve(null),
		app.letterId ? getLetter(user.id, app.letterId) : Promise.resolve(undefined),
	]);
	const fit = deserializeFit(app.fitScore, app.fitJson);
	return {
		id: app.id,
		company: app.company,
		jobTitle: app.jobTitle,
		status: app.status as Status,
		source: SOURCE_LABEL[app.source as Source] ?? 'Other',
		jobUrl: app.jobUrl,
		appliedAt: app.appliedAt?.toISOString() ?? null,
		createdAt: app.createdAt.toISOString(),
		contactName: app.contactName,
		contactEmail: app.contactEmail,
		notes: app.notes,
		jobPost: app.jobDescription.slice(0, 4000),
		fit: fit
			? {
					score: fit.score,
					band: BAND_LABEL[fitBand(fit.score)],
					summary: fit.summary,
					met: fit.requirements.filter((r) => r.status === 'met').map((r) => r.requirement).slice(0, 5),
					missing: fit.requirements.filter((r) => r.status !== 'met').map((r) => r.requirement).slice(0, 5),
				}
			: null,
		resume: resume ? { id: resume.id, title: resume.title, tailored: resume.kind === 'tailored' } : null,
		letter: letter ? { id: letter.id, createdAt: letter.createdAt.toISOString() } : null,
		interviews: interviews.map((i) => ({
			id: i.id,
			at: i.at.toISOString(),
			round: ROUND_LABEL[i.round as InterviewRound] ?? i.round,
			interviewers: i.interviewers,
			rating: i.rating,
		})),
		messages: messages.map((m) => ({ kind: m.kind, sent: Boolean(m.sentAt), createdAt: m.createdAt.toISOString() })),
		timeline: events
			.map((e) => ({
				at: e.at.toISOString(),
				text: e.type === 'status' ? `Status: ${STATUS_LABEL[e.status as Status] ?? e.status}` : (EVENT_TEXT[e.type] ?? e.type),
			}))
			.reverse(),
	};
}
