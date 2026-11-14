import { describe, expect, it } from 'vitest';
import { paymentsOpenFor } from './billing';

const base = {
	STRIPE_PRICE_LETTER: 'price_letter',
	STRIPE_PRICE_PRO: 'price_pro',
	APP_URL: 'https://coverbetter.io',
	MODEL_PICKER_EMAILS: 'owner@example.com',
};

describe('paymentsOpenFor', () => {
	it('is closed when Stripe is not configured', () => {
		expect(paymentsOpenFor({ ...base, STRIPE_SECRET_KEY: '' }, 'owner@example.com')).toBe(false);
	});
	it('opens live keys to everyone', () => {
		const env = { ...base, STRIPE_SECRET_KEY: 'sk_live_x' };
		expect(paymentsOpenFor(env, 'anyone@example.com')).toBe(true);
	});
	it('opens test keys only to the test accounts', () => {
		const env = { ...base, STRIPE_SECRET_KEY: 'sk_test_x' };
		expect(paymentsOpenFor(env, 'owner@example.com')).toBe(true);
		expect(paymentsOpenFor(env, 'anyone@example.com')).toBe(false);
	});
	it('treats restricted test keys like test keys', () => {
		const env = { ...base, STRIPE_SECRET_KEY: 'rk_test_x' };
		expect(paymentsOpenFor(env, 'anyone@example.com')).toBe(false);
	});
});
