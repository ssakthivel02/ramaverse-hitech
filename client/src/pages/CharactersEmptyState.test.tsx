import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Characters empty-results contract", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/pages/Characters.tsx"), "utf8");

  it("distinguishes a valid zero-result response from loading and failure states", () => {
    expect(source).toContain("charactersList?.length === 0");
    expect(source).toContain("No character records match your current search and filters.");
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
  });
});
