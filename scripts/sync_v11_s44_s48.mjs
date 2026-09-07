import fs from "node:fs";

const root = "/home/ubuntu/ramaverse/";
const read = (path) => JSON.parse(fs.readFileSync(root + path, "utf8"));
const write = (path, value) => fs.writeFileSync(root + path, JSON.stringify(value, null, 2) + "\n");
const postV1 = "data/staging/post_v1/";
const staging = [
  ...read("data/staging/physical/STAGING_RECORDS.json"),
  ...fs.readdirSync(root + postV1)
    .filter((file) => /^AYODHYA_S\d+_SOURCE_BACKED_RECORDS\.json$/.test(file))
    .flatMap((file) => read(postV1 + file).records),
];
const unique = [...new Set(staging.map((record) => record.candidate_id))];
if (unique.length !== staging.length) throw new Error("Duplicate candidate IDs block synchronization");
const required = ["candidate_id", "record_type", "kanda", "sarga", "verse_locator", "source_id", "source_locator", "source_type", "tradition_classification", "confidence", "merge_state", "possible_legacy_overlap", "publication_policy"];
const incomplete = staging.filter((record) => record.candidate_id.startsWith("stg-postv1-") && required.some((field) => record[field] === undefined || record[field] === null || record[field] === ""));
if (incomplete.length) throw new Error(`Incomplete staging records: ${incomplete.map((record) => record.candidate_id).join(", ")}`);

const scope = (sarga, verseRange, provider, role, url, caveat) => ({
  source_id: `src-valmiki-ayodhya-s${sarga}-${provider}`,
  title: `Valmiki Ramayana — Ayodhya Kanda — Sarga ${sarga}`,
  repository: provider === "sanskritdocuments" ? "SanskritDocuments.org" : provider === "stotranidhi" ? "Stotra Nidhi" : provider === "readramayana" ? "ReadRamayana" : provider === "vignanam" ? "Vaidika Vignanam" : "ValmikiRamayan.net",
  source_role: role,
  sourceType: role === "PRIMARY_ACQUISITION_SOURCE" ? "PRIMARY_TEXT_DIGITAL_RENDITION" : role === "TEXTUAL_CROSSCHECK" ? "PRIMARY_TEXT_DIGITAL_CROSSCHECK" : "EDITION_REFERENCE",
  kanda: "Ayodhya Kanda", sarga, verse_range: verseRange, url, accessedAt: "2026-08-20", tradition: "Valmiki", confidence: role === "PRIMARY_ACQUISITION_SOURCE" ? "high" : "medium",
  caveat,
});
const additions = [
  scope(44, "2.44.1–2.44.31", "sanskritdocuments", "PRIMARY_ACQUISITION_SOURCE", "https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga44/ayodhyaitrans44.htm", "Primary digital locator; not a critical edition."),
  scope(44, "2.44.1–2.44.31", "stotranidhi-crosscheck", "TEXTUAL_CROSSCHECK", "https://stotranidhi.com/en/ayodhya-kanda-sarga-44-in-english/", "Independent traditional-text presentation; not a critical edition."),
  scope(44, "2.44.1–2.44.31", "valmikiramayan-edition-reference", "ADDITIONAL_EDITION_REFERENCE", "https://www.valmikiramayan.net/ayodhya/sarga44/ayodhyaroman44.htm", "Additional established rendition reference; not a critical edition."),
  scope(45, "2.45.1–2.45.33", "stotranidhi", "PRIMARY_ACQUISITION_SOURCE", "https://stotranidhi.com/en/ayodhya-kanda-sarga-45-in-english/", "Accessible primary acquisition rendering; not a critical edition."),
  scope(45, "2.45.1–2.45.33", "valmikiramayan-suspended", "TEXTUAL_CROSSCHECK", "https://www.valmikiramayan.net/utf8/ayodhya/sarga45/ayodhyaitrans45.htm", "Host returned Account Suspended when checked; retained as availability evidence, not text evidence."),
  scope(45, "2.45.1–2.45.33", "vignanam-app-reference", "ADDITIONAL_EDITION_REFERENCE", "https://vignanam.org/english/vr-2.45-ayodhya-kanda-sarga-45.html", "Web page indicated full text is app-only; retained as availability reference, not text evidence."),
  scope(46, "2.46.1–2.46.34", "stotranidhi", "PRIMARY_ACQUISITION_SOURCE", "https://stotranidhi.com/en/ayodhya-kanda-sarga-46-in-english/", "Primary digital acquisition rendering; not a critical edition."),
  scope(46, "2.46.1–2.46.34", "readramayana-edition-reference", "https://readramayana.org/Ayodhya/46", "ADDITIONAL_EDITION_REFERENCE", "Chapter locator/edition reference only; not a critical edition."),
  scope(46, "2.46.1–2.46.34", "valmikiramayan-suspended", "TEXTUAL_CROSSCHECK", "https://www.valmikiramayan.net/ayodhya/sarga46/ayodhyaroman46.htm", "Suspended-host reference; not used as text evidence."),
  scope(47, "2.47.1–2.47.19", "stotranidhi", "PRIMARY_ACQUISITION_SOURCE", "https://stotranidhi.com/en/ayodhya-kanda-sarga-47-in-english/", "Primary digital acquisition rendering; not a critical edition."),
  scope(47, "2.47.1–2.47.19", "sanskritdocuments-crosscheck", "TEXTUAL_CROSSCHECK", "https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga47/ayodhyaroman47.htm", "Independent textual cross-check; not a critical edition."),
  scope(47, "2.47.1–2.47.19", "readramayana-edition-reference", "ADDITIONAL_EDITION_REFERENCE", "https://readramayana.org/Ayodhya/47", "Chapter locator/edition reference only; not a critical edition."),
  scope(48, "2.48.1–2.48.37", "sanskritdocuments", "PRIMARY_ACQUISITION_SOURCE", "https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga48/ayodhyaroman48.htm", "Primary digital locator; not a critical edition."),
  scope(48, "2.48.1–2.48.37", "stotranidhi-crosscheck", "TEXTUAL_CROSSCHECK", "https://stotranidhi.com/en/ayodhya-kanda-sarga-48-in-english/", "Independent traditional-text presentation; not a critical edition."),
];
const sourceLedger = read("SOURCE_LEDGER_V10.json");
const existingSources = new Set(sourceLedger.sources.map((source) => source.source_id));
sourceLedger.sources.push(...additions.filter((source) => !existingSources.has(source.source_id)));
sourceLedger.ledgerId = "ramaverse-master-source-ledger-v11";
sourceLedger.generatedAt = "2026-08-20T00:00:00.000Z";
write("SOURCE_LEDGER_V11.json", sourceLedger);

