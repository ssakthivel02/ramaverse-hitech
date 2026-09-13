import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Journey milestone controls", () => {
  it("uses native buttons instead of emulated button roles", () => {
    const source = readFileSync("client/src/pages/Journey.tsx", "utf8");

    expect(source).toContain('<button\n                  type="button"');
    expect(source).not.toContain('role="button"');
    expect(source).not.toContain('tabIndex={0}');
    expect(source).not.toContain('onKeyDown={(event) =>');
  });
});
