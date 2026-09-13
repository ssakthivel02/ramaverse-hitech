import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Experience Center contract", () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/ExperienceCenter.tsx"), "utf8");
  const appSource = fs.readFileSync(path.resolve(process.cwd(), "client/src/App.tsx"), "utf8");

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
  it("uses the single app-shell main-content skip target", () => {
    expect(appSource).toContain('id="main-content"');
    expect(source).not.toContain('id="main-content"');
  });
  it("retains evidence identity and source-reader navigation", () => {
    expect(source).toContain("Record ID");
    expect(source).toContain("Source IDs");
    expect(source).toContain("Read source record");
    expect(source).toContain("Copy evidence card");
  });
  it("preserves the selected interface language across internal navigation", () => {
    expect(source).toContain('localizedPath(language, "/walk-with-rama")');
    expect(source).toContain('localizedPath(language, "/search")');
    expect(source).toContain('localizedPath(language, "/library")');
    expect(source).toContain('localizedPath(language, "/journey")');
    expect(source).toContain('localizedPath(language, `/sargas/${encodeURIComponent(record.id)}`)');
    expect(source).not.toContain('href="/walk-with-rama"');
    expect(source).not.toContain('href="/search"');
    expect(source).not.toContain('href="/library"');
    expect(source).not.toContain('href="/journey"');
  });
  it("surfaces clipboard success and failure instead of failing silently", () => {
    expect(source).toContain("if (!navigator.clipboard)");
    expect(source).toContain("try {");
    expect(source).toContain("catch {");
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("Evidence card copied.");
    expect(source).toContain("Copy failed. Select the evidence text and copy it manually.");
  });
});
