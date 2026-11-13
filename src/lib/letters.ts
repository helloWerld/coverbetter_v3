import 'server-only';
import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '@/lib/cf';
import { letters, type Letter } from '@/db/schema';

/** Letters of one user, newest first. */
export async function listLetters(userId: string): Promise<Letter[]> {
	return getDb()
		.select()
		.from(letters)
		.where(eq(letters.userId, userId))
		.orderBy(desc(letters.createdAt), desc(letters.id));
}

/** One letter, or undefined when it is not this user's. */
export async function getLetter(
	userId: string,
	id: string,
): Promise<Letter | undefined> {
	return getDb().query.letters.findFirst({
		where: and(eq(letters.id, id), eq(letters.userId, userId)),
	});
}

export interface LetterUpdate {
	body?: string;
	template?: string;
	jobTitle?: string;
	company?: string;
}

/** Updates the given fields and sets updatedAt. Returns false when no row matched. */
export async function updateLetter(
	userId: string,
	id: string,
	patch: LetterUpdate,
): Promise<boolean> {
	const set: Partial<typeof letters.$inferInsert> = { updatedAt: new Date() };
	if (patch.body !== undefined) set.body = patch.body;
	if (patch.template !== undefined) set.template = patch.template;
	if (patch.jobTitle !== undefined) set.jobTitle = patch.jobTitle;
	if (patch.company !== undefined) set.company = patch.company;
	const rows = await getDb()
		.update(letters)
		.set(set)
		.where(and(eq(letters.id, id), eq(letters.userId, userId)))
		.returning({ id: letters.id });
	return rows.length > 0;
}

/** Deletes one letter. Returns false when no row matched. */
export async function deleteLetter(
	userId: string,
	id: string,
): Promise<boolean> {
	const rows = await getDb()
		.delete(letters)
		.where(and(eq(letters.id, id), eq(letters.userId, userId)))
		.returning({ id: letters.id });
	return rows.length > 0;
}
