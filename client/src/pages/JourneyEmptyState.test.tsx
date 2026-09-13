import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Journey empty result state", () => {
  it("provides accessible feedback when no journey places are returned", () => {
    const source = readFileSync("client/src/pages/Journey.tsx", "utf8");

    expect(source).toContain('(places?.length ?? 0) === 0');
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('t("noRecords")');
  });
});
