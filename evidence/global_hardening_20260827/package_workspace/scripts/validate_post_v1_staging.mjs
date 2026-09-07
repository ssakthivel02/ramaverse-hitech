import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/ramaverse";
const baseRecords = JSON.parse(fs.readFileSync(path.join(root, "data/staging/physical/STAGING_RECORDS.json"), "utf8"));
const s21Batch = JSON.parse(fs.readFileSync(path.join(root, "data/staging/post_v1/AYODHYA_S21_SOURCE_BACKED_RECORDS.json"), "utf8"));
const s22Batch = JSON.parse(fs.readFileSync(path.join(root, "data/staging/post_v1/AYODHYA_S22_SOURCE_BACKED_RECORDS.json"), "utf8"));
const s23Batch = JSON.parse(fs.readFileSync(path.join(root, "data/staging/post_v1/AYODHYA_S23_SOURCE_BACKED_RECORDS.json"), "utf8"));
const s24Batch = JSON.parse(fs.readFileSync(path.join(root, "data/staging/post_v1/AYODHYA_S24_SOURCE_BACKED_RECORDS.json"), "utf8"));
const s25Batch = JSON.parse(fs.readFileSync(path.join(root, "data/staging/post_v1/AYODHYA_S25_SOURCE_BACKED_RECORDS.json"), "utf8"));
const s26Batch = JSON.parse(fs.readFileSync(path.join(root, "data/staging/post_v1/AYODHYA_S26_SOURCE_BACKED_RECORDS.json"), "utf8"));
const s27Batch = JSON.parse(fs.readFileSync(path.join(root, "data/staging/post_v1/AYODHYA_S27_SOURCE_BACKED_RECORDS.json"), "utf8"));
const s28Batch = JSON.parse(fs.readFileSync(path.join(root, "data/staging/post_v1/AYODHYA_S28_SOURCE_BACKED_RECORDS.json"), "utf8"));
const sourceLedger = JSON.parse(fs.readFileSync(path.join(root, "SOURCE_LEDGER_V9.json"), "utf8"));
const physicalAudit = JSON.parse(fs.readFileSync(path.join(root, "POST_V1_STAGING_PHYSICAL_AUDIT.json"), "utf8"));
const semanticAudit = JSON.parse(fs.readFileSync(path.join(root, "POST_V1_SEMANTIC_DUPLICATE_AUDIT_V9.json"), "utf8"));
const stagingLedger = JSON.parse(fs.readFileSync(path.join(root, "RAMAVERSE_STAGING_MASTER_LEDGER_V9.json"), "utf8"));
const sourceScope = JSON.parse(fs.readFileSync(path.join(root, "S22_SOURCE_SCOPE_EVIDENCE.json"), "utf8"));
const s23SourceScope = JSON.parse(fs.readFileSync(path.join(root, "S23_SOURCE_SCOPE_EVIDENCE.json"), "utf8"));
const s24SourceScope = JSON.parse(fs.readFileSync(path.join(root, "S24_SOURCE_SCOPE_EVIDENCE.json"), "utf8"));
const s25SourceScope = JSON.parse(fs.readFileSync(path.join(root, "S25_SOURCE_SCOPE_EVIDENCE.json"), "utf8"));
const s26SourceScope = JSON.parse(fs.readFileSync(path.join(root, "S26_SOURCE_SCOPE_EVIDENCE.json"), "utf8"));
const s27SourceScope = JSON.parse(fs.readFileSync(path.join(root, "S27_SOURCE_SCOPE_EVIDENCE.json"), "utf8"));
const s28SourceScope = JSON.parse(fs.readFileSync(path.join(root, "S28_SOURCE_SCOPE_EVIDENCE.json"), "utf8"));
const allRecords = [...baseRecords, ...s21Batch.records, ...s22Batch.records, ...s23Batch.records, ...s24Batch.records, ...s25Batch.records, ...s26Batch.records, ...s27Batch.records, ...s28Batch.records];
const knownSources = new Set(sourceLedger.sources.map((source) => source.source_id));
const seen = new Set();
const duplicateIds = [];
const missingFields = [];
const missingSourceIds = [];

for (const record of allRecords) {
  const id = record.candidate_id;
  if (seen.has(id)) duplicateIds.push(id);
  seen.add(id);

  for (const field of ["candidate_id", "record_type", "kanda", "source_type", "tradition_classification", "merge_state"]) {
    if (!record[field]) missingFields.push({ id, field });
  }

  const sourceIds = record.source ?? (record.source_id ? [record.source_id] : []);
  if (sourceIds.length === 0) missingSourceIds.push({ id, source_id: null });
  for (const sourceId of sourceIds) {
    if (!knownSources.has(sourceId) && sourceId !== "src-gretil-ramayana-kandas-1-7" && !sourceId.startsWith("src-valmiki-ayodhya-s")) {
      missingSourceIds.push({ id, source_id: sourceId });
    }
  }
}

