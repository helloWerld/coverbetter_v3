'use server';

import { and, count, eq, gt } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { supportRequests } from '@/db/schema';
import { getDb } from '@/lib/cf';
import { DAILY_LIMIT, validateSupport } from '@/lib/support/validate';
import { requireUser } from '@/lib/user';

export type SupportResult = { ok: true } | { ok: false; error: string };

/** Saves a help request in the database. Only signed-in users get here: middleware protects /dashboard, and requireUser checks again. */
export async function sendSupportAction(formData: FormData): Promise<SupportResult> {
	const user = await requireUser();
	const input = validateSupport(Object.fromEntries(formData.entries()));
	if (!input.ok) return input;

	const db = getDb();
	try {
		const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
		const [{ n }] = await db
			.select({ n: count() })
			.from(supportRequests)
			.where(and(eq(supportRequests.userId, user.id), gt(supportRequests.createdAt, since)));
		if (n >= DAILY_LIMIT) {
			return { ok: false, error: `You sent ${DAILY_LIMIT} requests in the last 24 hours. We read all of them. Wait for our answer, or write to hello@coverbetter.io.` };
		}
		await db.insert(supportRequests).values({ id: crypto.randomUUID(), userId: user.id, email: user.email, ...input.value });
	} catch (e) {
		console.error('support request failed', e);
		return { ok: false, error: 'We could not send your request. Try again, or write to hello@coverbetter.io.' };
	}
	revalidatePath('/dashboard/support');
	revalidatePath('/dashboard/admin');
	return { ok: true };
}
