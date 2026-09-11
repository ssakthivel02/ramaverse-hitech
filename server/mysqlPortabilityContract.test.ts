import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const migrationFiles = fs
  .readdirSync(path.join(root, "drizzle"))
  .filter(file => /^\d+.*\.sql$/.test(file))
  .sort();

const portableSql = [read("drizzle/schema.ts"), ...migrationFiles.map(file => read(`drizzle/${file}`))].join("\n");

describe("RamaVerse portable MySQL schema contract", () => {
  it("keeps provider selection fail-closed until live validation", () => {
    const compatibility = JSON.parse(read("PREVIEW_DATABASE_COMPATIBILITY.json"));

    expect(compatibility.dialect).toBe("mysql");
    expect(compatibility.provider_selection_approved).toBe(false);
    expect(compatibility.status).toBe("PORTABLE_SOURCE_CANDIDATE_LIVE_VALIDATION_REQUIRED");
    expect(compatibility.approval_gate.requires_dedicated_instance).toBe(true);
    expect(compatibility.approval_gate.requires_verified_tls).toBe(true);
    expect(compatibility.approval_gate.requires_schema_push_success).toBe(true);
    expect(compatibility.approval_gate.requires_integration_gate).toBe(true);
  });

  it("does not introduce MySQL feature families that break the current portability floor", () => {
    const forbidden = [
      /\bCREATE\s+(?:DEFINER\s*=\s*[^\s]+\s+)?PROCEDURE\b/i,
      /\bCREATE\s+(?:DEFINER\s*=\s*[^\s]+\s+)?FUNCTION\b/i,
      /\bCREATE\s+(?:DEFINER\s*=\s*[^\s]+\s+)?TRIGGER\b/i,
      /\bCREATE\s+(?:DEFINER\s*=\s*[^\s]+\s+)?EVENT\b/i,
      /\bFULLTEXT\b/i,
      /\bSPATIAL\b/i,
      /\bGEOMETRY\b/i,
      /\bXA\s+(?:START|BEGIN|END|PREPARE|COMMIT|ROLLBACK)\b/i,
      /\bENGINE\s*=\s*[A-Za-z0-9_]+/i,
    ];

    for (const pattern of forbidden) {
      expect(portableSql, `portable schema must not match ${pattern}`).not.toMatch(pattern);
    }
  });

  it("records TiDB only as a static candidate, never as already approved", () => {
    const compatibility = JSON.parse(read("PREVIEW_DATABASE_COMPATIBILITY.json"));
    const tidb = compatibility.candidates.find((candidate: { provider: string }) => candidate.provider === "TiDB Cloud Starter");

    expect(tidb).toBeDefined();
    expect(tidb.status).toBe("STATIC_COMPATIBILITY_CANDIDATE");
    expect(tidb.reason).toContain("Live schema push");
  });
});
