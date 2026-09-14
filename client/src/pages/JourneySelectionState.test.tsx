import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Journey milestone selection semantics", () => {
  it("exposes the active milestone through aria-pressed", () => {
    const source = readFileSync("client/src/pages/Journey.tsx", "utf8");

    expect(source).toContain('type="button"');
    expect(source).toContain('onClick={() => setSelectedPlace(idx)}');
    expect(source).toContain('aria-pressed={selectedPlace === idx}');
  });
});
