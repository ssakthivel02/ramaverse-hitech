import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("RamaVerse preview runtime documentation contract", () => {
  it("documents production database identity as mandatory", () => {
    const readiness = read("PREVIEW_RUNTIME_READINESS.md");
    const envExample = read(".env.example");

    expect(readiness).toContain("DATABASE_EXPECTED_NAME=ramaverse_preview");
    expect(readiness).toContain("RAMAVERSE_PREVIEW_DATABASE_HOST");
    expect(readiness).toContain("schema existence alone does **not** prove Sarga Reader corpus rows are loaded");
    expect(envExample).toContain("DATABASE_EXPECTED_NAME=ramaverse_preview");
  });

  it("documents explicit deployed commit and repository identity", () => {
    const readiness = read("PREVIEW_RUNTIME_READINESS.md");
    const envExample = read(".env.example");

    expect(readiness).toContain("RENDER_GIT_COMMIT");
    expect(readiness).toContain("RENDER_GIT_REPO_SLUG");
    expect(readiness).toContain("GIT_COMMIT");
    expect(readiness).toContain("GIT_REPOSITORY");
    expect(readiness).toContain("exactRepositoryKnown: true");
    expect(envExample).toContain("GIT_REPOSITORY=ssakthivel02/ramaverse-hitech");
  });

  it("keeps unsafe preview shortcuts explicitly prohibited", () => {
    const readiness = read("PREVIEW_RUNTIME_READINESS.md");

    expect(readiness).toContain("Do not fabricate missing Sarga Reader rows.");
    expect(readiness).toContain("Do not treat schema presence as proof that Reader corpus data has been loaded.");
    expect(readiness).toContain("Do not use any shared cross-project database server/service for RamaVerse preview, even with a separate database name or user.");
    expect(readiness).not.toContain("Do not use an ambiguous/shared database service without verified RamaVerse ownership");
  });
});