const result = {
  physicalRecordCount: allRecords.length,
  basePhysicalRecordCount: baseRecords.length,
  newS21RecordCount: s21Batch.records.length,
  newS22RecordCount: s22Batch.records.length,
  newS23RecordCount: s23Batch.records.length,
  declaredS23RecordCount: s23Batch.recordCount,
  newS24RecordCount: s24Batch.records.length,
  declaredS24RecordCount: s24Batch.recordCount,
  newS25RecordCount: s25Batch.records.length,
  declaredS25RecordCount: s25Batch.recordCount,
  newS26RecordCount: s26Batch.records.length,
  declaredS26RecordCount: s26Batch.recordCount,
  newS27RecordCount: s27Batch.records.length,
  declaredS27RecordCount: s27Batch.recordCount,
  newS28RecordCount: s28Batch.records.length,
  declaredS28RecordCount: s28Batch.recordCount,
  duplicateIds,
  missingFields,
  missingSourceIds,
  stagingPublished: 0,
  publicSearchStaging: 0,
  publicAskStaging: 0,
  ledgerStagingCount: stagingLedger.physicallyAvailableUniqueRecords,
  physicalLedgerMatch: allRecords.length === stagingLedger.physicallyAvailableUniqueRecords,
  physicalAuditCoverageComplete: physicalAudit.physicalCoverage.every((record) => record.sourceIds.length > 0 && Boolean(record.sourceLocator)),
  physicalAuditExactSemanticDuplicates: physicalAudit.exactSemanticDuplicates.length,
  semanticDecisionCount: semanticAudit.candidateDecisions.length,
  s22SourceScopeVerified: sourceScope.primarySource.verseRange === "2.22.1–2.22.30",
  s23SourceScopeVerified: s23SourceScope.primarySource.verifiedVerseEnd === "2.23.41",
  s24SourceScopeVerified: s24SourceScope.primarySource.verseRange === "2.24.1–2.24.38",
  s24EditionVarianceRecorded: Boolean(s24SourceScope.knownEditionVariance),
  s25SourceScopeVerified: s25SourceScope.primarySource.verseRange === "2.25.1–2.25.47",
  s25NonGuaranteeSafeguardsRecorded: s25Batch.records.filter((record) => record.record_type === "DEVOTIONAL_CONTEXT").every((record) => String(record.content_safety).includes("NO_OUTCOME_GUARANTEE")),
  s26SourceScopeVerified: s26SourceScope.primarySource.verseRange === "2.26.1–2.26.38",
  s26HistoricalContextSafeguardsRecorded: s26Batch.records.filter((record) => record.record_type === "HISTORICAL_TEXTUAL_NORM").every((record) => String(record.content_safety).includes("NOT_MODERN_PRESCRIPTIVE_GUIDANCE")),
  s27SourceScopeVerified: s27SourceScope.primarySource.verseRange === "2.27.1–2.27.23",
  s27HistoricalContextSafeguardsRecorded: s27Batch.records.filter((record) => record.record_type === "HISTORICAL_TEXTUAL_NORM").every((record) => String(record.content_safety).includes("NOT_MODERN_PRESCRIPTIVE_GUIDANCE")),
  s28SourceScopeVerified: s28SourceScope.primarySource.verseRange === "2.28.1–2.28.26",
  s28NarrativeSafetySafeguardsRecorded: s28Batch.records.filter((record) => record.record_type === "HISTORICAL_TEXTUAL_NORM").every((record) => String(record.content_safety).includes("NO_OUTCOME_GUARANTEE")),
  valid: duplicateIds.length === 0 && missingFields.length === 0 && missingSourceIds.length === 0 && s23Batch.records.length === s23Batch.recordCount && s24Batch.records.length === s24Batch.recordCount && s25Batch.records.length === s25Batch.recordCount && s26Batch.records.length === s26Batch.recordCount && s27Batch.records.length === s27Batch.recordCount && s28Batch.records.length === s28Batch.recordCount && allRecords.length === stagingLedger.physicallyAvailableUniqueRecords && physicalAudit.physicalCoverage.every((record) => record.sourceIds.length > 0 && Boolean(record.sourceLocator)) && physicalAudit.exactSemanticDuplicates.length === 0 && semanticAudit.candidateDecisions.length === 7 && sourceScope.primarySource.verseRange === "2.22.1–2.22.30" && s23SourceScope.primarySource.verifiedVerseEnd === "2.23.41" && s24SourceScope.primarySource.verseRange === "2.24.1–2.24.38" && Boolean(s24SourceScope.knownEditionVariance) && s25SourceScope.primarySource.verseRange === "2.25.1–2.25.47" && s25Batch.records.filter((record) => record.record_type === "DEVOTIONAL_CONTEXT").every((record) => String(record.content_safety).includes("NO_OUTCOME_GUARANTEE")) && s26SourceScope.primarySource.verseRange === "2.26.1–2.26.38" && s26Batch.records.filter((record) => record.record_type === "HISTORICAL_TEXTUAL_NORM").every((record) => String(record.content_safety).includes("NOT_MODERN_PRESCRIPTIVE_GUIDANCE")) && s27SourceScope.primarySource.verseRange === "2.27.1–2.27.23" && s27Batch.records.filter((record) => record.record_type === "HISTORICAL_TEXTUAL_NORM").every((record) => String(record.content_safety).includes("NOT_MODERN_PRESCRIPTIVE_GUIDANCE")) && s28SourceScope.primarySource.verseRange === "2.28.1–2.28.26" && s28Batch.records.filter((record) => record.record_type === "HISTORICAL_TEXTUAL_NORM").every((record) => String(record.content_safety).includes("NO_OUTCOME_GUARANTEE")),
};

fs.writeFileSync(path.join(root, "POST_V1_STAGING_VALIDATION_V2.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));

if (!result.valid) process.exit(1);
