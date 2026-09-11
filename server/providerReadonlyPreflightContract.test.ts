import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const workflow = fs.readFileSync(
  path.join(root, ".github/workflows/provider-readonly-preflight.yml"),
  "utf8"
);

describe("RamaVerse provider read-only preflight contract", () => {
  it("is manual, fail-closed, isolated, and verified-TLS", () => {
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("RAMAVERSE_TEST_DATABASE_URL");
    expect(workflow).toContain("RAMAVERSE_PREVIEW_DATABASE_HOST");
    expect(workflow).toContain("DATABASE_EXPECTED_NAME: ramaverse_preview");
    expect(workflow).toContain("rejectUnauthorized: true");
    expect(workflow).toContain("minVersion: 'TLSv1.2'");
    expect(workflow).toContain("hitech-preview-mysql");
  });

  it("captures live server and TLS evidence without schema or data writes", () => {
    expect(workflow).toContain("SELECT DATABASE() AS db, VERSION() AS server_version, @@version_comment AS version_comment");
    expect(workflow).toContain("SHOW STATUS LIKE 'Ssl%'");
    expect(workflow).toContain("mutation_performed: false");
    expect(workflow).toContain("READ_ONLY_PROVIDER_PREFLIGHT_PASS");

    expect(workflow).not.toMatch(/\bpnpm\s+db:push\b/i);
    expect(workflow).not.toMatch(/\b(?:INSERT|UPDATE|DELETE|REPLACE|CREATE|ALTER|DROP|TRUNCATE)\s+(?:TABLE\s+)?/i);
  });

  it("does not turn a successful connection into provider approval", () => {
    expect(workflow).toContain("It does not approve the provider");
    expect(workflow).not.toContain("provider_selection_approved: true");
  });
});
