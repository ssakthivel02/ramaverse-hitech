import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Quizzes answer feedback status", () => {
  it("announces newly rendered answer feedback to assistive technology", () => {
    const source = readFileSync("client/src/pages/Quizzes.tsx", "utf8");

    expect(source).toContain(
      '<div role="status" aria-live="polite" aria-atomic="true" className={`p-4 rounded-xl border text-xs space-y-2'
    );
    expect(source).toContain('Correct! Excellent understanding.');
    expect(source).toContain('Incorrect. Review the correct option above.');
  });
});
