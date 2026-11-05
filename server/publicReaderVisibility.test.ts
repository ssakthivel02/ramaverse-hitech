import { beforeEach, describe, expect, it, vi } from "vitest";
import { sargas } from "../drizzle/schema";
import { getDb } from "./db";
import { isPublicReaderSarga } from "./publicReaderVisibility";
import { ramaverseRouter } from "./routers/ramaverse";

vi.mock("./db", () => ({ getDb: vi.fn() }));

const verified = {
  id: 1,
  recordKey: "VR-TEST-BALA-001",
  kandaNumber: 1,
  editionId: "SYNTHETIC-TEST-EDITION",
  sargaIdentifier: "Bala Sarga 1",
  editorialDescriptor: "Bala synthetic verified test only",
  summary: "Bala synthetic summary for an isolated access-control test.",
  sourceId: "TEST-SOURCE-1",
  sourceLocator: "Bala chapter 1",
  traditionId: "TEST-TRADITION",
  reviewStatus: "source_verified",
  confidence: "source_verified",
} satisfies typeof sargas.$inferSelect;

const fixtures = [
  verified,
  { ...verified, id: 2, recordKey: "STG-BALA-002", sargaIdentifier: "Bala Sarga 2" },
  { ...verified, id: 3, recordKey: "VR-TEST-BALA-003", reviewStatus: "needs_source_review" },
  { ...verified, id: 4, recordKey: "VR-TEST-BALA-004", editionId: " " },
  { ...verified, id: 5, recordKey: "VR-TEST-BALA-005", sourceId: "SRC-REVIEW-BALA-5" },
  { ...verified, id: 6, recordKey: "VR-TEST-BALA-006", reviewStatus: "human_reviewed", confidence: "source_verified" },
];

function setMockDatabase(rows = fixtures) {
  vi.mocked(getDb).mockResolvedValue({
    select: vi.fn(() => ({
      from: vi.fn(async (table: unknown) => table === sargas ? rows : []),
    })),
  } as any);
}
function caller() {
  return ramaverseRouter.createCaller({
    user: null,
    req: { socket: { remoteAddress: "198.51.100.219" }, headers: {} },
    res: { setHeader() {} },
  } as any);
}

beforeEach(() => { vi.clearAllMocks(); setMockDatabase(); });

describe("database Sarga public visibility fence", () => {
  it("rejects review-only, staging, source-review and malformed records even with synthetic verified confidence", () => {
    expect(fixtures.map(isPublicReaderSarga)).toEqual([true, false, false, false, false, false]);
  });

  it("returns only minimum-source-verified Sargas from public listing", async () => {
    expect(await caller().getSargas({ kandaNumber: 1 })).toEqual([verified]);
    expect(await caller().getSargas({ kandaNumber: 2 })).toEqual([]);
  });

  it("does not expose a blocked Sarga via direct record detail or adjacent navigation", async () => {
    for (const row of fixtures.slice(1)) {
      expect(await caller().getSargaDetail({ recordKey: row.recordKey })).toEqual({
        current: null, previous: null, next: null,
      });
    }
    expect(await caller().getSargaDetail({ recordKey: verified.recordKey })).toEqual({
      current: verified, previous: null, next: null,
    });
  });

  it.each(["globalSearch", "guidedSearch"] as const)(
    "%s excludes staging/pending Sargas from search results", async operation => {
      const result = await caller()[operation]({ query: "Bala" });
      expect(result.sargas).toEqual([verified]);
      expect(JSON.stringify(result.sargas)).not.toContain("STG-");
      expect(JSON.stringify(result.sargas)).not.toContain("SRC-REVIEW-");
    },
  );

  it("does not treat the confidence field alone as publication approval", () => {
    expect(isPublicReaderSarga({
      ...verified, reviewStatus: "human_reviewed", confidence: "source_verified",
    })).toBe(false);
  });

  it("returns no Sarga data when the database is unavailable", async () => {
    vi.mocked(getDb).mockResolvedValue(null);
    expect(await caller().getSargas()).toEqual([]);
    expect(await caller().getSargaDetail({ recordKey: verified.recordKey })).toEqual({
      current: null, previous: null, next: null,
    });
    const search = await caller().globalSearch({ query: "Bala" });
    expect(search.sargas).toEqual([]);
  });
});
