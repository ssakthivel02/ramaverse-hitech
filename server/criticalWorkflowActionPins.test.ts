import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

const protectedWorkflows = [
  ".github/workflows/quality-gate.yml",
  ".github/workflows/preview-rc.yml",
  ".github/workflows/integration-gate.yml",
  ".github/workflows/preview-db-setup.yml",
  ".github/workflows/provider-readonly-preflight.yml",
  ".github/workflows/preview-deployment-authorization.yml",
  ".github/workflows/preview-deployment-handoff.yml",
  ".github/workflows/preview-deployment-executor-admission.yml",
];

const immutableActionRef = /^\s*uses:\s+actions\/[A-Za-z0-9_.-]+@[0-9a-f]{40}(?:\s+#.*)?$/;

const expectedPins = {
  checkout: "11d5960a326750d5838078e36cf38b85af677262",
  setupNode: "49933ea5288caeca8642d1e84afbd3f7d6820020",
  uploadArtifact: "ea165f8d65b6e75b540449e92b4886f43607fa02",
};

describe("protected GitHub Actions supply-chain pins", () => {
  it.each(protectedWorkflows)("uses immutable commit SHAs in %s", (workflow) => {
    const usesLines = read(workflow)
      .split("\n")
      .filter((line) => line.trimStart().startsWith("uses: actions/"));

    expect(usesLines.length).toBeGreaterThan(0);
    for (const line of usesLines) {
      expect(line).toMatch(immutableActionRef);
    }
  });

  it("pins the expected current upstream v4 commits", () => {
    for (const workflow of protectedWorkflows) {
      const source = read(workflow);
      if (source.includes("actions/checkout@")) {
        expect(source).toContain(`actions/checkout@${expectedPins.checkout} # v4`);
      }
      if (source.includes("actions/setup-node@")) {
        expect(source).toContain(`actions/setup-node@${expectedPins.setupNode} # v4`);
      }
      if (source.includes("actions/upload-artifact@")) {
        expect(source).toContain(`actions/upload-artifact@${expectedPins.uploadArtifact} # v4`);
      }
    }
  });

  it("does not allow mutable v4 tags in the protected workflows", () => {
    for (const workflow of protectedWorkflows) {
      expect(read(workflow)).not.toMatch(/uses:\s+actions\/[A-Za-z0-9_.-]+@v4\b/);
    }
  });
});
