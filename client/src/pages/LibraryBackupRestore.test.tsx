import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Library backup restore contract", () => {
  it("wires the existing importer to a JSON file picker with feedback and retry support", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Library.tsx"), "utf8");

    expect(source).toContain("importData");
    expect(source).toContain('accept="application/json,.json"');
    expect(source).toContain("Restore Backup");
    expect(source).toContain("await file.text()");
    expect(source).toContain("importData(await file.text())");
    expect(source).toContain("Backup restored to this browser.");
    expect(source).toContain("Backup could not be restored.");
    expect(source).toContain('e.target.value = ""');
  });
});
