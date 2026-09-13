import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Places empty search state", () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/Places.tsx"), "utf8");

  it("surfaces successful zero-result searches accessibly", () => {
    expect(source).toContain("placesList?.length === 0");
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("No sacred places match your current search.");
  });
});
