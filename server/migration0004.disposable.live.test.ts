import { readFileSync } from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const migrationFile = (tag: string) => readFileSync(
  path.join(root, tag === "0004_schema_baseline_for_review" ? "migration-proposals" : "drizzle", tag + ".sql"),
  "utf8",
);
const statements = (text: string) => text.split("--> statement-breakpoint").map(value => value.trim()).filter(Boolean);
const tags = ["0000_fluffy_skin", "0001_easy_morgan_stark", "0002_blue_sue_storm", "0003_tranquil_aqueduct", "0004_schema_baseline_for_review"];

describe("0004 staged additive migration against disposable MySQL", () => {
  it.skipIf(process.env.RAMAVERSE_DISPOSABLE_MIGRATION_0004 !== "true")(
    "preserves an existing audio row, permits null transcript, and defaults review to pending",
    async () => {
      const raw = process.env.RAMAVERSE_DISPOSABLE_DATABASE_URL;
      if (!raw) throw new Error("Disposable connection details required");
      const url = new URL(raw);
      const dbName = decodeURIComponent(url.pathname.replace(/^\//, ""));
      if (url.protocol !== "mysql:" || url.hostname !== "127.0.0.1" || Number(url.port) !== 3306 || dbName !== "ramaverse_ci") {
        throw new Error("Refusing any non-disposable MySQL target");
      }
      const conn = await mysql.createConnection({
        host: url.hostname, port: 3306, database: dbName,
        user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
      });
      try {
        for (const tag of tags.slice(0, 4)) {
          for (const sql of statements(migrationFile(tag))) await conn.query(sql);
        }
        await conn.execute(
          "INSERT INTO audio_scripts (scriptNumber,title,narratorRole,durationMinutes,scriptContent) VALUES (?,?,?,?,?)",
          [987654,"synthetic existing row","CI-only narrator",2,"synthetic legacy transcript source"],
        );
        for (const sql of statements(migrationFile(tags[4]))) await conn.query(sql);
        const [rows] = await conn.execute(
          "SELECT transcript, scriptContent, narratorRole FROM audio_scripts WHERE scriptNumber = ?",
          [987654],
        );
        expect(rows).toEqual([{
          transcript: null, scriptContent: "synthetic legacy transcript source", narratorRole: "CI-only narrator",
        }]);
        const [pending] = await conn.query("SHOW COLUMNS FROM dialogues LIKE 'reviewStatus'");
        expect((pending as Array<{Default: string|null}>)[0].Default).toBe("needs_source_review");
        const [tradition] = await conn.query("SHOW COLUMNS FROM dialogues LIKE 'traditionStatus'");
        expect((tradition as Array<{Default: string|null}>)[0].Default).toBeNull();
        for (const table of ["devotional_practices", "dharma_lessons", "temples", "tradition_mappings"]) {
          const [review] = await conn.query(`SHOW COLUMNS FROM \`${table}\` LIKE 'reviewStatus'`);
          expect((review as Array<{Default: string|null}>)[0].Default).toBe("needs_source_review");
        }
      } finally {
        await conn.end();
      }
    },
    45_000,
  );
});

describe("0004 staged migration source safety", () => {
  it("does not elevate content status or force a transcript backfill", () => {
    const file = migrationFile(tags[4]);
    expect(file).not.toMatch(/DEFAULT 'human_reviewed'|DEFAULT 'VERIFIED_CANONICAL'/);
    expect(file).toContain("ADD `transcript` text;");
    expect(file).not.toContain("ADD `transcript` text NOT NULL");
    expect(file).not.toMatch(/UPDATE\s+`?audio_scripts`?/i);
  });
  it("keeps the unapproved proposal outside the executable journal and source migration folder", () => {
    const journal = JSON.parse(readFileSync(path.join(root, "drizzle/meta/_journal.json"), "utf8"));
    expect(journal.entries.map((entry: { tag: string }) => entry.tag)).not.toContain("0004_schema_baseline_for_review");
    const active = readFileSync(path.join(root, "drizzle/migration-repository-baseline.json"), "utf8");
    expect(active).not.toContain("0004_schema_baseline_for_review");
  });
  it("matches the interim Drizzle snapshot for nullability and approval fields", () => {
    const snapshot = JSON.parse(readFileSync(path.join(root,"migration-proposals/0004_snapshot.json"),"utf8"));
    expect(snapshot.tables.audio_scripts.columns.transcript.notNull).toBe(false);
    expect(snapshot.tables.dialogues.columns.traditionStatus.default).toBeUndefined();
    for (const name of ["dialogues","devotional_practices","dharma_lessons","temples","tradition_mappings"]) {
      expect(snapshot.tables[name].columns.reviewStatus.default).toBe("'needs_source_review'");
    }
  });
});
