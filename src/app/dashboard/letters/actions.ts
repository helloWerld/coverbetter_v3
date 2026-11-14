'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { UPGRADE_MESSAGE, hasPaidFeatures } from '@/lib/access';
import { requireUser } from '@/lib/user';
import { deleteLetter, updateLetter } from '@/lib/letters';
import { TEMPLATE_IDS } from '@/lib/templates';

export type ActionResult = { ok: true } | { ok: false; error: string };

const id = z.string().min(1).max(64);

const saveSchema = z.object({
	id,
	body: z.string().min(1, 'The letter is empty.').max(20000),
	jobTitle: z.string().max(200).optional(),
	company: z.string().max(200).optional(),
});

/** Saves the letter text and the job fields. */
export async function saveLetter(
	input: z.input<typeof saveSchema>,
): Promise<ActionResult> {
	const parsed = saveSchema.safeParse(input);
	if (!parsed.success)
		return { ok: false, error: parsed.error.issues[0]?.message ?? 'Bad input.' };
	const user = await requireUser();
	// Editing is a paid feature.
	if (!hasPaidFeatures(user, new Date())) return { ok: false, error: UPGRADE_MESSAGE };
	const { id: letterId, ...patch } = parsed.data;
	const done = await updateLetter(user.id, letterId, {
		...patch,
		jobTitle: patch.jobTitle?.trim(),
		company: patch.company?.trim(),
	});
	if (!done) return { ok: false, error: 'Letter not found.' };
	revalidatePath('/dashboard/letters');
	return { ok: true };
}

const templateSchema = z.object({ id, template: z.enum(TEMPLATE_IDS) });

/** Saves the chosen template. */
export async function setLetterTemplate(
	input: z.input<typeof templateSchema>,
): Promise<ActionResult> {
	const parsed = templateSchema.safeParse(input);
	if (!parsed.success) return { ok: false, error: 'Unknown template.' };
	const user = await requireUser();
	// Templates are a paid feature.
	if (!hasPaidFeatures(user, new Date())) return { ok: false, error: UPGRADE_MESSAGE };
	const done = await updateLetter(user.id, parsed.data.id, {
		template: parsed.data.template,
	});
	if (!done) return { ok: false, error: 'Letter not found.' };
	revalidatePath('/dashboard/letters');
	return { ok: true };
}

/** Deletes a letter. */
export async function removeLetter(letterId: string): Promise<ActionResult> {
	const parsed = id.safeParse(letterId);
	if (!parsed.success) return { ok: false, error: 'Bad id.' };
	const user = await requireUser();
	const done = await deleteLetter(user.id, parsed.data);
	if (!done) return { ok: false, error: 'Letter not found.' };
	revalidatePath('/dashboard/letters');
	return { ok: true };
}
