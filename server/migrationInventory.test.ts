import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { gitBlobHash, verifyMigrationInventory } from "./migrationInventory";

const roots: string[] = [];
function makeFixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "ramaverse-migrations-"));
  roots.push(root);
  const dir = path.join(root, "drizzle");
  mkdirSync(path.join(dir, "meta"), { recursive: true });
  const tag = "0000_synthetic_fixture";
  const sql = "CREATE TABLE test_synthetic (id int NOT NULL);\n";
  writeFileSync(path.join(dir, tag + ".sql"), sql);
  writeFileSync(path.join(dir, "migration-repository-baseline.json"), JSON.stringify({
    version: 1,
    status: "REPOSITORY_BASELINE_ONLY_NOT_APPROVED_FOR_DATABASE_MUTATION",
    entries: [{ tag, blobSha1: gitBlobHash(sql) }],
  }));
  writeFileSync(path.join(dir, "meta", "_journal.json"), JSON.stringify({
    dialect: "mysql", entries: [{ idx: 0, tag, version: "5", breakpoints: true }],
  }));
  return { root, dir, tag };
}
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("committed migration inventory guard", () => {
  it("recognizes the four unchanged repository-baseline migrations", () => {
    expect(verifyMigrationInventory()).toBe(4);
  });
  it("calculates the same Git blob hash as the repository file object", () => {
    const content = "hello\n";
    expect(gitBlobHash(content)).toBe(createHash("sha1").update("blob 6\0hello\n").digest("hex"));
  });
  it("refuses a newly added migration that has no reviewed fingerprint", () => {
    const { root, dir } = makeFixture();
    writeFileSync(path.join(dir, "0001_unreviewed.sql"), "ALTER TABLE test_synthetic ADD COLUMN x int;\n");
    expect(() => verifyMigrationInventory(root)).toThrow(/Unlisted|unreviewed/i);
  });
  it("refuses changed SQL even when the filename and journal remain the same", () => {
    const { root, dir, tag } = makeFixture();
    writeFileSync(path.join(dir, tag + ".sql"), "DROP TABLE test_synthetic;\n");
    expect(() => verifyMigrationInventory(root)).toThrow(/differs from repository-reviewed baseline/);
  });
  it("rejects a journal changed without corresponding fingerprint and sequence", () => {
    const { root, dir } = makeFixture();
    writeFileSync(path.join(dir, "meta", "_journal.json"), JSON.stringify({
      dialect: "mysql", entries: [{ idx: 1, tag: "0000_synthetic_fixture" }],
    }));
    expect(() => verifyMigrationInventory(root)).toThrow(/journal, sequence, or baseline mismatch/);
  });
  it("rejects attempts to label the baseline as a DB-mutation approval", () => {
    const { root, dir } = makeFixture();
    const file = path.join(dir, "migration-repository-baseline.json");
    const baseline = JSON.parse(readFileSync(file, "utf8"));
    baseline.status = "PRODUCTION_APPROVED";
    writeFileSync(file, JSON.stringify(baseline));
    expect(() => verifyMigrationInventory(root)).toThrow(/baseline authority/);
  });
});
