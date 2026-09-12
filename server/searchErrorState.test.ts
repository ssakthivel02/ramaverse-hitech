import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const searchPage = readFileSync("client/src/pages/Search.tsx", "utf8");

describe("Search failure-state contract", () => {
  it("distinguishes query failures from genuine zero-result searches", () => {
    expect(searchPage).toContain("error: null");
    expect(searchPage).toContain("const hasError = Boolean(modernSearch.error || legacySearch.error)");
    expect(searchPage).toContain("activeQuery && !isLoading && !hasError && filtered.length > 0");
    expect(searchPage).toContain('hasError ? <div role="alert"');
    expect(searchPage).toContain('t("unexpectedError")');
  });
});
