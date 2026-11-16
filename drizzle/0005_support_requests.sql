CREATE TABLE `support_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`topic` text NOT NULL,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `support_requests_status_idx` ON `support_requests` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `support_requests_user_idx` ON `support_requests` (`user_id`,`created_at`);