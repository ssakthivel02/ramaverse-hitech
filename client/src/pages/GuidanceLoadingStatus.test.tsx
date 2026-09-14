import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Guidance loading status", () => {
  it("announces the async loading state to assistive technology", () => {
    const source = readFileSync("client/src/pages/Guidance.tsx", "utf8");

    expect(source).toContain('{isLoading ? (\n          <div role="status" aria-live="polite" aria-atomic="true"');
    expect(source).toContain('{t("searching")}</div>');
  });
});
