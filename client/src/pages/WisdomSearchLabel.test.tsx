import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Wisdom search accessibility", () => {
  it("gives the search input a localized accessible name", () => {
    const source = readFileSync("client/src/pages/Wisdom.tsx", "utf8");

    expect(source).toContain('aria-label={t("searchInput")}');
    expect(source).toContain('placeholder={t("searchInput")}');
  });
});
