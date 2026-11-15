export type GoalType = 'offers' | 'interviews';
export type RateMode = 'counts' | 'percent';

export const WEEKDAYS_PER_WEEK = 5;

/** Reads a positive number from text such as "20" or "1,000". Returns null for empty, invalid, zero, or negative text. */
export function parsePositive(text: string): number | null {
	const cleaned = text.replace(/[,\s]/g, '');
	if (cleaned === '') return null;
	const n = Number(cleaned);
	return Number.isFinite(n) && n > 0 ? n : null;
}

/** Turns a percent into "one in N". 4 percent gives 25. Returns null for 0 or less, and for more than 100. */
export function percentToRatio(percent: number | null): number | null {
	if (percent === null || percent <= 0 || percent > 100) return null;
	return 100 / percent;
}

export type GoalInput = {
	goalType: GoalType;
	goal: number | null;
	weeks: number | null;
	/** Applications for each interview. */
	applicationsPerInterview: number | null;
	/** Interviews for each offer. Only needed when the goal is offers. */
	interviewsPerOffer: number | null;
};

export type GoalResult = {
	interviewsNeeded: number;
	applications: number;
	perWeek: number;
	perWeekday: number;
};

/** Returns null when an input is missing or zero. Rounds up, because you cannot send part of an application. */
export function computeGoal(i: GoalInput): GoalResult | null {
	const { goal, weeks, applicationsPerInterview, interviewsPerOffer } = i;
	if (goal === null || weeks === null || applicationsPerInterview === null) return null;
	if (goal <= 0 || weeks <= 0 || applicationsPerInterview <= 0) return null;
	let interviews = goal;
	if (i.goalType === 'offers') {
		if (interviewsPerOffer === null || interviewsPerOffer <= 0) return null;
		interviews = goal * interviewsPerOffer;
	}
	const interviewsNeeded = Math.ceil(interviews - 1e-9);
	const applications = Math.ceil(interviews * applicationsPerInterview - 1e-9);
	return {
		interviewsNeeded,
		applications,
		perWeek: Math.ceil(applications / weeks - 1e-9),
		perWeekday: Math.ceil(applications / (weeks * WEEKDAYS_PER_WEEK) - 1e-9),
	};
}

const int = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
export function formatCount(n: number | null): string {
	return n === null || !Number.isFinite(n) ? '-' : int.format(n);
}
