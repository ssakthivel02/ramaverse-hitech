import { describe, expect, it } from "vitest";
import {
  canonicalJson,
  computeManifestSha256,
  computeRecordContentSha256,
  evaluateReaderLoadAuthority,
  sealReaderManifest,
  validateReaderManifest,
  verifyReaderAgainstApprovedManifest,
  type GovernedSourceRegistry,
  type ManifestContext,
  type ReaderManifest,
  type ReaderManifestDraft,
  type ReaderRowWithContent,
} from "./readerManifest";

// Synthetic fixtures only: every identifier and text below is a test input, not a Ramayana record,
// citation or source claim.
const REGISTRY: GovernedSourceRegistry = {
  registryId: "TEST-REGISTRY",
  sha256: "a".repeat(64),
  sources: [
    { sourceId: "TEST-SOURCE-A", editionId: "TEST-EDITION-A", traditionId: "TEST-TRADITION" },
    { sourceId: "TEST-SOURCE-B", editionId: "TEST-EDITION-B", traditionId: "TEST-TRADITION" },
  ],
};

const record = (key: string, kandaNumber = 1, sourceId = "TEST-SOURCE-A", editionId = "TEST-EDITION-A") => ({
  recordKey: key,
  kandaNumber,
  sargaIdentifier: `sarga-${key}`,
  editionId,
  sourceId,
  sourceLocator: `locator-${key}`,
  traditionId: "TEST-TRADITION",
  reviewStatus: "source_verified" as const,
  editorialDescriptor: `descriptor ${key}`,
  summary: `summary ${key}`,
});

const draft = (keys: string[] = ["T-001", "T-002"]): ReaderManifestDraft => ({
  schemaVersion: 1,
  manifestId: "TEST-MANIFEST",
  createdAt: "2026-01-01T00:00:00Z",
  approval: { decision: "APPROVED_FOR_READER_LOAD", approvedBy: "test-approver", approvedAt: "2026-01-02T00:00:00Z", approvalRef: "TEST-APPROVAL-REF" },
  sourceRegistryRef: { registryId: REGISTRY.registryId, sha256: REGISTRY.sha256 },
  records: keys.map((k) => record(k)),
  totals: { recordCount: keys.length, perKanda: { "1": keys.length } },
});

const contextFor = (manifest: ReaderManifest): ManifestContext => ({
  pointer: { manifestId: manifest.manifestId, manifestSha256: manifest.integrity.manifestSha256, recordCount: manifest.records.length, approvalRef: manifest.approval.approvalRef },
  registry: REGISTRY,
});

const codes = (result: { findings: Array<{ code: string }> }) => result.findings.map((f) => f.code);
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

/** Re-seal after a deliberate change so ONLY the intended control fails. */
const resealed = (mutate: (d: ReaderManifestDraft) => void): ReaderManifest => {
  const d = draft();
  mutate(d);
  return sealReaderManifest(d);
};

const rowsFor = (manifest: ReaderManifest): ReaderRowWithContent[] =>
  manifest.records.map(({ contentSha256: _contentSha256, ...r }) => ({ ...r }));

describe("canonical hashing", () => {
  it("ignores object key order but respects array order", () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: 3 } })).toBe(canonicalJson({ a: { c: 3, d: 2 }, b: 1 }));
    expect(canonicalJson([1, 2])).not.toBe(canonicalJson([2, 1]));
  });

  it("hashes editorial content and the manifest deterministically, excluding the integrity block", () => {
    const sealed = sealReaderManifest(draft());
    expect(computeRecordContentSha256(sealed.records[0])).toBe(sealed.records[0].contentSha256);
    expect(computeManifestSha256(sealed)).toBe(sealed.integrity.manifestSha256);
    expect(sealReaderManifest(draft()).integrity.manifestSha256).toBe(sealed.integrity.manifestSha256);
  });
});

