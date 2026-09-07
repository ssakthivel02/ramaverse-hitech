import { z } from "zod";
import fs from "fs";
import path from "path";

const reviewStatusSchema = z.enum(["source_verified", "needs_source_review", "tradition_variant", "needs_human_tamil_review"]);

export const importRecordSchema = z.object({
  recordKey: z.string().min(1), kandaNumber: z.number().int().min(1).max(7), sargaIdentifier: z.string().min(1), summary: z.string().min(1), sourceId: z.string().min(1), traditionId: z.string().min(1), reviewStatus: reviewStatusSchema, possibleLegacyOverlap: z.boolean().optional().default(false),
});

export const importPackSchema = z.object({
  version: z.string().min(1), reconciliationStatus: z.enum(["approved", "pending", "rejected"]), sourceRegistry: z.array(z.string().min(1)), traditionRegistry: z.array(z.string().min(1)), canonicalRecordKeys: z.array(z.string().min(1)).default([]), records: z.array(importRecordSchema),
});

const stagingSourceSchema = z.object({ source_id: z.string().min(1), tradition_classification: z.string().min(1) });
const stagingRecordSchema = z.object({
  candidate_id: z.string().min(1), record_type: z.string().min(1), kanda: z.string().min(1), sarga_reference: z.string().min(1), canonical_source_locator: z.string().min(1), tamil_explanation: z.string().nullable(), english_explanation: z.string().min(1), source: z.array(z.string().min(1)).min(1), source_type: z.string().min(1), tradition_classification: z.string().min(1), possible_legacy_overlap: z.boolean(), merge_state: z.string().min(1), review_status: reviewStatusSchema,
});

export const stagingV2PackSchema = z.object({
  dataset_id: z.string().min(1), dataset_status: z.literal("staging_only"), historical_baseline: z.object({ total_records: z.number().int().nonnegative() }), staging_defaults: z.object({ merge_state: z.string().min(1), review_status: reviewStatusSchema }), sources: z.array(stagingSourceSchema).min(1), records: z.array(stagingRecordSchema),
});

export type ImportPack = z.infer<typeof importPackSchema>;

type DryRunOptions = { expectedObservedRecords?: number };

function makeReport(packPath: string, expectedObservedRecords?: number) {
  return {
    timestamp: new Date().toISOString(), packPath, dryRunOnly: true, status: "success" as "success" | "failed", inputFormat: "unknown", inputRecords: 0, validRecords: 0, duplicateRecords: 0, potentialLegacyOverlap: 0, humanReviewRequired: 0, sourceReviewRequired: 0, sourceIssues: 0, traditionIssues: 0, schemaIssues: 0, readyForEditorialReview: 0, candidateNewCanonicalRecords: 0, productionMerged: 0, historicalCanonicalBaseline: null as number | null, expectedObservedRecords: expectedObservedRecords ?? null, inputCountMatchesExpected: expectedObservedRecords === undefined ? null as boolean | null : false, errors: [] as string[], warnings: [] as string[],
  };
}

function runLegacyPack(data: z.infer<typeof importPackSchema>, report: ReturnType<typeof makeReport>) {
  report.inputFormat = "canonical-import-pack";
  report.inputRecords = data.records.length;
  if (data.reconciliationStatus !== "approved") report.warnings.push(`Reconciliation status is '${data.reconciliationStatus}'. This report cannot authorize production import.`);
  const sourceIds = new Set(data.sourceRegistry), traditionIds = new Set(data.traditionRegistry), canonicalKeys = new Set(data.canonicalRecordKeys), seenKeys = new Set<string>();
  for (const record of data.records) {
    if (seenKeys.has(record.recordKey)) { report.duplicateRecords++; report.errors.push(`Duplicate candidate ID: ${record.recordKey}`); continue; }
    seenKeys.add(record.recordKey);
    if (!sourceIds.has(record.sourceId)) { report.sourceIssues++; report.errors.push(`Unknown source ID for ${record.recordKey}: ${record.sourceId}`); continue; }
    if (!traditionIds.has(record.traditionId)) { report.traditionIssues++; report.errors.push(`Unknown tradition ID for ${record.recordKey}: ${record.traditionId}`); continue; }
    report.validRecords++;
    if (record.possibleLegacyOverlap || canonicalKeys.has(record.recordKey)) report.potentialLegacyOverlap++;
    if (record.reviewStatus === "needs_human_tamil_review") report.humanReviewRequired++;
    if (record.reviewStatus === "needs_source_review") report.sourceReviewRequired++;
    if (!record.possibleLegacyOverlap && !canonicalKeys.has(record.recordKey) && record.reviewStatus === "source_verified") report.candidateNewCanonicalRecords++;
  }
}