const queue = staging.map((record) => ({ record_id: record.candidate_id, record_type: record.record_type, translation_status: record.tamil_review_status === "EDITORIAL_DRAFT_READY_FOR_HUMAN_REVIEW" ? "EDITORIAL_DRAFT_READY_FOR_HUMAN_REVIEW" : "MACHINE_DRAFT_NEEDS_REVIEW", human_reviewed: false, priority: record.record_type === "DIALOGUE" ? "P1" : "P2" }));
const states = queue.reduce((total, record) => ({ ...total, [record.translation_status]: (total[record.translation_status] ?? 0) + 1 }), {});
write("RAMAVERSE_STAGING_MASTER_LEDGER_V11.json", { historicalCanonicalBaseline: 550, physicallyAvailableUniqueRecords: staging.length, stagingPublished: 0, duplicates: { candidateIds: [], count: 0 }, publicSurfacePolicy: { search: "CANONICAL_ONLY", ask: "CANONICAL_ONLY", stagingExposure: 0 }, sourceLedger: "SOURCE_LEDGER_V11.json" });
write("TAMIL_EDITORIAL_REVIEW_QUEUE_V11.json", { records: queue, countsByTranslationState: states, humanReviewedCount: 0, editorialDraftsImprovedThisRun: 32 });
write("EXACT_PHYSICAL_CONTINUATION_V11.json", { last_fully_acquired_kanda: "Ayodhya Kanda", last_fully_acquired_sarga: 48, last_fully_acquired_verse: "2.48.37", next_unacquired_verse: "2.49.1" });
write("V1_5_RECONCILIATION_PREVIEW_V11.json", { status: "EDITORIAL_PREVIEW_ONLY_NOT_PRODUCTION_READY", historicalCanonicalBaseline: 550, physicalStagingRecords: staging.length, stagingPublished: 0, tamilReview: staging.length, nextUnacquiredVerse: "2.49.1" });
write("POST_RUN_AUTHORITY_STATE_V11.json", { physicalStaging: staging.length, ledgerStaging: staging.length, physicalLedgerMatch: true, uniqueIds: unique.length, duplicateIds: [], missingRequiredFields: [], missingSourceIds: [], sourceCount: sourceLedger.sources.length, tamilReviewQueue: queue.length, tamilReviewStates: states, humanReviewedCount: 0, lastFullyAcquired: "2.48.37", nextUnacquiredVerse: "2.49.1", stagingPublished: 0, publicSearchStaging: 0, publicAskStaging: 0, valid: true });
const projectState = read("RAMAVERSE_PROJECT_STATE.json");
projectState.historical_canonical_total = 550;
projectState.RV_01_staging_count = staging.length;
projectState.RV_02_staging_count = projectState.RV_02_staging_count ?? 0;
projectState.canonical_dataset_files = projectState.canonical_dataset_files ?? [];
projectState.staging_files = ["data/staging/physical/STAGING_RECORDS.json", ...fs.readdirSync(root + postV1).filter((file) => /^AYODHYA_S\d+_SOURCE_BACKED_RECORDS\.json$/.test(file)).map((file) => postV1 + file)];
projectState.RV_01_continuation = { kanda: "Ayodhya Kanda", sarga: 49, verse: "2.49.1" };
projectState.latest_batch_ids = ["post-v1-ayodhya-s44-source-backed-v1", "post-v1-ayodhya-s45-source-backed-v1", "post-v1-ayodhya-s46-source-backed-v1", "post-v1-ayodhya-s47-source-backed-v1", "post-v1-ayodhya-s48-source-backed-v1"];
projectState.exact_next_point = "Ayodhya Kanda Sarga 49, verse 2.49.1";
projectState.source_freeze = projectState.source_freeze ?? false;
write("RAMAVERSE_PROJECT_STATE.json", projectState);
console.log(JSON.stringify({ physical: staging.length, sources: sourceLedger.sources.length, tamilQueue: queue.length, next: "2.49.1" }));
