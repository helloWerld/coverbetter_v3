'use server';

import { revalidatePath } from 'next/cache';
import type { PaidAiErrorCode } from '@/lib/paid-ai';
import type { PrepPackData } from '@/lib/prep/ai-prompt';
import { makePrepPack, saveAnswer } from '@/lib/prep/db';
import { requireUser } from '@/lib/user';

export type MakePackOutcome =
	| { ok: true; data: PrepPackData; createdAt: string }
	| { ok: false; error: string; code: PaidAiErrorCode };

export async function makePrepPackAction(applicationId: string): Promise<MakePackOutcome> {
	const user = await requireUser();
	const out = await makePrepPack(user, applicationId);
	if (!out.ok) return { ok: false, error: out.error, code: out.code };
	revalidatePath(`/dashboard/applications/${applicationId}/prep`);
	return { ok: true, data: out.value.data, createdAt: out.value.createdAt.toISOString() };
}

export type SaveAnswerOutcome = { ok: true } | { ok: false; error: string };

export async function saveAnswerAction(
	applicationId: string,
	questionId: string,
	question: string,
	json: string,
): Promise<SaveAnswerOutcome> {
	const user = await requireUser();
	if (typeof questionId !== 'string' || !questionId || typeof question !== 'string' || typeof json !== 'string') {
		return { ok: false, error: 'The answer is not valid.' };
	}
	try {
		JSON.parse(json);
	} catch {
		return { ok: false, error: 'The answer is not valid.' };
	}
	try {
		await saveAnswer(user.id, applicationId, { questionId, question, json });
	} catch {
		return { ok: false, error: 'We could not save the answer. Try again.' };
	}
	revalidatePath(`/dashboard/applications/${applicationId}/prep`);
	return { ok: true };
}
