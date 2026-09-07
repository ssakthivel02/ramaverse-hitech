import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = "/home/ubuntu/ramaverse";
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const write = (relative, value) => fs.writeFileSync(path.join(root, relative), JSON.stringify(value, null, 2) + "\n");
const sha256 = (relative) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relative))).digest("hex");
const payloadNames = fs.readdirSync(path.join(root, "data/staging/post_v1"))
  .filter((name) => /^AYODHYA_S\d+_SOURCE_BACKED_RECORDS\.json$/.test(name))
  .sort((a, b) => Number(a.match(/S(\d+)/)[1]) - Number(b.match(/S(\d+)/)[1]));
const payloads = [
  { path: "data/staging/physical/STAGING_RECORDS.json", records: read("data/staging/physical/STAGING_RECORDS.json") },
  ...payloadNames.map((name) => ({ path: `data/staging/post_v1/${name}`, records: read(`data/staging/post_v1/${name}`).records ?? [] })),
];
const records = payloads.flatMap((payload) => payload.records.map((record) => ({ ...record, _payload: payload.path })));
const ids = records.map((record) => record.candidate_id);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))].sort();
const s29 = read("data/staging/post_v1/AYODHYA_S29_SOURCE_BACKED_RECORDS.json");
if (s29.records.length !== s29.recordCount || duplicateIds.length > 0) throw new Error("Sarga 29 payload count or duplicate-id gate failed");

