import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Guidance empty-state contract", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/pages/Guidance.tsx"), "utf8");

  it("distinguishes a valid zero-result response from loading and failure states", () => {
    expect(source).toContain("guidanceList?.length === 0");
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("No guidance records match your current search and filters.");
  });
});
