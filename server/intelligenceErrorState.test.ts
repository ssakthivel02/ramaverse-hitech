import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Intelligence failure-state contract", () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/Intelligence.tsx"), "utf8");

  it("surfaces grounded-query failures without changing retrieval behavior", () => {
    expect(source).toContain("const queryError = modernAvailable ? modernResult.error : legacyResult.error;");
    expect(source).toContain('queryError && activeQuery && <p role="alert"');
    expect(source).toContain('t("unexpectedError")');
    expect(source).toContain("Canonical-only retrieval · no user content sent to an external provider by default");
  });
});
