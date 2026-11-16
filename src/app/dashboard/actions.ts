'use server';

import { generateForUser, type GenerateErrorCode } from '@/lib/generate';
import { requireUser } from '@/lib/user';

export type GenerateResult =
	| { ok: true; letterId: string; applicationId: string }
	| { ok: false; error: string; code?: GenerateErrorCode };

export async function generateLetterAction(
	formData: FormData,
): Promise<GenerateResult> {
	const user = await requireUser();
	const out = await generateForUser(user, {
		resumeId: formData.get('resumeId'),
		resumeText: formData.get('resumeText') ?? '',
		jobDescription: formData.get('jobDescription') ?? '',
		tone: formData.get('tone'),
		length: formData.get('length'),
		language: formData.get('language') ?? undefined,
		model: formData.get('model'),
		applicationId: formData.get('applicationId') ?? undefined,
	});
	return out.ok ? { ok: true, letterId: out.letterId, applicationId: out.applicationId } : out;
}
