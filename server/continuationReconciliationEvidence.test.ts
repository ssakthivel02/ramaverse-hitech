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
  conflicting_markers: Array<{ marker: string }>;
};

type P0CandidateLedger = {
  canonicalBaseline: number;
  rootCauseCounts: Record<string, number>;
  resolutionCounts: Record<string, number>;
  humanDecisionsRemaining: number;
  canonicalChanged: number;
  stagingPublished: number;
  mobileModified: boolean;
  status: string;
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
  const reconciliationSummary = readText(
    "data/reconciliation_vnext/CORPUS_RECONCILIATION_SUMMARY.md",
  );

  it("binds the fail-closed continuation authority to the evidence manifest", () => {
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
  });

  it("pins the decision to the exact underlying reconciliation evidence blobs", () => {
    expect(evidence.source_artifacts).toHaveLength(2);

    for (const artifact of evidence.source_artifacts) {
      expect(artifact.role.length).toBeGreaterThan(0);
      expect(gitBlobSha(artifact.path)).toBe(artifact.git_blob_sha);
    }
  });

  it("matches the physical reconciliation summary without inventing a continuation point", () => {
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
});
