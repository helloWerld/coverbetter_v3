CREATE TABLE `extension_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`last_used_at` integer
);
--> statement-breakpoint
CREATE INDEX `extension_tokens_user_idx` ON `extension_tokens` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `extension_tokens_hash_unique` ON `extension_tokens` (`token_hash`);