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

const root = process.cwd();
const readText = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("RamaVerse continuation authority guard", () => {
  const authority = JSON.parse(readText("CONTINUATION_AUTHORITY.json")) as ContinuationAuthority;
  const drift = JSON.parse(readText("STAGING_CHECKPOINT_DRIFT_EVIDENCE.json")) as DriftEvidence;
  const physicalCountDrift = JSON.parse(
    readText("PHYSICAL_STAGING_COUNT_DRIFT_EVIDENCE.json"),
  ) as PhysicalCountDriftEvidence;
  const physicalStaging = JSON.parse(
    readText("data/staging/physical/ramaverse_canonical_staging_v2.json"),
  ) as PhysicalStagingDataset;
  const checkpoint = JSON.parse(
    readText("data/staging/physical/CHECKPOINT_MANIFEST.json"),
  ) as { verified_staging_records: number };
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
        /candidate|historical|conflict|staging|unverified|unrecovered|uncheckpointed|not canonical|not continuation authority/i.test(
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
});
