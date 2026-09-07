import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = "/home/ubuntu/ramaverse";
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const payloadNames = fs.readdirSync(path.join(root, "data/staging/post_v1")).filter((name) => /^AYODHYA_S\d+_SOURCE_BACKED_RECORDS\.json$/.test(name)).sort((a, b) => Number(a.match(/S(\d+)/)[1]) - Number(b.match(/S(\d+)/)[1]));
const payloads = [
  { path: "data/staging/physical/STAGING_RECORDS.json", records: read("data/staging/physical/STAGING_RECORDS.json") },
  ...payloadNames.map((name) => ({ path: `data/staging/post_v1/${name}`, records: read(`data/staging/post_v1/${name}`).records ?? [] })),
];
const candidates = read("POST_V1_RECONCILIATION_CANDIDATES.json").candidates ?? [];
const ledger = read("RAMAVERSE_STAGING_MASTER_LEDGER_V10.json");
const physicalRecords = payloads.flatMap((payload) => payload.records.map((record) => ({ ...record, _payload: payload.path })));
const allIds = physicalRecords.map((record) => record.candidate_id).filter(Boolean);
const duplicateStableIds = [...new Set(allIds.filter((id, index) => allIds.indexOf(id) !== index))].sort();
const sourceIdsFor = (record) => [...new Set([record.source_id, ...(Array.isArray(record.source) ? record.source : [])].filter(Boolean))];
const sourceLocatorFor = (record) => record.canonical_source_locator ?? record.source_locator ?? record.locator ?? null;
const sectionFor = (record) => record.verse_locator ?? record.sarga_reference ?? record.locator ?? null;
const semanticKeyFor = (record) => [record.record_type ?? record.entity_type, record.kanda, record.sarga ?? record.sarga_reference, sectionFor(record), record.speaker ?? "", record.listener ?? "", record.subject ?? "", record.object ?? "", record.relation ?? ""].map((value) => String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()).join("|");
const buckets = new Map();
for (const record of physicalRecords) {
  const key = semanticKeyFor(record);
  buckets.set(key, [...(buckets.get(key) ?? []), record.candidate_id]);
}
const exactSemanticDuplicates = [...buckets.entries()].filter(([, ids]) => ids.length > 1).map(([semanticKey, ids]) => ({ semanticKey, ids }));
const physicalCoverage = physicalRecords.map((record) => ({ id: record.candidate_id, kanda: record.kanda, sarga: record.sarga ?? record.sarga_reference ?? null, verseRange: sectionFor(record), sourceLocator: sourceLocatorFor(record), sourceIds: sourceIdsFor(record), payload: record._payload })).sort((a, b) => String(a.id).localeCompare(String(b.id)));
const candidateCoverage = candidates.map((candidate) => ({ id: candidate.candidate_id, kanda: candidate.kanda, sarga: candidate.sarga, verseRange: candidate.locator ?? null, classification: candidate.classification }));
const artifactRelativePaths = [...payloads.map((payload) => payload.path), "POST_V1_RECONCILIATION_CANDIDATES.json", "RAMAVERSE_STAGING_MASTER_LEDGER_V10.json"];
const report = {
  auditId: "ramaverse-post-v1-staging-physical-audit-v10",
  generatedAt: new Date().toISOString(),
  physicalRecordCount: physicalRecords.length,
  basePhysicalRecordCount: payloads[0].records.length,
  postV1PhysicalRecordCount: physicalRecords.length - payloads[0].records.length,
  candidateRecordCount: candidates.length,
  declaredLedgerCount: ledger.physicallyAvailableUniqueRecords,
  duplicateStableIds,
  exactSemanticDuplicates,
  physicalCoverage,
  candidateCoverage,
  artifacts: artifactRelativePaths.map((relative) => ({ path: relative, sha256: crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relative))).digest("hex"), bytes: fs.statSync(path.join(root, relative)).size })),
  valid: physicalRecords.length === ledger.physicallyAvailableUniqueRecords && duplicateStableIds.length === 0 && exactSemanticDuplicates.length === 0 && physicalCoverage.every((record) => record.sourceIds.length > 0 && Boolean(record.sourceLocator))
};
fs.writeFileSync(path.join(root, "POST_V1_STAGING_PHYSICAL_AUDIT_V10.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
if (!report.valid) process.exit(1);
