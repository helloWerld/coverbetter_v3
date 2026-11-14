/** Display data for the purchase cards. No Stripe import, so client code can use it. */
export type ProductKey = 'letters' | 'pro';

export const LETTER_PRICE_CENTS = 150;
export const MIN_LETTERS = 1;
export const MAX_LETTERS = 50;

export const PRO_PRICE_CENTS = 1997;
export const PRO_FAIR_USE_CAP = 200;
export const FREE_LETTERS = 3;

export function formatUsd(cents: number): string {
	const whole = cents % 100 === 0;
	return `$${(cents / 100).toFixed(whole ? 0 : 2)}`;
}

export function lettersTotalCents(n: number): number {
	return n * LETTER_PRICE_CENTS;
}

/** An integer from 1 to 50, or null. Accepts a number or a plain digit string. */
export function parseLetterQuantity(value: unknown): number | null {
	const n =
		typeof value === 'number'
			? value
			: typeof value === 'string' && /^\d+$/.test(value.trim())
				? Number(value)
				: NaN;
	return Number.isInteger(n) && n >= MIN_LETTERS && n <= MAX_LETTERS ? n : null;
}

export function isProductKey(value: unknown): value is ProductKey {
	return value === 'letters' || value === 'pro';
}
