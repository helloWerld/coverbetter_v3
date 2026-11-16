'use server';

import { revalidatePath } from 'next/cache';
import { runFitCheck, type FitCheckOutcome } from '@/lib/fit-check';
import { requireUser } from '@/lib/user';

export async function fitCheckAction(formData: FormData): Promise<FitCheckOutcome> {
	const user = await requireUser();
	const out = await runFitCheck(user, {
		resumeId: formData.get('resumeId'),
		jobDescription: formData.get('jobDescription'),
	});
	if (out.ok) revalidatePath('/dashboard/fit-score');
	return out;
}

/** Checks one saved application. The batch form calls this once for each selected role. */
export async function fitCheckRoleAction(applicationId: string, resumeId: string): Promise<FitCheckOutcome> {
	const user = await requireUser();
	const out = await runFitCheck(user, { resumeId, applicationId });
	return out;
}
