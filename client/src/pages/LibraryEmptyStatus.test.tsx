import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(__dirname, "Library.tsx"), "utf8");

describe("Library empty-state accessibility contract", () => {
  it("announces the empty bookmarks state as a polite status", () => {
    expect(source).toMatch(/<div role="status" aria-live="polite"[^>]*>[\s\S]*?No Bookmarks Saved Yet/);
  });

  it("announces the empty journal state as a polite status", () => {
    expect(source).toMatch(/<div role="status" aria-live="polite"[^>]*>[\s\S]*?No Spiritual Reflections Yet/);
  });
});
