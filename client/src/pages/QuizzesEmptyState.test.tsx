import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Quizzes empty difficulty state", () => {
  it("provides accessible feedback when a difficulty filter has no matches", () => {
    const source = readFileSync("client/src/pages/Quizzes.tsx", "utf8");

    expect(source).toContain('const hasNoMatches = !isLoading && difficulty !== "All" && quizzesList?.length === 0;');
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("No quizzes match the selected difficulty.");
  });
});
