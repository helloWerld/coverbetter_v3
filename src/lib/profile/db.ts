import 'server-only';
import { eq } from 'drizzle-orm';
import { profiles } from '@/db/schema';
import { getDb } from '@/lib/cf';
import { emptyProfile, profileSchema, type Profile } from './types';

/** The user's career profile. An empty profile when there is none yet or the stored JSON is bad. */
export async function getProfile(userId: string): Promise<Profile> {
	const row = await getDb().query.profiles.findFirst({ where: eq(profiles.userId, userId) });
	if (!row) return emptyProfile();
	try {
		const parsed = profileSchema.safeParse(JSON.parse(row.json));
		return parsed.success ? parsed.data : emptyProfile();
	} catch {
		return emptyProfile();
	}
}

export async function hasProfile(userId: string): Promise<boolean> {
	const row = await getDb().query.profiles.findFirst({ where: eq(profiles.userId, userId), columns: { userId: true } });
	return Boolean(row);
}

/** Checks and saves the whole profile. Throws a ZodError when the data is not valid. */
export async function saveProfile(userId: string, raw: unknown): Promise<Profile> {
	const profile = profileSchema.parse(raw);
	const json = JSON.stringify(profile);
	if (json.length > 400_000) throw new Error('The profile is too large.');
	await getDb()
		.insert(profiles)
		.values({ userId, json, updatedAt: new Date() })
		.onConflictDoUpdate({ target: profiles.userId, set: { json, updatedAt: new Date() } });
	return profile;
}

export async function deleteProfile(userId: string): Promise<void> {
	await getDb().delete(profiles).where(eq(profiles.userId, userId));
}
