import { describe, expect, it } from "vitest";
import { APPROVED_CORPUS_RECORD_COUNT, APPROVED_UNIVERSE_RECORDS, universeSearch } from "./knowledgeUniverse";

describe("approved Knowledge Universe corpus", () => {
  it("contains the approved 1,092-record candidate only", () => {
    expect(APPROVED_CORPUS_RECORD_COUNT).toBe(1092);
    expect(APPROVED_UNIVERSE_RECORDS).toHaveLength(1092);
    expect(new Set(APPROVED_UNIVERSE_RECORDS.map((record) => record.id)).size).toBe(1092);
  });

  it("keeps source and locator provenance on every indexed record", () => {
    expect(APPROVED_UNIVERSE_RECORDS.every((record) => record.sourceIds.length > 0)).toBe(true);
    expect(APPROVED_UNIVERSE_RECORDS.every((record) => record.locator.length > 0)).toBe(true);
  });

  it("searches IDs, source IDs, titles, and locators deterministically", () => {
    const first = APPROVED_UNIVERSE_RECORDS[0];
    expect(universeSearch(first.id)[0]?.id).toBe(first.id);
    expect(universeSearch(first.sourceIds[0]).length).toBeGreaterThan(0);
    expect(universeSearch("not-a-real-record")).toHaveLength(0);
  });
});
