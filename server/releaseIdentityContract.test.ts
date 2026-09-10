import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("RamaVerse deployed release identity contract", () => {
  it("does not fabricate the canonical repository when runtime identity is absent", () => {
    const server = read("server/_core/index.ts");
    expect(server).toContain('process.env.RENDER_GIT_REPO_SLUG?.trim() || process.env.GIT_REPOSITORY?.trim() || "unknown"');
    expect(server).toContain('exactRepositoryKnown: repository !== "unknown"');
    expect(server).not.toContain('process.env.RENDER_GIT_REPO_SLUG?.trim() || "ssakthivel02/ramaverse-hitech"');
  });

  it("requires explicit repository identity during deployed preview smoke verification", () => {
    const smoke = read(".github/workflows/preview-http-smoke.yml");
    expect(smoke).toContain("release.exactRepositoryKnown !== true");
    expect(smoke).toContain("release.repository !== 'ssakthivel02/ramaverse-hitech'");
  });

  it("keeps the preflight contract aware of repository-identity verification", () => {
    const preflight = read(".github/workflows/preview-deploy-preflight.yml");
    expect(preflight).toContain("exactRepositoryKnown");
    expect(preflight).toContain("RENDER_GIT_REPO_SLUG");
  });
});