function runStagingV2Pack(data: z.infer<typeof stagingV2PackSchema>, report: ReturnType<typeof makeReport>) {
  report.inputFormat = "ramaverse-canonical-staging-v2";
  report.inputRecords = data.records.length;
  report.historicalCanonicalBaseline = data.historical_baseline.total_records;
  report.warnings.push("Staging-v2 is staging-only. This dry run has no database mutation or canonical publication path.");
  const sourceIds = new Set(data.sources.map((source) => source.source_id));
  const traditions = new Set(data.sources.map((source) => source.tradition_classification));
  const seen = new Set<string>();
  for (const record of data.records) {
    if (seen.has(record.candidate_id)) { report.duplicateRecords++; report.errors.push(`Duplicate candidate ID: ${record.candidate_id}`); continue; }
    seen.add(record.candidate_id);
    const unknownSources = record.source.filter((sourceId) => !sourceIds.has(sourceId));
    if (unknownSources.length) { report.sourceIssues += unknownSources.length; report.errors.push(`Unknown source ID(s) for ${record.candidate_id}: ${unknownSources.join(", ")}`); continue; }
    if (!traditions.has(record.tradition_classification)) { report.traditionIssues++; report.errors.push(`Unknown tradition classification for ${record.candidate_id}: ${record.tradition_classification}`); continue; }
    report.validRecords++;
    if (record.possible_legacy_overlap) report.potentialLegacyOverlap++;
    if (record.review_status === "needs_human_tamil_review") report.humanReviewRequired++;
    if (record.review_status === "needs_source_review") report.sourceReviewRequired++;
    if (record.merge_state !== data.staging_defaults.merge_state) report.errors.push(`Unexpected merge state for ${record.candidate_id}: ${record.merge_state}`);
    else report.readyForEditorialReview++;
  }
  report.candidateNewCanonicalRecords = 0;
}

export function runCanonicalImportDryRun(packJsonPath: string, options: DryRunOptions = {}) {
  const report = makeReport(packJsonPath, options.expectedObservedRecords);
  try {
    if (!fs.existsSync(packJsonPath)) { report.status = "failed"; report.errors.push(`Pack file not found at ${packJsonPath}`); return report; }
    const raw = JSON.parse(fs.readFileSync(packJsonPath, "utf-8"));
    const legacy = importPackSchema.safeParse(raw);
    if (legacy.success) runLegacyPack(legacy.data, report);
    else {
      const staging = stagingV2PackSchema.safeParse(raw);
      if (!staging.success) { report.status = "failed"; report.schemaIssues = 1; report.errors.push(`Pack schema validation failed: ${staging.error.message}`); return report; }
      runStagingV2Pack(staging.data, report);
    }
    if (report.expectedObservedRecords !== null) {
      report.inputCountMatchesExpected = report.inputRecords === report.expectedObservedRecords;
      if (!report.inputCountMatchesExpected) report.warnings.push(`Attached input has ${report.inputRecords} records; expected observed ledger count is ${report.expectedObservedRecords}. The discrepancy is preserved for reconciliation and does not authorize a merge.`);
    }
    if (report.errors.length > 0) report.status = "failed";
    fs.writeFileSync(path.join("/home/ubuntu/ramaverse", "CANONICAL_IMPORT_DRY_RUN_REPORT.json"), JSON.stringify(report, null, 2), "utf-8");
  } catch (error: unknown) {
    report.status = "failed"; report.schemaIssues++; report.errors.push(`Exception during dry run: ${error instanceof Error ? error.message : String(error)}`);
  }
  return report;
}
