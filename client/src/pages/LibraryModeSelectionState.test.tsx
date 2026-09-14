import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Library mode selection state", () => {
  it("exposes the active Library mode to assistive technology", () => {
    const source = readFileSync("client/src/pages/Library.tsx", "utf8");

    expect(source).toContain("aria-pressed={activeTab === 'bookmarks'}");
    expect(source).toContain("aria-pressed={activeTab === 'journal'}");
  });
});
