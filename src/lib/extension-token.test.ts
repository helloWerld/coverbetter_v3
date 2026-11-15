import { describe, expect, it } from 'vitest';
import { TOKEN_PREFIX, bearerToken, hashToken, newToken } from './extension-token';

describe('extension tokens', () => {
	it('makes a different url-safe token each time', () => {
		const a = newToken();
		const b = newToken();
		expect(a).not.toBe(b);
		expect(a.startsWith(TOKEN_PREFIX)).toBe(true);
		expect(a).toMatch(/^cbx_[A-Za-z0-9_-]{43}$/);
	});

	it('hashes to 64 hex characters, the same for the same token', async () => {
		const t = newToken();
		const h = await hashToken(t);
		expect(h).toMatch(/^[0-9a-f]{64}$/);
		expect(await hashToken(t)).toBe(h);
		expect(await hashToken(newToken())).not.toBe(h);
	});

	it('reads a bearer header', () => {
		const t = newToken();
		expect(bearerToken(`Bearer ${t}`)).toBe(t);
		expect(bearerToken(`bearer   ${t}  `)).toBe(t);
	});

	it('rejects bad headers', () => {
		expect(bearerToken(null)).toBeNull();
		expect(bearerToken('')).toBeNull();
		expect(bearerToken('Basic abc')).toBeNull();
		expect(bearerToken('Bearer sk_live_abcdefghijklmnopqrstuvwxyz0123456789abcdef')).toBeNull();
		expect(bearerToken('Bearer cbx_short')).toBeNull();
		expect(bearerToken(`Bearer cbx_${'a'.repeat(200)}`)).toBeNull();
		expect(bearerToken(`Bearer ${newToken()} extra`)).toBeNull();
	});
});
