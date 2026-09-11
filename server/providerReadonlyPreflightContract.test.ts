import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const workflow = fs.readFileSync(
  path.join(root, ".github/workflows/provider-readonly-preflight.yml"),
  "utf8"
);

describe("RamaVerse provider read-only preflight contract", () => {
  it("is manual, owner-approved, fail-closed, isolated, and verified-TLS", () => {
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("provider_candidate:");
    expect(workflow).toContain("owner_provider_candidate_approved:");
    expect(workflow).toContain("Explicit owner approval for this provider candidate is required before live validation.");
    expect(workflow).toContain("OWNER_PROVIDER_CANDIDATE_APPROVED");
    expect(workflow).toContain("RAMAVERSE_TEST_DATABASE_URL");
    expect(workflow).toContain("RAMAVERSE_PREVIEW_DATABASE_HOST");
    expect(workflow).toContain("DATABASE_EXPECTED_NAME: ramaverse_preview");
    expect(workflow).toContain("rejectUnauthorized: true");
    expect(workflow).toContain("minVersion: 'TLSv1.2'");
    expect(workflow).toContain("hitech-preview-mysql");
  });

  it("captures candidate approval, live server, and TLS evidence without schema or data writes", () => {
    expect(workflow).toContain("provider_candidate: process.env.PROVIDER_CANDIDATE");
    expect(workflow).toContain("owner_provider_candidate_approved: process.env.OWNER_PROVIDER_CANDIDATE_APPROVED === 'true'");
    expect(workflow).toContain("SELECT DATABASE() AS db, VERSION() AS server_version, @@version_comment AS version_comment");
    expect(workflow).toContain("SHOW STATUS LIKE 'Ssl%'");
    expect(workflow).toContain("mutation_performed: false");
    expect(workflow).toContain("READ_ONLY_PROVIDER_PREFLIGHT_PASS");

    expect(workflow).not.toMatch(/\bpnpm\s+db:push\b/i);
    expect(workflow).not.toMatch(/\b(?:INSERT|UPDATE|DELETE|REPLACE|CREATE|ALTER|DROP|TRUNCATE)\s+(?:TABLE\s+)?/i);
  });

  it("does not turn owner candidate approval or a successful connection into provider runtime approval", () => {
    expect(workflow).toContain("It does not approve the provider for preview runtime");
    expect(workflow).not.toContain("provider_selection_approved: true");
  });
});
