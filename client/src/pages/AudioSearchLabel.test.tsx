import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Audio search accessibility", () => {
  it("provides a programmatic label for the search input", () => {
    const source = readFileSync("client/src/pages/Audio.tsx", "utf8");

    expect(source).toContain('aria-label="Search narration scripts"');
    expect(source).toContain('placeholder="Search narration scripts..."');
  });
});