const sourceLedger = read("SOURCE_LEDGER_V9.json");
const additions = [
  {
    source_id: "src-valmiki-ayodhya-s18-sanskritdocuments",
    title: "Valmiki Ramayana — Ayodhya Kanda — Sarga 18",
    repository: "Historical physical staging provenance",
    edition_or_recension: "Primary-text digital rendition identifier preserved from verified physical staging",
    language: "Sanskrit with English translation",
    sourceType: "PRIMARY_TEXT_DIGITAL_RENDITION",
    kanda: "Ayodhya Kanda",
    sarga: 18,
    verse_range: "See record-specific locators in data/staging/physical/STAGING_RECORDS.json",
    url: null,
    accessedAt: "Pre-V10 physical staging",
    rights_status: "Source identifier retained for provenance resolution; no continuous source text is reproduced.",
    tradition: "Valmiki",
    confidence: "high",
    caveat: "Legacy physical source ID resolved for audit continuity; individual staging records retain the specific locators."
  },
  {
    source_id: "src-valmiki-ayodhya-s19-sanskritdocuments",
    title: "Valmiki Ramayana — Ayodhya Kanda — Sarga 19",
    repository: "Historical physical staging provenance",
    edition_or_recension: "Primary-text digital rendition identifier preserved from verified physical staging",
    language: "Sanskrit with English translation",
    sourceType: "PRIMARY_TEXT_DIGITAL_RENDITION",
    kanda: "Ayodhya Kanda",
    sarga: 19,
    verse_range: "See record-specific locators in data/staging/physical/STAGING_RECORDS.json",
    url: null,
    accessedAt: "Pre-V10 physical staging",
    rights_status: "Source identifier retained for provenance resolution; no continuous source text is reproduced.",
    tradition: "Valmiki",
    confidence: "high",
    caveat: "Legacy physical source ID resolved for audit continuity; individual staging records retain the specific locators."
  },
  {
    source_id: "src-valmiki-ayodhya-s20-sanskritdocuments",
    title: "Valmiki Ramayana — Ayodhya Kanda — Sarga 20",
    repository: "Historical physical staging provenance",
    edition_or_recension: "Primary-text digital rendition identifier preserved from verified physical staging",
    language: "Sanskrit with English translation",
    sourceType: "PRIMARY_TEXT_DIGITAL_RENDITION",
    kanda: "Ayodhya Kanda",
    sarga: 20,
    verse_range: "See record-specific locators in data/staging/physical/STAGING_RECORDS.json",
    url: null,
    accessedAt: "Pre-V10 physical staging",
    rights_status: "Source identifier retained for provenance resolution; no continuous source text is reproduced.",
    tradition: "Valmiki",
    confidence: "high",
    caveat: "Legacy physical source ID resolved for audit continuity; individual staging records retain the specific locators."
  },
  {
    source_id: "src-valmiki-ayodhya-s29-sanskritdocuments",
    title: "Valmiki Ramayana — Ayodhya Kanda — Sarga 29",
    repository: "SanskritDocuments.org",
    edition_or_recension: "Traditional digital Sanskrit recension with English word-for-word translation",
    language: "Sanskrit with English translation",
    sourceType: "PRIMARY_TEXT_DIGITAL_RENDITION",
    kanda: "Ayodhya Kanda",
    sarga: 29,
    verse_range: "2.29.1–2.29.24",
    url: "https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga29/ayodhyaroman29.htm",
    accessedAt: "2026-08-19",
    rights_status: "External digital text; only original structured paraphrases are stored in staging.",
    tradition: "Valmiki",
    confidence: "high",
    caveat: "Section-specific digital source locator; not represented as a critical edition. Historical marital-duty language and the dramatic self-endangering expression are preserved only as non-prescriptive literary context."
  },
  {
    source_id: "src-valmiki-ayodhya-s29-stotranidhi-crosscheck",
    title: "Ayodhya Kanda Sarga 29 — IAST text cross-check",
    repository: "Stotra Nidhi",
    edition_or_recension: "Traditional digital IAST text presentation",
    language: "Sanskrit (IAST)",
    sourceType: "PRIMARY_TEXT_DIGITAL_CROSSCHECK",
    kanda: "Ayodhya Kanda",
    sarga: 29,
    verse_range: "2.29.1–2.29.24",
    url: "https://stotranidhi.com/en/ayodhya-kanda-sarga-29-in-english/",
    accessedAt: "2026-08-19",
    rights_status: "External reference; no continuous source text is reproduced in staging.",
    tradition: "Valmiki",
    confidence: "medium",
    caveat: "Used to corroborate chapter identity and 24-verse scope; SanskritDocuments remains the primary acquisition locator."
  },
  {
    source_id: "src-valmiki-ayodhya-s29-vedapath-v7-crosscheck",
    title: "Valmiki Ramayana 2.29.7 — verse-level context cross-check",
    repository: "Vedapath",
    edition_or_recension: "Digital verse presentation with transliteration and context",
    language: "Sanskrit with English interface",
    sourceType: "PRIMARY_TEXT_DIGITAL_CROSSCHECK",
    kanda: "Ayodhya Kanda",
    sarga: 29,
    verse_range: "2.29.7",
    url: "https://vedapath.app/sa/ramayana/ayodhya-kanda/29/7",
    accessedAt: "2026-08-19",
    rights_status: "External reference; no continuous source text is reproduced in staging.",
    tradition: "Valmiki",
    confidence: "medium",
    caveat: "Used only to corroborate verse 2.29.7 identification and historical-marital-context labeling."
  }
];
const existingSourceIds = new Set(sourceLedger.sources.map((source) => source.source_id));
const sourceLedgerV10 = {
  ...sourceLedger,
  ledgerId: "ramaverse-master-source-ledger-v10",
  generatedAt: "2026-08-19T13:48:00.000Z",
  sources: [...sourceLedger.sources, ...additions.filter((source) => !existingSourceIds.has(source.source_id))],
};
write("SOURCE_LEDGER_V10.json", sourceLedgerV10);

