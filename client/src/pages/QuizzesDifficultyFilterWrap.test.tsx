import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Quizzes difficulty filter layout", () => {
  it("wraps difficulty buttons to prevent phone-width horizontal overflow", () => {
    const source = readFileSync("client/src/pages/Quizzes.tsx", "utf8");
    expect(source).toContain('<div className="flex flex-wrap justify-center gap-2 mb-12">');
  });
});
