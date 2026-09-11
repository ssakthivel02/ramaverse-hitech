import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type Candidate = {
  provider: string;
  status: string;
  approval?: boolean;
  official_evidence?: string[];
  live_validation_runbook?: string;
};

type Compatibility = {
  schema_version: number;
  provider_selection_approved: boolean;
  candidates: Candidate[];
  approval_gate: Record<string, boolean>;
};

const root = process.cwd();
const compatibility = JSON.parse(
  fs.readFileSync(path.join(root, "PREVIEW_DATABASE_COMPATIBILITY.json"), "utf8"),
) as Compatibility;
const runbook = fs.readFileSync(path.join(root, "TIDB_LIVE_VALIDATION_PLAN.md"), "utf8");

describe("TiDB live-validation governance", () => {
  it("keeps TiDB fail-closed until live evidence exists", () => {
    const tidb = compatibility.candidates.find((candidate) => candidate.provider === "TiDB Cloud Starter");

    expect(compatibility.schema_version).toBeGreaterThanOrEqual(2);
    expect(compatibility.provider_selection_approved).toBe(false);
    expect(tidb).toBeDefined();
    expect(tidb?.approval).toBe(false);
    expect(tidb?.status).toBe("STATIC_COMPATIBILITY_REVIEWED_LIVE_VALIDATION_REQUIRED");
    expect(tidb?.live_validation_runbook).toBe("TIDB_LIVE_VALIDATION_PLAN.md");
  });

  it("retains every live approval gate", () => {
    expect(compatibility.approval_gate).toMatchObject({
      requires_owner_provider_choice: true,
      requires_dedicated_instance: true,
      requires_exact_host_identity: true,
      requires_verified_tls: true,
      requires_schema_push_success: true,
      requires_canonical_reader_data_verification: true,
      requires_integration_gate: true,
      requires_exact_deployed_commit_qa: true,
    });
  });

  it("pins official evidence and explicit no-shortcut language", () => {
    const tidb = compatibility.candidates.find((candidate) => candidate.provider === "TiDB Cloud Starter");
    const evidence = tidb?.official_evidence ?? [];

    expect(evidence).toEqual(
      expect.arrayContaining([
        "https://docs.pingcap.com/tidbcloud/mysql-compatibility/",
        "https://docs.pingcap.com/tidbcloud/secure-connections-to-serverless-clusters/",
        "https://docs.pingcap.com/tidbcloud/serverless-limitations/",
      ]),
    );
    expect(runbook).toContain("CANDIDATE ONLY — NOT APPROVED FOR PREVIEW RUNTIME");
    expect(runbook).toContain("A schema-only success is **not** a provider approval.");
    expect(runbook).toContain("Only a fully evidenced run may justify a future status change to provider approved.");
    expect(runbook).toContain("Do not configure production DNS.");
  });
});
