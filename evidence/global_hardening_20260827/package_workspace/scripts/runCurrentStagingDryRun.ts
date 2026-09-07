import fs from "node:fs";
import path from "node:path";
import { runCanonicalImportDryRun } from "../server/importDryRun";

const stagingPath = "/home/ubuntu/.manus/config/project-file/ramaverse_canonical_staging_v2.json";
const report = runCanonicalImportDryRun(stagingPath, { expectedObservedRecords: 78 });
const staging = JSON.parse(fs.readFileSync(stagingPath, "utf8")) as { sources: { source_id: string }[]; records: Record<string, unknown>[] };
const sourceIds = staging.sources.map((source) => source.source_id);
const sargas = sourceIds.map((sourceId) => Number(sourceId.match(/-s(\d+)-/)?.[1])).filter(Number.isFinite).sort((left, right) => left - right);
const stagingCoverage = sargas.length ? `Ayodhya Kanda Sargas ${sargas[0]}–${sargas.at(-1)}` : "Source-located staging coverage";
const candidateEvidence = staging.records.map((record) => {
  const reviewStatus = String(record.review_status ?? "");
  const sourceReview = reviewStatus.includes("source") || String(record.copyright_status ?? "").includes("review_required");
  const tamilReview = reviewStatus.includes("tamil");
  const possibleLegacyOverlap = record.possible_legacy_overlap === true;
  const decisionState = tamilReview ? "NEEDS_TAMIL_REVIEW" : sourceReview ? "NEEDS_SOURCE_REVIEW" : possibleLegacyOverlap ? "POTENTIAL_OVERLAP" : "READY_FOR_EDITORIAL_APPROVAL";
  return {
    candidateId: String(record.candidate_id ?? "unidentified-staging-candidate"),
    recordType: String(record.record_type ?? "UNCLASSIFIED"),
    kanda: String(record.kanda ?? "Unspecified"),
    sargaReference: String(record.sarga_reference ?? "Unspecified"),
    sourceLocator: String(record.canonical_source_locator ?? "Locator unavailable"),
    sourceIds: Array.isArray(record.source) ? record.source.map(String) : [],
    tradition: String(record.tradition_classification ?? "UNCLASSIFIED"),
    confidence: String(record.confidence ?? "not stated"),
    possibleCanonicalMatch: possibleLegacyOverlap ? "POTENTIAL_OVERLAP" : "NONE_RECORDED",
    possibleLegacyOverlap,
    tamilReview,
    sourceReview,
    decisionState,
  };
});
const decisionStateCounts = candidateEvidence.reduce<Record<string, number>>((counts, candidate) => ({ ...counts, [candidate.decisionState]: (counts[candidate.decisionState] ?? 0) + 1 }), {});
const enrichedReport = { ...report, stagingCoverage, candidateEvidence, decisionStateCounts };
fs.writeFileSync(path.join("/home/ubuntu/ramaverse", "CANONICAL_IMPORT_DRY_RUN_REPORT.json"), JSON.stringify(enrichedReport, null, 2), "utf8");
console.log(JSON.stringify(enrichedReport, null, 2));
