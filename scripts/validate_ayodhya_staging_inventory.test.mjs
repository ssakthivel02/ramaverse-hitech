import assert from "node:assert/strict";
import test from "node:test";
import { inspectBatches } from "./validate_ayodhya_staging_inventory.mjs";

const file = s => `AYODHYA_S${s}_SOURCE_BACKED_RECORDS.json`;
const early = (s, count = 1) => ({
  file: file(s),
  payload: {
    recordCount: count,
    records: [{ candidate_id: `stg-postv1-ayodhyakanda-s${s}-sarga-001`, source_id: `src-s${s}`, sarga: s, publication_policy: "STAGING_QUARANTINE_ONLY", merge_state: "awaiting_v1_4_0_reconciliation", tamil_review_status: "NEEDS_TAMIL_REVIEW", possible_legacy_overlap: true }]
  }
});
const middle = s => ({
  file: file(s),
  payload: [{ candidate_id: `stg-postv1-ayodhyakanda-s${s}-sarga-001`, source_id: `src-s${s}`, sarga: s, publication_policy: "STAGING_QUARANTINE_ONLY", merge_state: "awaiting_v1_4_0_reconciliation", tamil_review_status: "NEEDS_TAMIL_REVIEW", possible_legacy_overlap: true }]
});
const late = s => ({
  file: file(s),
  payload: {
    recordsCount: 1,
    records: [{ id: `RV-STG-AYODHYA-S${s}`, sourceIds: [`src-s${s}`], sarga: s, publicationState: "UNPUBLISHED_STAGING", mergeState: "QUARANTINED_UNRECONCILED", reviewState: "MACHINE_DRAFT_NEEDS_REVIEW" }]
  }
});
const inspect = batches => inspectBatches(batches, { enforceCompleteRange: false });

test("accepts the three quarantined schemas without touching source objects", () => {
  const input = [early(21), middle(53), late(66)];
  const original = JSON.stringify(input);
  const result = inspect(input);
  assert.equal(result.valid, true);
  assert.equal(result.filesChecked, 3);
  assert.equal(result.physicalRecords, 3);
  assert.equal(result.quarantinedRecords, 3);
  assert.equal(result.uniqueRecordIds, 3);
  assert.deepEqual(result.families, { "21-52": 1, "53-65": 1, "66-95": 1 });
  assert.equal(JSON.stringify(input), original);
});

test("fails closed on Sarga 51 and 52 header-count drift", () => {
  const result = inspect([early(51, 2), early(52, 2)]);
  assert.equal(result.valid, false);
  assert.deepEqual(result.findings.filter(x => x.code === "COUNT_MISMATCH").map(x => x.file), [file(51), file(52)]);
  assert.equal(result.physicalRecords, 2);
});

test("detects duplicate candidate IDs across separate batches", () => {
  const a = early(21), b = early(22);
  b.payload.records[0].candidate_id = a.payload.records[0].candidate_id;
  assert.ok(inspect([a, b]).findings.some(x => x.code === "DUPLICATE_RECORD_ID"));
});

test("blocks unreviewed publication metadata and missing source reference", () => {
  const a = middle(53), b = late(66);
  delete a.payload[0].publication_policy;
  b.payload.records[0].sourceIds = [];
  b.payload.records[0].publicationState = "PUBLISHED";
  const codes = inspect([a, b]).findings.map(x => x.code);
  assert.equal(codes.filter(x => x === "PUBLICATION_GUARD_MISSING").length, 2);
  assert.ok(codes.includes("MISSING_SOURCE_REFERENCE"));
});

test("fails when a full archive omits any Sarga in 21–95", () => {
  const result = inspectBatches([early(21)]);
  assert.equal(result.valid, false);
  assert.equal(result.findings.filter(x => x.code === "MISSING_BATCH").length, 74);
});

test("rejects incorrect format and missing batch-count header", () => {
  const a = middle(53), b = early(51);
  a.payload = { records: a.payload };
  delete b.payload.recordCount;
  const codes = inspect([a, b]).findings.map(x => x.code);
  assert.ok(codes.includes("WRONG_CONTAINER_SHAPE"));
  assert.ok(codes.includes("INVALID_DECLARED_COUNT"));
});

test("checks the later family recordsCount and quarantine status", () => {
  const a = late(95); a.payload.recordsCount = 5;
  a.payload.records[0].reviewState = "APPROVED";
  const codes = inspect([a]).findings.map(x => x.code);
  assert.ok(codes.includes("COUNT_MISMATCH"));
  assert.ok(codes.includes("PUBLICATION_GUARD_MISSING"));
});

test("blocks early-family promotion even when publication_policy still says quarantine", () => {
  const batch = early(21);
  batch.payload.records[0].merge_state = "promoted";
  const result = inspect([batch]);
  assert.equal(result.valid, false);
  assert.ok(result.findings.some(x => x.code === "PUBLICATION_GUARD_MISSING"));
});

test("requires actual human-review-pending state for early family", () => {
  const batch = middle(53);
  batch.payload[0].tamil_review_status = "HUMAN_APPROVED";
  const result = inspect([batch]);
  assert.equal(result.valid, false);
  assert.ok(result.findings.some(x => x.code === "PUBLICATION_GUARD_MISSING"));
});

test("requires explicit boolean legacy-overlap disposition for early-family records", () => {
  const a = early(21), b = middle(53);
  delete a.payload.records[0].possible_legacy_overlap;
  b.payload[0].possible_legacy_overlap = "false";
  const result = inspect([a, b]);
  assert.equal(result.valid, false);
  assert.equal(result.findings.filter(x => x.code === "MISSING_LEGACY_OVERLAP_DISPOSITION").length, 2);
});

test("accepts explicit false as unresolved overlap classification without auto-promoting", () => {
  const a = middle(55);
  a.payload[0].possible_legacy_overlap = false;
  const result = inspect([a]);
  assert.equal(result.valid, true);
  assert.equal(result.quarantinedRecords, 1);
});
