import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type EvidenceManifest = {
  repository: string;
  decision: string;
  acquisition_allowed: boolean;
  promotion_allowed: boolean;
  verified_next_source: string | null;
  source_artifacts: Array<{ path: string; git_blob_sha: string; role: string }>;
  observed_facts: {
    historical_canonical_baseline: number;
    physical_record_occurrences_inspected: number;
    unique_physical_records: number;
    safe_new: number;
    safe_enrichments: number;
    p0_human_editor_required: number;
    p0_insufficient_source_evidence: number;
    p0_human_decisions_remaining: number;
    verified_staging_branch_records: number;
    verified_staging_latest_completed_source: string;
    verified_staging_next_source: string;
    missing_artifact_claimed_records: number;
    missing_artifact_claimed_next_source: string;
    missing_artifact_present: boolean;
  };
  conflicting_markers: string[];
};

type ContinuationAuthority = {
  repository: string;
  status: string;
  acquisition_allowed: boolean;
  promotion_allowed: boolean;
  verified_next_source: string | null;
  reconciliation_evidence_file: string;
  conflicting_markers: Array<{ marker: string; disposition: string }>;
};

type P0CandidateLedger = {
  canonicalBaseline: number;
  resolutionCounts: Record<string, number>;
  humanDecisionsRemaining: number;
  canonicalChanged: number;
  stagingPublished: number;
  mobileModified: boolean;
  status: string;
};

type PhysicalContinuationState = {
  historical_baseline: { total_records: number; status: string };
  global_continuation_status: string;
  branches: Array<{
    branch_id: string;
    status: string;
    latest_completed_source: string | null;
    next_exact_source: string;
    record_count: number;
    continuation_source_file: string;
    action_required?: string;
  }>;
  records_created_this_reconciliation_run: number;
  production_merge: string;
};

const root = process.cwd();

