ALTER TABLE `audio_scripts` ADD `reviewStatus` varchar(64) DEFAULT 'needs_source_review' NOT NULL;--> statement-breakpoint
ALTER TABLE `characters` ADD `reviewStatus` varchar(64) DEFAULT 'needs_source_review' NOT NULL;--> statement-breakpoint
ALTER TABLE `guidance_records` ADD `reviewStatus` varchar(64) DEFAULT 'needs_source_review' NOT NULL;--> statement-breakpoint
ALTER TABLE `kandas` ADD `reviewStatus` varchar(64) DEFAULT 'needs_source_review' NOT NULL;--> statement-breakpoint
ALTER TABLE `kids_stories` ADD `reviewStatus` varchar(64) DEFAULT 'needs_source_review' NOT NULL;--> statement-breakpoint
ALTER TABLE `places` ADD `reviewStatus` varchar(64) DEFAULT 'needs_source_review' NOT NULL;--> statement-breakpoint
ALTER TABLE `quizzes` ADD `reviewStatus` varchar(64) DEFAULT 'needs_source_review' NOT NULL;--> statement-breakpoint
ALTER TABLE `wisdom_records` ADD `reviewStatus` varchar(64) DEFAULT 'needs_source_review' NOT NULL;