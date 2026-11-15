import { UNAUTHORIZED, json, revokeExtensionToken, userFromRequest } from '@/lib/extension-auth';

/** Disconnects this browser: deletes the token that made the request. */
export async function DELETE(req: Request) {
	const auth = await userFromRequest(req);
	if (!auth) return UNAUTHORIZED();
	await revokeExtensionToken(auth.tokenHash);
	return json({ ok: true });
}
