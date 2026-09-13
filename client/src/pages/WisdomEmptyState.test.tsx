import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Wisdom empty result state", () => {
  it("provides accessible feedback when search or filters have no matches", () => {
    const source = readFileSync("client/src/pages/Wisdom.tsx", "utf8");

    expect(source).toContain('const hasNoMatches = !isLoading && !error && wisdomList?.length === 0 && (Boolean(search.trim()) || category !== "All");');
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("No wisdom records match your current search and filters.");
  });
});
