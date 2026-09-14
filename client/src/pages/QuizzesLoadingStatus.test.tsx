import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Quizzes loading status", () => {
  it("announces the async loading state to assistive technology", () => {
    const source = readFileSync("client/src/pages/Quizzes.tsx", "utf8");

    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('aria-atomic="true"');
    expect(source).toContain("Loading 100 quizzes...");
  });
});
