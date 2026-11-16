'use server';

import { revalidatePath } from 'next/cache';
import type { FitResult } from '@/lib/fit';
import { getApplication, linkToApplication } from '@/lib/applications/db';
import type { PaidAiErrorCode } from '@/lib/paid-ai';
import type { TailoredSelection } from '@/lib/profile/types';
import { saveTailoredResume, tailorWithAi } from '@/lib/tailor';
import { requireUser } from '@/lib/user';

export type SaveTailoredOutcome = { ok: true; resumeId: string } | { ok: false; error: string };

export type TailorAiOutcome =
	| { ok: true; selection: TailoredSelection; resumeId: string; letterId: string | null; fit: FitResult | null }
	| { ok: false; error: string; code: PaidAiErrorCode };

export async function saveTailoredAction(
	applicationId: string,
	resumeId: string | null,
	title: string,
	selectionJson: string,
): Promise<SaveTailoredOutcome> {
	try {
		const user = await requireUser();
		const app = await getApplication(user.id, applicationId);
		if (!app) return { ok: false, error: 'We could not find that application.' };
		const row = await saveTailoredResume(user.id, {
			resumeId,
			applicationId: app.id,
			title,
			selection: JSON.parse(selectionJson),
		});
		await linkToApplication(user.id, app.id, { resumeId: row.id });
		revalidatePath('/dashboard/resumes');
		revalidatePath(`/dashboard/applications/${app.id}`);
		return { ok: true, resumeId: row.id };
	} catch (e) {
		return { ok: false, error: e instanceof Error && e.message.startsWith('You have too many') ? e.message : 'We could not save the resume. Try again.' };
	}
}

export async function tailorWithAiAction(applicationId: string): Promise<TailorAiOutcome> {
	const user = await requireUser();
	const out = await tailorWithAi(user, applicationId);
	if (!out.ok) return { ok: false, error: out.error, code: out.code };
	revalidatePath('/dashboard/resumes');
	revalidatePath(`/dashboard/applications/${applicationId}`);
	return { ok: true, ...out.value };
}
