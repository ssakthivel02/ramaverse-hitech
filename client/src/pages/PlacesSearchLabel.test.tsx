import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Places search accessibility", () => {
  it("provides a programmatic label for the search input", () => {
    const source = readFileSync("client/src/pages/Places.tsx", "utf8");

    expect(source).toContain('aria-label={t("searchInput")}');
    expect(source).toContain('placeholder={t("searchInput")}');
  });
});
