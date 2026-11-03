import { describe, expect, it } from "vitest";
import { verifyReaderParity, type ApprovedReaderManifest, type ReaderRow } from "./readerParity";

// Synthetic fixtures only: these identifiers are test inputs, not Ramayana records or source claims.
const approved = (key: string, kandaNumber = 1) => ({
  recordKey: key,
  kandaNumber,
  editionId: "TEST-EDITION",
  sourceId: "TEST-SOURCE",
  sourceLocator: `locator-${key}`,
  traditionId: "TEST-TRADITION",
});
const row = (key: string, overrides: Partial<ReaderRow> = {}): ReaderRow => ({ ...approved(key), reviewStatus: "source_verified", ...overrides });
const manifest = (...keys: string[]): ApprovedReaderManifest => ({ schemaVersion: 1, manifestId: "TEST-MANIFEST", records: keys.map((k) => approved(k)) });
const codes = (report: ReturnType<typeof verifyReaderParity>) => report.findings.map((f) => f.code);

describe("Reader parity verifier (read-only, fail-closed)", () => {
  it("never verifies parity without an approved manifest, even for well-formed rows", () => {
    const report = verifyReaderParity([row("A-1")], null);
    expect(report.status).toBe("PARITY_NOT_ESTABLISHED");
    expect(codes(report)).toEqual(["NO_APPROVED_MANIFEST"]);
  });

  it("does not treat an empty approved manifest as parity, even against an empty database", () => {
    const report = verifyReaderParity([], { schemaVersion: 1, manifestId: "EMPTY", records: [] });
    expect(report.status).toBe("PARITY_NOT_ESTABLISHED");
    expect(codes(report)).toEqual(["EMPTY_APPROVED_MANIFEST"]);
  });

  it("verifies an exact match", () => {
    const report = verifyReaderParity([row("A-1"), row("A-2")], manifest("A-1", "A-2"));
    expect(report).toMatchObject({ status: "PARITY_VERIFIED", expected: 2, observed: 2, findings: [] });
  });

  it("fails on a missing approved record (empty or partial database)", () => {
    expect(codes(verifyReaderParity([], manifest("A-1")))).toEqual(["MISSING_RECORD"]);
    expect(codes(verifyReaderParity([row("A-1")], manifest("A-1", "A-2")))).toEqual(["MISSING_RECORD"]);
  });

  it("fails on an unexpected record that is not in the approved manifest", () => {
    const report = verifyReaderParity([row("A-1"), row("X-9")], manifest("A-1"));
    expect(report.status).toBe("PARITY_FAILED");
    expect(codes(report)).toEqual(["UNEXPECTED_RECORD"]);
  });

  it("fails on duplicate database record keys and duplicate manifest keys", () => {
    expect(codes(verifyReaderParity([row("A-1"), row("A-1")], manifest("A-1")))).toEqual(["DUPLICATE_RECORD_KEY"]);
    expect(codes(verifyReaderParity([row("A-1")], manifest("A-1", "A-1")))).toContain("DUPLICATE_MANIFEST_KEY");
  });

  it("rejects rows that are not source_verified, including human_reviewed placeholders", () => {
    for (const status of ["human_reviewed", "needs_source_review", "tradition_variant", ""]) {
      const report = verifyReaderParity([row("A-1", { reviewStatus: status })], manifest("A-1"));
      expect(report.status).toBe("PARITY_FAILED");
      expect(codes(report)).toEqual(["NOT_SOURCE_VERIFIED"]);
    }
  });

  it("fails on missing provenance fields", () => {
    const report = verifyReaderParity([row("A-1", { sourceLocator: "  ", sourceId: "" })], manifest("A-1"));
    expect(codes(report)).toEqual(["MISSING_PROVENANCE"]);
    expect(report.findings[0].detail).toContain("sourceId");
    expect(report.findings[0].detail).toContain("sourceLocator");
  });

  it("fails on mismatched edition, source, locator, tradition or Kanda", () => {
    const report = verifyReaderParity(
      [row("A-1", { editionId: "OTHER", sourceId: "OTHER", sourceLocator: "other", traditionId: "OTHER", kandaNumber: 2 })],
      manifest("A-1"),
    );
    expect(codes(report)).toEqual(["FIELD_MISMATCH"]);
    for (const field of ["editionId", "sourceId", "sourceLocator", "traditionId", "kandaNumber"]) {
      expect(report.findings[0].detail).toContain(field);
    }
  });

  it("flags staging, source-review and candidate identifiers in the database and in the manifest", () => {
    const keys = ["stg-v2-x", "STAGING-X-1", "SRC-REVIEW-X-1", "SRC-READINESS-X-1", "CANDIDATE-X-1"];
    for (const key of keys) {
      const inDb = verifyReaderParity([row("A-1"), row(key)], manifest("A-1"));
      expect(codes(inDb)).toContain("STAGING_IDENTIFIER");
      expect(inDb.status).toBe("PARITY_FAILED");
      const inManifest = verifyReaderParity([row("A-1"), row(key)], manifest("A-1", key));
      expect(codes(inManifest)).toContain("STAGING_IDENTIFIER");
      expect(inManifest.status).toBe("PARITY_FAILED");
    }
  });

  it("is deterministic and does not mutate its inputs", () => {
    const rows = [row("A-2"), row("A-1")];
    const m = manifest("A-1", "A-2");
    const snapshot = JSON.stringify({ rows, m });
    const first = verifyReaderParity(rows, m);
    const second = verifyReaderParity(rows, m);
    expect(second).toEqual(first);
    expect(JSON.stringify({ rows, m })).toBe(snapshot);
  });
});
