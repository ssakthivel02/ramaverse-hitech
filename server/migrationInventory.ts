import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const STATUS = "REPOSITORY_BASELINE_ONLY_NOT_APPROVED_FOR_DATABASE_MUTATION";

export function gitBlobHash(contents: Buffer | string) {
  const data = Buffer.isBuffer(contents) ? contents : Buffer.from(contents, "utf8");
  return createHash("sha1")
    .update(Buffer.from(`blob ${data.length}\0`, "utf8"))
    .update(data)
    .digest("hex");
}

/**
 * Read-only repository guard. A new migration must have a deliberate baseline
 * update under code review, separate from actual DB-mutation authorization.
 */
export function verifyMigrationInventory(root = process.cwd()): number {
  const dir = path.join(root, "drizzle");
  const manifest = JSON.parse(readFileSync(path.join(dir, "migration-repository-baseline.json"), "utf8"));
  const journal = JSON.parse(readFileSync(path.join(dir, "meta", "_journal.json"), "utf8"));
  if (manifest?.version !== 1 || manifest?.status !== STATUS || !Array.isArray(manifest.entries)) {
    throw new Error("Unknown or missing migration baseline authority");
  }
  if (journal?.dialect !== "mysql" || !Array.isArray(journal.entries)) {
    throw new Error("Unexpected migration journal");
  }

  const files = readdirSync(dir).filter(file => /^\d{4}_[A-Za-z0-9_]+\.sql$/.test(file)).sort();
  const expected = manifest.entries as Array<{ tag: string; blobSha1: string }>;
  if (files.length === 0 || files.length !== expected.length || journal.entries.length !== expected.length) {
    throw new Error("Unlisted, missing or unreviewed SQL migration detected");
  }

  const seen = new Set<string>();
  for (let idx = 0; idx < expected.length; idx++) {
    const entry = expected[idx];
    const expectedFilename = `${entry.tag}.sql`;
    if (!/^\d{4}_[A-Za-z0-9_]+$/.test(entry.tag) || !/^[a-f0-9]{40}$/.test(entry.blobSha1)) {
      throw new Error("Invalid migration baseline entry");
    }
    if (seen.has(entry.tag) || files[idx] !== expectedFilename || journal.entries[idx]?.tag !== entry.tag || journal.entries[idx]?.idx !== idx) {
      throw new Error("Migration journal, sequence, or baseline mismatch");
    }
    seen.add(entry.tag);
    if (gitBlobHash(readFileSync(path.join(dir, expectedFilename))) !== entry.blobSha1) {
      throw new Error(`Migration file differs from repository-reviewed baseline: ${expectedFilename}`);
    }
  }
  return expected.length;
}

if (process.argv[1] && /(?:^|[\\/])migrationInventory\.ts$/.test(process.argv[1])) {
  try {
    const count = verifyMigrationInventory();
    console.log(`Verified ${count} committed migration fingerprints. No database operation was performed.`);
  } catch (error) {
    console.error("Migration inventory validation refused:", error);
    process.exitCode = 1;
  }
}
