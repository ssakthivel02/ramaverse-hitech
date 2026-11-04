/**
 * Fail-closed validation of an owner-approved Reader manifest (Issue #178), plus a combined verifier.
 *
 * This module is pure and read-only: no database access, no file access, no import and no promotion.
 * It validates a manifest that the CALLER supplies, together with the context the caller supplies (the
 * approval pointer and the governed source registry). It never derives expectations from the database, the
 * seed, tests, staging or source-review artifacts, and it cannot make a manifest authoritative: equality
 * with a manifest proves only that the database matches that manifest.
 *
 * The manifest format below is a PROPOSAL (see the Reader manifest contract design); no approved manifest,
 * pointer or governed registry exists in the repository yet, so every caller path today ends in
 * "not established".
 */
import { createHash } from "node:crypto";
import { z } from "zod";
import { NON_CANONICAL_KEY, verifyReaderParity, type ParityFinding, type ReaderRow } from "./readerParity";

const sha256Hex = z.string().regex(/^[a-f0-9]{64}$/, "must be a lowercase hex SHA-256");
const nonBlank = z.string().trim().min(1);

export const readerManifestRecordSchema = z
  .object({
    recordKey: nonBlank,
    kandaNumber: z.number().int().min(1).max(7),
    sargaIdentifier: nonBlank,
    editionId: nonBlank,
    sourceId: nonBlank,
    sourceLocator: nonBlank,
    traditionId: nonBlank,
    reviewStatus: z.literal("source_verified"),
    editorialDescriptor: nonBlank,
    summary: nonBlank,
    contentSha256: sha256Hex,
  })
  .strict();

export const readerManifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    manifestId: nonBlank,
    createdAt: z.iso.datetime(),
    approval: z
      .object({
        decision: z.literal("APPROVED_FOR_READER_LOAD"),
        approvedBy: nonBlank,
        approvedAt: z.iso.datetime(),
        approvalRef: nonBlank,
      })
      .strict(),
    sourceRegistryRef: z.object({ registryId: nonBlank, sha256: sha256Hex }).strict(),
    records: z.array(readerManifestRecordSchema).min(1),
    totals: z
      .object({
        recordCount: z.number().int().nonnegative(),
        perKanda: z.record(z.string(), z.number().int().nonnegative()),
      })
      .strict(),
    integrity: z.object({ manifestSha256: sha256Hex }).strict(),
  })
  .strict();

export type ReaderManifest = z.infer<typeof readerManifestSchema>;
export type ReaderManifestRecord = z.infer<typeof readerManifestRecordSchema>;
export type ReaderManifestDraft = Omit<ReaderManifest, "integrity" | "records"> & {
  records: Array<Omit<ReaderManifestRecord, "contentSha256">>;
};

/** Pinned approval pointer (proposed data/reader/ACTIVE_READER_MANIFEST.json), supplied by the caller. */
export type ReaderManifestPointer = { manifestId: string; manifestSha256: string; recordCount: number; approvalRef: string };

/** Governed source registry (proposed), supplied by the caller together with its own SHA-256. */
export type GovernedSourceRegistry = {
  registryId: string;
  sha256: string;
  sources: Array<{ sourceId: string; editionId: string; traditionId: string }>;
};

export type ManifestContext = { pointer: ReaderManifestPointer | null; registry: GovernedSourceRegistry | null };

export type ManifestFindingCode =
  | "SCHEMA_INVALID"
  | "NOT_APPROVED"
  | "NO_POINTER"
  | "NO_REGISTRY"
  | "MANIFEST_HASH_MISMATCH"
  | "POINTER_ID_MISMATCH"
  | "POINTER_HASH_MISMATCH"
  | "POINTER_COUNT_MISMATCH"
  | "POINTER_APPROVAL_MISMATCH"
  | "TOTALS_MISMATCH"
  | "RECORDS_NOT_SORTED_OR_DUPLICATE"
  | "STAGING_IDENTIFIER"
  | "CONTENT_HASH_MISMATCH"
  | "REGISTRY_REF_MISMATCH"
  | "UNKNOWN_SOURCE_ID"
  | "EDITION_MISMATCH"
  | "TRADITION_MISMATCH";

export type ManifestFinding = { code: ManifestFindingCode; recordKey?: string; detail: string };

export type ManifestValidation = {
  status: "MANIFEST_VALID" | "MANIFEST_INVALID" | "MANIFEST_NOT_ESTABLISHED";
  findings: ManifestFinding[];
};

/** Deterministic JSON: object keys sorted recursively, arrays kept in order, no whitespace. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

const sha256 = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");

/** Hash of a record's editorial content: the fields a reader sees that are not otherwise provenance. */
export function computeRecordContentSha256(record: { editorialDescriptor: string; summary: string }): string {
  return sha256(canonicalJson({ editorialDescriptor: record.editorialDescriptor, summary: record.summary }));
}

