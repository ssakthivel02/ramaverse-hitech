import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type ContinuationAuthority = {
  repository: string;
  status: string;
  acquisition_allowed: boolean;
  promotion_allowed: boolean;
  reader_corpus_activation_implied: boolean;
  verified_next_source: string | null;
  staging_checkpoint_drift_evidence_file: string;
  physical_staging_count_drift_evidence_file: string;
  sarga_21_22_provenance_reconciliation_evidence_file: string;
  conflicting_markers: Array<{ marker: string; disposition: string }>;
};

type DriftEvidence = {
  decision: string;
  verified_next_source: string | null;
  acquisition_allowed: boolean;
  promotion_allowed: boolean;
  checkpointed_verified_state: {
    verified_staging_records: number;
    verified_source_coverage: string;
    branch_next_source: string;
  };
  uncheckpointed_imported_claim: {
    claimed_staging_records: number;
    claimed_source_coverage: string;
    claimed_next_source: string;
    checkpoint_manifest_member: boolean;
    usable_as_continuation_authority: boolean;
  };
};

type PhysicalCountDriftEvidence = {
  observed_states: Array<{
    artifact: string;
    observed_record_count?: number;
    verified_record_count?: number;
    claimed_record_count?: number;
    continuation_authority: boolean;
  }>;
  authority_decision: {
    verified_next_source: string | null;
    acquisition_enabled: boolean;
    promotion_enabled: boolean;
  };
};

type PhysicalStagingDataset = {
  sources: Array<{ source_id: string }>;
  records: Array<unknown>;
};

type PostV1StagingBatch = {
  source_id: string;
  source_locator: string;
  rights_status: string;
  recordCount: number;
  records: Array<{
    candidate_id: string;
    sarga: number;
    verse_locator: string;
    source_id: string;
    source_locator: string;
    source_type: string;
    merge_state: string;
    publication_policy: string;
  }>;
};

type Sarga2122ProvenanceEvidence = {
  classification: string;
  observations: {
    sarga_21: {
      declared_record_count: number;
      source_id: string;
      physical_source_registry_member: boolean;
      checkpoint_manifest_member: boolean;
    };
    sarga_22: {
      declared_record_count: number;
      source_id: string;
      physical_source_registry_member: boolean;
      checkpoint_manifest_member: boolean;
    };
  };
  ingestion_provenance: {
    first_observed_canonical_repository_commit: string;
    classification: string;
  };
  authority_decision: {
    outcome: string;
    verified_next_source: string | null;
    acquisition_allowed: boolean;
    promotion_allowed: boolean;
    reader_corpus_activation_implied: boolean;
    sarga_23_usable_as_continuation_authority: boolean;
  };
};

