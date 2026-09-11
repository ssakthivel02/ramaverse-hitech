import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

const criticalWorkflows = [
  ".github/workflows/quality-gate.yml",
  ".github/workflows/preview-rc.yml",
];

const immutableActionRef = /^\s*uses:\s+actions\/[A-Za-z0-9_.-]+@[0-9a-f]{40}(?:\s+#.*)?$/;

describe("critical GitHub Actions supply-chain pins", () => {
  it.each(criticalWorkflows)("uses immutable commit SHAs in %s", (workflow) => {
    const usesLines = read(workflow)
      .split("\n")
      .filter((line) => line.trimStart().startsWith("uses: actions/"));

    expect(usesLines.length).toBeGreaterThan(0);
    for (const line of usesLines) {
      expect(line).toMatch(immutableActionRef);
    }
  });

  it("pins the expected current upstream v4 commits", () => {
    const quality = read(".github/workflows/quality-gate.yml");
    const preview = read(".github/workflows/preview-rc.yml");

    expect(quality).toContain("actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4");
    expect(quality).toContain("actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4");
    expect(preview).toContain("actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4");
  });
});
