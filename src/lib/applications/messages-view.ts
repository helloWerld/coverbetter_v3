import 'server-only';
import type { Application, Interview, Message } from '@/db/schema';
import type { InterviewView } from '@/components/Applications/InterviewsPanel';
import type { MessageView } from '@/components/Applications/MessagesPanel';
import { deserializeFit } from '@/lib/fit';
import type { Profile } from '@/lib/profile/types';
import type { Reminder } from './analytics';
import type { InterviewFormat, InterviewRound, MessageKind } from './types';

/** The props of MessagesPanel and InterviewsPanel for one role. */
export function followUpView(
	app: Application,
	interviews: Interview[],
	messages: Message[],
	profile: Profile,
	due: Reminder | undefined,
) {
	const fit = deserializeFit(app.fitScore, app.fitJson);
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
	return {
		interviewViews,
		messageViews,
		suggestedKind,
		template: {
			applicantName: profile.basics.name || '',
			company: app.company,
			jobTitle: app.jobTitle,
			appliedOn: app.appliedAt ? app.appliedAt.toISOString() : null,
			contactName: app.contactName,
			contactEmail: app.contactEmail,
			strength: fit?.requirements.find((r) => r.status === 'met')?.requirement ?? '',
		},
	};
}
