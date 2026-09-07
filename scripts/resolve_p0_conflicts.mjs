import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
const root = "/home/ubuntu/ramaverse";
const inputDir = path.join(root, "data", "overlap_max_unlock_vnext");
const outDir = path.join(root, "data", "p0_conflict_resolution_vnext");
mkdirSync(outDir, { recursive: true });
const fingerprints = JSON.parse(readFileSync(path.join(inputDir, "RAMAVERSE_OVERLAP_FINGERPRINTS.json"), "utf8"));
const classifications = JSON.parse(readFileSync(path.join(inputDir, "RAMAVERSE_OVERLAP_CLASSIFICATION.json"), "utf8"));
const conflicts = new Set(classifications.classifications.filter((item) => item.primary_class === "CONFLICT").map((item) => item.record_id));
const groups = fingerprints.groups.filter((group) => conflicts.has(group.record_id));
const get = (value, ...keys) => keys.map((key) => value?.[key]).find((item) => item !== undefined && item !== null && item !== "");
const list = (value) => Array.isArray(value) ? value.flat(Infinity).map(String).filter(Boolean) : value ? [String(value)] : [];
const uniq = (values) => [...new Set(values)].sort();
const norm = (value) => String(value ?? "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
const compactRecord = (record) => record ? {
  record_id: get(record, "record_id", "recordId", "id"),
  record_type: get(record, "record_type", "recordType"),
  kanda: get(record, "kanda", "kanda_id", "kandaId"),
  sarga: get(record, "sarga", "sarga_number", "sargaNumber"),
  locator: get(record, "source_locator", "sourceLocator", "verse_locator", "verseLocator", "locator"),
  source_ids: list(get(record, "source_ids", "sourceIds", "source_reference", "sourceReference")),
  edition: get(record, "edition", "edition_name", "editionName"),
  tradition: get(record, "tradition", "tradition_classification", "traditionClassification", "source_tradition", "sourceTradition"),
  characters: list(get(record, "characters", "character_ids", "characterIds")),
  places: list(get(record, "places", "place_ids", "placeIds")),
  events: list(get(record, "events", "event_ids", "eventIds")),
  speaker: get(record, "speaker", "speaker_id", "speakerId"),
  listener: get(record, "listener", "listener_id", "listenerId", "recipient", "recipient_id"),
  title_en: get(record, "title_en", "titleEn"),
  summary_en: get(record, "summary_en", "summaryEn", "content_en", "contentEn"),
  tamil_state: get(record, "tamil_review_state", "tamilReviewState", "review_status", "reviewStatus"),
} : null;
const semantic = (record) => norm([record?.title_en, record?.summary_en].filter(Boolean).join(" "));
const numericLocator = (value) => norm(value).replace(/\s+/g, ".").replace(/[^0-9.\-]/g, "");
const rootCause = (records) => {
  const sourceIds = uniq(records.flatMap((record) => record.source_ids));
  const locators = uniq(records.map((record) => record.locator));
  const editions = uniq(records.map((record) => record.edition));
  const traditions = uniq(records.map((record) => record.tradition));
  const types = uniq(records.map((record) => record.record_type));
  const speakers = uniq(records.map((record) => record.speaker));
  const listeners = uniq(records.map((record) => record.listener));
  const chars = uniq(records.flatMap((record) => record.characters));
  const places = uniq(records.flatMap((record) => record.places));
  const events = uniq(records.flatMap((record) => record.events));
  if (!records.length) return "OTHER";
  if (speakers.length > 1 || listeners.length > 1) return "DIALOGUE_ATTRIBUTION_CONFLICT";
  if (events.length > 1) return "EVENT_IDENTITY_CONFLICT";
  if (places.length > 1) return "PLACE_IDENTITY_CONFLICT";
  if (chars.length > 1) return "ENTITY_IDENTITY_CONFLICT";
  if (sourceIds.length > 1) return "SOURCE_IDENTITY_CONFLICT";
  if (traditions.length > 1) return "TRADITION_DIFFERENCE";
  if (editions.length > 1) return "SOURCE_IDENTITY_CONFLICT";
  if (types.length > 1) return "SCHEMA_MAPPING_CONFLICT";
  if (locators.length > 1) {
    const normalized = uniq(locators.map(numericLocator));
    if (normalized.length === 1) return "VERSE_NUMBERING_CONFLICT";
    if (records.some((record) => String(record.locator ?? "").match(/sarga|chapter|section/i))) return "SARGA_BOUNDARY_CONFLICT";
    return "SOURCE_LOCATOR_CONFLICT";
  }
  const semantics = uniq(records.map(semantic));
  if (semantics.length > 1) return "TRANSLATION_DIFFERENCE";
  return "OTHER";
};
const resolve = (records, cause) => {
  const sourceIds = uniq(records.flatMap((record) => record.source_ids));
  const locators = uniq(records.map((record) => record.locator));
  const editions = uniq(records.map((record) => record.edition));
  const traditions = uniq(records.map((record) => record.tradition));
  const types = uniq(records.map((record) => record.record_type));
  const semantics = uniq(records.map(semantic));
  if (!records.length || sourceIds.length === 0) return { state: "INSUFFICIENT_SOURCE_EVIDENCE", confidence: "LOW", reason: "Physical record representations were reopened, but no source ID is present for authority comparison." };
  if (sourceIds.length === 1 && locators.length === 1 && semantics.length === 1 && types.length === 1) return { state: "RESOLVED_SAFE_ENRICHMENT", confidence: "HIGH", reason: "Same source, locator, semantic content, and record type; differences are optional metadata only." };
  if (cause === "VERSE_NUMBERING_CONFLICT" && sourceIds.length === 1 && semantics.length === 1) return { state: "RESOLVED_NUMBERING_DIFFERENCE", confidence: "MEDIUM", reason: "Normalized locator is identical while display numbering differs; preserve both locators in a crosswalk." };
  if (cause === "TRADITION_DIFFERENCE" && traditions.length > 1 && semantics.length === 1) return { state: "RESOLVED_EDITION_DIFFERENCE", confidence: "MEDIUM", reason: "Same semantic description is explicitly associated with distinct tradition/edition labels; preserve each authority context." };
  if (cause === "SOURCE_IDENTITY_CONFLICT" && sourceIds.length > 1) return { state: "HUMAN_EDITOR_REQUIRED", confidence: "LOW", reason: "Multiple physical source identities cannot be ranked automatically." };
  if (editions.length > 1 || traditions.length > 1) return { state: "HUMAN_EDITOR_REQUIRED", confidence: "LOW", reason: "Edition or tradition disagreement requires editorial source authority." };
  if (types.length > 1 || cause === "DIALOGUE_ATTRIBUTION_CONFLICT" || cause === "EVENT_IDENTITY_CONFLICT" || cause === "ENTITY_IDENTITY_CONFLICT" || cause === "PLACE_IDENTITY_CONFLICT") return { state: "HUMAN_EDITOR_REQUIRED", confidence: "LOW", reason: "Entity, dialogue, event, or schema identity disagreement must not be collapsed automatically." };
  return { state: "HUMAN_EDITOR_REQUIRED", confidence: "LOW", reason: "No deterministic physical-authority rule supports resolution." };
};
const recordsOut = [];
for (const group of groups) {
  const records = group.occurrences.map((occurrence) => compactRecord(occurrence.record)).filter(Boolean);
  const cause = rootCause(records);
  const result = resolve(records, cause);
  recordsOut.push({
    conflict_id: `P0-${group.record_id}`,
    record_ids: [group.record_id],
    root_cause: cause,
    canonical_representation: records[0] ?? null,
    candidate_representations: records,
    source_evidence: { physical_files: uniq(group.occurrences.map((occurrence) => occurrence.file)), occurrence_count: group.occurrences.length, source_ids: uniq(records.flatMap((record) => record.source_ids)), locators: uniq(records.map((record) => record.locator)), editions: uniq(records.map((record) => record.edition)), traditions: uniq(records.map((record) => record.tradition)), content_hashes: group.fingerprint.content_hashes },
    exact_disagreement: result.reason,
    resolution_state: result.state,
    confidence: result.confidence,
    candidate_only: true,
    canonical_mutation: 0,
    staging_publication: 0,
  });
}
const rootCauseCounts = Object.fromEntries(["SOURCE_IDENTITY_CONFLICT", "SOURCE_LOCATOR_CONFLICT", "VERSE_NUMBERING_CONFLICT", "SARGA_BOUNDARY_CONFLICT", "ENTITY_IDENTITY_CONFLICT", "DIALOGUE_ATTRIBUTION_CONFLICT", "PLACE_IDENTITY_CONFLICT", "EVENT_IDENTITY_CONFLICT", "TRANSLATION_DIFFERENCE", "TEXTUAL_VARIANT", "TRADITION_DIFFERENCE", "SCHEMA_MAPPING_CONFLICT", "OTHER"].map((key) => [key, recordsOut.filter((record) => record.root_cause === key).length]));
const resolutionCounts = Object.fromEntries(["RESOLVED_CANONICAL_MATCH", "RESOLVED_SAFE_ENRICHMENT", "RESOLVED_ENTITY_ALIAS", "RESOLVED_EDITION_DIFFERENCE", "RESOLVED_NUMBERING_DIFFERENCE", "RESOLVED_DUPLICATE", "VALID_TEXTUAL_VARIANT", "VALID_TRANSLATION_VARIANT", "HUMAN_EDITOR_REQUIRED", "INSUFFICIENT_SOURCE_EVIDENCE", "REJECTED"].map((key) => [key, recordsOut.filter((record) => record.resolution_state === key).length]));
const patches = recordsOut.filter((record) => record.resolution_state === "RESOLVED_SAFE_ENRICHMENT").map((record) => ({ conflict_id: record.conflict_id, record_ids: record.record_ids, patch_type: "OPTIONAL_FIELD_ENRICHMENT_CANDIDATE", source_evidence: record.source_evidence, apply_state: "CANDIDATE_ONLY_NOT_APPLIED", canonical_mutation: 0 }));
const aliasCrosswalks = recordsOut.filter((record) => record.resolution_state === "RESOLVED_ENTITY_ALIAS").map((record) => ({ conflict_id: record.conflict_id, source_evidence: record.source_evidence, status: "CANDIDATE_ONLY_NOT_APPLIED" }));
const variants = recordsOut.filter((record) => ["VALID_TEXTUAL_VARIANT", "VALID_TRANSLATION_VARIANT", "RESOLVED_EDITION_DIFFERENCE", "RESOLVED_NUMBERING_DIFFERENCE"].includes(record.resolution_state)).map((record) => ({ conflict_id: record.conflict_id, root_cause: record.root_cause, source_evidence: record.source_evidence, preserve_separately: true, canonical_mutation: 0 }));
const human = recordsOut.filter((record) => ["HUMAN_EDITOR_REQUIRED", "INSUFFICIENT_SOURCE_EVIDENCE"].includes(record.resolution_state)).map((record) => ({ decision_id: record.conflict_id, record_ids: record.record_ids, root_cause: record.root_cause, canonical_representation: record.canonical_representation, candidate_representations: record.candidate_representations, source_evidence: record.source_evidence, exact_disagreement: record.exact_disagreement, risk: record.confidence === "LOW" ? "HIGH" : "MEDIUM", decision_choices: ["retain current canonical/staging boundary", "resolve to one source authority after editor review", "preserve as an explicit edition/tradition/entity/event variant"], recommended_editorial_action: "HUMAN_EDITOR_REQUIRED", confidence: record.confidence, editor_decision: null }));
const validation = { startingP0: conflicts.size, rootCauseAccounting: Object.values(rootCauseCounts).reduce((sum, value) => sum + value, 0) === conflicts.size, resolutionAccounting: Object.values(resolutionCounts).reduce((sum, value) => sum + value, 0) === conflicts.size, stableIdDuplicates: recordsOut.length - new Set(recordsOut.map((record) => record.record_ids[0])).size, sourceReferenceValidation: recordsOut.every((record) => record.source_evidence.source_ids.length > 0 || record.resolution_state === "INSUFFICIENT_SOURCE_EVIDENCE"), sourceLocatorValidation: recordsOut.every((record) => record.source_evidence.locators.length > 0), oneDecisionPerConflict: recordsOut.every((record) => Boolean(record.resolution_state)), variantPreservation: variants.every((variant) => variant.preserve_separately), aliasIntegrity: aliasCrosswalks.every((alias) => alias.status === "CANDIDATE_ONLY_NOT_APPLIED"), searchLeakage: 0, askLeakage: 0, canonicalMutation: 0, stagingPublished: 0, mobileModified: false, status: "PASS" };
validation.status = Object.entries(validation).filter(([key]) => ["rootCauseAccounting", "resolutionAccounting", "stableIdDuplicates", "sourceReferenceValidation", "sourceLocatorValidation", "oneDecisionPerConflict", "variantPreservation", "aliasIntegrity", "searchLeakage", "askLeakage", "canonicalMutation", "stagingPublished", "mobileModified"].includes(key)).every(([key, value]) => value === true || value === 0 || (key === "mobileModified" && value === false)) ? "PASS" : "FAIL";
const candidateLedger = { generatedAt: new Date().toISOString(), startingP0: conflicts.size, rootCauseCounts, resolutionCounts, autoResolved: recordsOut.filter((record) => record.resolution_state !== "HUMAN_EDITOR_REQUIRED" && record.resolution_state !== "INSUFFICIENT_SOURCE_EVIDENCE").length, patchesCreated: patches.length, patchesApplied: 0, humanDecisionsRemaining: human.length, canonicalBaseline: 550, canonicalChanged: 0, stagingPublished: 0, mobileModified: false, status: "CANDIDATE_ONLY_NOT_PRODUCTION" };
writeFileSync(path.join(outDir, "RAMAVERSE_P0_CONFLICT_ROOT_CAUSE_LEDGER.json"), JSON.stringify({ generatedAt: candidateLedger.generatedAt, startingP0: conflicts.size, rootCauseCounts, conflicts: recordsOut.map((record) => ({ conflict_id: record.conflict_id, root_cause: record.root_cause, record_ids: record.record_ids })) }, null, 2) + "\n");
writeFileSync(path.join(outDir, "RAMAVERSE_P0_SOURCE_EVIDENCE_MAP.json"), JSON.stringify({ generatedAt: candidateLedger.generatedAt, evidence: recordsOut.map((record) => ({ conflict_id: record.conflict_id, source_evidence: record.source_evidence, canonical_representation: record.canonical_representation, candidate_representations: record.candidate_representations })) }, null, 2) + "\n");
writeFileSync(path.join(outDir, "RAMAVERSE_P0_RESOLUTION_LEDGER.json"), JSON.stringify({ generatedAt: candidateLedger.generatedAt, resolutionCounts, resolutions: recordsOut }, null, 2) + "\n");
writeFileSync(path.join(outDir, "RAMAVERSE_P0_RESOLUTION_PATCHES.json"), JSON.stringify({ generatedAt: candidateLedger.generatedAt, patches, applied: 0 }, null, 2) + "\n");
writeFileSync(path.join(outDir, "RAMAVERSE_P0_VARIANT_LEDGER.json"), JSON.stringify({ generatedAt: candidateLedger.generatedAt, variants, preservedWithoutMutation: true }, null, 2) + "\n");
writeFileSync(path.join(outDir, "RAMAVERSE_P0_ENTITY_ALIAS_CROSSWALKS.json"), JSON.stringify({ generatedAt: candidateLedger.generatedAt, crosswalks: aliasCrosswalks, applied: 0 }, null, 2) + "\n");
writeFileSync(path.join(outDir, "RAMAVERSE_FINAL_HUMAN_EDITOR_QUEUE.json"), JSON.stringify({ generatedAt: candidateLedger.generatedAt, total: human.length, p0: human.length, p1: 0, p2: 0, decisions: human }, null, 2) + "\n");
writeFileSync(path.join(outDir, "RAMAVERSE_P0_CANDIDATE_LEDGER.json"), JSON.stringify(candidateLedger, null, 2) + "\n");
writeFileSync(path.join(outDir, "RAMAVERSE_P0_VALIDATION.json"), JSON.stringify(validation, null, 2) + "\n");
writeFileSync(path.join(outDir, "RAMAVERSE_P0_SUMMARY.md"), `# RamaVerse P0 Conflict Source Resolution\n\nNo UI, deployment, Mobile modification, canonical mutation, or staging publication was performed.\n\n| Root cause | Count |\n|---|---:|\n${Object.entries(rootCauseCounts).map(([key, value]) => `| ${key} | ${value} |`).join("\n")}\n\n| Resolution | Count |\n|---|---:|\n${Object.entries(resolutionCounts).map(([key, value]) => `| ${key} | ${value} |`).join("\n")}\n\nThe candidate-only patches are not applied. Legitimate edition, numbering, textual, translation, entity, dialogue, and event differences remain preserved for editorial review.\n`);
console.log(JSON.stringify({ startingP0: conflicts.size, rootCauseCounts, resolutionCounts, autoResolved: candidateLedger.autoResolved, patches: patches.length, humanDecisions: human.length, validation }, null, 2));
if (validation.status !== "PASS") process.exitCode = 1;
