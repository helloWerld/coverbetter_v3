/** Display data for the purchase cards. No Stripe import, so client code can use it. */
export type ProductKey = 'pack5' | 'pack15' | 'pro';

export const PACK_DISPLAY = {
	pack5: { credits: 5, priceCents: 500 },
	pack15: { credits: 15, priceCents: 1200 },
} as const;

export const PRO_PRICE_CENTS = 1900;
export const PRO_FAIR_USE_CAP = 200;
export const FREE_LETTERS = 3;

export function formatUsd(cents: number): string {
	const whole = cents % 100 === 0;
	return `$${(cents / 100).toFixed(whole ? 0 : 2)}`;
}

/** Price for one letter in a pack, for example "$0.80 per letter". */
export function perLetterLabel(priceCents: number, credits: number): string {
	return `$${(priceCents / credits / 100).toFixed(2)} per letter`;
}

export function isProductKey(value: unknown): value is ProductKey {
	return value === 'pack5' || value === 'pack15' || value === 'pro';
}
