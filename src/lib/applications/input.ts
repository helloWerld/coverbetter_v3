import { z } from 'zod';
import { INTERVIEW_FORMATS, INTERVIEW_ROUNDS, SOURCES, STATUSES } from './types';

const text = (max: number) => z.string().trim().max(max).catch('');

/** A date from a form field ("YYYY-MM-DD" or "YYYY-MM-DDTHH:mm"). Null when empty or bad. */
export const formDate = z
	.union([z.string(), z.null(), z.undefined()])
	.transform((v) => {
		if (!v) return null;
		const d = new Date(v.length === 10 ? `${v}T12:00:00` : v);
		return Number.isNaN(d.getTime()) ? null : d;
	});

export const applicationInput = z.object({
	company: text(200),
	jobTitle: text(200),
	jobUrl: z
		.string()
		.trim()
		.max(1000)
		.refine((v) => v === '' || /^https?:\/\//i.test(v), 'The job link must start with http:// or https://.')
		.catch(''),
	source: z.enum(SOURCES).catch('other'),
	jobDescription: text(20000),
	notes: text(5000),
	contactName: text(200),
	contactEmail: z
		.string()
		.trim()
		.max(254)
		.refine((v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
		.catch(''),
});
export type ApplicationInput = z.infer<typeof applicationInput>;

export const statusInput = z.enum(STATUSES);

export const interviewInput = z.object({
	at: formDate,
	round: z.enum(INTERVIEW_ROUNDS).catch('first'),
	format: z.enum(INTERVIEW_FORMATS).catch('video'),
	interviewers: text(500),
	topics: text(3000),
	wentWell: text(3000),
	clarify: text(3000),
	rating: z.coerce.number().int().min(0).max(5).catch(0),
});
export type InterviewInput = z.infer<typeof interviewInput>;
