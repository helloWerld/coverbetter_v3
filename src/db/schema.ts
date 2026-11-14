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
		createdAt: createdAt(),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(t) => [index('letters_user_idx').on(t.userId)],
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
