import { sql } from 'drizzle-orm';
import {
	index,
	integer,
	sqliteTable,
	text,
	unique,
} from 'drizzle-orm/sqlite-core';

const createdAt = () =>
	integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`);

export const users = sqliteTable('users', {
	/** Clerk user id */
	id: text('id').primaryKey(),
	email: text('email').notNull().default(''),
	plan: text('plan', { enum: ['free', 'pro'] })
		.notNull()
		.default('free'),
	freeLettersUsed: integer('free_letters_used').notNull().default(0),
	credits: integer('credits').notNull().default(0),
	proLettersThisPeriod: integer('pro_letters_this_period')
		.notNull()
		.default(0),
	stripeCustomerId: text('stripe_customer_id'),
	proPeriodEnd: integer('pro_period_end', { mode: 'timestamp' }),
	createdAt: createdAt(),
});

export const resumes = sqliteTable(
	'resumes',
	{
		id: text('id').primaryKey(),
		userId: text('user_id').notNull(),
		title: text('title').notNull(),
		/** null when the resume was pasted */
		r2Key: text('r2_key'),
		fileName: text('file_name'),
		text: text('text').notNull(),
		/** 'uploaded' (a file or pasted text) or 'tailored' (built from the career profile for one job). */
		kind: text('kind').notNull().default('uploaded'),
		/** For tailored resumes: the application it was made for. */
		applicationId: text('application_id'),
		/** For tailored resumes: the TailoredSelection JSON. `text` holds the plain-text render. */
		docJson: text('doc_json'),
		createdAt: createdAt(),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(t) => [index('resumes_user_idx').on(t.userId)],
);

export const letters = sqliteTable(
	'letters',
	{
		id: text('id').primaryKey(),
		userId: text('user_id').notNull(),
		resumeId: text('resume_id'),
		jobTitle: text('job_title').notNull().default(''),
		company: text('company').notNull().default(''),
		jobDescription: text('job_description').notNull(),
		tone: text('tone').notNull(),
		length: text('length').notNull(),
		template: text('template').notNull().default('classic'),
		language: text('language').notNull().default('en'),
		body: text('body').notNull(),
		model: text('model').notNull().default(''),
		/** AI Job Fit Score, 0 to 100. Empty for free letters and older letters. */
		fitScore: integer('fit_score'),
		/** Summary and requirement list, see src/lib/fit.ts. */
		fitJson: text('fit_json'),
		/** The application this letter belongs to. Empty for letters made before the dashboard. */
		applicationId: text('application_id'),
		createdAt: createdAt(),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(t) => [index('letters_user_idx').on(t.userId)],
);

/** Job Fit Score checks run on their own, without a letter. Each one uses 1 credit. */
export const fitChecks = sqliteTable(
	'fit_checks',
	{
		id: text('id').primaryKey(),
		userId: text('user_id').notNull(),
		resumeId: text('resume_id'),
		jobTitle: text('job_title').notNull().default(''),
		company: text('company').notNull().default(''),
		jobDescription: text('job_description').notNull(),
		fitScore: integer('fit_score').notNull(),
		fitJson: text('fit_json').notNull(),
		model: text('model').notNull().default(''),
		createdAt: createdAt(),
	},
	(t) => [index('fit_checks_user_idx').on(t.userId)],
);

export const waitlist = sqliteTable(
	'waitlist',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		email: text('email').notNull(),
		feature: text('feature').notNull(),
		createdAt: createdAt(),
	},
	(t) => [unique('waitlist_email_feature_unique').on(t.email, t.feature)],
);

export const stripeEvents = sqliteTable('stripe_events', {
	/** Stripe event id */
	id: text('id').primaryKey(),
	type: text('type').notNull(),
	processedAt: integer('processed_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
});

export type User = typeof users.$inferSelect;
export type Resume = typeof resumes.$inferSelect;
export type Letter = typeof letters.$inferSelect;
export type FitCheck = typeof fitChecks.$inferSelect;

/** Sign-in tokens for the Chrome extension. Only the SHA-256 hash is stored. */
export const extensionTokens = sqliteTable(
	'extension_tokens',
	{
		id: text('id').primaryKey(),
		userId: text('user_id').notNull(),
		tokenHash: text('token_hash').notNull(),
		createdAt: createdAt(),
		lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
	},
	(t) => [
		unique('extension_tokens_hash_unique').on(t.tokenHash),
		index('extension_tokens_user_idx').on(t.userId),
	],
);

export type ExtensionToken = typeof extensionTokens.$inferSelect;

/** One job that the user is interested in. The base of the job application dashboard. */
export const applications = sqliteTable(
	'applications',
	{
		id: text('id').primaryKey(),
		userId: text('user_id').notNull(),
		company: text('company').notNull().default(''),
		jobTitle: text('job_title').notNull().default(''),
		jobUrl: text('job_url').notNull().default(''),
		source: text('source').notNull().default('other'),
		jobDescription: text('job_description').notNull().default(''),
		/** See STATUSES in src/lib/applications/types.ts. */
		status: text('status').notNull().default('saved'),
		notes: text('notes').notNull().default(''),
		contactName: text('contact_name').notNull().default(''),
		contactEmail: text('contact_email').notNull().default(''),
		appliedAt: integer('applied_at', { mode: 'timestamp' }),
		/** The resume version used for this job (resumes.id). */
		resumeId: text('resume_id'),
		/** The cover letter for this job (letters.id). */
		letterId: text('letter_id'),
		fitScore: integer('fit_score'),
		fitJson: text('fit_json'),
		createdAt: createdAt(),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(t) => [index('applications_user_idx').on(t.userId)],
);

/** Status changes and other dated events. The analytics come from this list. */
export const applicationEvents = sqliteTable(
	'application_events',
	{
		id: text('id').primaryKey(),
		applicationId: text('application_id').notNull(),
		userId: text('user_id').notNull(),
		/** See EVENT_TYPES. */
		type: text('type').notNull(),
		status: text('status'),
		at: integer('at', { mode: 'timestamp' }).notNull(),
		createdAt: createdAt(),
	},
	(t) => [
		index('application_events_app_idx').on(t.applicationId),
		index('application_events_user_idx').on(t.userId),
	],
);

export const interviews = sqliteTable(
	'interviews',
	{
		id: text('id').primaryKey(),
		applicationId: text('application_id').notNull(),
		userId: text('user_id').notNull(),
		at: integer('at', { mode: 'timestamp' }).notNull(),
		round: text('round').notNull().default('first'),
		format: text('format').notNull().default('video'),
		interviewers: text('interviewers').notNull().default(''),
		topics: text('topics').notNull().default(''),
		wentWell: text('went_well').notNull().default(''),
		clarify: text('clarify').notNull().default(''),
		/** 1 to 5, how it went. 0 = not set. */
		rating: integer('rating').notNull().default(0),
		createdAt: createdAt(),
	},
	(t) => [
		index('interviews_app_idx').on(t.applicationId),
		index('interviews_user_idx').on(t.userId),
	],
);

/** Follow-up and thank-you letters. */
export const messages = sqliteTable(
	'messages',
	{
		id: text('id').primaryKey(),
		applicationId: text('application_id').notNull(),
		userId: text('user_id').notNull(),
		/** See MESSAGE_KINDS. */
		kind: text('kind').notNull(),
		interviewId: text('interview_id'),
		subject: text('subject').notNull().default(''),
		body: text('body').notNull(),
		/** 'template' or 'ai'. */
		mode: text('mode').notNull().default('template'),
		model: text('model').notNull().default(''),
		sentAt: integer('sent_at', { mode: 'timestamp' }),
		createdAt: createdAt(),
	},
	(t) => [
		index('messages_app_idx').on(t.applicationId),
		index('messages_user_idx').on(t.userId),
	],
);

/** Settings and defaults for each user, as JSON (see UserSettings). */
export const userSettings = sqliteTable('user_settings', {
	userId: text('user_id').primaryKey(),
	json: text('json').notNull().default('{}'),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
});

/** The career profile, one JSON document for each user (see src/lib/profile/types.ts). */
export const profiles = sqliteTable('profiles', {
	userId: text('user_id').primaryKey(),
	json: text('json').notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
});

/** AI interview prep packs. */
export const prepPacks = sqliteTable(
	'prep_packs',
	{
		id: text('id').primaryKey(),
		applicationId: text('application_id').notNull(),
		userId: text('user_id').notNull(),
		json: text('json').notNull(),
		model: text('model').notNull().default(''),
		createdAt: createdAt(),
	},
	(t) => [
		index('prep_packs_app_idx').on(t.applicationId),
		index('prep_packs_user_idx').on(t.userId),
	],
);

/** The user's practice answers (STAR or free text) for one application. */
export const prepAnswers = sqliteTable(
	'prep_answers',
	{
		id: text('id').primaryKey(),
		applicationId: text('application_id').notNull(),
		userId: text('user_id').notNull(),
		/** A question-bank id, "ai:<n>" for an AI pack question, or "custom:<id>". */
		questionId: text('question_id').notNull(),
		question: text('question').notNull(),
		json: text('json').notNull().default('{}'),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(t) => [
		index('prep_answers_user_idx').on(t.userId),
		unique('prep_answers_app_question_unique').on(t.applicationId, t.questionId),
	],
);

/** AI calls other than letters and fit checks (tailoring, follow-ups, prep packs), for the hourly limit. */
export const aiCalls = sqliteTable(
	'ai_calls',
	{
		id: text('id').primaryKey(),
		userId: text('user_id').notNull(),
		kind: text('kind').notNull(),
		createdAt: createdAt(),
	},
	(t) => [index('ai_calls_user_idx').on(t.userId, t.createdAt)],
);

export type Application = typeof applications.$inferSelect;
export type ApplicationEvent = typeof applicationEvents.$inferSelect;
export type Interview = typeof interviews.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type PrepPack = typeof prepPacks.$inferSelect;
export type PrepAnswer = typeof prepAnswers.$inferSelect;

/** Help requests from the Support page. Only signed-in users can send one. */
export const supportRequests = sqliteTable(
	'support_requests',
	{
		id: text('id').primaryKey(),
		userId: text('user_id').notNull(),
		email: text('email').notNull().default(''),
		topic: text('topic').notNull(),
		subject: text('subject').notNull(),
		message: text('message').notNull(),
		status: text('status', { enum: ['open', 'closed'] })
			.notNull()
			.default('open'),
		createdAt: createdAt(),
	},
	(t) => [
		index('support_requests_status_idx').on(t.status, t.createdAt),
		index('support_requests_user_idx').on(t.userId, t.createdAt),
	],
);

export type SupportRequest = typeof supportRequests.$inferSelect;
