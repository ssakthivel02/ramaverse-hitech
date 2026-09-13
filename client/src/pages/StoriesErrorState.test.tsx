import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Stories API error state", () => {
  it("surfaces accessible feedback when the stories query fails", () => {
    const source = readFileSync("client/src/pages/Stories.tsx", "utf8");

    expect(source).toContain("data: storiesList, isLoading, error");
    expect(source).toContain('role="alert"');
    expect(source).toContain("Unable to load kids stories right now.");
  });
});
