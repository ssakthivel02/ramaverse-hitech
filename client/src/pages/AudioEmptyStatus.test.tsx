import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Audio empty results status", () => {
  it("announces successful empty results as a polite atomic status", () => {
    const source = readFileSync("client/src/pages/Audio.tsx", "utf8");

    expect(source).toContain('No audio scripts matching your search were found.');
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('aria-atomic="true"');
  });
});
