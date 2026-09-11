import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const workflow = fs.readFileSync(
  path.join(root, ".github/workflows/integration-gate.yml"),
  "utf8",
);

describe("RamaVerse provider-neutral integration gate", () => {
  it("binds live integration to the exact approved preview host and database", () => {
    expect(workflow).toContain("RAMAVERSE_PREVIEW_DATABASE_HOST");
    expect(workflow).toContain("DATABASE_EXPECTED_HOST");
    expect(workflow).toContain("actualHost !== expectedHost");
    expect(workflow).toContain("DATABASE_EXPECTED_NAME: ramaverse_preview");
    expect(workflow).toContain("Known shared cross-project database service is prohibited");
    expect(workflow).toContain("hitech-preview-mysql");
  });

  it("requires verified TLS without requiring every provider to publish a custom CA", () => {
    expect(workflow).toContain('DATABASE_REQUIRE_TLS: "true"');
    expect(workflow).toContain("rejectUnauthorized: true");
    expect(workflow).toContain("minVersion: 'TLSv1.2'");
    expect(workflow).toContain("RAMAVERSE_PREVIEW_DATABASE_CA_CERT_B64");
    expect(workflow).toContain("AIVEN_MYSQL_CA_CERT_B64");
    expect(workflow).toContain("...(caB64 ? { ca:");
    expect(workflow).not.toContain('if [ -z "${DATABASE_CA_CERT_B64:-}" ]');
  });

  it("keeps Aiven custom-CA behavior fail-closed without making Aiven the only provider", () => {
    expect(workflow).toContain("actualHost.endsWith('.aivencloud.com') && !caB64");
    expect(workflow).toContain("Aiven integration requires the trusted provider CA certificate");
    expect(workflow).not.toContain("integration database must be the approved Aiven preview service");
    expect(workflow).not.toContain("if (!url.hostname.endsWith('.aivencloud.com'))");
  });

  it("runs the canonical database-backed validation suite after connectivity", () => {
    expect(workflow).toContain("server/sargas.test.ts");
    expect(workflow).toContain("server/canonicalSurfaceAudit.test.ts");
    expect(workflow).toContain("server/grounding.test.ts");
  });
});
