import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runCanonicalImportDryRun } from "./importDryRun";

function withTempJson(name: string, value: unknown, test: (file: string) => void) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ramaverse-test-"));
  const file = path.join(dir, name);
  try {
    fs.writeFileSync(file, JSON.stringify(value), "utf-8");
    test(file);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe("RamaVerse reconciliation dry run", () => {
  it("reports duplicates and preserves the non-mutating review gate", () => {
    withTempJson("test_import_pack.json", {
      version: "1.4.0", reconciliationStatus: "pending", sourceRegistry: ["SRC-1"], traditionRegistry: ["VALMIKI"], canonicalRecordKeys: ["LEGACY-1"],
      records: [
        { recordKey: "NEW-1", kandaNumber: 1, sargaIdentifier: "Bala 1", summary: "Editorial summary", sourceId: "SRC-1", traditionId: "VALMIKI", reviewStatus: "source_verified" },
        { recordKey: "NEW-1", kandaNumber: 1, sargaIdentifier: "Bala 2", summary: "Duplicate", sourceId: "SRC-1", traditionId: "VALMIKI", reviewStatus: "needs_human_tamil_review" },
      ],
    }, (packPath) => {
      const report = runCanonicalImportDryRun(packPath);
      expect(report.dryRunOnly).toBe(true);
      expect(report.status).toBe("failed");
      expect(report.duplicateRecords).toBe(1);
      expect(report.candidateNewCanonicalRecords).toBe(1);
    });
  });

  it("validates staging-v2 source and tradition references without creating a canonical candidate", () => {
    withTempJson("test_staging_v2.json", {
      dataset_id: "ramaverse_canonical_staging_v2", dataset_status: "staging_only", historical_baseline: { total_records: 550 }, staging_defaults: { merge_state: "awaiting_v1_4_0_reconciliation", review_status: "needs_human_tamil_review" }, sources: [{ source_id: "SRC-1", tradition_classification: "PRIMARY_TEXT" }], records: [{ candidate_id: "STG-1", record_type: "EVENT", kanda: "Ayodhya Kanda", sarga_reference: "2.18.1", canonical_source_locator: "Ayodhya 2.18.1", tamil_explanation: "தமிழ் விளக்கம்", english_explanation: "Editorial staging summary.", source: ["SRC-1"], source_type: "PRIMARY_TEXT", tradition_classification: "PRIMARY_TEXT", possible_legacy_overlap: true, merge_state: "awaiting_v1_4_0_reconciliation", review_status: "needs_human_tamil_review" }],
    }, (packPath) => {
      const report = runCanonicalImportDryRun(packPath, { expectedObservedRecords: 2 });
      expect(report).toMatchObject({ dryRunOnly: true, inputFormat: "ramaverse-canonical-staging-v2", inputRecords: 1, validRecords: 1, potentialLegacyOverlap: 1, humanReviewRequired: 1, readyForEditorialReview: 1, candidateNewCanonicalRecords: 0, productionMerged: 0, inputCountMatchesExpected: false });
    });
  });
});
