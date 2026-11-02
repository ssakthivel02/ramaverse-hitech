import { MySqlDialect } from "drizzle-orm/mysql-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("./db", () => ({ getDb: mocks.getDb }));

import { probeReaderReadiness, READER_READY_REVIEW_STATUSES } from "./readerReadiness";

function dbReturning(rows: unknown[]) {
  const limit = vi.fn().mockResolvedValue(rows);
  const where = vi.fn().mockReturnValue({ limit });
  const from = vi.fn().mockReturnValue({ where });
  const select = vi.fn().mockReturnValue({ from });
  return { select, where };
}

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
    mocks.getDb.mockResolvedValue(dbReturning([{ recordKey: "x", sourceId: "source", sourceLocator: "" }]));
    await expect(probeReaderReadiness()).resolves.toBe(false);
  });

  it("accepts a bounded source-located reviewed Reader row", async () => {
    const db = dbReturning([{ recordKey: "canonical", sourceId: "source", sourceLocator: "Bala 1" }]);
    mocks.getDb.mockResolvedValue(db);
    await expect(probeReaderReadiness()).resolves.toBe(true);
    expect(db.select).toHaveBeenCalledOnce();
  });
  it("filters on canonical contract review statuses", async () => {
    const db = dbReturning([{ recordKey: "VR-IITK-BALA-001", sourceId: "SR-06", sourceLocator: "Bala 1" }]);
    mocks.getDb.mockResolvedValue(db);
    await probeReaderReadiness();
    const rendered = new MySqlDialect().sqlToQuery(db.where.mock.calls[0][0]);
    expect(READER_READY_REVIEW_STATUSES).toContain("source_verified");
    expect(rendered.sql).toContain("`reviewStatus` in");
    expect(rendered.params).toEqual(expect.arrayContaining(["source_verified", "human_reviewed"]));
    expect(rendered.params).not.toContain("needs_source_review");
  });
});
