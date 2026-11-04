CREATE TABLE `devotional_practices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`practiceKey` varchar(96) NOT NULL,
	`title` varchar(255) NOT NULL,
	`traditionSource` varchar(255) NOT NULL,
	`traditionalPurpose` text NOT NULL,
	`disclaimer` text NOT NULL DEFAULT ('Traditional practice and observance. No outcome or remedy is guaranteed.'),
	`traditionCategory` varchar(64) NOT NULL DEFAULT 'TRADITIONAL',
	`reviewStatus` varchar(64) NOT NULL DEFAULT 'needs_source_review',
	CONSTRAINT `devotional_practices_id` PRIMARY KEY(`id`),
	CONSTRAINT `devotional_practices_practiceKey_unique` UNIQUE(`practiceKey`)
);
--> statement-breakpoint
CREATE TABLE `dharma_lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lessonKey` varchar(96) NOT NULL,
	`theme` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`sourceTextExcerpt` text NOT NULL,
	`traditionalInterpretation` text NOT NULL,
	`editorialLifeApplication` text NOT NULL,
	`sourceLocator` varchar(255) NOT NULL,
	`reviewStatus` varchar(64) NOT NULL DEFAULT 'needs_source_review',
	CONSTRAINT `dharma_lessons_id` PRIMARY KEY(`id`),
	CONSTRAINT `dharma_lessons_lessonKey_unique` UNIQUE(`lessonKey`)
);
--> statement-breakpoint
CREATE TABLE `dialogues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dialogueKey` varchar(96) NOT NULL,
	`speaker` varchar(128) NOT NULL,
	`listener` varchar(128) NOT NULL,
	`context` text NOT NULL,
	`quote` text,
	`paraphrase` text NOT NULL,
	`simpleExplanation` text NOT NULL,
	`deeperExplanation` text NOT NULL,
	`dharmaPrinciple` varchar(128) NOT NULL,
	`sourceLocator` varchar(255) NOT NULL,
	`traditionStatus` varchar(64) NOT NULL,
	`reviewStatus` varchar(64) NOT NULL DEFAULT 'needs_source_review',
	CONSTRAINT `dialogues_id` PRIMARY KEY(`id`),
	CONSTRAINT `dialogues_dialogueKey_unique` UNIQUE(`dialogueKey`)
);
--> statement-breakpoint
CREATE TABLE `temples` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templeKey` varchar(96) NOT NULL,
	`name` varchar(128) NOT NULL,
	`deity` varchar(128) NOT NULL,
	`location` varchar(128) NOT NULL,
	`historicalSignificance` text NOT NULL,
	`pilgrimageAssociation` text NOT NULL,
	`officialChannelsOnly` text NOT NULL,
	`reviewStatus` varchar(64) NOT NULL DEFAULT 'needs_source_review',
	CONSTRAINT `temples_id` PRIMARY KEY(`id`),
	CONSTRAINT `temples_templeKey_unique` UNIQUE(`templeKey`)
);
--> statement-breakpoint
CREATE TABLE `tradition_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mappingKey` varchar(96) NOT NULL,
	`title` varchar(255) NOT NULL,
	`valmikiTreatment` text NOT NULL,
	`kambaTreatment` text NOT NULL,
	`tulsiTreatment` text NOT NULL,
	`adhyatmaTreatment` text NOT NULL,
	`regionalVariant` text NOT NULL,
	`reviewStatus` varchar(64) NOT NULL DEFAULT 'needs_source_review',
	CONSTRAINT `tradition_mappings_id` PRIMARY KEY(`id`),
	CONSTRAINT `tradition_mappings_mappingKey_unique` UNIQUE(`mappingKey`)
);
--> statement-breakpoint
ALTER TABLE `audio_scripts` MODIFY COLUMN `narratorRole` varchar(128);--> statement-breakpoint
ALTER TABLE `audio_scripts` MODIFY COLUMN `scriptContent` text;--> statement-breakpoint
ALTER TABLE `audio_scripts` ADD `transcript` text;--> statement-breakpoint
ALTER TABLE `audio_scripts` ADD `ageGroup` varchar(32) DEFAULT 'All Ages';
