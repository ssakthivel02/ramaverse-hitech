import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/Journey.tsx"), "utf8");

describe("Journey failure-state contract", () => {
  it("distinguishes API failures from a successful journey response", () => {
    expect(source).toContain("data: places, isLoading, error");
    expect(source).toContain('role="alert"');
    expect(source).toContain('t("unexpectedError")');

    const loadingBranch = source.indexOf("{isLoading ? (");
    const errorBranch = source.indexOf(") : error ? (", loadingBranch);
    const journeyGrid = source.indexOf('className="grid grid-cols-1 lg:grid-cols-3 gap-10"', errorBranch);

    expect(loadingBranch).toBeGreaterThan(-1);
    expect(errorBranch).toBeGreaterThan(loadingBranch);
    expect(journeyGrid).toBeGreaterThan(errorBranch);
  });
});
