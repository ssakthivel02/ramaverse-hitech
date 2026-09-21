import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Owner command center auth loading state", () => {
  it("announces owner authentication loading progress", () => {
    const source = readFileSync("client/src/pages/OwnerCommandCenter.tsx", "utf8");
    const loadingState = source.match(/auth\.loading\) return <main([^>]*)>Preparing owner view…<\/main>/)?.[1] ?? "";

    expect(loadingState).toContain('role="status"');
    expect(loadingState).toContain('aria-live="polite"');
    expect(loadingState).toContain('aria-atomic="true"');
  });
});
