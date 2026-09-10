import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("RamaVerse preview deployment isolation contract", () => {
  it("requires a dedicated RamaVerse database service, not only a dedicated database name", () => {
    const plan = read("PREVIEW_DEPLOYMENT_PLAN.md");

    expect(plan).toContain("separately provisioned Aiven MySQL service dedicated to RamaVerse preview");
    expect(plan).toContain("A database schema/name alone is not sufficient isolation");
    expect(plan).toContain("shared database server/service containing multiple project databases is not an approved preview dependency");
    expect(plan).toContain("Do not power on, repurpose, migrate, or delete a shared service merely to satisfy RamaVerse preview readiness");
  });

  it("requires explicit runtime identity and Reader data verification", () => {
    const plan = read("PREVIEW_DEPLOYMENT_PLAN.md");

    expect(plan).toContain("DATABASE_EXPECTED_NAME=ramaverse_preview");
    expect(plan).toContain("Canonical Reader rows are verified as loaded; schema-only success is insufficient");
    expect(plan).toContain("Exact deployed repository/commit identity is verified");
  });

  it("keeps external provisioning decisions explicit rather than guessed", () => {
    const plan = read("PREVIEW_DEPLOYMENT_PLAN.md");

    expect(plan).toContain("confirm the selected provider plan, cloud/region, cost tier, service name, and repository/branch binding");
    expect(plan).toContain("Do not guess these values");
  });

  it("binds preview schema setup to an explicit dedicated host identity", () => {
    const workflow = read(".github/workflows/preview-db-setup.yml");

    expect(workflow).toContain("RAMAVERSE_PREVIEW_DATABASE_HOST");
    expect(workflow).toContain("DATABASE_EXPECTED_HOST");
    expect(workflow).toContain("actualHost !== expectedHost");
    expect(workflow).toContain("DATABASE_EXPECTED_SERVICE_MARKER: ramaverse");
    expect(workflow).toContain("actualHost.includes('hitech-preview-mysql')");
    expect(workflow).toContain("Known shared cross-project Aiven service is prohibited for RamaVerse preview");
  });

  it("documents all secrets required by the fail-closed DB setup gate", () => {
    const plan = read("PREVIEW_DEPLOYMENT_PLAN.md");

    expect(plan).toContain("RAMAVERSE_TEST_DATABASE_URL");
    expect(plan).toContain("RAMAVERSE_PREVIEW_DATABASE_HOST");
    expect(plan).toContain("AIVEN_MYSQL_CA_CERT_B64");
    expect(plan).toContain("known shared `hitech-preview-mysql` service is explicitly rejected");
  });

  it("keeps runtime readiness aligned with dedicated-service isolation", () => {
    const readiness = read("PREVIEW_RUNTIME_READINESS.md");

    expect(readiness).toContain("separately provisioned MySQL service dedicated to RamaVerse preview/test use");
    expect(readiness).toContain("RAMAVERSE_PREVIEW_DATABASE_HOST");
    expect(readiness).toContain("dedicated database/schema name or dedicated database user inside a shared cross-project database service is **not sufficient isolation**");
    expect(readiness).toContain("Do not use any shared cross-project database server/service for RamaVerse preview");
    expect(readiness).not.toContain("Do not use an ambiguous/shared database service without verified RamaVerse ownership");
  });
});