/** Hash of the whole manifest excluding its own `integrity` block. */
export function computeManifestSha256(manifest: Omit<ReaderManifest, "integrity"> | ReaderManifest): string {
  const { integrity: _integrity, ...rest } = manifest as ReaderManifest;
  return sha256(canonicalJson(rest));
}

/** Owner-tooling helper: fills record content hashes and the integrity hash. Does not approve anything. */
export function sealReaderManifest(draft: ReaderManifestDraft): ReaderManifest {
  const records = draft.records.map((record) => ({ ...record, contentSha256: computeRecordContentSha256(record) }));
  const body = { ...draft, records };
  return { ...body, integrity: { manifestSha256: computeManifestSha256(body as Omit<ReaderManifest, "integrity">) } } as ReaderManifest;
}

function perKandaCounts(records: readonly { kandaNumber: number }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const record of records) counts[String(record.kandaNumber)] = (counts[String(record.kandaNumber)] ?? 0) + 1;
  return counts;
}

export function validateReaderManifest(input: unknown, context: ManifestContext): ManifestValidation {
  const findings: ManifestFinding[] = [];
  const parsed = readerManifestSchema.safeParse(input);

  if (!parsed.success) {
    for (const issue of parsed.error.issues.slice(0, 10)) {
      const path = issue.path.join(".");
      const approvalDecision = path === "approval.decision";
      findings.push({
        code: approvalDecision ? "NOT_APPROVED" : "SCHEMA_INVALID",
        detail: approvalDecision ? "approval.decision is not APPROVED_FOR_READER_LOAD." : `${path || "(root)"}: ${issue.message}`,
      });
    }
    return { status: "MANIFEST_INVALID", findings };
  }
  const manifest = parsed.data;

  // Context that cannot be evaluated is "not established", never "valid".
  let missingContext = false;
  if (!context.pointer) {
    missingContext = true;
    findings.push({ code: "NO_POINTER", detail: "No approval pointer supplied; the manifest cannot be bound to an approved version." });
  }
  if (!context.registry) {
    missingContext = true;
    findings.push({ code: "NO_REGISTRY", detail: "No governed source registry supplied; sources and editions cannot be resolved." });
  }

  const recomputed = computeManifestSha256(manifest);
  if (recomputed !== manifest.integrity.manifestSha256) {
    findings.push({ code: "MANIFEST_HASH_MISMATCH", detail: "integrity.manifestSha256 does not match the manifest content." });
  }

  if (context.pointer) {
    const { pointer } = context;
    if (pointer.manifestId !== manifest.manifestId) findings.push({ code: "POINTER_ID_MISMATCH", detail: "Pointer manifestId differs from the manifest." });
    if (pointer.manifestSha256 !== recomputed || pointer.manifestSha256 !== manifest.integrity.manifestSha256) {
      findings.push({ code: "POINTER_HASH_MISMATCH", detail: "Pointer manifestSha256 does not equal the recomputed and declared manifest hash." });
    }
    if (pointer.recordCount !== manifest.records.length) findings.push({ code: "POINTER_COUNT_MISMATCH", detail: "Pointer recordCount differs from the number of records." });
    if (pointer.approvalRef !== manifest.approval.approvalRef) findings.push({ code: "POINTER_APPROVAL_MISMATCH", detail: "Pointer approvalRef differs from the manifest approval." });
  }

  if (manifest.totals.recordCount !== manifest.records.length || canonicalJson(manifest.totals.perKanda) !== canonicalJson(perKandaCounts(manifest.records))) {
    findings.push({ code: "TOTALS_MISMATCH", detail: "totals do not match the records." });
  }

  for (let i = 0; i < manifest.records.length; i++) {
    const record = manifest.records[i];
    if (i > 0 && !(manifest.records[i - 1].recordKey < record.recordKey)) {
      findings.push({ code: "RECORDS_NOT_SORTED_OR_DUPLICATE", recordKey: record.recordKey, detail: "Records must be strictly ascending by recordKey (no duplicates)." });
    }
    if (NON_CANONICAL_KEY.test(record.recordKey)) {
      findings.push({ code: "STAGING_IDENTIFIER", recordKey: record.recordKey, detail: "Staging/source-review/candidate identifier in an approved manifest." });
    }
    if (computeRecordContentSha256(record) !== record.contentSha256) {
      findings.push({ code: "CONTENT_HASH_MISMATCH", recordKey: record.recordKey, detail: "contentSha256 does not match the editorial content." });
    }
  }

  if (context.registry) {
    const { registry } = context;
    if (registry.registryId !== manifest.sourceRegistryRef.registryId || registry.sha256 !== manifest.sourceRegistryRef.sha256) {
      findings.push({ code: "REGISTRY_REF_MISMATCH", detail: "Supplied registry id/hash differs from sourceRegistryRef." });
    }
    const bySource = new Map(registry.sources.map((source) => [source.sourceId, source]));
    for (const record of manifest.records) {
      const source = bySource.get(record.sourceId);
      if (!source) {
        findings.push({ code: "UNKNOWN_SOURCE_ID", recordKey: record.recordKey, detail: `sourceId "${record.sourceId}" is not in the governed registry.` });
        continue;
      }
      if (source.editionId !== record.editionId) findings.push({ code: "EDITION_MISMATCH", recordKey: record.recordKey, detail: "editionId differs from the registry entry for this source." });
      if (source.traditionId !== record.traditionId) findings.push({ code: "TRADITION_MISMATCH", recordKey: record.recordKey, detail: "traditionId differs from the registry entry for this source." });
    }
  }

  const hasInvalid = findings.some((f) => f.code !== "NO_POINTER" && f.code !== "NO_REGISTRY");
  return { status: hasInvalid ? "MANIFEST_INVALID" : missingContext ? "MANIFEST_NOT_ESTABLISHED" : "MANIFEST_VALID", findings };
}

