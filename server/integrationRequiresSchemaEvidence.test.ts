import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const setup = fs.readFileSync(path.join(root, ".github/workflows/preview-db-setup.yml"), "utf8");
const integration = fs.readFileSync(path.join(root, ".github/workflows/integration-gate.yml"), "utf8");

describe("RamaVerse schema-to-integration chain of custody", () => {
  it("emits non-secret schema setup evidence after db:push", () => {
    expect(setup).toContain("Create schema setup evidence");
    expect(setup).toContain("preview-schema-setup-evidence.json");
    expect(setup).toContain("preview-schema-setup-${{ github.sha }}");
    expect(setup).toContain("schema_push_performed: true");
    expect(setup).toContain("reader_data_verified: false");
    expect(setup).toContain("PREVIEW_SCHEMA_SETUP_PASS");
    expect(setup.indexOf("Create schema setup evidence")).toBeGreaterThan(setup.indexOf("Apply preview schema only"));
  });

  it("requires exact successful schema evidence before canonical integration tests", () => {
    expect(integration).toContain("provider_candidate:");
    expect(integration).toContain("schema_setup_run_id:");
    expect(integration).toContain("confirm_canonical_reader_data_loaded:");
    expect(integration).toContain("Verify matching schema setup evidence");
    expect(integration).toContain('RamaVerse Preview DB Setup');
    expect(integration).toContain('.github/workflows/preview-db-setup.yml');
    expect(integration).toContain('.head_sha == $sha');
    expect(integration).toContain('.conclusion == "success"');
    expect(integration).toContain('preview-schema-setup-${GITHUB_SHA}');
    expect(integration).toContain('.provider_candidate == $provider');
    expect(integration).toContain('.schema_push_performed == true');
    expect(integration).toContain('.reader_data_verified == false');
    expect(integration).toContain('.result == "PREVIEW_SCHEMA_SETUP_PASS"');
    expect(integration.indexOf("Canonical database tests")).toBeGreaterThan(integration.indexOf("Verify matching schema setup evidence"));
  });

  it("keeps live integration fail-closed on data confirmation and database identity", () => {
    expect(integration).toContain("Explicit confirmation of owner-approved canonical Reader data is required.");
    expect(integration).toContain("DATABASE_EXPECTED_NAME: ramaverse_preview");
    expect(integration).toContain("RAMAVERSE_PREVIEW_DATABASE_HOST");
    expect(integration).toContain("hitech-preview-mysql");
    expect(integration).toContain("rejectUnauthorized: true");
    expect(integration).toContain("minVersion: 'TLSv1.2'");
  });
});