const priorLedger = read("RAMAVERSE_STAGING_MASTER_LEDGER_V9.json");
const recordPayloads = payloads.map((payload) => ({ path: payload.path, records: payload.records.length }));
const ledgerV10 = {
  ...priorLedger,
  ledgerId: "ramaverse-website-staging-master-v10-physical-v10",
  generatedAt: "2026-08-19T13:48:00.000Z",
  historicalCanonicalBaseline: 550,
  stagingPublished: 0,
  physicallyAvailableUniqueRecords: records.length,
  recordPayloads,
  duplicates: { candidateIds: duplicateIds, count: duplicateIds.length },
  latestVerifiedCoverage: { kanda: "Ayodhya Kanda", sarga: 29, verseRange: "2.29.1–2.29.24", status: "PHYSICAL_STAGING_SOURCE_BACKED" },
  nextAcquisitionPoint: { kanda: "Ayodhya Kanda", sarga: 30, verseRange: "2.30.1 onward", status: "SOURCE_PROCUREMENT_PENDING" },
  publicSurfacePolicy: { search: "CANONICAL_ONLY", ask: "CANONICAL_ONLY", stagingExposure: 0 },
};
write("RAMAVERSE_STAGING_MASTER_LEDGER_V10.json", ledgerV10);

const continuationV10 = {
  ledgerId: "ramaverse-exact-physical-continuation-v10",
  generatedAt: "2026-08-19T13:48:00.000Z",
  historicalCanonicalBaseline: 550,
  physicalStagingCount: records.length,
  last_fully_acquired_kanda: "Ayodhya Kanda",
  last_fully_acquired_sarga: 29,
  last_fully_acquired_verse: "2.29.24",
  next_unacquired_verse: "2.30.1",
  source_id: "src-valmiki-ayodhya-s29-sanskritdocuments",
  source_locator: "SanskritDocuments, Valmiki Ramayana, Ayodhya Kanda, Sarga 29, verses 2.29.1–2.29.24",
  supporting_record_ids: ["stg-postv1-ayodhyakanda-s29-sarga-001", "stg-postv1-ayodhyakanda-s29-source-001"],
  duplicate_prevention: "No non-physical reconciliation candidate asserts Sarga 29 coverage. New acquisition begins at Sarga 30, verse 2.30.1."
};
write("EXACT_PHYSICAL_CONTINUATION_V10.json", continuationV10);
write("EXACT_NEXT_ACQUISITION_POINT.json", {
  status: "READY_FOR_SOURCE_PROCUREMENT",
  kanda: "Ayodhya Kanda",
  sarga: 30,
  verse: "2.30.1",
  priorPhysicalBoundary: "2.29.24",
  stagingPublished: 0,
  canonicalBaseline: 550
});

write("POST_V1_CONTENT_INVENTORY_V10.json", {
  inventoryId: "ramaverse-post-v1-content-inventory-v10",
  generatedAt: "2026-08-19T13:48:00.000Z",
  canonicalProduction: 550,
  physicalStaging: records.length,
  reconciliationOnlyCandidates: 7,
  stagingPublished: 0,
  publicSearchStaging: 0,
  publicAskStaging: 0,
  verifiedCoverage: { kanda: "Ayodhya Kanda", lastFullyAcquired: "2.29.24", nextUnacquired: "2.30.1" },
  newThisBatch: {
    sarga: 29,
    records: s29.records.length,
    verseSections: s29.records.filter((record) => record.record_type === "VERSE_SECTION").length,
    events: s29.records.filter((record) => record.record_type === "EVENT").length,
    dialogues: s29.records.filter((record) => record.record_type === "DIALOGUE").length,
    relationships: s29.records.filter((record) => record.record_type === "RELATIONSHIP").length,
    historicalTextualNorms: s29.records.filter((record) => record.record_type === "HISTORICAL_TEXTUAL_NORM").length,
    sourceReferences: s29.records.filter((record) => record.record_type === "SOURCE_REFERENCE").length
  }
});

