import 'server-only';
import type { Message, User } from '@/db/schema';
import { getApplication, getInterview, getSettings, saveMessage } from '@/lib/applications/db';
import { ROUND_LABEL, type InterviewRound, type MessageKind } from '@/lib/applications/types';
import { getEnv } from '@/lib/cf';
import { deserializeFit } from '@/lib/fit';
import { LANGUAGE_CODES, type LanguageCode } from '@/lib/languages';
import { getLetter } from '@/lib/letters';
import { generateLetter } from '@/lib/llm';
import { runPaidAi, type PaidAiResult } from '@/lib/paid-ai';
import { getProfile } from '@/lib/profile/db';
import { buildMessagePrompt, parseMessageOutput } from './ai-prompt';

const day = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

/** Writes a follow-up or thank-you email with AI for 1 credit, and saves it as a draft. */
export async function writeMessageWithAi(
	user: User,
	applicationId: string,
	kind: MessageKind,
	interviewId?: string,
	extra: { details?: string } = {},
): Promise<PaidAiResult<Message>> {
	const app = await getApplication(user.id, applicationId);
	if (!app) return { ok: false, error: 'We could not find that application.', code: 'failed' };
	const interview = kind === 'thank_you' && interviewId ? await getInterview(user.id, interviewId) : null;
	if (kind === 'thank_you' && (!interview || interview.applicationId !== app.id)) {
		return { ok: false, error: 'Add the interview first, then write the thank-you letter.', code: 'failed' };
	}
	const [profile, settings, letter] = await Promise.all([
		getProfile(user.id),
		getSettings(user.id),
		app.letterId ? getLetter(user.id, app.letterId) : Promise.resolve(null),
	]);
	const fit = deserializeFit(app.fitScore, app.fitJson);
	const b = profile.basics;
	const language = (LANGUAGE_CODES as readonly string[]).includes(settings.language) ? (settings.language as LanguageCode) : 'en';

	return runPaidAi(user, `message:${kind}`, async () => {
		const prompt = buildMessagePrompt({
			kind,
			applicantName: b.name || user.email.split('@')[0] || '',
			applicantContact: [b.email || user.email, b.phone].filter(Boolean).join(' | '),
			company: app.company,
			jobTitle: app.jobTitle,
			jobDescription: app.jobDescription,
			appliedOn: app.appliedAt ? day.format(app.appliedAt) : '',
			contactName: app.contactName,
			letter: letter?.body ?? '',
			strengths: fit?.requirements.filter((r) => r.status === 'met').map((r) => r.requirement).slice(0, 4) ?? [],
			interview: interview
				? {
						date: day.format(interview.at),
						round: ROUND_LABEL[interview.round as InterviewRound] ?? interview.round,
						interviewers: interview.interviewers,
						topics: interview.topics,
						wentWell: interview.wentWell,
						clarify: interview.clarify,
						rating: interview.rating,
					}
				: undefined,
			details: extra.details,
			language,
		});
		const result = await generateLetter(getEnv(), prompt, 'sonnet', 1200);
		const out = parseMessageOutput(result.text);
		if (!out.body) return { ok: false, error: 'The AI returned an empty email. You were not charged. Try again.' };
		const subject = out.subject || (kind === 'thank_you' ? `Thank you – ${app.jobTitle}` : `Following up – ${app.jobTitle}`);
		const msg = await saveMessage(user.id, app.id, {
			kind,
			interviewId: interview?.id ?? null,
			subject,
			body: out.body,
			mode: 'ai',
			model: result.model,
		});
		return { ok: true, value: msg };
	});
}
