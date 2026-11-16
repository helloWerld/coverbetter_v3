'use server';

import { revalidatePath } from 'next/cache';
import { saveSettings } from '@/lib/applications/db';
import { requireUser } from '@/lib/user';

export async function saveSettingsAction(formData: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
	const user = await requireUser();
	try {
		await saveSettings(user.id, Object.fromEntries(formData.entries()));
	} catch (e) {
		console.error('saveSettings failed', e);
		return { ok: false, error: 'We could not save your settings. Try again.' };
	}
	revalidatePath('/dashboard', 'layout');
	return { ok: true };
}
