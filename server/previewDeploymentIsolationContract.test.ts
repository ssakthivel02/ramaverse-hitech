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
});
