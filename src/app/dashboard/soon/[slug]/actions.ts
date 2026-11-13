'use server';

import { getDb } from '@/lib/cf';
import { requireUser } from '@/lib/user';
import { waitlist } from '@/db/schema';
import { getSoonFeature, isValidEmail } from '@/lib/soon';

export type WaitlistState = {
	status: 'idle' | 'ok' | 'error';
	message: string;
};

export async function joinWaitlist(
	_prev: WaitlistState,
	formData: FormData,
): Promise<WaitlistState> {
	await requireUser();

	const slug = String(formData.get('feature') ?? '');
	const email = String(formData.get('email') ?? '')
		.trim()
		.toLowerCase();

	if (!getSoonFeature(slug)) {
		return { status: 'error', message: 'This feature does not exist.' };
	}
	if (!isValidEmail(email)) {
		return { status: 'error', message: 'Enter a valid email address.' };
	}

	try {
		// A second sign-up with the same email and feature is not an error.
		await getDb()
			.insert(waitlist)
			.values({ email, feature: slug })
			.onConflictDoNothing();
	} catch {
		return {
			status: 'error',
			message: 'We could not save your email. Try again.',
		};
	}
	return { status: 'ok', message: 'Saved. We will email you when it is ready.' };
}
