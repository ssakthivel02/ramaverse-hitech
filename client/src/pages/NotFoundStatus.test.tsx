import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("NotFound accessibility", () => {
  it("announces the unavailable route as a status", () => {
    const source = readFileSync("client/src/pages/NotFound.tsx", "utf8");

    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('aria-atomic="true"');
  });
});
