export type Period = 'hourly' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export const PERIODS: readonly { value: Period; label: string }[] = [
	{ value: 'hourly', label: 'Hourly' },
	{ value: 'daily', label: 'Daily' },
	{ value: 'weekly', label: 'Weekly' },
	{ value: 'biweekly', label: 'Every two weeks' },
	{ value: 'monthly', label: 'Monthly' },
	{ value: 'yearly', label: 'Yearly' },
];

/** The tool treats a week as 5 working days. */
export const DAYS_PER_WEEK = 5;

/** Reads "60,000" or "$60,000.50". Returns null for empty or invalid text, and for negative numbers. */
export function parseNumber(text: string): number | null {
	const cleaned = text.replace(/[$,\s]/g, '');
	if (cleaned === '') return null;
	const n = Number(cleaned);
	return Number.isFinite(n) && n >= 0 ? n : null;
}

export type Conversion = Record<Period, number>;

/** Turns one amount into all six periods. Returns null when an input is empty, invalid, or zero hours or weeks. */
export function convertAll(
	amount: number | null,
	period: Period,
	hoursPerWeek: number | null,
	weeksPerYear: number | null,
): Conversion | null {
	if (amount === null || hoursPerWeek === null || weeksPerYear === null) return null;
	if (hoursPerWeek <= 0 || weeksPerYear <= 0) return null;
	const yearly = toYearly(amount, period, hoursPerWeek, weeksPerYear);
	return {
		hourly: yearly / (hoursPerWeek * weeksPerYear),
		daily: yearly / (DAYS_PER_WEEK * weeksPerYear),
		weekly: yearly / weeksPerYear,
		biweekly: (yearly / weeksPerYear) * 2,
		monthly: yearly / 12,
		yearly,
	};
}

function toYearly(amount: number, period: Period, hoursPerWeek: number, weeksPerYear: number): number {
	switch (period) {
		case 'hourly':
			return amount * hoursPerWeek * weeksPerYear;
		case 'daily':
			return amount * DAYS_PER_WEEK * weeksPerYear;
		case 'weekly':
			return amount * weeksPerYear;
		case 'biweekly':
			return (amount / 2) * weeksPerYear;
		case 'monthly':
			return amount * 12;
		case 'yearly':
			return amount;
	}
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export function formatMoney(n: number | null): string {
	return n === null || !Number.isFinite(n) ? '-' : money.format(n);
}
