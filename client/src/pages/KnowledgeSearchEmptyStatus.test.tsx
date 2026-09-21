import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Knowledge search empty state", () => {
  it("announces an empty filtered result set", () => {
    const source = readFileSync("client/src/pages/KnowledgeGraph.tsx", "utf8");
    const emptyState = source.match(/!results\.length && <div([^>]*)>No approved record matches this search\.<\/div>/)?.[1] ?? "";

    expect(emptyState).toContain('role="status"');
    expect(emptyState).toContain('aria-live="polite"');
    expect(emptyState).toContain('aria-atomic="true"');
  });
});
