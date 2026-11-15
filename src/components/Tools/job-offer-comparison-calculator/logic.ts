/** All fields are text, so they save and edit as the user types them. */
export type OfferInput = {
	name: string;
	base: string;
	bonus: string;
	equity: string;
	matchPct: string;
	matchCapPct: string;
	benefits: string;
	ptoDays: string;
	daysInOffice: string;
	commuteCostPerDay: string;
	commuteWeeks: string;
};

export const EMPTY_OFFER: OfferInput = {
	name: '',
	base: '',
	bonus: '',
	equity: '',
	matchPct: '',
	matchCapPct: '',
	benefits: '',
	ptoDays: '',
	daysInOffice: '',
	commuteCostPerDay: '',
	commuteWeeks: '48',
};

/** Working days in a year with no time off: 52 weeks of 5 days. */
export const WORK_DAYS_PER_YEAR = 260;

/** Reads "60,000" or "$60,000.50". Empty text counts as 0. Invalid or negative text also counts as 0. */
export function parseAmount(text: string): number {
	const cleaned = text.replace(/[$,%\s]/g, '');
	if (cleaned === '') return 0;
	const n = Number(cleaned);
	return Number.isFinite(n) && n >= 0 ? n : 0;
}

export type OfferResult = {
	hasData: boolean;
	base: number;
	bonus: number;
	equity: number;
	match: number;
	benefits: number;
	commute: number;
	total: number;
	workingDays: number;
	perDay: number | null;
};

export function computeOffer(o: OfferInput): OfferResult {
	const base = parseAmount(o.base);
	const bonus = parseAmount(o.bonus);
	const equity = parseAmount(o.equity);
	const benefits = parseAmount(o.benefits);
	const matchPct = parseAmount(o.matchPct);
	const capPct = parseAmount(o.matchCapPct);
	// The match is never more than the cap. An empty cap means no cap.
	const effectivePct = o.matchCapPct.trim() === '' ? matchPct : Math.min(matchPct, capPct);
	const match = (base * effectivePct) / 100;
	const commute = parseAmount(o.daysInOffice) * parseAmount(o.commuteCostPerDay) * parseAmount(o.commuteWeeks);
	const total = base + bonus + equity + match + benefits - commute;
	const workingDays = Math.max(0, WORK_DAYS_PER_YEAR - parseAmount(o.ptoDays));
	const hasData = base > 0 || bonus > 0 || equity > 0 || benefits > 0 || commute > 0;
	return {
		hasData,
		base,
		bonus,
		equity,
		match,
		benefits,
		commute,
		total,
		workingDays,
		perDay: hasData && workingDays > 0 ? total / workingDays : null,
	};
}

/** The difference from the highest total, as 0 or a negative number. Offers without data get null. */
export function differencesFromHighest(results: OfferResult[]): (number | null)[] {
	const totals = results.filter((r) => r.hasData).map((r) => r.total);
	if (totals.length === 0) return results.map(() => null);
	const top = Math.max(...totals);
	return results.map((r) => (r.hasData ? r.total - top : null));
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export function formatMoney(n: number | null): string {
	return n === null || !Number.isFinite(n) ? '-' : money.format(n);
}
