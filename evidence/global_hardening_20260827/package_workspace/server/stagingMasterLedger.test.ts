import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/ramaverse";

describe("RamaVerse physical staging master ledger", () => {
  it("keeps physical records, unavailable declarations, and canonical publication as separate facts", () => {
    const ledger = JSON.parse(fs.readFileSync(path.join(root, "RAMAVERSE_STAGING_MASTER_LEDGER.json"), "utf8"));
    expect(ledger).toMatchObject({
      mode: "non_mutating_physical_artifact_inventory",
      historicalCanonicalBaseline: 550,
      stagingPublished: 0,
      physicallyAvailableUniqueRecords: 28,
      latestVerifiedSarga: { sarga: "Ayodhya Kanda Sarga 20" },
      nextAcquisitionPoint: { sarga: "Ayodhya Kanda Sarga 21" },
      duplicates: { count: 0 },
    });
    expect(ledger.records).toHaveLength(28);
    expect(ledger.artifactInventory).toHaveLength(14);
    expect(ledger.artifactInventory.map((artifact: { role: string }) => artifact.role)).toEqual(expect.arrayContaining([
      "candidate_record_payload",
      "inherited_branch_ledger",
      "continuation_claims_and_blockers",
      "inherited_duplicate_audit",
      "reconciliation_queue",
      "staging_source_registry",
      "tamil_editorial_queue",
      "source_archive_container",
      "source_checkpoint_manifest",
      "source_checksum_evidence",
      "source_continuity_blocker",
      "canonical_staging_payload",
    ]));
    expect(ledger.archiveMemberInventory).toHaveLength(10);
    expect(ledger.archiveMemberInventory).toEqual(expect.arrayContaining([
      expect.objectContaining({ member: "STAGING_RECORDS.json", role: "candidate_record_payload" }),
      expect.objectContaining({ member: "CHECKPOINT_MANIFEST.json", role: "source_checkpoint_manifest" }),
      expect.objectContaining({ member: "SHA256SUMS.txt", role: "source_checksum_evidence" }),
    ]));
    expect(ledger.declaredButUnavailableClaims.map((claim: { declaredRecords: number }) => claim.declaredRecords)).toEqual([50, 97, 17, 109]);
    expect(ledger.declaredButUnavailableClaims.every((claim: { artifactAvailable: boolean }) => claim.artifactAvailable === false)).toBe(true);
  });
});
