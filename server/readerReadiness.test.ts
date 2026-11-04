import { MySqlDialect } from "drizzle-orm/mysql-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("./db", () => ({ getDb: mocks.getDb }));

import { probeReaderReadiness, READER_READY_REVIEW_STATUS } from "./readerReadiness";

function dbReturning(rows: unknown[]) {
  const limit = vi.fn().mockResolvedValue(rows);
  const where = vi.fn().mockReturnValue({ limit });
  const from = vi.fn().mockReturnValue({ where });
  const select = vi.fn().mockReturnValue({ from });
  return { select, where };
}

const validRow = {
  recordKey: "VR-IITK-BALA-001",
  kandaNumber: 1,
  sargaIdentifier: "VR-IITK-BALA-001",
  editionId: "synthetic-edition-for-test",
  sourceId: "synthetic-source-for-test",
  sourceLocator: "Bala 1",
  traditionId: "synthetic-tradition-for-test",
  editorialDescriptor: "Synthetic descriptor for test",
  summary: "Synthetic summary for test",
};

describe("bounded Reader readiness proof", () => {
  beforeEach(() => vi.resetAllMocks());

  it("fails closed when database is unavailable", async () => {
    mocks.getDb.mockResolvedValue(null);
    await expect(probeReaderReadiness()).resolves.toBe(false);
  });

  it("fails closed for empty Reader tables", async () => {
    mocks.getDb.mockResolvedValue(dbReturning([]));
    await expect(probeReaderReadiness()).resolves.toBe(false);
  });

  it("fails closed when an initialized database becomes unqueryable", async () => {
    mocks.getDb.mockResolvedValue({ select: () => { throw new Error("disconnected"); } });
    await expect(probeReaderReadiness()).resolves.toBe(false);
  });

  it("rejects a row missing its source locator", async () => {
    mocks.getDb.mockResolvedValue(dbReturning([{ ...validRow, sourceLocator: "" }]));
    await expect(probeReaderReadiness()).resolves.toBe(false);
  });

  it("accepts a bounded source-located reviewed Reader row", async () => {
    const db = dbReturning([validRow]);
    mocks.getDb.mockResolvedValue(db);
    await expect(probeReaderReadiness()).resolves.toBe(true);
    expect(db.select).toHaveBeenCalledOnce();
  });
  it.each([
    ["missing edition", { editionId: "" }],
    ["missing tradition", { traditionId: " " }],
    ["missing summary", { summary: "" }],
    ["missing descriptor", { editorialDescriptor: "" }],
    ["missing Sarga ID", { sargaIdentifier: "" }],
    ["invalid Kanda number", { kandaNumber: 8 }],
    ["staging record key", { recordKey: "STAGING-BALA-001" }],
    ["candidate Sarga identifier", { sargaIdentifier: "candidate-bala-001" }],
    ["staging source ID", { sourceId: "SRC-REVIEW-SOURCE-001" }],
  ])("fails closed for %s", async (_reason, patch) => {
    mocks.getDb.mockResolvedValue(dbReturning([{ ...validRow, ...patch }]));
    await expect(probeReaderReadiness()).resolves.toBe(false);
  });

  it("selects bounded provenance and editorial fields without writing", async () => {
    const db = dbReturning([validRow]);
    mocks.getDb.mockResolvedValue(db);
    expect(await probeReaderReadiness()).toBe(true);
    expect(db.select.mock.calls[0][0]).toHaveProperty("editionId");
    expect(db.select.mock.calls[0][0]).toHaveProperty("traditionId");
    expect(db.select.mock.calls[0][0]).toHaveProperty("summary");
    expect(db.select.mock.calls[0][0]).toHaveProperty("editorialDescriptor");
    expect(db.select.mock.calls[0][0]).not.toHaveProperty("reviewStatus");
    expect(db.where).toHaveBeenCalledOnce();
  });

  it("filters only on source_verified and excludes unverified placeholder review statuses", async () => {
    const db = dbReturning([validRow]);
    mocks.getDb.mockResolvedValue(db);
    await probeReaderReadiness();
    const rendered = new MySqlDialect().sqlToQuery(db.where.mock.calls[0][0]);
    expect(READER_READY_REVIEW_STATUS).toBe("source_verified");
    expect(rendered.sql).toContain("`reviewStatus` = ?");
    expect(rendered.params).toEqual(["source_verified"]);
    expect(rendered.params).not.toContain("human_reviewed");
    expect(rendered.params).not.toContain("needs_source_review");
  });
});
