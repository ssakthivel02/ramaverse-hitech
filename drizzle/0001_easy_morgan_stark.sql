CREATE TABLE `audio_scripts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scriptNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`narratorRole` varchar(128) NOT NULL,
	`durationMinutes` int NOT NULL,
	`scriptContent` text NOT NULL,
	`musicalMood` varchar(128),
	CONSTRAINT `audio_scripts_id` PRIMARY KEY(`id`),
	CONSTRAINT `audio_scripts_scriptNumber_unique` UNIQUE(`scriptNumber`)
);
--> statement-breakpoint
CREATE TABLE `characters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`characterNumber` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`title` varchar(255),
	`roleCategory` varchar(64) NOT NULL,
	`description` text NOT NULL,
	`relationships` json NOT NULL,
	`appearances` json NOT NULL,
	`imageUrl` text,
	CONSTRAINT `characters_id` PRIMARY KEY(`id`),
	CONSTRAINT `characters_characterNumber_unique` UNIQUE(`characterNumber`)
);
--> statement-breakpoint
CREATE TABLE `guidance_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recordNumber` int NOT NULL,
	`theme` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`advice` text NOT NULL,
	`kandaReference` varchar(128),
	`characterReference` varchar(128),
	CONSTRAINT `guidance_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `guidance_records_recordNumber_unique` UNIQUE(`recordNumber`)
);
--> statement-breakpoint
CREATE TABLE `kandas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kandaNumber` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`sanskritName` varchar(128) NOT NULL,
	`sargasCount` int NOT NULL,
	`summary` text NOT NULL,
	`keyEvents` json NOT NULL,
	`imageUrl` text,
	CONSTRAINT `kandas_id` PRIMARY KEY(`id`),
	CONSTRAINT `kandas_kandaNumber_unique` UNIQUE(`kandaNumber`)
);
--> statement-breakpoint
CREATE TABLE `kids_stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storyNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`moral` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`ageGroup` varchar(32) DEFAULT 'All Ages',
	`imageUrl` text,
	CONSTRAINT `kids_stories_id` PRIMARY KEY(`id`),
	CONSTRAINT `kids_stories_storyNumber_unique` UNIQUE(`storyNumber`)
);
--> statement-breakpoint
CREATE TABLE `places` (
	`id` int AUTO_INCREMENT NOT NULL,
	`placeNumber` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`modernLocation` varchar(128),
	`significance` text NOT NULL,
	`associatedKandas` json NOT NULL,
	`coordinates` varchar(64),
	CONSTRAINT `places_id` PRIMARY KEY(`id`),
	CONSTRAINT `places_placeNumber_unique` UNIQUE(`placeNumber`)
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quizNumber` int NOT NULL,
	`question` text NOT NULL,
	`options` json NOT NULL,
	`correctAnswerIndex` int NOT NULL,
	`explanation` text NOT NULL,
	`difficulty` varchar(32) DEFAULT 'Medium',
	`kandaReference` varchar(128),
	CONSTRAINT `quizzes_id` PRIMARY KEY(`id`),
	CONSTRAINT `quizzes_quizNumber_unique` UNIQUE(`quizNumber`)
);
--> statement-breakpoint
CREATE TABLE `wisdom_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recordNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` varchar(128) NOT NULL,
	`shlokaSanskrit` text,
	`transliteration` text,
	`translation` text NOT NULL,
	`philosophicalInsight` text NOT NULL,
	`kandaId` int,
	`sourceReference` varchar(255),
	CONSTRAINT `wisdom_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `wisdom_records_recordNumber_unique` UNIQUE(`recordNumber`)
);
