import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Quizzes API error state", () => {
  it("surfaces a query failure instead of rendering an empty quiz area", () => {
    const source = readFileSync("client/src/pages/Quizzes.tsx", "utf8");

    expect(source).toContain("data: quizzesList, isLoading, error");
    expect(source).toContain(") : error ? (");
    expect(source).toContain('role="alert"');
    expect(source).toContain("Unable to load quizzes. Please try again.");
  });
});
