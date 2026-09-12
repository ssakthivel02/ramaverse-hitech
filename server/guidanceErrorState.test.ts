import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Guidance failure-state contract", () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/Guidance.tsx"), "utf8");

  it("distinguishes primary guidance API failures from valid content states", () => {
    expect(source).toContain("data: guidanceList, isLoading, error");
    expect(source).toContain('error ? (\n          <div role="alert"');
    expect(source).toContain('t("unexpectedError")');
    expect(source).toContain("getGuidanceDevotionBoundary.useQuery()");
  });
});
