import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Library journal form accessibility", () => {
  it("associates visible labels with the journal title and note fields", () => {
    const source = readFileSync("client/src/pages/Library.tsx", "utf8");

    expect(source).toContain('htmlFor="library-note-title"');
    expect(source).toContain('id="library-note-title"');
    expect(source).toContain('htmlFor="library-note-content"');
    expect(source).toContain('id="library-note-content"');
  });
});
