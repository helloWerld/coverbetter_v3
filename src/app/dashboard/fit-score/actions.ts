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
