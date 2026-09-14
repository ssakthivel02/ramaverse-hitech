import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Stories search accessibility", () => {
  it("provides a programmatic label for the search input", () => {
    const source = readFileSync("client/src/pages/Stories.tsx", "utf8");

    expect(source).toContain('aria-label="Search kids stories"');
    expect(source).toContain('placeholder="Search kids stories..."');
  });
});
