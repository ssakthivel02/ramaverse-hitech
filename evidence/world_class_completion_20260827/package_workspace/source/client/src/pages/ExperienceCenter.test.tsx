import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Experience Center contract", () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/ExperienceCenter.tsx"), "utf8");
  it("keeps the experience source-grounded and avoids outcome guarantees", () => {
    expect(source).toContain("source-aware");
    expect(source).toContain("no promised outcome");
    expect(source).toContain("tradition metadata");
    expect(source).toContain("historical or archaeological claims");
  });
  it("provides accessible mode and age controls", () => {
    expect(source).toContain('aria-label="Experience modes"');
    expect(source).toContain("aria-pressed={mode === item}");
    expect(source).toContain("aria-pressed={age === band}");
  });
  it("retains evidence identity and source-reader navigation", () => {
    expect(source).toContain("Record ID");
    expect(source).toContain("Source IDs");
    expect(source).toContain("Read source record");
    expect(source).toContain("Copy evidence card");
  });
});