describe("validateReaderManifest (fail-closed)", () => {
  it("accepts a sealed manifest bound to its pointer and governed registry", () => {
    const manifest = sealReaderManifest(draft());
    expect(validateReaderManifest(manifest, contextFor(manifest))).toEqual({ status: "MANIFEST_VALID", findings: [] });
  });

  it("is NOT established, never valid, without a pointer or without a registry", () => {
    const manifest = sealReaderManifest(draft());
    const ctx = contextFor(manifest);
    expect(codes(validateReaderManifest(manifest, { ...ctx, pointer: null }))).toEqual(["NO_POINTER"]);
    expect(codes(validateReaderManifest(manifest, { ...ctx, registry: null }))).toEqual(["NO_REGISTRY"]);
    const neither = validateReaderManifest(manifest, { pointer: null, registry: null });
    expect(neither.status).toBe("MANIFEST_NOT_ESTABLISHED");
    expect(codes(neither).sort()).toEqual(["NO_POINTER", "NO_REGISTRY"]);
  });

  it("an invalid manifest outranks missing context", () => {
    const manifest = clone(sealReaderManifest(draft()));
    manifest.records[0].summary = "tampered";
    expect(validateReaderManifest(manifest, { pointer: null, registry: null }).status).toBe("MANIFEST_INVALID");
  });

  it("rejects non-objects and schema violations", () => {
    for (const input of [null, undefined, "x", 42, [], {}]) {
      expect(validateReaderManifest(input, { pointer: null, registry: null }).status).toBe("MANIFEST_INVALID");
    }
    const manifest = clone(sealReaderManifest(draft()));
    const cases: Array<[string, (m: Record<string, any>) => void]> = [
      ["unknown top-level field", (m) => { m.extra = true; }],
      ["unknown record field", (m) => { m.records[0].extra = 1; }],
      ["non source_verified status", (m) => { m.records[0].reviewStatus = "human_reviewed"; }],
      ["kanda out of range", (m) => { m.records[0].kandaNumber = 8; }],
      ["blank locator", (m) => { m.records[0].sourceLocator = "  "; }],
      ["bad hash format", (m) => { m.integrity.manifestSha256 = "XYZ"; }],
      ["empty records", (m) => { m.records = []; }],
      ["bad date", (m) => { m.createdAt = "yesterday"; }],
      ["wrong schema version", (m) => { m.schemaVersion = 2; }],
    ];
    for (const [name, mutate] of cases) {
      const copy = clone(manifest) as Record<string, any>;
      mutate(copy);
      const result = validateReaderManifest(copy, contextFor(manifest));
      expect(result.status, name).toBe("MANIFEST_INVALID");
      expect(codes(result), name).toContain("SCHEMA_INVALID");
    }
  });

  it("requires an explicit approval decision", () => {
    const manifest = clone(sealReaderManifest(draft())) as Record<string, any>;
    for (const decision of ["PENDING", "REJECTED", "", undefined]) {
      manifest.approval.decision = decision;
      const result = validateReaderManifest(manifest, { pointer: null, registry: null });
      expect(result.status).toBe("MANIFEST_INVALID");
      expect(codes(result)).toContain("NOT_APPROVED");
    }
  });

  it("detects any content change after sealing (record and manifest hashes)", () => {
    const manifest = clone(sealReaderManifest(draft()));
    manifest.records[1].summary = "edited after approval";
    const result = validateReaderManifest(manifest, contextFor(sealReaderManifest(draft())));
    expect(codes(result)).toEqual(expect.arrayContaining(["CONTENT_HASH_MISMATCH", "MANIFEST_HASH_MISMATCH"]));
    expect(result.status).toBe("MANIFEST_INVALID");
  });

  it("detects a swapped integrity hash and a record hash recomputed without resealing", () => {
    const manifest = clone(sealReaderManifest(draft()));
    manifest.integrity.manifestSha256 = "b".repeat(64);
    expect(codes(validateReaderManifest(manifest, contextFor(sealReaderManifest(draft()))))).toContain("MANIFEST_HASH_MISMATCH");

    const edited = clone(sealReaderManifest(draft()));
    edited.records[0].summary = "new";
    edited.records[0].contentSha256 = computeRecordContentSha256(edited.records[0]);
    const result = validateReaderManifest(edited, contextFor(sealReaderManifest(draft())));
    expect(codes(result)).toContain("MANIFEST_HASH_MISMATCH");
    expect(codes(result)).not.toContain("CONTENT_HASH_MISMATCH");
  });

  it("binds the manifest to the approved pointer", () => {
    const manifest = sealReaderManifest(draft());
    const ctx = contextFor(manifest);
    expect(codes(validateReaderManifest(manifest, { ...ctx, pointer: { ...ctx.pointer!, manifestId: "OTHER" } }))).toEqual(["POINTER_ID_MISMATCH"]);
    expect(codes(validateReaderManifest(manifest, { ...ctx, pointer: { ...ctx.pointer!, manifestSha256: "c".repeat(64) } }))).toEqual(["POINTER_HASH_MISMATCH"]);
    expect(codes(validateReaderManifest(manifest, { ...ctx, pointer: { ...ctx.pointer!, recordCount: 99 } }))).toEqual(["POINTER_COUNT_MISMATCH"]);
    expect(codes(validateReaderManifest(manifest, { ...ctx, pointer: { ...ctx.pointer!, approvalRef: "OTHER" } }))).toEqual(["POINTER_APPROVAL_MISMATCH"]);
  });

  it("rejects totals that do not match the records", () => {
    const wrongCount = resealed((d) => { d.totals.recordCount = 5; });
    expect(codes(validateReaderManifest(wrongCount, contextFor(wrongCount)))).toEqual(["TOTALS_MISMATCH"]);
    const wrongKanda = resealed((d) => { d.totals.perKanda = { "2": 2 }; });
    expect(codes(validateReaderManifest(wrongKanda, contextFor(wrongKanda)))).toEqual(["TOTALS_MISMATCH"]);
  });

  it("rejects unsorted and duplicate record keys", () => {
    const unsorted = resealed((d) => { d.records.reverse(); });
    expect(codes(validateReaderManifest(unsorted, contextFor(unsorted)))).toEqual(["RECORDS_NOT_SORTED_OR_DUPLICATE"]);
    const duplicate = resealed((d) => { d.records = [record("T-001"), record("T-001")]; d.totals = { recordCount: 2, perKanda: { "1": 2 } }; });
    expect(codes(validateReaderManifest(duplicate, contextFor(duplicate)))).toEqual(["RECORDS_NOT_SORTED_OR_DUPLICATE"]);
  });

  it("rejects staging, source-review and candidate identifiers even when correctly sealed", () => {
    for (const key of ["STAGING-X-1", "stg-v2-x", "SRC-REVIEW-X-1", "SRC-READINESS-X-1", "CANDIDATE-X-1"]) {
      const manifest = resealed((d) => { d.records = [record(key)]; d.totals = { recordCount: 1, perKanda: { "1": 1 } }; });
      const result = validateReaderManifest(manifest, contextFor(manifest));
      expect(codes(result), key).toEqual(["STAGING_IDENTIFIER"]);
      expect(result.status).toBe("MANIFEST_INVALID");
    }
  });

  it("resolves every source, edition and tradition through the governed registry", () => {
    const manifest = sealReaderManifest(draft());
    const ctx = contextFor(manifest);
    expect(codes(validateReaderManifest(manifest, { ...ctx, registry: { ...REGISTRY, sha256: "d".repeat(64) } }))).toEqual(["REGISTRY_REF_MISMATCH"]);
    expect(codes(validateReaderManifest(manifest, { ...ctx, registry: { ...REGISTRY, registryId: "OTHER" } }))).toEqual(["REGISTRY_REF_MISMATCH"]);

    const unknown = resealed((d) => { d.records[0] = record("T-001", 1, "TEST-SOURCE-MISSING"); });
    expect(codes(validateReaderManifest(unknown, contextFor(unknown)))).toEqual(["UNKNOWN_SOURCE_ID"]);

    const wrongEdition = resealed((d) => { d.records[0] = record("T-001", 1, "TEST-SOURCE-A", "TEST-EDITION-B"); });
    expect(codes(validateReaderManifest(wrongEdition, contextFor(wrongEdition)))).toEqual(["EDITION_MISMATCH"]);

    const wrongTradition = resealed((d) => { d.records[0] = { ...record("T-001"), traditionId: "OTHER-TRADITION" }; });
    expect(codes(validateReaderManifest(wrongTradition, contextFor(wrongTradition)))).toEqual(["TRADITION_MISMATCH"]);
  });

  it("does not mutate its inputs", () => {
    const manifest = sealReaderManifest(draft());
    const ctx = contextFor(manifest);
    const snapshot = JSON.stringify({ manifest, ctx });
    validateReaderManifest(manifest, ctx);
    expect(JSON.stringify({ manifest, ctx })).toBe(snapshot);
  });
});

