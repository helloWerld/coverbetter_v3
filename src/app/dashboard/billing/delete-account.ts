'use server';

import { redirect } from 'next/navigation';
import { clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { extensionTokens, letters, resumes, users, waitlist } from '@/db/schema';
import { getDb, getEnv } from '@/lib/cf';
import { requireUser } from '@/lib/user';
import { getStripe, isStripeConfigured } from '@/lib/billing';

export type DeleteState = { error?: string } | null;

/** Deletes the account and all data, then sends the person to the homepage. */
export async function deleteAccountAction(
	_prev: DeleteState,
	formData: FormData,
): Promise<DeleteState> {
	if (formData.get('confirm') !== 'DELETE') {
		return { error: 'Type DELETE in capital letters to confirm.' };
	}

	const user = await requireUser();
	const env = getEnv();
	const db = getDb();

	try {
		// 1. Stop billing first, so nobody pays for an account that is gone.
		if (user.stripeCustomerId && isStripeConfigured(env)) {
			const stripe = getStripe(env);
			const subs = await stripe.subscriptions.list({
				customer: user.stripeCustomerId,
				status: 'all',
			});
			for (const sub of subs.data) {
				if (['active', 'trialing', 'past_due', 'unpaid'].includes(sub.status)) {
					await stripe.subscriptions.cancel(sub.id);
				}
			}
		}

		// 2. Resume files in R2.
		const prefix = `resumes/${user.id}/`;
		let cursor: string | undefined;
		do {
			const page = await env.RESUMES.list({ prefix, cursor });
			if (page.objects.length) {
				await env.RESUMES.delete(page.objects.map((o) => o.key));
			}
			cursor = page.truncated ? page.cursor : undefined;
		} while (cursor);

		// 3. Database rows.
		await db.delete(extensionTokens).where(eq(extensionTokens.userId, user.id));
		await db.delete(letters).where(eq(letters.userId, user.id));
		await db.delete(resumes).where(eq(resumes.userId, user.id));
		if (user.email) await db.delete(waitlist).where(eq(waitlist.email, user.email));
		await db.delete(users).where(eq(users.id, user.id));

		// 4. The sign-in account.
		await (await clerkClient()).users.deleteUser(user.id);
	} catch (err) {
		console.error('Account deletion failed', err);
		return {
			error:
				'We could not delete everything. Try again. If it keeps failing, email support.',
		};
	}

	redirect('/');
}
