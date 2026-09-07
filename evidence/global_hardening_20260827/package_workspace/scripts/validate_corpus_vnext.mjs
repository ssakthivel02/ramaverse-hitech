import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
const root = "/home/ubuntu/ramaverse";
const dir = path.join(root, "data", "reconciliation_vnext");
const ledger = JSON.parse(readFileSync(path.join(dir, "RAMAVERSE-WEB-CORPUS-vNEXT-RECONCILIATION-LEDGER.json"), "utf8"));
const candidate = JSON.parse(readFileSync(path.join(dir, "RAMAVERSE-WEB-CORPUS-vNEXT-CANDIDATE.json"), "utf8"));
const projections = Object.fromEntries(["SEARCH_INDEX-vNEXT-CANDIDATE.json", "ASK_INDEX-vNEXT-CANDIDATE.json", "READER_MAPPINGS-vNEXT-CANDIDATE.json", "ENTITY_PROJECTIONS-vNEXT-CANDIDATE.json", "TIMELINE_PROJECTIONS-vNEXT-CANDIDATE.json"].map((file) => [file, JSON.parse(readFileSync(path.join(dir, file), "utf8"))]));
const dispositionKeys = Object.keys(ledger.counts);
const dispositionSum = Object.values(ledger.counts).reduce((sum, value) => sum + value, 0);
const oneDisposition = ledger.records.every((record) => dispositionKeys.includes(record.disposition));
const uniqueIds = new Set(ledger.records.map((record) => record.record_id));
const approvedIds = new Set([...candidate.safeNew, ...candidate.safeEnrichments].map((record) => record.record_id));
const projectionChecks = Object.entries(projections).map(([file, value]) => {
  const list = value.documents ?? value.mappings ?? value.entities ?? value.events ?? [];
  return { file, stagingExcluded: value.stagingExcluded === true, targetIdsResolve: list.every((item) => approvedIds.has(item.id)) };
});
const report = {
  generatedAt: new Date().toISOString(),
  specification: "pasted_content_108",
  physicalOccurrences: ledger.physicalOccurrences,
  uniquePhysicalRecords: ledger.uniquePhysicalRecords,
  physicalAccounting: ledger.physicalOccurrences > 0 && ledger.uniquePhysicalRecords === ledger.records.length,
  dispositionAccounting: dispositionSum === ledger.uniquePhysicalRecords && oneDisposition,
  stableIdDuplicates: ledger.records.length - uniqueIds.size,
  invalidSourceRefs: ledger.invalidSourceRefs,
  sourceResolution: ledger.invalidSourceRefs === 0 ? "PASS" : "HOLD_REQUIRES_SOURCE_REGISTRY_RECONCILIATION",
  canonicalBaseline: ledger.canonicalBaseline,
  stagingPublication: ledger.stagingPublished,
  mobileModified: ledger.mobileModified,
  productionMutation: ledger.productionMutation,
  candidate: { safeNew: candidate.safeNew.length, safeEnrichments: candidate.safeEnrichments.length, resultingCanonicalCandidate: candidate.resultingCanonicalCandidate, publicationState: candidate.publicationState },
  projections: projectionChecks,
  stagingLeakage: projectionChecks.some((check) => !check.stagingExcluded || !check.targetIdsResolve) ? "FAIL" : "0",
  tamilHumanReviewed: 0,
};
report.pass = report.physicalAccounting && report.dispositionAccounting && report.stableIdDuplicates === 0 && report.stagingPublication === 0 && report.mobileModified === false && report.productionMutation === 0 && report.stagingLeakage === "0";
writeFileSync(path.join(root, "release_evidence", "CORPUS_VNEXT_VALIDATION.json"), JSON.stringify(report, null, 2) + "\n");
writeFileSync(path.join(root, "release_evidence", "CORPUS_VNEXT_VALIDATION.md"), `# RamaVerse Corpus vNext Validation\n\nGenerated ${report.generatedAt}. This is a non-publishing reconciliation.\n\n| Gate | Result |\n|---|---|\n| Physical occurrences | ${report.physicalOccurrences} |\n| Unique physical records | ${report.uniquePhysicalRecords} |\n| Disposition accounting | ${report.dispositionAccounting ? "PASS" : "FAIL"} |\n| Stable-ID duplicates | ${report.stableIdDuplicates} |\n| Invalid source references | ${report.invalidSourceRefs} |\n| Canonical baseline | ${report.canonicalBaseline} |\n| Staging publication | ${report.stagingPublication} |\n| Candidate canonical count | ${report.candidate.resultingCanonicalCandidate} |\n| Projection staging leakage | ${report.stagingLeakage} |\n| Tamil human reviewed | ${report.tamilHumanReviewed} |\n| Overall non-publishing gate | ${report.pass ? "PASS" : "FAIL"} |\n\nThe source-reference hold count is reported separately and is not silently promoted. The Website production indexes remain unchanged.\n`);
console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exitCode = 1;
