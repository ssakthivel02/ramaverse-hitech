import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Audio failure-state contract", () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/Audio.tsx"), "utf8");

  it("distinguishes API failures from genuine empty results", () => {
    expect(source).toContain("data: audioList, isLoading, error");
    expect(source).toContain('error ? (\n          <div role="alert"');
    expect(source).toContain("Audio scripts could not be loaded. Please try again.");
    expect(source).toContain("No audio scripts matching your search were found.");
  });
});
