import { describe, expect, it } from 'vitest';
import { computeGoal, formatCount, parsePositive, percentToRatio } from './logic';

describe('parsePositive', () => {
	it('reads positive numbers', () => {
		expect(parsePositive('20')).toBe(20);
		expect(parsePositive('1,000')).toBe(1000);
		expect(parsePositive('2.5')).toBe(2.5);
	});
	it('returns null for empty, zero, negative, and invalid text', () => {
		expect(parsePositive('')).toBeNull();
		expect(parsePositive('0')).toBeNull();
		expect(parsePositive('-3')).toBeNull();
		expect(parsePositive('abc')).toBeNull();
	});
});

describe('percentToRatio', () => {
	it('turns a percent into one in N', () => {
		expect(percentToRatio(4)).toBe(25);
		expect(percentToRatio(100)).toBe(1);
	});
	it('returns null for 0, negative, over 100, and null', () => {
		expect(percentToRatio(0)).toBeNull();
		expect(percentToRatio(-1)).toBeNull();
		expect(percentToRatio(150)).toBeNull();
		expect(percentToRatio(null)).toBeNull();
	});
});

describe('computeGoal', () => {
	it('works from offers', () => {
		const r = computeGoal({ goalType: 'offers', goal: 2, weeks: 10, applicationsPerInterview: 10, interviewsPerOffer: 4 })!;
		expect(r.interviewsNeeded).toBe(8);
		expect(r.applications).toBe(80);
		expect(r.perWeek).toBe(8);
		expect(r.perWeekday).toBe(2);
	});
	it('works from interviews and ignores interviews per offer', () => {
		const r = computeGoal({ goalType: 'interviews', goal: 5, weeks: 4, applicationsPerInterview: 12, interviewsPerOffer: null })!;
		expect(r.applications).toBe(60);
		expect(r.perWeek).toBe(15);
		expect(r.perWeekday).toBe(3);
	});
	it('rounds up', () => {
		const r = computeGoal({ goalType: 'interviews', goal: 1, weeks: 3, applicationsPerInterview: 10, interviewsPerOffer: null })!;
		expect(r.perWeek).toBe(4);
		expect(r.perWeekday).toBe(1);
		const p = computeGoal({ goalType: 'interviews', goal: 1, weeks: 1, applicationsPerInterview: percentToRatio(3), interviewsPerOffer: null })!;
		expect(p.applications).toBe(34);
	});
	it('returns null for empty or zero inputs', () => {
		const base = { goalType: 'offers' as const, goal: 1, weeks: 4, applicationsPerInterview: 10, interviewsPerOffer: 3 };
		expect(computeGoal({ ...base, goal: null })).toBeNull();
		expect(computeGoal({ ...base, goal: 0 })).toBeNull();
		expect(computeGoal({ ...base, weeks: 0 })).toBeNull();
		expect(computeGoal({ ...base, weeks: null })).toBeNull();
		expect(computeGoal({ ...base, applicationsPerInterview: null })).toBeNull();
		expect(computeGoal({ ...base, applicationsPerInterview: 0 })).toBeNull();
		expect(computeGoal({ ...base, interviewsPerOffer: null })).toBeNull();
		expect(computeGoal({ ...base, interviewsPerOffer: 0 })).toBeNull();
	});
	it('handles very large numbers', () => {
		const r = computeGoal({ goalType: 'offers', goal: 1e6, weeks: 1, applicationsPerInterview: 1e6, interviewsPerOffer: 1e3 })!;
		expect(Number.isFinite(r.applications)).toBe(true);
	});
});

describe('formatCount', () => {
	it('formats and handles null', () => {
		expect(formatCount(1234)).toBe('1,234');
		expect(formatCount(null)).toBe('-');
		expect(formatCount(NaN)).toBe('-');
	});
});
