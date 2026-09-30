import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("dependency review workflow security contract", () => {
  const workflow = read(".github/workflows/dependency-review.yml");
  const policy = read("DEPENDENCY_REVIEW_SECURITY.md");

  it("pins Dependency Review to the verified immutable v5.0.0 commit", () => {
    expect(workflow).toContain(
      "actions/dependency-review-action@a1d282b36b6f3519aa1f3fc636f609c47dddb294 # v5.0.0",
    );
    expect(workflow).not.toMatch(/actions\/dependency-review-action@v\d+/);
  });

  it("fails on high-severity newly introduced vulnerabilities with read-only contents permission", () => {
    expect(workflow).toContain("contents: read");
    expect(workflow).toContain("fail-on-severity: high");
  });

  it("documents the fail-closed review boundary without granting deployment authority", () => {
    expect(policy).toContain("High or Critical");
    expect(policy).toContain("do not authorize provider selection");
    expect(policy).toContain("do not bypass the gate");
  });
});
