import 'server-only';
import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/cf';
import { users, type User } from '@/db/schema';

/**
 * Returns the signed-in user's row. Creates or refreshes it from Clerk.
 * Throws when nobody is signed in. Middleware already protects /dashboard.
 */
export async function requireUser(): Promise<User> {
	const { userId } = await auth();
	if (!userId) throw new Error('Not signed in');

	const clerkUser = await currentUser();
	const email =
		clerkUser?.primaryEmailAddress?.emailAddress ??
		clerkUser?.emailAddresses[0]?.emailAddress ??
		'';

	const db = getDb();
	await db
		.insert(users)
		.values({ id: userId, email })
		.onConflictDoUpdate({
			target: users.id,
			// Keep the old email when Clerk gives none.
			set: email ? { email } : { id: userId },
		});

	const row = await db.query.users.findFirst({ where: eq(users.id, userId) });
	if (!row) throw new Error('User row missing after upsert');
	return row;
}
