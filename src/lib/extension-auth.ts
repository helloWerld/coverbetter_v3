import 'server-only';
import { and, desc, eq, notInArray } from 'drizzle-orm';
import { extensionTokens, users, type User } from '@/db/schema';
import { getDb } from '@/lib/cf';
import { bearerToken, hashToken, newToken } from '@/lib/extension-token';

/** One user can connect this many browsers at the same time. */
export const MAX_TOKENS_PER_USER = 5;

/** Makes a token for the user and removes the oldest ones over the limit. */
export async function createExtensionToken(userId: string): Promise<string> {
	const db = getDb();
	const token = newToken();
	await db.insert(extensionTokens).values({
		id: crypto.randomUUID(),
		userId,
		tokenHash: await hashToken(token),
	});

	const keep = await db
		.select({ id: extensionTokens.id })
		.from(extensionTokens)
		.where(eq(extensionTokens.userId, userId))
		.orderBy(desc(extensionTokens.createdAt), desc(extensionTokens.id))
		.limit(MAX_TOKENS_PER_USER);
	await db.delete(extensionTokens).where(
		and(
			eq(extensionTokens.userId, userId),
			notInArray(
				extensionTokens.id,
				keep.map((k) => k.id),
			),
		),
	);
	return token;
}

/** The user for the request's bearer token, or null. */
export async function userFromRequest(req: Request): Promise<{ user: User; tokenHash: string } | null> {
	const token = bearerToken(req.headers.get('authorization'));
	if (!token) return null;
	const tokenHash = await hashToken(token);
	const db = getDb();
	const row = await db.query.extensionTokens.findFirst({
		where: eq(extensionTokens.tokenHash, tokenHash),
	});
	if (!row) return null;
	const user = await db.query.users.findFirst({ where: eq(users.id, row.userId) });
	if (!user) return null;
	await db
		.update(extensionTokens)
		.set({ lastUsedAt: new Date() })
		.where(eq(extensionTokens.id, row.id));
	return { user, tokenHash };
}

/** Deletes one token. */
export async function revokeExtensionToken(tokenHash: string): Promise<void> {
	await getDb().delete(extensionTokens).where(eq(extensionTokens.tokenHash, tokenHash));
}

/** Deletes every token of the user, for example on account deletion. */
export async function revokeAllExtensionTokens(userId: string): Promise<void> {
	await getDb().delete(extensionTokens).where(eq(extensionTokens.userId, userId));
}

/** JSON response that no cache keeps. */
export function json(data: unknown, status = 200): Response {
	return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

export const UNAUTHORIZED = () =>
	json({ error: 'Connect the extension to your CoverBetter account again.', code: 'unauthorized' }, 401);
