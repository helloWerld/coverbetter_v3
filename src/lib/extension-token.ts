/**
 * Token helpers for the Chrome extension. Pure functions, so they run in
 * tests and on the Worker. The database keeps only the hash of a token.
 */

export const TOKEN_PREFIX = 'cbx_';

/** A new random token: the prefix and 32 random bytes in base64url. */
export function newToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	let bin = '';
	for (const b of bytes) bin += String.fromCharCode(b);
	return TOKEN_PREFIX + btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** SHA-256 of the token as lowercase hex. */
export async function hashToken(token: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
	return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** The token from an `Authorization: Bearer cbx_...` header, or null. */
export function bearerToken(header: string | null | undefined): string | null {
	if (!header) return null;
	const m = /^Bearer\s+(\S+)$/i.exec(header.trim());
	if (!m) return null;
	const token = m[1];
	if (!token.startsWith(TOKEN_PREFIX) || token.length < TOKEN_PREFIX.length + 40 || token.length > 100) {
		return null;
	}
	return token;
}
