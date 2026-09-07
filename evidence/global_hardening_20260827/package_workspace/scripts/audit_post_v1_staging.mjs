import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = "/home/ubuntu/ramaverse";
const recordsPath = path.join(root, "data/staging/physical/STAGING_RECORDS.json");
const candidatesPath = path.join(root, "POST_V1_RECONCILIATION_CANDIDATES.json");
const ledgerPath = path.join(root, "RAMAVERSE_STAGING_MASTER_LEDGER.json");
const postV1Paths = [
  path.join(root, "data/staging/post_v1/AYODHYA_S21_SOURCE_BACKED_RECORDS.json"),
  path.join(root, "data/staging/post_v1/AYODHYA_S22_SOURCE_BACKED_RECORDS.json"),
  path.join(root, "data/staging/post_v1/AYODHYA_S23_SOURCE_BACKED_RECORDS.json"),
  path.join(root, "data/staging/post_v1/AYODHYA_S24_SOURCE_BACKED_RECORDS.json"),
  path.join(root, "data/staging/post_v1/AYODHYA_S25_SOURCE_BACKED_RECORDS.json"),
  path.join(root, "data/staging/post_v1/AYODHYA_S26_SOURCE_BACKED_RECORDS.json"),
  path.join(root, "data/staging/post_v1/AYODHYA_S27_SOURCE_BACKED_RECORDS.json"),
  path.join(root, "data/staging/post_v1/AYODHYA_S28_SOURCE_BACKED_RECORDS.json"),
];

const records = JSON.parse(fs.readFileSync(recordsPath, "utf8"));
const candidatesPayload = JSON.parse(fs.readFileSync(candidatesPath, "utf8"));
const candidates = candidatesPayload.candidates ?? [];
const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));
const postV1Records = postV1Paths.flatMap((postV1Path) => JSON.parse(fs.readFileSync(postV1Path, "utf8")).records);
const idSet = new Set();
const duplicateIds = [];

for (const record of [...records, ...postV1Records, ...candidates]) {
  const id = record.candidate_id ?? record.id ?? record.stable_id;
  if (idSet.has(id)) duplicateIds.push(id);
  idSet.add(id);
}

const sourceIdsFor = (record) => record.source ?? (record.source_id ? [record.source_id] : []);
const sourceLocatorFor = (record) => record.canonical_source_locator ?? record.source_locator ?? record.locator ?? null;
const verseRangeFor = (record) => record.sarga_reference ?? record.verse_locator ?? record.locator ?? null;
const normalized = (value) => String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const semanticKeyFor = (record) => [
  record.record_type ?? record.entity_type,
  record.kanda,
  record.sarga ?? record.sarga_reference,
  verseRangeFor(record),
  record.speaker,
  record.listener,
  Array.isArray(record.characters) ? record.characters.join(" ") : "",
  Array.isArray(record.events) ? record.events.join(" ") : "",
  Array.isArray(record.relationships) ? record.relationships.join(" ") : "",
  record.title,
].map(normalized).join("|");

const physicalCoverage = [...records, ...postV1Records]
  .map((record) => ({
    id: record.candidate_id ?? record.id ?? record.stable_id,
    kanda: record.kanda,
    sarga: record.sarga ?? record.sarga_reference,
    verseRange: verseRangeFor(record),
    sourceLocator: sourceLocatorFor(record),
    sourceIds: sourceIdsFor(record),
    semanticKey: semanticKeyFor(record),
  }))
  .sort((a, b) => String(a.sarga).localeCompare(String(b.sarga)));

const candidateCoverage = candidates.map((record) => ({
  id: record.candidate_id,
  kanda: record.kanda,
  sarga: record.sarga,
  verseRange: record.locator ?? null,
  sourceLocator: sourceLocatorFor(record),
  sourceIds: sourceIdsFor(record),
  semanticKey: semanticKeyFor(record),
  classification: record.classification,
}));

const semanticBuckets = new Map();
for (const record of [...physicalCoverage, ...candidateCoverage]) {
  const ids = semanticBuckets.get(record.semanticKey) ?? [];
  ids.push(record.id);
  semanticBuckets.set(record.semanticKey, ids);
}
const exactSemanticDuplicates = [...semanticBuckets.entries()]
  .filter(([, ids]) => ids.length > 1)
  .map(([semanticKey, ids]) => ({ semanticKey, ids }));

const artifactPaths = [recordsPath, ...postV1Paths, candidatesPath, ledgerPath];
const artifacts = artifactPaths.map((artifactPath) => ({
  path: path.relative(root, artifactPath),
  sha256: crypto.createHash("sha256").update(fs.readFileSync(artifactPath)).digest("hex"),
  bytes: fs.statSync(artifactPath).size,
}));

const report = {
  generatedAt: new Date().toISOString(),
  physicalRecordCount: records.length + postV1Records.length,
  basePhysicalRecordCount: records.length,
  postV1PhysicalRecordCount: postV1Records.length,
  candidateRecordCount: candidates.length,
  declaredLedgerCount: ledger.physicallyAvailableUniqueRecords,
  duplicateStableIds: duplicateIds,
  exactSemanticDuplicates,
  physicalCoverage,
  candidateCoverage,
  artifacts,
};

fs.writeFileSync(path.join(root, "POST_V1_STAGING_PHYSICAL_AUDIT.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
