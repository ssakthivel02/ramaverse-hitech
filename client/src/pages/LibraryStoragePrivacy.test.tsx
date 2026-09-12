import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Library storage privacy copy", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/pages/Library.tsx"), "utf8");

  it("describes local browser storage without implying encryption", () => {
    expect(source).toContain("Stored in this browser's local storage and not encrypted by RamaVerse.");
    expect(source).not.toContain("Stored securely on your device only.");
  });
});