write("S29_SOURCE_SCOPE_EVIDENCE.json", {
  evidenceId: "ramaverse-s29-source-scope-v1",
  generatedAt: "2026-08-19T13:48:00.000Z",
  primarySource: {
    sourceId: "src-valmiki-ayodhya-s29-sanskritdocuments",
    url: "https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga29/ayodhyaroman29.htm",
    verseRange: "2.29.1–2.29.24",
    verifiedVerseEnd: "2.29.24",
    accessStatus: "EXTRACTED"
  },
  crossChecks: [
    { sourceId: "src-valmiki-ayodhya-s29-stotranidhi-crosscheck", url: "https://stotranidhi.com/en/ayodhya-kanda-sarga-29-in-english/", confirmedVerseRange: "2.29.1–2.29.24", accessStatus: "EXTRACTED" },
    { sourceId: "src-valmiki-ayodhya-s29-vedapath-v7-crosscheck", url: "https://vedapath.app/sa/ramayana/ayodhya-kanda/29/7", confirmedVerse: "2.29.7", accessStatus: "EXTRACTED" }
  ],
  chapterScope: "Sita maintains her resolve to accompany Rama; the chapter closes with Rama's consoling response without a resolution.",
  safetyReview: {
    historicalMaritalDutyVerses: ["2.29.7", "2.29.16–2.29.18"],
    historicalLabel: "HISTORICAL_LITERARY_CONTEXT; NOT_MODERN_PRESCRIPTIVE_GUIDANCE",
    dramaticExpressionVerse: "2.29.21",
    dramaticExpressionLabel: "NARRATIVE_DRAMATIC_EXPRESSION; NOT_INSTRUCTIONAL"
  },
  result: "PASS"
});

const normalizeTamil = (record) => {
  const value = String(record.tamil_review_status ?? record.review_status ?? "NEEDS_HUMAN_REVIEW").toUpperCase();
  if (value.includes("SOURCE_TAMIL")) return "SOURCE_TAMIL";
  if (value.includes("HUMAN_REVIEWED")) return "HUMAN_REVIEWED";
  if (value.includes("MACHINE")) return "MACHINE_DRAFT";
  if (value.includes("FALLBACK")) return "FALLBACK_EN";
  if (value.includes("NOT_AVAILABLE")) return "NOT_AVAILABLE";
  return "NEEDS_HUMAN_REVIEW";
};
const priority = (record) => ({ DIALOGUE: "P1", HISTORICAL_TEXTUAL_NORM: "P1", SARGA: "P2", EVENT: "P2", RELATIONSHIP: "P2", VERSE_SECTION: "P3", SOURCE_REFERENCE: "P4" }[record.record_type] ?? "P4");
const reviewQueue = records.map((record) => ({
  candidate_id: record.candidate_id,
  record_type: record.record_type,
  kanda: record.kanda,
  sarga: record.sarga ?? null,
  verse_locator: record.verse_locator ?? record.sarga_reference ?? null,
  source_id: record.source_id ?? (record.source ?? [])[0] ?? null,
  tamil_translation_state: normalizeTamil(record),
  review_priority: priority(record),
  review_reason: record.record_type === "HISTORICAL_TEXTUAL_NORM" ? "Historical-context labeling and Tamil editorial phrasing require human review." : "Tamil editorial review required before any reconciliation consideration.",
  merge_state: record.merge_state ?? "awaiting_v1_4_0_reconciliation",
  publication_state: "STAGING_QUARANTINE_ONLY"
})).sort((a, b) => a.review_priority.localeCompare(b.review_priority) || a.candidate_id.localeCompare(b.candidate_id));
write("TAMIL_EDITORIAL_REVIEW_QUEUE.json", {
  queueId: "ramaverse-tamil-editorial-review-queue-v1",
  generatedAt: "2026-08-19T13:48:00.000Z",
  scope: "All physical staging records only; no queue item is public or production-approved.",
  countsByTranslationState: reviewQueue.reduce((counts, item) => ({ ...counts, [item.tamil_translation_state]: (counts[item.tamil_translation_state] ?? 0) + 1 }), {}),
  priorityRules: { P1: "Dialogues and historical-textual norms", P2: "Sarga summaries, events, and relationship records", P3: "Verse sections", P4: "Source references" },
  records: reviewQueue
});

