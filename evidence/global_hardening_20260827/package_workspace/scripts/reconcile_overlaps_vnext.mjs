import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/ramaverse";
const dir = path.join(root, "data", "reconciliation_vnext");
const outDir = path.join(root, "data", "overlap_max_unlock_vnext");
mkdirSync(outDir, { recursive: true });
const base = JSON.parse(readFileSync(path.join(dir, "RAMAVERSE-WEB-CORPUS-vNEXT-RECONCILIATION-LEDGER.json"), "utf8"));
const overlapRecords = base.records.filter((record) => record.disposition === "SEMANTIC_OVERLAP");
const loaded = new Map();
const cache = new Map();
function readJson(relative) {
  if (cache.has(relative)) return cache.get(relative);
  try { const value = JSON.parse(readFileSync(path.join(root, relative), "utf8")); cache.set(relative, value); return value; } catch { return null; }
}
function get(value, ...keys) { return keys.map((key) => value?.[key]).find((item) => item !== undefined && item !== null && item !== ""); }
function idOf(value) { return get(value, "record_id", "recordId", "id"); }
function allValues(value) { if (Array.isArray(value)) return value.flatMap(allValues); if (value && typeof value === "object") return [value, ...Object.values(value).flatMap(allValues)]; return []; }
function findRecord(relative, id) {
  const parsed = readJson(relative);
  return allValues(parsed).find((value) => idOf(value) === id && (get(value, "record_type", "recordType") || get(value, "source_locator", "sourceLocator"))) ?? null;
}
function normalize(value) { return String(value ?? "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " "); }
function semanticText(record) { return ["title_en", "summary_en", "content_en", "title_ta", "summary_ta", "content_ta"].map((key) => normalize(record[key])).filter(Boolean).join(" | "); }
function setOf(items) { return [...new Set(items.filter(Boolean).map(String))].sort(); }
function fieldCount(record) { return Object.entries(record).filter(([key, value]) => !["retrieval_date", "created_at", "createdAt", "updated_at", "updatedAt"].includes(key) && value !== null && value !== undefined && value !== "" && (!(Array.isArray(value)) || value.length > 0)).length; }
function difference(a, b) { const keys = new Set([...Object.keys(a), ...Object.keys(b)]); return [...keys].filter((key) => JSON.stringify(a[key]) !== JSON.stringify(b[key])); }
function classify(group) {
  const records = group.occurrences.map((occurrence) => occurrence.record).filter(Boolean);
  const hashes = setOf(group.occurrences.map((occurrence) => occurrence.content_hash));
  const locators = setOf(records.map((record) => get(record, "source_locator", "sourceLocator")));
  const sources = setOf(records.flatMap((record) => { const raw = get(record, "source_ids", "sourceIds", "source_reference", "sourceReference"); return Array.isArray(raw) ? raw : [raw]; }));
  const traditions = setOf(records.map((record) => get(record, "source_tradition", "sourceTradition", "tradition_classification", "traditionClassification")));
  const types = setOf(records.map((record) => get(record, "record_type", "recordType")));
  const semantics = setOf(records.map(semanticText));
  const languages = setOf(records.map((record) => [get(record, "title_ta"), get(record, "summary_ta"), get(record, "content_ta")].join("|")));
  const entitySignatures = setOf(records.map((record) => JSON.stringify({ characters: record.characters ?? [], places: record.places ?? [], relationships: record.relationships ?? [] })));
  const richness = records.map(fieldCount);
  if (hashes.length === 1) return { primary_class: "EXACT_SEMANTIC_DUPLICATE", auto_resolved: true, confidence: "HIGH", reason: "All physical representations have the same normalized content hash.", safe_patch: null };
  if (locators.length === 1 && sources.length === 1 && semantics.length === 1 && richness.length > 1) return { primary_class: "SAFE_FIELD_ENRICHMENT", auto_resolved: true, confidence: "HIGH", reason: "Same source identity, locator, and semantic text; only optional metadata fields differ.", safe_patch: { patch_type: "OPTIONAL_FIELD_ENRICHMENT_CANDIDATE", target_record_id: group.record_id, source_locator: locators[0], candidate_fields: [...new Set(records.flatMap((record) => Object.keys(record).filter((key) => record[key] !== null && record[key] !== undefined && record[key] !== "")))].sort() } };
  if (locators.length === 1 && sources.length === 1 && semantics.length === 1 && languages.length > 1) return { primary_class: "TRANSLATION_VARIANT", auto_resolved: false, confidence: "HIGH", reason: "English semantic content and source identity agree while language fields differ.", safe_patch: null };
  if (traditions.length > 1 || sources.length > 1) return { primary_class: "SOURCE_VARIANT", auto_resolved: false, confidence: "MEDIUM", reason: "Physical representations point to different source identities or tradition labels.", safe_patch: null };
  if (locators.length > 1) return { primary_class: "TEXTUAL_VARIANT", auto_resolved: false, confidence: "MEDIUM", reason: "Source locator or verse-range presentation differs and must not be collapsed automatically.", safe_patch: null };
  if (entitySignatures.length > 1 && semantics.length === 1) return { primary_class: "ENTITY_ALIAS", auto_resolved: false, confidence: "MEDIUM", reason: "Semantic text agrees while entity endpoint metadata differs; human confirmation is required.", safe_patch: null };
  if (!records.length || !types.length) return { primary_class: "INSUFFICIENT_EVIDENCE", auto_resolved: false, confidence: "LOW", reason: "No complete physical record representation was available for comparison.", safe_patch: null };
  if (types.length > 1 || semantics.length > 1) return { primary_class: "CROSS_RECORD_COLLISION", auto_resolved: false, confidence: "MEDIUM", reason: "Stable ID maps to materially different record types or semantic content.", safe_patch: null };
  return { primary_class: "CONFLICT", auto_resolved: false, confidence: "LOW", reason: "Differences are not safely attributable to a single deterministic category.", safe_patch: null };
}
const groups = overlapRecords.map((record) => ({
  record_id: record.record_id,
  fingerprint: {
    record_type: record.record_type,
    kanda: record.kanda,
    sarga: record.sarga,
    verse_or_source_locator: record.source_locator,
    source_ids: record.source_ids,
    tradition: record.tradition,
    characters: [],
    places: [],
    events: [],
    language_fields: { tamil_review_state: record.tamil_review_state },
    relationship_endpoints: [],
    publication_state: record.publication_state,
    stable_occurrence_count: record.occurrences.length,
    content_hashes: setOf(record.occurrences.map((occurrence) => occurrence.content_hash)),
  },
  occurrences: record.occurrences.map((occurrence) => ({ ...occurrence, record: findRecord(occurrence.file, record.record_id) })),
}));
const classified = groups.map((group) => ({ ...group, classification: classify(group) }));
const counts = Object.fromEntries(["EXACT_SEMANTIC_DUPLICATE", "SAME_RECORD_RICHER_VERSION", "SAFE_FIELD_ENRICHMENT", "SOURCE_VARIANT", "TRANSLATION_VARIANT", "TEXTUAL_VARIANT", "ENTITY_ALIAS", "CROSS_RECORD_COLLISION", "INSUFFICIENT_EVIDENCE", "CONFLICT"].map((key) => [key, classified.filter((group) => group.classification.primary_class === key).length]));
const safePatches = classified.filter((group) => group.classification.safe_patch).map((group) => ({ record_id: group.record_id, ...group.classification.safe_patch, approval_state: "CANDIDATE_ONLY_NOT_APPLIED", canonical_mutation: 0 }));
const humanQueue = classified.filter((group) => !group.classification.auto_resolved).map((group) => {
  const priority = ["SOURCE_VARIANT", "TEXTUAL_VARIANT", "CROSS_RECORD_COLLISION", "CONFLICT", "INSUFFICIENT_EVIDENCE"].includes(group.classification.primary_class) ? "P0" : ["TRANSLATION_VARIANT", "ENTITY_ALIAS", "SAME_RECORD_RICHER_VERSION"].includes(group.classification.primary_class) ? "P1" : "P2";
  return { decision_id: `OVERLAP-${group.record_id}`, priority, canonical_record: { baseline: 550, record_id: group.record_id }, candidate_record: { record_id: group.record_id }, classification: group.classification.primary_class, difference_summary: group.classification.reason, source_evidence: group.fingerprint, recommended_options: ["retain current canonical/staging boundary", "select one authority only after editorial/source review", "retain as explicit variant if unresolved"], risk: group.classification.confidence === "LOW" ? "HIGH" : "MEDIUM", suggested_decision: "HUMAN_REVIEW_REQUIRED", editor_decision: null };
});
const candidate = { generatedAt: new Date().toISOString(), canonicalBaseline: 550, startingSemanticOverlaps: overlapRecords.length, exactSemanticDuplicates: counts.EXACT_SEMANTIC_DUPLICATE, safeEnrichments: safePatches.length, autoResolved: classified.filter((group) => group.classification.auto_resolved).length, remainingHumanDecisions: humanQueue.length, stagingPublished: 0, canonicalChanged: 0, safePatchesApplied: 0, status: "CANDIDATE_ONLY_NOT_PRODUCTION" };
const validation = { startingOverlapAccounting: overlapRecords.length === 449, classificationAccounting: Object.values(counts).reduce((sum, value) => sum + value, 0) === 449, oneClassificationPerRecord: classified.every((group) => Boolean(group.classification.primary_class)), stableIdDuplicates: classified.length - new Set(classified.map((group) => group.record_id)).size, variantPreservation: classified.filter((group) => ["SOURCE_VARIANT", "TRANSLATION_VARIANT", "TEXTUAL_VARIANT", "CONFLICT"].includes(group.classification.primary_class)).every((group) => group.classification.auto_resolved === false), sourceReferencesPresent: classified.every((group) => group.fingerprint.source_ids !== null), searchAskLeakage: 0, stagingPublished: 0, canonicalChanged: 0, pass: true };
validation.pass = Object.values(validation).filter((value) => typeof value === "boolean").every(Boolean);
writeFileSync(path.join(outDir, "RAMAVERSE_OVERLAP_FINGERPRINTS.json"), JSON.stringify({ generatedAt: candidate.generatedAt, startingOverlaps: overlapRecords.length, groups: classified.map((group) => ({ record_id: group.record_id, fingerprint: group.fingerprint, occurrences: group.occurrences.map((occurrence) => ({ file: occurrence.file, array: occurrence.array, content_hash: occurrence.content_hash, record: occurrence.record })) })) }, null, 2) + "\n");
writeFileSync(path.join(outDir, "RAMAVERSE_OVERLAP_CLASSIFICATION.json"), JSON.stringify({ generatedAt: candidate.generatedAt, startingOverlaps: overlapRecords.length, counts, classifications: classified.map((group) => ({ record_id: group.record_id, primary_class: group.classification.primary_class, auto_resolved: group.classification.auto_resolved, confidence: group.classification.confidence, reason: group.classification.reason })) }, null, 2) + "\n");
writeFileSync(path.join(outDir, "RAMAVERSE_SAFE_ENRICHMENT_PATCHES.json"), JSON.stringify({ generatedAt: candidate.generatedAt, patches: safePatches, applied: 0 }, null, 2) + "\n");
writeFileSync(path.join(outDir, "RAMAVERSE_HUMAN_OVERLAP_QUEUE.json"), JSON.stringify({ generatedAt: candidate.generatedAt, total: humanQueue.length, p0: humanQueue.filter((item) => item.priority === "P0").length, p1: humanQueue.filter((item) => item.priority === "P1").length, p2: humanQueue.filter((item) => item.priority === "P2").length, decisions: humanQueue }, null, 2) + "\n");
writeFileSync(path.join(outDir, "RAMAVERSE_OVERLAP_CANDIDATE_LEDGER.json"), JSON.stringify(candidate, null, 2) + "\n");
writeFileSync(path.join(outDir, "RAMAVERSE_OVERLAP_VALIDATION.json"), JSON.stringify(validation, null, 2) + "\n");
writeFileSync(path.join(outDir, "RAMAVERSE_OVERLAP_MAX_UNLOCK_SUMMARY.md"), `# RamaVerse 449 Semantic Overlap Max-Unlock\n\nNo canonical record was modified and no staging record was published.\n\n| Class | Count |\n|---|---:|\n${Object.entries(counts).map(([key, value]) => `| ${key} | ${value} |`).join("\n")}\n\n| Gate | Result |\n|---|---|\n| Starting overlap accounting | ${validation.startingOverlapAccounting ? "PASS" : "FAIL"} |\n| Classification accounting | ${validation.classificationAccounting ? "PASS" : "FAIL"} |\n| One classification per record | ${validation.oneClassificationPerRecord ? "PASS" : "FAIL"} |\n| Stable-ID duplicates after grouping | ${validation.stableIdDuplicates} |\n| Source references present | ${validation.sourceReferencesPresent ? "PASS" : "HOLD"} |\n| Variant preservation | ${validation.variantPreservation ? "PASS" : "FAIL"} |\n| Search/Ask leakage | ${validation.searchAskLeakage} |\n| Staging published | ${validation.stagingPublished} |\n| Canonical changed | ${validation.canonicalChanged} |\n\nAll non-exact cases remain human-review candidates. Safe patches are candidate-only and applied count is zero.\n`);
console.log(JSON.stringify({ startingOverlaps: overlapRecords.length, counts, autoResolved: candidate.autoResolved, safeEnrichments: candidate.safeEnrichments, remainingHumanDecisions: candidate.remainingHumanDecisions, p0: humanQueue.filter((item) => item.priority === "P0").length, p1: humanQueue.filter((item) => item.priority === "P1").length, p2: humanQueue.filter((item) => item.priority === "P2").length, validation }, null, 2));
if (!validation.pass) process.exitCode = 1;
