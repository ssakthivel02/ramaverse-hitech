import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Guidance search accessible name", () => {
  it("labels the search input for assistive technology", () => {
    const source = readFileSync("client/src/pages/Guidance.tsx", "utf8");
    const input = source.match(/<Input[\s\S]*?\/>/)?.[0] ?? "";

    expect(input).toContain('type="text"');
    expect(input).toContain('aria-label={t("searchInput")}');
    expect(input).toContain('placeholder={t("searchInput")}');
  });
});
