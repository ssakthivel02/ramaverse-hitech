import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("App lazy-loading fallback", () => {
  it("announces the visible route-loading state to assistive technology", () => {
    const source = readFileSync("client/src/App.tsx", "utf8");

    expect(source).toContain('<Suspense fallback={<main role="status" aria-live="polite" aria-atomic="true"');
    expect(source).toContain('>Preparing RamaVerse…</main>}>');
  });
});