export type ReaderRowWithContent = ReaderRow & { editorialDescriptor: string; summary: string; sargaIdentifier: string };

export type ApprovedParityReport = {
  status: "PARITY_VERIFIED" | "PARITY_FAILED" | "PARITY_NOT_ESTABLISHED";
  manifest: ManifestValidation["status"];
  findings: Array<ManifestFinding | ParityFinding | { code: "CONTENT_MISMATCH" | "SARGA_IDENTIFIER_MISMATCH"; recordKey: string; detail: string }>;
};

/**
 * Parity of a database snapshot against a VALIDATED manifest. If the manifest is not valid this never
 * reports success: invalid manifest -> PARITY_FAILED, unestablished context -> PARITY_NOT_ESTABLISHED.
 */
export function verifyReaderAgainstApprovedManifest(rows: readonly ReaderRowWithContent[], input: unknown, context: ManifestContext): ApprovedParityReport {
  const validation = validateReaderManifest(input, context);
  if (validation.status !== "MANIFEST_VALID") {
    return {
      status: validation.status === "MANIFEST_INVALID" ? "PARITY_FAILED" : "PARITY_NOT_ESTABLISHED",
      manifest: validation.status,
      findings: validation.findings,
    };
  }
  const manifest = readerManifestSchema.parse(input);
  const base = verifyReaderParity(rows, {
    schemaVersion: 1,
    manifestId: manifest.manifestId,
    records: manifest.records.map(({ recordKey, kandaNumber, editionId, sourceId, sourceLocator, traditionId }) => ({ recordKey, kandaNumber, editionId, sourceId, sourceLocator, traditionId })),
  });
  const findings: ApprovedParityReport["findings"] = [...base.findings];
  const approved = new Map(manifest.records.map((record) => [record.recordKey, record]));
  for (const row of rows) {
    const record = approved.get(row.recordKey);
    if (!record) continue;
    if (computeRecordContentSha256(row) !== record.contentSha256) findings.push({ code: "CONTENT_MISMATCH", recordKey: row.recordKey, detail: "Database editorial content differs from the approved content hash." });
    if (row.sargaIdentifier !== record.sargaIdentifier) findings.push({ code: "SARGA_IDENTIFIER_MISMATCH", recordKey: row.recordKey, detail: "sargaIdentifier differs from the approved manifest." });
  }
  return { status: findings.length === 0 && base.status === "PARITY_VERIFIED" ? "PARITY_VERIFIED" : "PARITY_FAILED", manifest: validation.status, findings };
}

/**
 * Whether the governance file permits loading Reader data. Pure function over an already-read object, so the
 * authority file remains the single control: while it reports a conflict or does not explicitly allow
 * promotion, nothing downstream may load.
 */
export function evaluateReaderLoadAuthority(authority: unknown): { permitted: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (authority === null || typeof authority !== "object") return { permitted: false, reasons: ["authority file missing or unreadable"] };
  const record = authority as Record<string, unknown>;
  if (typeof record.status !== "string" || record.status.trim() === "") reasons.push("authority status missing");
  else if (record.status === "CONFLICT_REQUIRES_RECONCILIATION") reasons.push("authority status is CONFLICT_REQUIRES_RECONCILIATION");
  if (record.promotion_allowed !== true) reasons.push("promotion_allowed is not true");
  return { permitted: reasons.length === 0, reasons };
}
