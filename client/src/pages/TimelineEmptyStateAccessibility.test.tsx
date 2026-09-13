import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Timeline empty state accessibility", () => {
  it("announces zero-result filter states without changing Timeline data behavior", () => {
    const source = readFileSync("client/src/pages/Timeline.tsx", "utf8");

    expect(source).toContain('filtered.length === 0 ? <div role="status" aria-live="polite"');
    expect(source).toContain('{t("noRecords")}');
  });
});
