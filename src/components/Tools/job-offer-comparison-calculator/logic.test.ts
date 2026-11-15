import { describe, expect, it } from 'vitest';
import { EMPTY_OFFER, computeOffer, differencesFromHighest, formatMoney, parseAmount, type OfferInput } from './logic';

const offer = (o: Partial<OfferInput>): OfferInput => ({ ...EMPTY_OFFER, ...o });

describe('parseAmount', () => {
	it('reads money text', () => {
		expect(parseAmount('$90,000')).toBe(90000);
		expect(parseAmount('4%')).toBe(4);
	});
	it('gives 0 for empty, invalid, and negative text', () => {
		expect(parseAmount('')).toBe(0);
		expect(parseAmount('x')).toBe(0);
		expect(parseAmount('-4')).toBe(0);
	});
});

describe('computeOffer', () => {
	it('adds base, bonus, equity, match, and benefits, and subtracts commute', () => {
		const r = computeOffer(
			offer({
				base: '100,000',
				bonus: '10000',
				equity: '5000',
				matchPct: '4',
				matchCapPct: '6',
				benefits: '3000',
				ptoDays: '20',
				daysInOffice: '3',
				commuteCostPerDay: '10',
				commuteWeeks: '48',
			}),
		);
		expect(r.match).toBe(4000);
		expect(r.commute).toBe(1440);
		expect(r.total).toBe(100000 + 10000 + 5000 + 4000 + 3000 - 1440);
		expect(r.workingDays).toBe(240);
		expect(r.perDay).toBeCloseTo(r.total / 240, 6);
	});
	it('caps the match at the cap percent', () => {
		expect(computeOffer(offer({ base: '100000', matchPct: '8', matchCapPct: '5' })).match).toBe(5000);
	});
	it('does not cap when the cap is empty', () => {
		expect(computeOffer(offer({ base: '100000', matchPct: '3' })).match).toBe(3000);
	});
	it('returns no value per day for an empty offer', () => {
		const r = computeOffer(EMPTY_OFFER);
		expect(r.hasData).toBe(false);
		expect(r.total).toBe(0);
		expect(r.perDay).toBeNull();
	});
	it('handles PTO above the working days', () => {
		const r = computeOffer(offer({ base: '50000', ptoDays: '300' }));
		expect(r.workingDays).toBe(0);
		expect(r.perDay).toBeNull();
	});
	it('handles very large numbers', () => {
		expect(Number.isFinite(computeOffer(offer({ base: '1e12' })).total)).toBe(true);
	});
});

describe('differencesFromHighest', () => {
	it('gives 0 for the best offer and negative numbers for the others', () => {
		const rs = [computeOffer(offer({ base: '90000' })), computeOffer(offer({ base: '100000' })), computeOffer(EMPTY_OFFER)];
		expect(differencesFromHighest(rs)).toEqual([-10000, 0, null]);
	});
	it('gives null for all empty offers', () => {
		expect(differencesFromHighest([computeOffer(EMPTY_OFFER)])).toEqual([null]);
	});
});

describe('formatMoney', () => {
	it('formats numbers and shows a dash for null', () => {
		expect(formatMoney(1234)).toBe('$1,234');
		expect(formatMoney(null)).toBe('-');
		expect(formatMoney(NaN)).toBe('-');
	});
});
