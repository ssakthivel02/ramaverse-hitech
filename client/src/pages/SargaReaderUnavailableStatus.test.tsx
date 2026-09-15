import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Sarga reader unavailable status", () => {
  it("announces a successful unavailable result as a polite atomic status", () => {
    const source = readFileSync("client/src/pages/SargaReader.tsx", "utf8");

    expect(source).toContain('if (!sarga)');
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('aria-atomic="true"');
  });
});
