'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
	MAX_TEXT_CHARS,
	MESSAGES,
	MIN_PASTE_CHARS,
} from '@/lib/resume-limit';
import {
	ResumeLimitError,
	createResume,
	deleteResume,
	updateResume,
} from '@/lib/resumes';
import { requireUser } from '@/lib/user';

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

const title = z.string().trim().min(1, 'Add a title.').max(100, 'Use 100 characters or fewer for the title.');
const text = z
	.string()
	.trim()
	.min(MIN_PASTE_CHARS, `Add at least ${MIN_PASTE_CHARS} characters of resume text.`)
	.max(MAX_TEXT_CHARS, `Use ${MAX_TEXT_CHARS.toLocaleString('en-US')} characters or fewer.`);
const idSchema = z.string().min(1).max(100);

function firstIssue(err: z.ZodError): string {
	return err.issues[0]?.message ?? MESSAGES.generic;
}

function refresh() {
	revalidatePath('/dashboard/resumes');
	revalidatePath('/dashboard');
}

export async function pasteResumeAction(input: {
	title: string;
	text: string;
}): Promise<ActionResult> {
	const parsed = z.object({ title, text }).safeParse(input);
	if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
	const user = await requireUser();
	try {
		const row = await createResume(user.id, parsed.data);
		refresh();
		return { ok: true, id: row.id };
	} catch (err) {
		if (err instanceof ResumeLimitError) return { ok: false, error: MESSAGES.limit };
		return { ok: false, error: MESSAGES.generic };
	}
}

export async function updateResumeAction(input: {
	id: string;
	title?: string;
	text?: string;
}): Promise<ActionResult> {
	const parsed = z
		.object({ id: idSchema, title: title.optional(), text: text.optional() })
		.safeParse(input);
	if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
	const user = await requireUser();
	const { id, ...patch } = parsed.data;
	const row = await updateResume(user.id, id, patch);
	if (!row) return { ok: false, error: 'This resume no longer exists.' };
	refresh();
	return { ok: true, id };
}

export async function deleteResumeAction(input: { id: string }): Promise<ActionResult> {
	const parsed = z.object({ id: idSchema }).safeParse(input);
	if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
	const user = await requireUser();
	await deleteResume(user.id, parsed.data.id);
	refresh();
	return { ok: true };
}
