/**
 * Deterministic, read-only Reader parity verifier (Issue #178).
 *
 * It compares a snapshot of `sargas` rows against an OWNER-APPROVED Reader manifest. It performs no
 * database access, no import and no promotion. With no approved manifest it can only report
 * PARITY_NOT_ESTABLISHED: the repository currently contains no approved Reader load artifact, and this
 * module never derives expectations from the database, the seed, tests, or staging/source-review files.
 */

export type ReaderRow = {
  recordKey: string;
  kandaNumber: number;
  editionId: string;
  sourceId: string;
  sourceLocator: string;
  traditionId: string;
  reviewStatus: string;
};

export type ApprovedReaderRecord = Omit<ReaderRow, "reviewStatus">;

export type ApprovedReaderManifest = {
  schemaVersion: 1;
  manifestId: string;
  records: ApprovedReaderRecord[];
};

export type ParityFindingCode =
  | "NO_APPROVED_MANIFEST"
  | "EMPTY_APPROVED_MANIFEST"
  | "DUPLICATE_MANIFEST_KEY"
  | "STAGING_IDENTIFIER"
  | "DUPLICATE_RECORD_KEY"
  | "MISSING_RECORD"
  | "UNEXPECTED_RECORD"
  | "NOT_SOURCE_VERIFIED"
  | "MISSING_PROVENANCE"
  | "FIELD_MISMATCH";

export type ParityFinding = { code: ParityFindingCode; recordKey?: string; detail: string };

export type ParityReport = {
  status: "PARITY_VERIFIED" | "PARITY_FAILED" | "PARITY_NOT_ESTABLISHED";
  expected: number;
  observed: number;
  findings: ParityFinding[];
};

/** Identifier shapes used by staging, source-review and candidate artifacts. They are never canonical Reader keys. */
const NON_CANONICAL_KEY = /^(stg-|staging-|src-review-|src-readiness-|candidate-)/i;
const COMPARED_FIELDS = ["kandaNumber", "editionId", "sourceId", "sourceLocator", "traditionId"] as const;
const PROVENANCE_FIELDS = ["editionId", "sourceId", "sourceLocator", "traditionId"] as const;

const blank = (value: unknown) => typeof value !== "string" || value.trim() === "";

export function verifyReaderParity(rows: readonly ReaderRow[], manifest: ApprovedReaderManifest | null): ParityReport {
  const findings: ParityFinding[] = [];
  const observed = rows.length;

  if (!manifest) {
    findings.push({ code: "NO_APPROVED_MANIFEST", detail: "No owner-approved Reader manifest supplied; parity cannot be established." });
    return { status: "PARITY_NOT_ESTABLISHED", expected: 0, observed, findings };
  }
  if (manifest.records.length === 0) {
    findings.push({ code: "EMPTY_APPROVED_MANIFEST", detail: "Approved manifest lists no records; an empty manifest cannot establish parity." });
    return { status: "PARITY_NOT_ESTABLISHED", expected: 0, observed, findings };
  }

  const expectedByKey = new Map<string, ApprovedReaderRecord>();
  for (const record of manifest.records) {
    if (expectedByKey.has(record.recordKey)) {
      findings.push({ code: "DUPLICATE_MANIFEST_KEY", recordKey: record.recordKey, detail: "Approved manifest repeats this record key." });
    }
    if (NON_CANONICAL_KEY.test(record.recordKey)) {
      findings.push({ code: "STAGING_IDENTIFIER", recordKey: record.recordKey, detail: "Approved manifest contains a staging/source-review/candidate identifier." });
    }
    expectedByKey.set(record.recordKey, record);
  }

  const seen = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.recordKey)) {
      findings.push({ code: "DUPLICATE_RECORD_KEY", recordKey: row.recordKey, detail: "Database snapshot repeats this record key." });
      continue;
    }
    seen.add(row.recordKey);

    if (NON_CANONICAL_KEY.test(row.recordKey)) {
      findings.push({ code: "STAGING_IDENTIFIER", recordKey: row.recordKey, detail: "Database row carries a staging/source-review/candidate identifier." });
    }
    const expected = expectedByKey.get(row.recordKey);
    if (!expected) {
      findings.push({ code: "UNEXPECTED_RECORD", recordKey: row.recordKey, detail: "Row is not in the approved manifest." });
      continue;
    }
    if (row.reviewStatus !== "source_verified") {
      findings.push({ code: "NOT_SOURCE_VERIFIED", recordKey: row.recordKey, detail: `reviewStatus is "${row.reviewStatus}", expected "source_verified".` });
    }
    const missing = PROVENANCE_FIELDS.filter((field) => blank(row[field]));
    if (missing.length > 0) {
      findings.push({ code: "MISSING_PROVENANCE", recordKey: row.recordKey, detail: `Blank provenance field(s): ${missing.join(", ")}.` });
    }
    const mismatched = COMPARED_FIELDS.filter((field) => row[field] !== expected[field] && !missing.includes(field as never));
    if (mismatched.length > 0) {
      findings.push({ code: "FIELD_MISMATCH", recordKey: row.recordKey, detail: `Differs from approved manifest: ${mismatched.join(", ")}.` });
    }
  }

  for (const key of Array.from(expectedByKey.keys())) {
    if (!seen.has(key)) findings.push({ code: "MISSING_RECORD", recordKey: key, detail: "Approved record is absent from the database snapshot." });
  }

  return {
    status: findings.length === 0 ? "PARITY_VERIFIED" : "PARITY_FAILED",
    expected: expectedByKey.size,
    observed,
    findings,
  };
}
