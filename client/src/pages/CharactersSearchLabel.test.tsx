import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Characters search accessibility", () => {
  it("provides a programmatic label for the search input", () => {
    const source = readFileSync("client/src/pages/Characters.tsx", "utf8");

    expect(source).toContain('aria-label={t("searchInput")}');
    expect(source).toContain('placeholder={t("searchInput")}');
  });
});
