'use server';

import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import { saveProfile } from '@/lib/profile/db';
import { requireUser } from '@/lib/user';

export type SaveOutcome = { ok: true; savedAt: string } | { ok: false; error: string };

/** A short message from the first zod issue. Array positions start at 1. */
function describe(err: ZodError): string {
	const issue = err.issues[0];
	if (!issue) return 'The profile has a mistake.';
	const where = issue.path.map((p) => (typeof p === 'number' ? String(p + 1) : String(p))).join(' ');
	return where ? `Check ${where}: ${issue.message}` : issue.message;
}

export async function saveProfileAction(json: string): Promise<SaveOutcome> {
	const user = await requireUser();
	let raw: unknown;
	try {
		raw = JSON.parse(json);
	} catch {
		return { ok: false, error: 'The data was not valid. Reload the page and try again.' };
	}
	try {
		await saveProfile(user.id, raw);
	} catch (err) {
		if (err instanceof ZodError) return { ok: false, error: describe(err) };
		if (err instanceof Error && err.message === 'The profile is too large.') return { ok: false, error: err.message };
		return { ok: false, error: 'The profile did not save. Try again.' };
	}
	revalidatePath('/dashboard/profile');
	return { ok: true, savedAt: new Date().toISOString() };
}
