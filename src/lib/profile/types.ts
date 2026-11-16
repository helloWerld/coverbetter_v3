import { z } from 'zod';

/**
 * The career profile: the user's full work history and everything else that can go on a resume.
 * One JSON document for each user (table `profiles`). Every item and every bullet has a stable id,
 * so a tailored resume can point to them, and the AI can answer with ids instead of text.
 */

const id = z.string().min(1).max(40);
const short = (max = 200) => z.string().trim().max(max).default('');
/** "YYYY-MM" or "YYYY". Empty when not known. */
export const yearMonth = z
	.string()
	.trim()
	.regex(/^(\d{4}(-(0[1-9]|1[0-2]))?)?$/, 'Use YYYY or YYYY-MM')
	.default('');

export const bulletSchema = z.object({
	id,
	text: z.string().trim().min(1).max(500),
	/** The user never wants this bullet on a resume. */
	hidden: z.boolean().default(false),
});

export const linkSchema = z.object({
	label: short(60),
	url: short(300),
});

export const positionSchema = z.object({
	id,
	company: short(),
	title: short(),
	location: short(),
	start: yearMonth,
	/** Empty with current = true means "Present". */
	end: yearMonth,
	current: z.boolean().default(false),
	employmentType: short(60),
	bullets: z.array(bulletSchema).max(40).default([]),
});

export const educationSchema = z.object({
	id,
	school: short(),
	degree: short(),
	field: short(),
	start: yearMonth,
	end: yearMonth,
	gpa: short(20),
	honors: short(300),
	courses: short(500),
});

export const certificationSchema = z.object({
	id,
	name: short(),
	issuer: short(),
	date: yearMonth,
	expires: yearMonth,
	credentialId: short(100),
	url: short(300),
});

export const SKILL_GROUPS = ['technical', 'tool', 'soft', 'language', 'other'] as const;
export type SkillGroup = (typeof SKILL_GROUPS)[number];

export const skillSchema = z.object({
	id,
	name: z.string().trim().min(1).max(80),
	group: z.enum(SKILL_GROUPS).catch('other'),
});

export const projectSchema = z.object({
	id,
	name: short(),
	role: short(),
	start: yearMonth,
	end: yearMonth,
	url: short(300),
	bullets: z.array(bulletSchema).max(20).default([]),
});

export const OTHER_KINDS = ['volunteer', 'award', 'publication', 'language', 'other'] as const;
export type OtherKind = (typeof OTHER_KINDS)[number];

export const otherSchema = z.object({
	id,
	kind: z.enum(OTHER_KINDS).catch('other'),
	title: short(),
	organization: short(),
	date: yearMonth,
	description: short(1000),
});

export const summarySchema = z.object({
	id,
	text: z.string().trim().min(1).max(1500),
});

/** A headline other than the main one (basics.headline), for a different type of role. */
export const headlineSchema = z.object({
	id,
	text: z.string().trim().min(1).max(200),
});

export const basicsSchema = z.object({
	name: short(120),
	headline: short(200),
	email: short(200),
	phone: short(60),
	location: short(120),
	links: z.array(linkSchema).max(8).default([]),
});

export const profileSchema = z.object({
	version: z.literal(1).default(1),
	basics: basicsSchema.default({ name: '', headline: '', email: '', phone: '', location: '', links: [] }),
	summaries: z.array(summarySchema).max(10).default([]),
	/** Other headlines. The main headline is basics.headline. */
	headlines: z.array(headlineSchema).max(10).default([]),
	positions: z.array(positionSchema).max(60).default([]),
	education: z.array(educationSchema).max(20).default([]),
	certifications: z.array(certificationSchema).max(60).default([]),
	skills: z.array(skillSchema).max(200).default([]),
	projects: z.array(projectSchema).max(40).default([]),
	other: z.array(otherSchema).max(60).default([]),
});

export type Bullet = z.infer<typeof bulletSchema>;
export type Position = z.infer<typeof positionSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Project = z.infer<typeof projectSchema>;
export type OtherItem = z.infer<typeof otherSchema>;
export type Summary = z.infer<typeof summarySchema>;
export type Headline = z.infer<typeof headlineSchema>;
export type Basics = z.infer<typeof basicsSchema>;
export type Profile = z.infer<typeof profileSchema>;

/** An empty profile. */
export function emptyProfile(): Profile {
	return profileSchema.parse({});
}

/** Short random id for profile items. Works in the browser and on the server. */
export function newItemId(prefix: string): string {
	const bytes = new Uint8Array(6);
	crypto.getRandomValues(bytes);
	const s = Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 10);
	return `${prefix}_${s}`;
}

/**
 * A tailored resume: which profile items to show, in which order, with optional new text.
 * Stored in `resumes.doc_json` for resumes of kind "tailored".
 */
export const tailoredSelectionSchema = z.object({
	version: z.literal(1).default(1),
	/** The headline for this version. Not set means the main headline. Empty means no headline. */
	headline: z.string().trim().max(200).optional(),
	/** The summary text for this version. Empty means no summary. */
	summary: z.string().trim().max(1500).default(''),
	/** Position ids in display order. */
	positions: z
		.array(
			z.object({
				id,
				/** Bullet ids in display order. */
				bullets: z.array(id).max(40).default([]),
			}),
		)
		.max(60)
		.default([]),
	education: z.array(id).max(20).default([]),
	certifications: z.array(id).max(60).default([]),
	skills: z.array(id).max(200).default([]),
	projects: z
		.array(z.object({ id, bullets: z.array(id).max(20).default([]) }))
		.max(40)
		.default([]),
	other: z.array(id).max(60).default([]),
	/** New text for a bullet in this version only, by bullet id. The profile does not change. */
	rewrites: z.record(z.string(), z.string().trim().min(1).max(500)).default({}),
	template: z.enum(['classic', 'modern', 'minimal']).catch('classic'),
});

export type TailoredSelection = z.infer<typeof tailoredSelectionSchema>;
