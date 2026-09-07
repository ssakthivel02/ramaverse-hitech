import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/ramaverse";
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const payloadNames = fs.readdirSync(path.join(root, "data/staging/post_v1")).filter((name) => /^AYODHYA_S\d+_SOURCE_BACKED_RECORDS\.json$/.test(name)).sort((a, b) => Number(a.match(/S(\d+)/)[1]) - Number(b.match(/S(\d+)/)[1]));
const payloads = [
  { path: "data/staging/physical/STAGING_RECORDS.json", records: read("data/staging/physical/STAGING_RECORDS.json") },
  ...payloadNames.map((name) => ({ path: `data/staging/post_v1/${name}`, batch: read(`data/staging/post_v1/${name}`) }))
];
for (const payload of payloads.slice(1)) payload.records = payload.batch.records ?? [];
const allRecords = payloads.flatMap((payload) => payload.records);
const sourceLedger = read("SOURCE_LEDGER_V10.json");
const physicalAudit = read("POST_V1_STAGING_PHYSICAL_AUDIT_V10.json");
const semanticAudit = read("POST_V1_SEMANTIC_DUPLICATE_AUDIT_V10.json");
const stagingLedger = read("RAMAVERSE_STAGING_MASTER_LEDGER_V10.json");
const sourceScope = read("S29_SOURCE_SCOPE_EVIDENCE.json");
const knownSources = new Set(sourceLedger.sources.map((source) => source.source_id));
const seen = new Set();
const duplicateIds = [];
const missingFields = [];
const missingSourceIds = [];
const required = [
  ["candidate_id", (record) => Boolean(record.candidate_id)],
  ["record_type", (record) => Boolean(record.record_type)],
  ["kanda", (record) => Boolean(record.kanda)],
  ["sarga_or_section", (record) => Boolean(record.sarga ?? record.sarga_reference ?? record.verse_locator)],
  ["source_id", (record) => Boolean(record.source_id) || (Array.isArray(record.source) && record.source.length > 0)],
  ["source_locator", (record) => Boolean(record.source_locator ?? record.canonical_source_locator ?? record.locator)],
  ["source_type", (record) => Boolean(record.source_type)],
  ["tradition_classification", (record) => Boolean(record.tradition_classification)],
  ["confidence", (record) => Boolean(record.confidence)],
  ["review_status", (record) => Boolean(record.tamil_review_status ?? record.review_status)],
  ["merge_state", (record) => Boolean(record.merge_state)],
  ["possible_legacy_overlap", (record) => typeof record.possible_legacy_overlap === "boolean"]
];
for (const record of allRecords) {
  if (seen.has(record.candidate_id)) duplicateIds.push(record.candidate_id);
  seen.add(record.candidate_id);
  for (const [field, predicate] of required) if (!predicate(record)) missingFields.push({ id: record.candidate_id, field });
  for (const sourceId of [...new Set([record.source_id, ...(Array.isArray(record.source) ? record.source : [])].filter(Boolean))]) {
    if (!knownSources.has(sourceId) && sourceId !== "src-gretil-ramayana-kandas-1-7") missingSourceIds.push({ id: record.candidate_id, source_id: sourceId });
  }
}
const declaredBatchCounts = payloads.slice(1).map((payload) => ({ path: payload.path, actual: payload.records.length, declared: payload.batch.recordCount, match: payload.records.length === payload.batch.recordCount }));
const s29Batch = payloads.find((payload) => payload.path.endsWith("AYODHYA_S29_SOURCE_BACKED_RECORDS.json"))?.batch;
const s29HistoricalNorms = s29Batch?.records.filter((record) => record.record_type === "HISTORICAL_TEXTUAL_NORM") ?? [];
const s29DramaticDialogue = s29Batch?.records.find((record) => record.candidate_id === "stg-postv1-ayodhyakanda-s29-dialogue-003");
const result = {
  validationId: "ramaverse-post-v1-staging-validation-v10",
  generatedAt: new Date().toISOString(),
  physicalRecordCount: allRecords.length,
  basePhysicalRecordCount: payloads[0].records.length,
  postV1PhysicalRecordCount: allRecords.length - payloads[0].records.length,
  s29RecordCount: s29Batch?.records.length ?? 0,
  declaredBatchCounts,
  duplicateIds,
  missingFields,
  missingSourceIds,
  stagingPublished: stagingLedger.stagingPublished,
  publicSearchStaging: stagingLedger.publicSurfacePolicy?.stagingExposure ?? null,
  publicAskStaging: stagingLedger.publicSurfacePolicy?.stagingExposure ?? null,
  ledgerStagingCount: stagingLedger.physicallyAvailableUniqueRecords,
  physicalLedgerMatch: allRecords.length === stagingLedger.physicallyAvailableUniqueRecords,
  physicalAuditCoverageComplete: physicalAudit.physicalCoverage.every((record) => record.sourceIds.length > 0 && Boolean(record.sourceLocator)),
  physicalAuditExactSemanticDuplicates: physicalAudit.exactSemanticDuplicates.length,
  semanticDecisionCount: semanticAudit.candidateDecisions.length,
  s29SourceScopeVerified: sourceScope.primarySource.verseRange === "2.29.1–2.29.24" && sourceScope.primarySource.verifiedVerseEnd === "2.29.24",
  s29HistoricalContextSafeguardsRecorded: s29HistoricalNorms.length === 2 && s29HistoricalNorms.every((record) => String(record.content_safety).includes("NOT_MODERN_PRESCRIPTIVE_GUIDANCE")),
  s29DramaticExpressionSafeguardRecorded: String(s29DramaticDialogue?.content_safety ?? "").includes("NARRATIVE_DRAMATIC_EXPRESSION") && String(s29DramaticDialogue?.content_safety ?? "").includes("NOT_INSTRUCTIONAL"),
  valid: false
};
result.valid = result.physicalRecordCount === result.ledgerStagingCount && result.duplicateIds.length === 0 && result.missingFields.length === 0 && result.missingSourceIds.length === 0 && result.declaredBatchCounts.every((batch) => batch.match) && result.stagingPublished === 0 && result.publicSearchStaging === 0 && result.publicAskStaging === 0 && result.physicalAuditCoverageComplete && result.physicalAuditExactSemanticDuplicates === 0 && result.semanticDecisionCount === 7 && result.s29SourceScopeVerified && result.s29HistoricalContextSafeguardsRecorded && result.s29DramaticExpressionSafeguardRecorded;
fs.writeFileSync(path.join(root, "POST_V1_STAGING_VALIDATION_V10.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));
if (!result.valid) process.exit(1);
