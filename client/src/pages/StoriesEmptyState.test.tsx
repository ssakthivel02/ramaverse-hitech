import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Stories empty search state", () => {
  it("provides accessible feedback when a search has no matches", () => {
    const source = readFileSync("client/src/pages/Stories.tsx", "utf8");

    expect(source).toContain("const hasNoMatches = !isLoading && Boolean(search.trim()) && storiesList?.length === 0;");
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("No kids stories match your current search.");
  });
});
