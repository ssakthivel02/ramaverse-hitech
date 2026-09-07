CREATE TABLE `sargas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recordKey` varchar(96) NOT NULL,
	`kandaNumber` int NOT NULL,
	`editionId` varchar(96) NOT NULL,
	`sargaIdentifier` varchar(64) NOT NULL,
	`editorialDescriptor` varchar(255) NOT NULL,
	`summary` text NOT NULL,
	`sourceId` varchar(64) NOT NULL,
	`sourceLocator` varchar(255) NOT NULL,
	`traditionId` varchar(96) NOT NULL,
	`reviewStatus` varchar(64) NOT NULL DEFAULT 'needs_source_review',
	`confidence` varchar(64) NOT NULL DEFAULT 'source_verified',
	CONSTRAINT `sargas_id` PRIMARY KEY(`id`),
	CONSTRAINT `sargas_recordKey_unique` UNIQUE(`recordKey`)
);
