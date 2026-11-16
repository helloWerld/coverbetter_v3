'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
	addInterview,
	createApplication,
	deleteApplication,
	deleteInterview,
	deleteMessage,
	getApplication,
	getInterview,
	markMessageSent,
	saveMessage,
	setStatus,
	updateApplication,
	updateInterview,
	updateMessage,
} from '@/lib/applications/db';
import { applicationInput, formDate, interviewInput, statusInput } from '@/lib/applications/input';
import { MESSAGE_KINDS, type MessageKind } from '@/lib/applications/types';
import { writeMessageWithAi } from '@/lib/messages/ai';
import type { PaidAiErrorCode } from '@/lib/paid-ai';
import { requireUser } from '@/lib/user';

type Result = { ok: true } | { ok: false; error: string };

function refresh(id?: string) {
	revalidatePath('/dashboard/applications');
	revalidatePath('/dashboard/analytics');
	if (id) revalidatePath(`/dashboard/applications/${id}`);
}

function readApp(formData: FormData) {
	return applicationInput.parse({
		company: formData.get('company') ?? '',
		jobTitle: formData.get('jobTitle') ?? '',
		jobUrl: formData.get('jobUrl') ?? '',
		source: formData.get('source') ?? 'other',
		jobDescription: formData.get('jobDescription') ?? '',
		notes: formData.get('notes') ?? '',
		contactName: formData.get('contactName') ?? '',
		contactEmail: formData.get('contactEmail') ?? '',
	});
}

export async function createApplicationAction(formData: FormData): Promise<{ ok: false; error: string } | never> {
	const user = await requireUser();
	const input = readApp(formData);
	if (!input.company && !input.jobTitle) return { ok: false, error: 'Add a company or a job title.' };
	const status = statusInput.safeParse(formData.get('status'));
	const app = await createApplication(user.id, input, { status: status.success ? status.data : 'saved' });
	refresh();
	redirect(`/dashboard/applications/${app.id}`);
}

export async function updateApplicationAction(id: string, formData: FormData): Promise<Result> {
	const user = await requireUser();
	const input = readApp(formData);
	if (!input.company && !input.jobTitle) return { ok: false, error: 'Add a company or a job title.' };
	const ok = await updateApplication(user.id, id, input);
	refresh(id);
	return ok ? { ok: true } : { ok: false, error: 'We could not find that application.' };
}

export async function setStatusAction(id: string, status: string, date?: string): Promise<Result> {
	const user = await requireUser();
	const parsed = statusInput.safeParse(status);
	if (!parsed.success) return { ok: false, error: 'Pick a valid status.' };
	const at = formDate.parse(date) ?? new Date();
	const ok = await setStatus(user.id, id, parsed.data, at);
	refresh(id);
	return ok ? { ok: true } : { ok: false, error: 'We could not find that application.' };
}

export async function deleteApplicationAction(id: string): Promise<void> {
	const user = await requireUser();
	await deleteApplication(user.id, id);
	refresh();
	redirect('/dashboard/applications');
}

function readInterview(formData: FormData) {
	return interviewInput.parse({
		at: formData.get('at'),
		round: formData.get('round'),
		format: formData.get('format'),
		interviewers: formData.get('interviewers') ?? '',
		topics: formData.get('topics') ?? '',
		wentWell: formData.get('wentWell') ?? '',
		clarify: formData.get('clarify') ?? '',
		rating: formData.get('rating') ?? 0,
	});
}

export async function saveInterviewAction(applicationId: string, interviewId: string | null, formData: FormData): Promise<Result> {
	const user = await requireUser();
	const input = readInterview(formData);
	if (!input.at) return { ok: false, error: 'Add the date of the interview.' };
	const ok = interviewId ? await updateInterview(user.id, interviewId, input) : Boolean(await addInterview(user.id, applicationId, input));
	refresh(applicationId);
	return ok ? { ok: true } : { ok: false, error: 'We could not save the interview.' };
}

export async function deleteInterviewAction(applicationId: string, interviewId: string): Promise<Result> {
	const user = await requireUser();
	await deleteInterview(user.id, interviewId);
	refresh(applicationId);
	return { ok: true };
}

const isKind = (k: string): k is MessageKind => (MESSAGE_KINDS as readonly string[]).includes(k);

/** Saves a template letter as a draft. Free. */
export async function saveTemplateMessageAction(
	applicationId: string,
	kind: string,
	interviewId: string | null,
	subject: string,
	body: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
	const user = await requireUser();
	if (!isKind(kind)) return { ok: false, error: 'Pick a letter type.' };
	const app = await getApplication(user.id, applicationId);
	if (!app) return { ok: false, error: 'We could not find that application.' };
	if (interviewId) {
		const iv = await getInterview(user.id, interviewId);
		if (!iv || iv.applicationId !== app.id) interviewId = null;
	}
	if (!body.trim()) return { ok: false, error: 'The letter is empty.' };
	const msg = await saveMessage(user.id, app.id, { kind, interviewId, subject, body, mode: 'template' });
	refresh(app.id);
	return { ok: true, id: msg.id };
}

/** Writes the letter with AI. 1 credit, only when it works. */
export async function writeMessageWithAiAction(
	applicationId: string,
	kind: string,
	interviewId: string | null,
): Promise<{ ok: true; id: string } | { ok: false; error: string; code?: PaidAiErrorCode }> {
	const user = await requireUser();
	if (!isKind(kind)) return { ok: false, error: 'Pick a letter type.' };
	const out = await writeMessageWithAi(user, applicationId, kind, interviewId ?? undefined);
	refresh(applicationId);
	return out.ok ? { ok: true, id: out.value.id } : { ok: false, error: out.error, code: out.code };
}

export async function updateMessageAction(applicationId: string, id: string, subject: string, body: string): Promise<Result> {
	const user = await requireUser();
	const ok = await updateMessage(user.id, id, subject, body);
	refresh(applicationId);
	return ok ? { ok: true } : { ok: false, error: 'We could not save the letter.' };
}

export async function markMessageSentAction(applicationId: string, id: string): Promise<Result> {
	const user = await requireUser();
	const ok = await markMessageSent(user.id, id);
	refresh(applicationId);
	return ok ? { ok: true } : { ok: false, error: 'We could not find that letter.' };
}

export async function deleteMessageAction(applicationId: string, id: string): Promise<Result> {
	const user = await requireUser();
	await deleteMessage(user.id, id);
	refresh(applicationId);
	return { ok: true };
}
