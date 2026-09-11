import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type RecoveryEvidence = {
  classification: string;
  imported_workspace_metadata: {
    artifact: string;
    imported_source_version_claim: string;
    metadata_claims_missing_files: string[];
    referenced_stable_id_registries: string[];
    referenced_later_task_outputs: string[];
  };
  disposition: {
    status: string;
    full_provenance_recovered: boolean;
    new_checkpoint_authorized: boolean;
    verified_next_source: string | null;
    acquisition_allowed: boolean;
    promotion_allowed: boolean;
    sarga_23_usable_as_continuation_authority: boolean;
    external_or_offline_artifact_can_reopen_investigation: boolean;
  };
};

type ProjectState = {
  staging_files: string[];
  stable_id_registries: string[];
  task_output_map: Record<string, string>;
  missing_files: string[];
};

type Authority = {
  verified_next_source: string | null;
  acquisition_allowed: boolean;
  promotion_allowed: boolean;
  sarga_21_22_referenced_provenance_recovery_evidence_file: string;
};

const root = process.cwd();
const readJson = <T>(path: string): T =>
  JSON.parse(readFileSync(resolve(root, path), "utf8")) as T;

describe("Sarga 21/22 referenced provenance recovery guard", () => {
  const evidence = readJson<RecoveryEvidence>(
    "SARGA_21_22_REFERENCED_PROVENANCE_RECOVERY_EVIDENCE.json",
  );
  const projectState = readJson<ProjectState>("RAMAVERSE_PROJECT_STATE.json");
  const authority = readJson<Authority>("CONTINUATION_AUTHORITY.json");

  it("preserves the distinction between workspace metadata references and recoverable Git artifacts", () => {
    expect(projectState.staging_files).toContain(
      "data/staging/post_v1/AYODHYA_S21_SOURCE_BACKED_RECORDS.json",
    );
    expect(projectState.staging_files).toContain(
      "data/staging/post_v1/AYODHYA_S22_SOURCE_BACKED_RECORDS.json",
    );
    expect(projectState.stable_id_registries).toContain("POST_V1_STAGING_PHYSICAL_AUDIT.json");
    expect(projectState.stable_id_registries).toContain("RAMAVERSE_STAGING_MASTER_LEDGER_V9.json");
    expect(projectState.task_output_map.physical_ledger).toBe("RAMAVERSE_STAGING_MASTER_LEDGER_V12.json");
    expect(projectState.missing_files).toEqual([]);

    for (const referenced of [
      "POST_V1_STAGING_PHYSICAL_AUDIT.json",
      "RAMAVERSE_STAGING_MASTER_LEDGER_V9.json",
      "RAMAVERSE_STAGING_MASTER_LEDGER_V12.json",
    ]) {
      expect(existsSync(resolve(root, referenced))).toBe(false);
    }
  });

  it("records only an unrecovered disposition and never upgrades continuation authority", () => {
    expect(evidence.classification).toBe("UNRECOVERED_REFERENCED_PROVENANCE_FAIL_CLOSED");
    expect(evidence.imported_workspace_metadata.artifact).toBe("RAMAVERSE_PROJECT_STATE.json");
    expect(evidence.imported_workspace_metadata.imported_source_version_claim).toBe(
      "56bb0d6+working-tree-2026-08-25",
    );
    expect(evidence.disposition.status).toBe(
      "UNRECOVERED_ACROSS_CURRENTLY_ACCESSIBLE_GITHUB_SOURCES",
    );
    expect(evidence.disposition.full_provenance_recovered).toBe(false);
    expect(evidence.disposition.new_checkpoint_authorized).toBe(false);
    expect(evidence.disposition.verified_next_source).toBeNull();
    expect(evidence.disposition.acquisition_allowed).toBe(false);
    expect(evidence.disposition.promotion_allowed).toBe(false);
    expect(evidence.disposition.sarga_23_usable_as_continuation_authority).toBe(false);
    expect(evidence.disposition.external_or_offline_artifact_can_reopen_investigation).toBe(true);
  });

  it("binds the fail-closed authority to the recovery disposition", () => {
    expect(authority.sarga_21_22_referenced_provenance_recovery_evidence_file).toBe(
      "SARGA_21_22_REFERENCED_PROVENANCE_RECOVERY_EVIDENCE.json",
    );
    expect(authority.verified_next_source).toBeNull();
    expect(authority.acquisition_allowed).toBe(false);
    expect(authority.promotion_allowed).toBe(false);
  });
});
