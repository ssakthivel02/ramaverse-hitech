import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";
import { describe, expect, it } from "vitest";
import { sargas } from "../drizzle/schema";

/**
 * Runs only with a disposable MySQL service in GitHub Actions. Does not read
 * DATABASE_URL, load any corpus, or mutate any real RamaVerse database.
 */
describe("Drizzle MySQL compatibility against an isolated engine", () => {
  it.skipIf(process.env.RAMAVERSE_EPHEMERAL_MYSQL_SMOKE !== "true")(
    "executes parameterized Drizzle queries and safely quotes MySQL identifiers",
    async () => {
      const rawUrl = process.env.RAMAVERSE_EPHEMERAL_MYSQL_URL;
      if (!rawUrl) throw new Error("Ephemeral MySQL URL is required");
      const url = new URL(rawUrl);
      const dbName = decodeURIComponent(url.pathname.replace(/^\//, ""));
      if (url.protocol !== "mysql:" || url.hostname !== "127.0.0.1" || dbName !== "ramaverse_ci" || Number(url.port) !== 3306) {
        throw new Error("Refusing a nonlocal or non-disposable MySQL endpoint");
      }
      const pool = mysql.createPool({
        host: url.hostname,
        port: 3306,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: dbName,
        connectionLimit: 2,
      });
      try {
        const db = drizzle(pool);
        // The 0.45.4 security fix doubles embedded MySQL identifier backticks.
        const alias = "synthetic`label";
        const statement = sql`SELECT ${sql.param(17)} AS ${sql.identifier(alias)}`;
        const rowSet = await db.execute(statement);
        const rows = rowSet[0] as Array<Record<string, unknown>>;
        expect(rows).toHaveLength(1);
        expect(rows[0][alias]).toBe(17);

        // Compiled app Reader query remains parameterized.
        const compiled = db.select().from(sargas)
          .where(eq(sargas.reviewStatus, "source_verified"))
          .limit(1).toSQL();
        expect(compiled.sql).toContain("`reviewStatus` = ?");
        expect(compiled.params).toContain("source_verified");
        // Read the actual table installed by the committed migrations, without inserting content.
        const liveRows = await db.select({
          recordKey: sargas.recordKey,
          reviewStatus: sargas.reviewStatus,
          sourceId: sargas.sourceId,
          sourceLocator: sargas.sourceLocator,
        }).from(sargas).where(eq(sargas.reviewStatus, "source_verified")).limit(1);
        expect(liveRows).toEqual([]);

        const [schemaRows] = await pool.promise().query(
          "SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
          [dbName, "sargas"],
        );
        const columnNames = (schemaRows as Array<{ name: string }>).map(row => row.name);
        expect(columnNames).toEqual(expect.arrayContaining([
          "recordKey", "reviewStatus", "editionId", "sourceId", "sourceLocator", "traditionId",
        ]));
        // The Reader table is empty on purpose: this is schema compatibility, not canonical parity.
      } finally {
        await pool.promise().end();
      }
    },
    20_000,
  );
});
