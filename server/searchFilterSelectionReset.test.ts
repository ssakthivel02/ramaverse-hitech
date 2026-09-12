import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const searchSource = readFileSync(resolve(process.cwd(), "client/src/pages/Search.tsx"), "utf8");

describe("Search keyboard selection reset", () => {
  it("resets the selected result when any filter dimension changes", () => {
    expect(searchSource).toContain(
      "useEffect(() => setSelectedIndex(0), [activeQuery, entityType, reviewState]);",
    );
  });

  it("keeps review-state filtering as an explicit result-set dimension", () => {
    expect(searchSource).toContain("reviewState === \"all\" || record.reviewStatus === reviewState");
  });
});
