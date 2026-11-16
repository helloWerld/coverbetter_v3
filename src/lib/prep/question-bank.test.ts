import { describe, expect, it } from 'vitest';
import { INTERVIEW_ROUNDS } from '@/lib/applications/types';
import { JOB_FAMILIES, QUESTIONS, QUESTIONS_TO_ASK, detectFamily, questionsFor } from './question-bank';

describe('QUESTIONS', () => {
	it('has at least 350 questions', () => {
		expect(QUESTIONS.length).toBeGreaterThanOrEqual(350);
	});
	it('has unique ids and unique texts', () => {
		expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
		expect(new Set(QUESTIONS.map((q) => q.text.toLowerCase())).size).toBe(QUESTIONS.length);
	});
	it('has the expected general and behavioral counts', () => {
		expect(QUESTIONS.filter((q) => q.id.startsWith('gen-')).length).toBeGreaterThanOrEqual(75);
		expect(QUESTIONS.filter((q) => q.type === 'behavioral').length).toBeGreaterThanOrEqual(65);
	});
	it('has a complete record for every question', () => {
		const ids = new Set(JOB_FAMILIES.map((f) => f.id as string));
		for (const q of QUESTIONS) {
			expect(q.text.trim().length).toBeGreaterThan(10);
			expect(q.tip.trim().length).toBeGreaterThan(10);
			expect(q.tip.split(/[.!?]\s/).length).toBeLessThanOrEqual(2);
			expect(q.families.length).toBeGreaterThan(0);
			for (const f of q.families) expect(ids.has(f)).toBe(true);
		}
	});
	it('marks behavioral questions for STAR', () => {
		for (const q of QUESTIONS.filter((x) => x.type === 'behavioral')) expect(q.star).toBe(true);
	});
	it('has at least 12 role questions for each family except general', () => {
		for (const f of JOB_FAMILIES.filter((x) => x.id !== 'general')) {
			const n = QUESTIONS.filter((q) => q.type === 'role' && q.families.includes(f.id)).length;
			expect(n, f.id).toBeGreaterThanOrEqual(12);
		}
	});
	it('has the 18 families', () => {
		expect(JOB_FAMILIES).toHaveLength(18);
	});
});

describe('detectFamily', () => {
	const cases: [string, string][] = [
		['Senior Software Engineer', 'software'],
		['Full-Stack Developer', 'software'],
		['Data Analyst', 'data'],
		['Data Engineer', 'data'],
		['Product Manager', 'product'],
		['Technical Project Manager', 'project_management'],
		['Product Designer', 'design'],
		['Digital Marketing Manager', 'marketing'],
		['Account Executive', 'sales'],
		['Customer Success Manager', 'customer_support'],
		['Supply Chain Coordinator', 'operations'],
		['Staff Accountant', 'finance'],
		['Technical Recruiter', 'hr'],
		['Registered Nurse', 'healthcare'],
		['High School Teacher', 'education'],
		['Executive Assistant', 'administrative'],
		['Mechanical Engineer', 'engineering'],
		['Corporate Attorney', 'legal'],
		['Store Manager, Retail', 'hospitality_retail'],
		['Data Entry Clerk', 'administrative'],
	];
	it.each(cases)('title "%s" gives %s', (title, family) => {
		expect(detectFamily(title)).toBe(family);
	});
	it('falls back to general', () => {
		expect(detectFamily('Wizard')).toBe('general');
		expect(detectFamily('')).toBe('general');
	});
	it('uses the post when the title is not clear', () => {
		const post = 'You will build features as a developer. We use a backend written in Go, and the software ships weekly.';
		expect(detectFamily('Team Member', post)).toBe('software');
	});
	it('prefers the title over the post', () => {
		expect(detectFamily('Registered Nurse', 'software developer, software, backend developer')).toBe('healthcare');
	});
	it('stays general when the post has too few hints', () => {
		expect(detectFamily('Team Member', 'We value kindness. One mention of software.')).toBe('general');
	});
});

describe('questionsFor', () => {
	it('returns general, behavioral, and family questions', () => {
		const qs = questionsFor('software');
		expect(qs.some((q) => q.type === 'behavioral')).toBe(true);
		expect(qs.some((q) => q.id.startsWith('sw-'))).toBe(true);
		expect(qs.some((q) => q.id.startsWith('data-'))).toBe(false);
	});
	it('returns only general questions for general or an unknown family', () => {
		expect(questionsFor('general').every((q) => q.families.includes('general'))).toBe(true);
		expect(questionsFor('nope')).toEqual(questionsFor('general'));
	});
	it('filters by type and limit', () => {
		const roles = questionsFor('sales', { types: ['role'] });
		expect(roles.length).toBeGreaterThanOrEqual(12);
		expect(roles.every((q) => q.type === 'role' && q.families.includes('sales'))).toBe(true);
		expect(questionsFor('sales', { limit: 5 })).toHaveLength(5);
	});
	it('keeps a stable order', () => {
		expect(questionsFor('data').map((q) => q.id)).toEqual(questionsFor('data').map((q) => q.id));
		const all = QUESTIONS.map((q) => q.id);
		const picked = questionsFor('data').map((q) => all.indexOf(q.id));
		expect(picked).toEqual([...picked].sort((a, b) => a - b));
	});
});

describe('QUESTIONS_TO_ASK', () => {
	it('has 6 to 10 questions for every round', () => {
		for (const r of INTERVIEW_ROUNDS) {
			expect(QUESTIONS_TO_ASK[r].length, r).toBeGreaterThanOrEqual(6);
			expect(QUESTIONS_TO_ASK[r].length, r).toBeLessThanOrEqual(10);
			expect(new Set(QUESTIONS_TO_ASK[r]).size).toBe(QUESTIONS_TO_ASK[r].length);
		}
	});
});