const root = process.cwd();
const readText = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("RamaVerse continuation authority guard", () => {
  const authority = JSON.parse(readText("CONTINUATION_AUTHORITY.json")) as ContinuationAuthority;
  const drift = JSON.parse(readText("STAGING_CHECKPOINT_DRIFT_EVIDENCE.json")) as DriftEvidence;
  const physicalCountDrift = JSON.parse(
    readText("PHYSICAL_STAGING_COUNT_DRIFT_EVIDENCE.json"),
  ) as PhysicalCountDriftEvidence;
  const sarga2122Evidence = JSON.parse(
    readText("SARGA_21_22_PROVENANCE_RECONCILIATION_EVIDENCE.json"),
  ) as Sarga2122ProvenanceEvidence;
  const physicalStaging = JSON.parse(
    readText("data/staging/physical/ramaverse_canonical_staging_v2.json"),
  ) as PhysicalStagingDataset;
  const sarga21 = JSON.parse(
    readText("data/staging/post_v1/AYODHYA_S21_SOURCE_BACKED_RECORDS.json"),
  ) as PostV1StagingBatch;
  const sarga22 = JSON.parse(
    readText("data/staging/post_v1/AYODHYA_S22_SOURCE_BACKED_RECORDS.json"),
  ) as PostV1StagingBatch;
  const checkpoint = JSON.parse(
    readText("data/staging/physical/CHECKPOINT_MANIFEST.json"),
  ) as { verified_staging_records: number; files: Array<{ name: string }> };
  const continuationNarrative = readText(
    "data/staging/physical/RAMAVERSE_STAGING_V2_CONTINUATION.md",
  );
  const sourceRegistry = readText("data/staging/physical/SOURCE_REGISTRY_STAGING.csv");

  it("binds continuation authority to the canonical HI-TECH repository", () => {
    expect(authority.repository).toBe("ssakthivel02/ramaverse-hitech");
  });

  it("fails closed while continuation evidence conflicts", () => {
    expect(authority.status).toBe("CONFLICT_REQUIRES_RECONCILIATION");
    expect(authority.acquisition_allowed).toBe(false);
    expect(authority.promotion_allowed).toBe(false);
    expect(authority.reader_corpus_activation_implied).toBe(false);
    expect(authority.verified_next_source).toBeNull();
  });

  it("retains every known continuation marker as explicitly non-authoritative evidence", () => {
    const markers = authority.conflicting_markers.map(({ marker }) => marker);
    expect(markers).toContain("Aranya Kanda Sarga 45 / 3.45.1");
    expect(markers).toContain("Ayodhya Kanda Sarga 66 / 2.66.1");
    expect(markers).toContain("Ayodhya Kanda Sarga 21");
    expect(markers).toContain("Ayodhya Kanda Sarga 23");
    expect(markers).toContain("Uttara Kanda Chapter 95");
    expect(
      authority.conflicting_markers.every(({ disposition }) =>
        /candidate|historical|conflict|staging|unverified|unrecovered|uncheckpointed|not canonical|not continuation authority|unusable/i.test(
          disposition,
        ),
      ),
    ).toBe(true);
  });

  it("binds the authority to explicit staging-checkpoint drift evidence", () => {
    expect(authority.staging_checkpoint_drift_evidence_file).toBe(
      "STAGING_CHECKPOINT_DRIFT_EVIDENCE.json",
    );
    expect(drift.decision).toBe("BLOCKED_CHECKPOINT_DRIFT_REQUIRES_RECONCILIATION");
    expect(drift.verified_next_source).toBeNull();
    expect(drift.acquisition_allowed).toBe(false);
    expect(drift.promotion_allowed).toBe(false);
  });

  it("distinguishes checkpointed 28-record evidence from the uncheckpointed 61-record narrative", () => {
    expect(checkpoint.verified_staging_records).toBe(28);
    expect(drift.checkpointed_verified_state.verified_staging_records).toBe(28);
    expect(drift.checkpointed_verified_state.verified_source_coverage).toBe(
      "Ayodhya Kanda Sargas 18–20",
    );
    expect(drift.checkpointed_verified_state.branch_next_source).toBe("Ayodhya Kanda Sarga 21");

    expect(continuationNarrative).toContain("61 staging records");
    expect(continuationNarrative).toContain("Ayodhya Kanda, Sarga 23");
    expect(drift.uncheckpointed_imported_claim.claimed_staging_records).toBe(61);
    expect(drift.uncheckpointed_imported_claim.claimed_source_coverage).toBe(
      "Ayodhya Kanda Sargas 18–22",
    );
    expect(drift.uncheckpointed_imported_claim.claimed_next_source).toBe("Ayodhya Kanda Sarga 23");
    expect(drift.uncheckpointed_imported_claim.checkpoint_manifest_member).toBe(false);
    expect(drift.uncheckpointed_imported_claim.usable_as_continuation_authority).toBe(false);
  });

  it("records the physical 12/28/61 staging divergence and fails closed", () => {
    expect(authority.physical_staging_count_drift_evidence_file).toBe(
      "PHYSICAL_STAGING_COUNT_DRIFT_EVIDENCE.json",
    );
    expect(physicalStaging.records).toHaveLength(12);
    expect(new Set(physicalStaging.sources.map(({ source_id }) => source_id))).toEqual(
      new Set([
        "src-valmiki-ayodhya-s18-sanskritdocuments",
        "src-valmiki-ayodhya-s19-sanskritdocuments",
        "src-gretil-ramayana-kandas-1-7",
      ]),
    );

    const counts = physicalCountDrift.observed_states.map(
      ({ observed_record_count, verified_record_count, claimed_record_count }) =>
        observed_record_count ?? verified_record_count ?? claimed_record_count,
    );
    expect(counts).toEqual([12, 28, 61]);
    expect(physicalCountDrift.observed_states.every(({ continuation_authority }) => !continuation_authority)).toBe(
      true,
    );
    expect(physicalCountDrift.authority_decision.verified_next_source).toBeNull();
    expect(physicalCountDrift.authority_decision.acquisition_enabled).toBe(false);
    expect(physicalCountDrift.authority_decision.promotion_enabled).toBe(false);
  });

  it("shows that the checkpointed source registry stops at Sarga 20", () => {
    expect(sourceRegistry).toContain("ayodhya-s20");
    expect(sourceRegistry).not.toContain("ayodhya-s21");
    expect(sourceRegistry).not.toContain("ayodhya-s22");
  });

  it("recognizes real post-v1 Sarga 21 and Sarga 22 staging artifacts without promoting them", () => {
    expect(sarga21.recordCount).toBe(10);
    expect(sarga21.records).toHaveLength(10);
    expect(sarga21.source_id).toBe("src-valmiki-ayodhya-s21-sanskritdocuments");
    expect(sarga22.recordCount).toBe(10);
    expect(sarga22.records).toHaveLength(10);
    expect(sarga22.source_id).toBe("src-valmiki-ayodhya-s22-sanskritdocuments");

    for (const [batch, expectedSarga] of [
      [sarga21, 21],
      [sarga22, 22],
    ] as const) {
      expect(batch.source_locator).toContain(`Sarga ${expectedSarga}`);
      expect(batch.rights_status.length).toBeGreaterThan(0);
      expect(new Set(batch.records.map(({ candidate_id }) => candidate_id)).size).toBe(
        batch.records.length,
      );
      for (const record of batch.records) {
        expect(record.candidate_id.length).toBeGreaterThan(0);
        expect(record.sarga).toBe(expectedSarga);
        expect(record.verse_locator.length).toBeGreaterThan(0);
        expect(record.source_id).toBe(batch.source_id);
        expect(record.source_locator.length).toBeGreaterThan(0);
        expect(record.source_type.length).toBeGreaterThan(0);
        expect(record.merge_state.length).toBeGreaterThan(0);
        expect(record.publication_policy).toBe("STAGING_QUARANTINE_ONLY");
      }
    }
  });

  it("binds Sarga 21/22 existence to partial provenance evidence and keeps Sarga 23 blocked", () => {
    expect(authority.sarga_21_22_provenance_reconciliation_evidence_file).toBe(
      "SARGA_21_22_PROVENANCE_RECONCILIATION_EVIDENCE.json",
    );
    expect(sarga2122Evidence.classification).toBe("PARTIAL_EVIDENCE_FAIL_CLOSED");
    expect(sarga2122Evidence.observations.sarga_21.declared_record_count).toBe(10);
    expect(sarga2122Evidence.observations.sarga_22.declared_record_count).toBe(10);
    expect(sarga2122Evidence.observations.sarga_21.physical_source_registry_member).toBe(false);
    expect(sarga2122Evidence.observations.sarga_22.physical_source_registry_member).toBe(false);
    expect(sarga2122Evidence.observations.sarga_21.checkpoint_manifest_member).toBe(false);
    expect(sarga2122Evidence.observations.sarga_22.checkpoint_manifest_member).toBe(false);
    expect(sarga2122Evidence.ingestion_provenance.first_observed_canonical_repository_commit).toBe(
      "50b78232a7d13abd5bfe8666373181c54b7390c6",
    );
    expect(sarga2122Evidence.ingestion_provenance.classification).toBe("bulk_manus_export_import");
    expect(sarga2122Evidence.authority_decision.outcome).toBe("OUTCOME_B_PARTIAL_EVIDENCE");
    expect(sarga2122Evidence.authority_decision.verified_next_source).toBeNull();
    expect(sarga2122Evidence.authority_decision.acquisition_allowed).toBe(false);
    expect(sarga2122Evidence.authority_decision.promotion_allowed).toBe(false);
    expect(sarga2122Evidence.authority_decision.reader_corpus_activation_implied).toBe(false);
    expect(sarga2122Evidence.authority_decision.sarga_23_usable_as_continuation_authority).toBe(false);

    const checkpointFiles = checkpoint.files.map(({ name }) => name);
    expect(checkpointFiles).not.toContain("AYODHYA_S21_SOURCE_BACKED_RECORDS.json");
    expect(checkpointFiles).not.toContain("AYODHYA_S22_SOURCE_BACKED_RECORDS.json");
  });
});