describe("verifyReaderAgainstApprovedManifest", () => {
  it("verifies only a valid manifest plus an exact database match including editorial content", () => {
    const manifest = sealReaderManifest(draft());
    const report = verifyReaderAgainstApprovedManifest(rowsFor(manifest), manifest, contextFor(manifest));
    expect(report).toMatchObject({ status: "PARITY_VERIFIED", manifest: "MANIFEST_VALID", findings: [] });
  });

  it("never verifies when context is missing or the manifest is invalid", () => {
    const manifest = sealReaderManifest(draft());
    const rows = rowsFor(manifest);
    expect(verifyReaderAgainstApprovedManifest(rows, manifest, { pointer: null, registry: REGISTRY }).status).toBe("PARITY_NOT_ESTABLISHED");
    expect(verifyReaderAgainstApprovedManifest(rows, null, contextFor(manifest)).status).toBe("PARITY_FAILED");
    const tampered = clone(manifest);
    tampered.records[0].summary = "x";
    expect(verifyReaderAgainstApprovedManifest(rows, tampered, contextFor(manifest)).status).toBe("PARITY_FAILED");
  });

  it("fails on database editorial content or Sarga identifier drift", () => {
    const manifest = sealReaderManifest(draft());
    const rows = rowsFor(manifest);
    rows[0] = { ...rows[0], summary: "database text drifted" };
    rows[1] = { ...rows[1], sargaIdentifier: "other" };
    const report = verifyReaderAgainstApprovedManifest(rows, manifest, contextFor(manifest));
    expect(report.status).toBe("PARITY_FAILED");
    expect(codes(report)).toEqual(expect.arrayContaining(["CONTENT_MISMATCH", "SARGA_IDENTIFIER_MISMATCH"]));
  });

  it("fails on missing, extra, duplicate, human_reviewed and staging rows", () => {
    const manifest = sealReaderManifest(draft());
    const [a, b] = rowsFor(manifest);
    const ctx = contextFor(manifest);
    expect(codes(verifyReaderAgainstApprovedManifest([a], manifest, ctx))).toContain("MISSING_RECORD");
    expect(codes(verifyReaderAgainstApprovedManifest([a, b, { ...a, recordKey: "T-999" }], manifest, ctx))).toContain("UNEXPECTED_RECORD");
    expect(codes(verifyReaderAgainstApprovedManifest([a, b, a], manifest, ctx))).toContain("DUPLICATE_RECORD_KEY");
    expect(codes(verifyReaderAgainstApprovedManifest([{ ...a, reviewStatus: "human_reviewed" }, b], manifest, ctx))).toContain("NOT_SOURCE_VERIFIED");
    expect(codes(verifyReaderAgainstApprovedManifest([a, b, { ...a, recordKey: "STAGING-X-1" }], manifest, ctx))).toContain("STAGING_IDENTIFIER");
    expect(verifyReaderAgainstApprovedManifest([], manifest, ctx).status).toBe("PARITY_FAILED");
  });
});

