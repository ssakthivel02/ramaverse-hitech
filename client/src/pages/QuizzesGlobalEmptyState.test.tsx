import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Quizzes global empty state", () => {
  it("surfaces a status message when the full quiz catalogue is empty", () => {
    const source = readFileSync("client/src/pages/Quizzes.tsx", "utf8");

    expect(source).toContain('const hasNoMatches = !isLoading && difficulty !== "All" && quizzesList?.length === 0;');
    expect(source).toContain('const hasNoQuizzes = !isLoading && difficulty === "All" && quizzesList?.length === 0;');
    expect(source).toContain('hasNoMatches || hasNoQuizzes');
    expect(source).toContain('No quizzes are available yet.');
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
  });
});
