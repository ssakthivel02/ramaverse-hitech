import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ErrorBoundary safe fallback", () => {
  it("announces a safe recovery message without exposing an error stack", () => {
    const source = readFileSync("client/src/components/ErrorBoundary.tsx", "utf8");

    expect(source).toContain('role="alert"');
    expect(source).toContain('aria-live="assertive"');
    expect(source).toContain('aria-atomic="true"');
    expect(source).toContain("RamaVerse could not display this page. Reload to try again.");
    expect(source).not.toContain("this.state.error?.stack");
  });
});
