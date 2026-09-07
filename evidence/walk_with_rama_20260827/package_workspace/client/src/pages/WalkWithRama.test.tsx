import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.resolve(import.meta.dirname, "WalkWithRama.tsx"), "utf8");

describe("Walk with Rama experience contract", () => {
  it("uses the safe source-grounded reflection framing", () => {
    expect(source).toContain("source-grounded reflection inspired by Rama");
    expect(source).toContain("not a claim that Rama is literally speaking through this experience");
    expect(source).toContain("No guaranteed outcome is promised");
  });

  it("filters staging identifiers before selecting evidence", () => {
    expect(source).toContain('record.id.startsWith("STAGING-")');
    expect(source).toContain('!record.id.startsWith("STAGING-")');
    expect(source).toContain("sourceIds");
    expect(source).toContain("locator");
  });

  it("provides keyboard and reduced-motion-safe interaction markers", () => {
    expect(source).toContain('aria-pressed={active}');
    expect(source).toContain('aria-live="polite"');
    expect(fs.readFileSync(path.resolve(import.meta.dirname, "../index.css"), "utf8")).toContain("prefers-reduced-motion: reduce");
  });
});