function readText(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function gitBlobSha(path: string) {
  const data = readFileSync(resolve(root, path));
  return createHash("sha1")
    .update(Buffer.from(`blob ${data.length}\0`, "utf8"))
    .update(data)
    .digest("hex");
}

describe("RamaVerse continuation reconciliation evidence", () => {
  const authority = JSON.parse(readText("CONTINUATION_AUTHORITY.json")) as ContinuationAuthority;
  const evidence = JSON.parse(readText("CONTINUATION_RECONCILIATION_EVIDENCE.json")) as EvidenceManifest;
  const p0 = JSON.parse(
    readText("data/p0_conflict_resolution_vnext/RAMAVERSE_P0_CANDIDATE_LEDGER.json"),
  ) as P0CandidateLedger;
  const physicalState = JSON.parse(
    readText("data/staging/physical/CONTINUATION_STATE.json"),
  ) as PhysicalContinuationState;
  const reconciliationSummary = readText(
    "data/reconciliation_vnext/CORPUS_RECONCILIATION_SUMMARY.md",
  );
  const stagingReport = readText(
    "data/staging/physical/STAGING_BRANCH_RECONCILIATION_REPORT.md",
  );
  const continuityBlocker = readText("data/staging/physical/SOURCE_CONTINUITY_BLOCKER.md");

  it("binds the fail-closed continuation authority to the complete evidence manifest", () => {
    expect(authority.repository).toBe("ssakthivel02/ramaverse-hitech");
    expect(authority.reconciliation_evidence_file).toBe(
      "CONTINUATION_RECONCILIATION_EVIDENCE.json",
    );
    expect(authority.status).toBe("CONFLICT_REQUIRES_RECONCILIATION");
    expect(authority.acquisition_allowed).toBe(false);
    expect(authority.promotion_allowed).toBe(false);
    expect(authority.verified_next_source).toBeNull();

    expect(evidence.repository).toBe(authority.repository);
    expect(evidence.decision).toBe("BLOCKED_NO_VERIFIED_NEXT_SOURCE");
    expect(evidence.acquisition_allowed).toBe(false);
    expect(evidence.promotion_allowed).toBe(false);
    expect(evidence.verified_next_source).toBeNull();
    expect(evidence.conflicting_markers).toEqual(
      authority.conflicting_markers.map(({ marker }) => marker),
    );
    expect(evidence.conflicting_markers).toEqual([
      "Aranya Kanda Sarga 45 / 3.45.1",
      "Ayodhya Kanda Sarga 66 / 2.66.1",
      "Ayodhya Kanda Sarga 21",
      "Uttara Kanda Chapter 95",
    ]);
  });

  it("pins the decision to every underlying reconciliation evidence blob", () => {
    expect(evidence.source_artifacts).toHaveLength(5);

    for (const artifact of evidence.source_artifacts) {
      expect(artifact.role.length).toBeGreaterThan(0);
      expect(gitBlobSha(artifact.path)).toBe(artifact.git_blob_sha);
    }
  });

  it("matches the physical reconciliation summary without inventing a canonical continuation point", () => {
    const facts = evidence.observed_facts;

    expect(reconciliationSummary).toContain(
      `| Historical canonical baseline | ${facts.historical_canonical_baseline} |`,
    );
    expect(reconciliationSummary).toContain(
      `| Physical record occurrences inspected | ${facts.physical_record_occurrences_inspected} |`,
    );
    expect(reconciliationSummary).toContain(
      `| Unique physical records | ${facts.unique_physical_records} |`,
    );
    expect(reconciliationSummary).toContain(`| Safe new | ${facts.safe_new} |`);
    expect(reconciliationSummary).toContain(`| Safe enrichments | ${facts.safe_enrichments} |`);
    expect(facts.safe_new).toBe(0);
    expect(facts.safe_enrichments).toBe(0);
  });

  it("matches the unresolved P0 ledger and keeps all mutation counters closed", () => {
    const facts = evidence.observed_facts;

    expect(p0.canonicalBaseline).toBe(facts.historical_canonical_baseline);
    expect(p0.resolutionCounts.HUMAN_EDITOR_REQUIRED).toBe(facts.p0_human_editor_required);
    expect(p0.resolutionCounts.INSUFFICIENT_SOURCE_EVIDENCE).toBe(
      facts.p0_insufficient_source_evidence,
    );
    expect(p0.humanDecisionsRemaining).toBe(facts.p0_human_decisions_remaining);
    expect(p0.humanDecisionsRemaining).toBe(
      p0.resolutionCounts.HUMAN_EDITOR_REQUIRED +
        p0.resolutionCounts.INSUFFICIENT_SOURCE_EVIDENCE,
    );
    expect(p0.canonicalChanged).toBe(0);
    expect(p0.stagingPublished).toBe(0);
    expect(p0.mobileModified).toBe(false);
    expect(p0.status).toBe("CANDIDATE_ONLY_NOT_PRODUCTION");
  });

  it("captures the verified Ayodhya staging branch without promoting it to canonical authority", () => {
    const facts = evidence.observed_facts;
    const branch = physicalState.branches.find(({ branch_id }) => branch_id === "ayodhya_v2_verified");

    expect(branch).toBeDefined();
    expect(branch?.status).toBe("active_verified_branch");
    expect(branch?.record_count).toBe(facts.verified_staging_branch_records);
    expect(branch?.latest_completed_source).toBe(facts.verified_staging_latest_completed_source);
    expect(branch?.next_exact_source).toBe(facts.verified_staging_next_source);
    expect(stagingReport).toContain("The only defensible current master is the **28-record verified Ayodhya branch**");
    expect(stagingReport).toContain("Ayodhya Kanda Sarga 21");
    expect(authority.verified_next_source).toBeNull();
  });

  it("captures the Uttara 95 claim as missing-artifact evidence only", () => {
    const facts = evidence.observed_facts;
    const claim = physicalState.branches.find(
      ({ branch_id }) => branch_id === "claimed_continuation_state_2026_08_14",
    );

    expect(claim).toBeDefined();
    expect(claim?.status).toBe("unverified_missing_artifact");
    expect(claim?.record_count).toBe(facts.missing_artifact_claimed_records);
    expect(claim?.next_exact_source).toBe(facts.missing_artifact_claimed_next_source);
    expect(facts.missing_artifact_present).toBe(false);
    expect(stagingReport).toContain("Not present in the accessible workspace");
    expect(continuityBlocker).toContain("authoritative continuation package unavailable");
    expect(
      authority.conflicting_markers.find(({ marker }) => marker === "Uttara Kanda Chapter 95")
        ?.disposition,
    ).toMatch(/unverified|absent/i);
  });

  it("preserves fail-closed staging and production state", () => {
    expect(physicalState.historical_baseline.total_records).toBe(550);
    expect(physicalState.historical_baseline.status).toBe("unchanged");
    expect(physicalState.global_continuation_status).toBe("blocked_pending_claimed_branch_artifact");
    expect(physicalState.records_created_this_reconciliation_run).toBe(0);
    expect(physicalState.production_merge).toBe("NOT_PERFORMED");
  });
});
