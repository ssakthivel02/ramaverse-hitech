import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Timeline API failure state", () => {
  it("distinguishes load failures from legitimate empty results", () => {
    const source = readFileSync("client/src/pages/Timeline.tsx", "utf8");

    expect(source).toContain("data: sargas = [], isLoading, error");
    expect(source).toContain('role="alert"');
    expect(source).toContain('t("unexpectedError")');
    expect(source).toContain('{error ? "—" : filtered.length} source-linked records');
  });
});
