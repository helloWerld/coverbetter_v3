import { describe, expect, it } from 'vitest';
import { isAdminEmail } from './admin-email';

describe('isAdminEmail', () => {
	it('accepts the admin email in any case', () => {
		expect(isAdminEmail('hello@russelltrzaska.com')).toBe(true);
		expect(isAdminEmail(' Hello@RussellTrzaska.com ')).toBe(true);
	});
	it('refuses other emails and empty values', () => {
		expect(isAdminEmail('hello@russelltrzaska.com.evil.io')).toBe(false);
		expect(isAdminEmail('someone@example.com')).toBe(false);
		expect(isAdminEmail('')).toBe(false);
		expect(isAdminEmail(null)).toBe(false);
	});
});
