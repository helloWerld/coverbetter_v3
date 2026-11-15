CREATE TABLE `fit_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`resume_id` text,
	`job_title` text DEFAULT '' NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`job_description` text NOT NULL,
	`fit_score` integer NOT NULL,
	`fit_json` text NOT NULL,
	`model` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `fit_checks_user_idx` ON `fit_checks` (`user_id`);--> statement-breakpoint
ALTER TABLE `letters` ADD `fit_score` integer;--> statement-breakpoint
ALTER TABLE `letters` ADD `fit_json` text;