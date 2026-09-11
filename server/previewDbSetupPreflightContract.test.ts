import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const workflow = fs.readFileSync(
  path.join(root, ".github/workflows/preview-db-setup.yml"),
  "utf8"
);

describe("RamaVerse preview DB setup preflight dependency", () => {
  it("requires explicit schema mutation approval and a prior preflight run id", () => {
    expect(workflow).toContain("provider_candidate:");
    expect(workflow).toContain("preflight_run_id:");
    expect(workflow).toContain("confirm_schema_mutation:");
    expect(workflow).toContain("Explicit schema-only mutation approval is required before db:push.");
    expect(workflow).toContain("actions: read");
  });

  it("validates the exact successful read-only preflight run and artifact before db:push", () => {
    expect(workflow).toContain('RamaVerse Provider Read-Only Preflight');
    expect(workflow).toContain('.github/workflows/provider-readonly-preflight.yml');
    expect(workflow).toContain('.head_sha == $sha');
    expect(workflow).toContain('.conclusion == "success"');
    expect(workflow).toContain('provider-readonly-preflight-${GITHUB_SHA}');
    expect(workflow).toContain('.provider_candidate == $provider');
    expect(workflow).toContain('.owner_provider_candidate_approved == true');
    expect(workflow).toContain('.mutation_performed == false');
    expect(workflow).toContain('.result == "READ_ONLY_PROVIDER_PREFLIGHT_PASS"');
    expect(workflow).toContain("run: pnpm db:push");

    const verificationIndex = workflow.indexOf("Verify matching read-only preflight evidence");
    const mutationStepIndex = workflow.indexOf("Apply preview schema only");
    expect(verificationIndex).toBeGreaterThan(-1);
    expect(mutationStepIndex).toBeGreaterThan(verificationIndex);
  });

  it("keeps database identity and verified TLS protections in place", () => {
    expect(workflow).toContain("DATABASE_EXPECTED_NAME: ramaverse_preview");
    expect(workflow).toContain("RAMAVERSE_PREVIEW_DATABASE_HOST");
    expect(workflow).toContain("hitech-preview-mysql");
    expect(workflow).toContain("rejectUnauthorized: true");
    expect(workflow).toContain("minVersion: 'TLSv1.2'");
  });
});