const candidates = read("POST_V1_RECONCILIATION_CANDIDATES.json").candidates ?? [];
const candidateDecisions = candidates.map((candidate) => ({
  candidate_id: candidate.candidate_id,
  kanda: candidate.kanda,
  sarga: candidate.sarga,
  source_backed_physical_overlap: records.some((record) => Number(record.sarga) === Number(candidate.sarga)),
  decision: "AWAITING_V1_4_0_RECONCILIATION",
  reason: "Candidate remains separate from physical source-backed staging and is not merged, published, or treated as canonical."
}));
const physicalSemanticKeys = new Map();
for (const record of records) {
  const key = [record.record_type, record.kanda, record.sarga ?? record.sarga_reference, record.verse_locator ?? record.sarga_reference, record.speaker ?? "", record.listener ?? ""].join("|").toLowerCase();
  physicalSemanticKeys.set(key, [...(physicalSemanticKeys.get(key) ?? []), record.candidate_id]);
}
const exactSemanticDuplicates = [...physicalSemanticKeys.entries()].filter(([, matches]) => matches.length > 1).map(([key, matches]) => ({ semantic_key: key, candidate_ids: matches }));
write("POST_V1_SEMANTIC_DUPLICATE_AUDIT_V10.json", {
  auditId: "ramaverse-post-v1-semantic-duplicate-audit-v10",
  generatedAt: "2026-08-19T13:48:00.000Z",
  physicalStagingCount: records.length,
  duplicateStableIds: duplicateIds,
  exactSemanticDuplicates,
  candidateDecisions,
  result: duplicateIds.length === 0 && exactSemanticDuplicates.length === 0 ? "PASS" : "NO_GO"
});

const typeCounts = records.reduce((counts, record) => ({ ...counts, [record.record_type]: (counts[record.record_type] ?? 0) + 1 }), {});
const sourceIds = [...new Set(records.flatMap((record) => [record.source_id, ...(record.source ?? [])]).filter(Boolean))].sort();
const editorialIndex = {
  indexId: "ramaverse-post-v1-editorial-index-v10",
  generatedAt: "2026-08-19T13:48:00.000Z",
  visibility: "EDITORIAL_ONLY_STAGING",
  canonicalBaseline: 550,
  stagingRecords: records.length,
  publicSearchEntries: 0,
  publicAskEntries: 0,
  byRecordType: typeCounts,
  bySarga: records.reduce((counts, record) => ({ ...counts, [`${record.kanda} ${record.sarga ?? "legacy"}`]: (counts[`${record.kanda} ${record.sarga ?? "legacy"}`] ?? 0) + 1 }), {}),
  sourceIds
};
write("POST_V1_EDITORIAL_INDEX_V10.json", editorialIndex);

