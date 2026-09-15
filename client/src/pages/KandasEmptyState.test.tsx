import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Kandas empty-results contract", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/pages/Kandas.tsx"), "utf8");

  it("distinguishes a valid empty Kanda response from loading and failure states", () => {
    expect(source).toContain("kandas?.length === 0");
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('aria-atomic="true"');
    expect(source).toContain('t("noRecords")');
  });
});
