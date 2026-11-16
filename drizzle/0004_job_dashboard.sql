CREATE TABLE `ai_calls` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ai_calls_user_idx` ON `ai_calls` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `application_events` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`status` text,
	`at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `application_events_app_idx` ON `application_events` (`application_id`);--> statement-breakpoint
CREATE INDEX `application_events_user_idx` ON `application_events` (`user_id`);--> statement-breakpoint
CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`job_title` text DEFAULT '' NOT NULL,
	`job_url` text DEFAULT '' NOT NULL,
	`source` text DEFAULT 'other' NOT NULL,
	`job_description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'saved' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`contact_name` text DEFAULT '' NOT NULL,
	`contact_email` text DEFAULT '' NOT NULL,
	`applied_at` integer,
	`resume_id` text,
	`letter_id` text,
	`fit_score` integer,
	`fit_json` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `applications_user_idx` ON `applications` (`user_id`);--> statement-breakpoint
CREATE TABLE `interviews` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`user_id` text NOT NULL,
	`at` integer NOT NULL,
	`round` text DEFAULT 'first' NOT NULL,
	`format` text DEFAULT 'video' NOT NULL,
	`interviewers` text DEFAULT '' NOT NULL,
	`topics` text DEFAULT '' NOT NULL,
	`went_well` text DEFAULT '' NOT NULL,
	`clarify` text DEFAULT '' NOT NULL,
	`rating` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `interviews_app_idx` ON `interviews` (`application_id`);--> statement-breakpoint
CREATE INDEX `interviews_user_idx` ON `interviews` (`user_id`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`interview_id` text,
	`subject` text DEFAULT '' NOT NULL,
	`body` text NOT NULL,
	`mode` text DEFAULT 'template' NOT NULL,
	`model` text DEFAULT '' NOT NULL,
	`sent_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `messages_app_idx` ON `messages` (`application_id`);--> statement-breakpoint
CREATE INDEX `messages_user_idx` ON `messages` (`user_id`);--> statement-breakpoint
CREATE TABLE `prep_answers` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`user_id` text NOT NULL,
	`question_id` text NOT NULL,
	`question` text NOT NULL,
	`json` text DEFAULT '{}' NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `prep_answers_user_idx` ON `prep_answers` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `prep_answers_app_question_unique` ON `prep_answers` (`application_id`,`question_id`);--> statement-breakpoint
CREATE TABLE `prep_packs` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`user_id` text NOT NULL,
	`json` text NOT NULL,
	`model` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `prep_packs_app_idx` ON `prep_packs` (`application_id`);--> statement-breakpoint
CREATE INDEX `prep_packs_user_idx` ON `prep_packs` (`user_id`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`json` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`json` text DEFAULT '{}' NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `letters` ADD `application_id` text;--> statement-breakpoint
ALTER TABLE `resumes` ADD `kind` text DEFAULT 'uploaded' NOT NULL;--> statement-breakpoint
ALTER TABLE `resumes` ADD `application_id` text;--> statement-breakpoint
ALTER TABLE `resumes` ADD `doc_json` text;--> statement-breakpoint
INSERT INTO `applications` (`id`, `user_id`, `company`, `job_title`, `job_description`, `status`, `letter_id`, `resume_id`, `fit_score`, `fit_json`, `created_at`, `updated_at`)
SELECT 'app_' || `id`, `user_id`, `company`, `job_title`, `job_description`, 'saved', `id`, `resume_id`, `fit_score`, `fit_json`, `created_at`, `updated_at` FROM `letters`;
--> statement-breakpoint
UPDATE `letters` SET `application_id` = 'app_' || `id` WHERE `application_id` IS NULL;
--> statement-breakpoint
INSERT INTO `application_events` (`id`, `application_id`, `user_id`, `type`, `status`, `at`, `created_at`)
SELECT 'evt_' || `id`, 'app_' || `id`, `user_id`, 'status', 'saved', `created_at`, `created_at` FROM `letters`;