describe("evaluateReaderLoadAuthority (the governance file stays the control)", () => {
  it("blocks while the authority reports a conflict or does not explicitly allow promotion", () => {
    const current = { status: "CONFLICT_REQUIRES_RECONCILIATION", acquisition_allowed: false, promotion_allowed: false, reader_corpus_activation_implied: false };
    const result = evaluateReaderLoadAuthority(current);
    expect(result.permitted).toBe(false);
    expect(result.reasons.join(" ")).toContain("CONFLICT_REQUIRES_RECONCILIATION");
    expect(result.reasons.join(" ")).toContain("promotion_allowed");
  });

  it("blocks conflict status even if promotion_allowed was flipped, and blocks malformed input", () => {
    expect(evaluateReaderLoadAuthority({ status: "CONFLICT_REQUIRES_RECONCILIATION", promotion_allowed: true }).permitted).toBe(false);
    for (const bad of [null, undefined, "x", 5, [], {}, { status: "", promotion_allowed: true }, { status: "RESOLVED", promotion_allowed: "true" }, { status: "RESOLVED", promotion_allowed: 1 }]) {
      expect(evaluateReaderLoadAuthority(bad).permitted, JSON.stringify(bad)).toBe(false);
    }
  });

  it("permits only an explicit boolean promotion_allowed with a non-conflict status", () => {
    expect(evaluateReaderLoadAuthority({ status: "RESOLVED_TEST_FIXTURE", promotion_allowed: true })).toEqual({ permitted: true, reasons: [] });
  });
});
