import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("preview DB setup migration gate", () => {
  const workflow = readFileSync(".github/workflows/preview-db-setup.yml", "utf8");
  it("applies only committed migrations, never generating a new one at setup time", () => {
    expect(workflow).toContain("run: pnpm exec drizzle-kit migrate");
    expect(workflow).not.toContain("run: pnpm db:push");
    expect(workflow).not.toContain("drizzle-kit generate");
  });
  it("retains the explicit schema-mutation and preflight gate", () => {
    expect(workflow).toContain("confirm_schema_mutation");
    expect(workflow).toContain("SCHEMA_MUTATION_APPROVED");
    expect(workflow).toContain("PREVIEW_SCHEMA_SETUP_PASS");
  });
});
