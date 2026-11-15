/** Reads "60,000" or "$60,000.50". Returns null for empty or invalid text. */
export function parseMoney(text: string): number | null {
	const cleaned = text.replace(/[$,\s]/g, '');
	if (cleaned === '') return null;
	const n = Number(cleaned);
	return Number.isFinite(n) ? n : null;
}

export type RunwayInput = {
	savings: number;
	monthlyCosts: number;
	monthlyIncome: number;
	oneTimeCosts: number;
};

export type RunwayRow = { month: number; balance: number };

export type Runway = {
	/** Money left to spend each month: costs minus income. 0 or less means savings do not go down. */
	monthlyDrain: number;
	/** Savings after the one-time costs. Can be negative. */
	startBalance: number;
	/** True when income covers costs and the start balance is not negative. */
	lasts: boolean;
	/** Months of runway, or null when savings do not go down. */
	months: number | null;
	/** The date the money runs out, or null. */
	runOutDate: Date | null;
	/** Balance at the end of each month, 1 to 24. Stops one month after the balance goes below 0. */
	rows: RunwayRow[];
};

export const MAX_MONTHS = 24;
const DAYS_PER_MONTH = 30.4375;

export function computeRunway(input: RunwayInput, today: Date): Runway {
	const monthlyDrain = input.monthlyCosts - input.monthlyIncome;
	const startBalance = input.savings - input.oneTimeCosts;
	const lasts = monthlyDrain <= 0 && startBalance >= 0;

	const rows: RunwayRow[] = [];
	for (let m = 1; m <= MAX_MONTHS; m++) {
		const balance = startBalance - monthlyDrain * m;
		rows.push({ month: m, balance });
		if (balance < 0) break;
	}

	if (monthlyDrain <= 0 && startBalance >= 0) {
		return { monthlyDrain, startBalance, lasts, months: null, runOutDate: null, rows };
	}
	const months = startBalance <= 0 ? 0 : startBalance / monthlyDrain;
	const runOutDate = new Date(today.getTime() + months * DAYS_PER_MONTH * 24 * 60 * 60 * 1000);
	return { monthlyDrain, startBalance, lasts, months, runOutDate, rows };
}

export function formatMonths(months: number): string {
	const rounded = Math.round(months * 10) / 10;
	return `${rounded} ${rounded === 1 ? 'month' : 'months'}`;
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export function formatMoney(n: number | null): string {
	return n === null || !Number.isFinite(n) ? '-' : money.format(n);
}

const dateFmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
export function formatDate(d: Date | null): string {
	return d === null || Number.isNaN(d.getTime()) ? '-' : dateFmt.format(d);
}

/** The date at the end of month m, counted from today. */
export function monthEndDate(today: Date, m: number): Date {
	return new Date(today.getTime() + m * DAYS_PER_MONTH * 24 * 60 * 60 * 1000);
}
