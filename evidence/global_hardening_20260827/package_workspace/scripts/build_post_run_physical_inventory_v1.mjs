import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/ramaverse";
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const payloadNames = fs.readdirSync(path.join(root, "data/staging/post_v1")).filter((name) => /^AYODHYA_S\d+_SOURCE_BACKED_RECORDS\.json$/.test(name)).sort((a, b) => Number(a.match(/S(\d+)/)[1]) - Number(b.match(/S(\d+)/)[1]));
const payloads = [{ path: "data/staging/physical/STAGING_RECORDS.json", records: read("data/staging/physical/STAGING_RECORDS.json") }, ...payloadNames.map((name) => ({ path: `data/staging/post_v1/${name}`, records: read(`data/staging/post_v1/${name}`).records ?? [] }))];
const records = payloads.flatMap((payload) => payload.records);
const ids = records.map((record) => record.candidate_id).filter(Boolean);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))].sort();
const ledger = read("RAMAVERSE_STAGING_MASTER_LEDGER_V10.json");
const inventory = {
  inventoryId: "ramaverse-post-run-physical-inventory-v1",
  generatedAt: new Date().toISOString(),
  scope: "physical source-backed staging only; reconciliation candidates excluded",
  historicalCanonicalBaseline: 550,
  physicalStagingFiles: payloads.map((payload) => ({ path: payload.path, recordCount: payload.records.length })),
  physicalStagingCount: records.length,
  physicalUniqueIds: new Set(ids).size,
  duplicateIds,
  duplicateCount: duplicateIds.length,
  ledgerCount: ledger.physicallyAvailableUniqueRecords,
  latestCompletedSourceLocator: ledger.latestVerifiedCoverage,
  nextAcquisitionPoint: ledger.nextAcquisitionPoint,
  publicSurfacePolicy: ledger.publicSurfacePolicy,
  physicalLedgerMatch: records.length === ledger.physicallyAvailableUniqueRecords && new Set(ids).size === records.length,
  valid: records.length === ledger.physicallyAvailableUniqueRecords && duplicateIds.length === 0 && ledger.stagingPublished === 0 && ledger.publicSurfacePolicy.stagingExposure === 0
};
fs.writeFileSync(path.join(root, "POST_RUN_PHYSICAL_INVENTORY.json"), JSON.stringify(inventory, null, 2) + "\n");
console.log(JSON.stringify(inventory, null, 2));
if (!inventory.valid) process.exit(1);