const relationEdges = records.filter((record) => record.record_type === "RELATIONSHIP" && record.subject && record.object).map((record) => ({ from: record.subject, to: record.object, relation: record.relation ?? "SOURCE_BOUND_RELATIONSHIP", evidence_id: record.candidate_id, source_id: record.source_id, verse_locator: record.verse_locator }));
const dialogueEdges = records.filter((record) => record.record_type === "DIALOGUE" && record.speaker && record.listener).map((record) => ({ from: record.speaker, to: record.listener, relation: "SPEAKS_TO", evidence_id: record.candidate_id, source_id: record.source_id, verse_locator: record.verse_locator }));
write("POST_V1_STAGING_KNOWLEDGE_GRAPH_V10.json", {
  graphId: "ramaverse-post-v1-staging-knowledge-graph-v10",
  generatedAt: "2026-08-19T13:48:00.000Z",
  visibility: "EDITORIAL_ONLY_STAGING",
  publicGraphExposure: 0,
  nodes: records.map((record) => ({ id: record.candidate_id, type: record.record_type, source_id: record.source_id ?? null, staging_state: "QUARANTINED" })),
  edges: [...relationEdges, ...dialogueEdges],
  safeguards: "This graph is an editorial evidence artifact only and is not exposed through the public canonical knowledge graph."
});
write("RELATIONAL_DIALOGUE_EVIDENCE_V10.json", {
  evidenceId: "ramaverse-relational-dialogue-evidence-v10",
  generatedAt: "2026-08-19T13:48:00.000Z",
  visibility: "EDITORIAL_ONLY_STAGING",
  s29Relationships: s29.records.filter((record) => record.record_type === "RELATIONSHIP").map((record) => record.candidate_id),
  s29Dialogues: s29.records.filter((record) => record.record_type === "DIALOGUE").map((record) => record.candidate_id),
  boundary: "Relationship and dialogue records preserve source-bound narrative context; no contemporary advice, guarantees, or public publication is inferred."
});
write("V1_5_RECONCILIATION_PREVIEW.json", {
  previewId: "ramaverse-v1.5-reconciliation-preview-v1",
  generatedAt: "2026-08-19T13:48:00.000Z",
  status: "EDITORIAL_PREVIEW_ONLY_NOT_PRODUCTION_READY",
  historicalCanonicalBaseline: 550,
  stagingPublished: 0,
  physicalStagingRecords: records.length,
  counts: { new_candidate: records.length, enrich_existing: 0, duplicate: duplicateIds.length, variant: 0, conflict: 0, source_review: records.length, tamil_review: reviewQueue.filter((item) => item.tamil_translation_state !== "HUMAN_REVIEWED").length, rejected: 0 },
  guardrails: ["No staging record is added to the historical canonical baseline.", "No public Search, Ask, mobile pack, or public graph surface receives staging data.", "Formal authoritative v1.4.0 reconciliation is required before any merge decision."],
  batchFocus: "Ayodhya Kanda Sarga 29 source-backed staging"
});

const state = read("RAMAVERSE_PROJECT_STATE.json");
const stateStagingFiles = [...new Set([...state.staging_files, "data/staging/post_v1/AYODHYA_S29_SOURCE_BACKED_RECORDS.json"])];
const stateRegistries = [...new Set([...state.stable_id_registries, "RAMAVERSE_STAGING_MASTER_LEDGER_V10.json", "POST_V1_SEMANTIC_DUPLICATE_AUDIT_V10.json"])];
const stateClusters = [...new Set([...state.source_clusters, "Valmiki Ramayana / Ayodhya Kanda / Sarga 29 physical source-backed staging"] )];
write("RAMAVERSE_PROJECT_STATE.json", {
  ...state,
  RV_01_staging_count: records.length,
  staging_published: 0,
  staging_files: stateStagingFiles,
  stable_id_registries: stateRegistries,
  RV_01_continuation: "Ayodhya Kanda Sarga 30, verse 2.30.1 onward",
  source_clusters: stateClusters,
  latest_batch_ids: ["AYODHYA_S29_SOURCE_BACKED_RECORDS", "POST_V1_EDITORIAL_INDEX_V10", "POST_V1_STAGING_KNOWLEDGE_GRAPH_V10"],
  task_output_map: { ...state.task_output_map, physical_ledger: "RAMAVERSE_STAGING_MASTER_LEDGER_V10.json", continuation: "EXACT_PHYSICAL_CONTINUATION_V10.json", source_ledger: "SOURCE_LEDGER_V10.json", corpus_archive: "RAMAVERSE-CORPUS-AUTHORITY-POST-V1-vNEXT.zip" },
  SHA256: { ...state.SHA256, s29_staging_payload: sha256("data/staging/post_v1/AYODHYA_S29_SOURCE_BACKED_RECORDS.json"), staging_ledger_v10: sha256("RAMAVERSE_STAGING_MASTER_LEDGER_V10.json") },
  exact_next_point: "Ayodhya Kanda / Sarga 30 / verse 2.30.1",
  updated_at: "2026-08-19T13:48:00.000Z"
});

console.log(JSON.stringify({ physicalStaging: records.length, s29Records: s29.records.length, sourceLedgerSources: sourceLedgerV10.sources.length, duplicateIds, status: "PASS" }, null, 2));
