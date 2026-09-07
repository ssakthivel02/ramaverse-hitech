import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/ramaverse";
const physicalPath = "data/staging/physical/STAGING_RECORDS.json";
const postV1Dir = path.join(root, "data/staging/post_v1");
const ledgerPath = path.join(root, "RAMAVERSE_STAGING_MASTER_LEDGER_V9.json");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));

const payloads = [];
const physical = readJson(physicalPath);
payloads.push({ path: physicalPath, records: physical });
for (const filename of fs.readdirSync(postV1Dir).filter((name) => /^AYODHYA_S\d+_SOURCE_BACKED_RECORDS\.json$/.test(name)).sort()) {
  const relative = `data/staging/post_v1/${filename}`;
  const parsed = readJson(relative);
  payloads.push({ path: relative, records: parsed.records ?? [] });
}

const records = payloads.flatMap((payload) => payload.records.map((record) => ({ ...record, _payload: payload.path })));
const ids = records.map((record) => record.candidate_id).filter(Boolean);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))].sort();
const sourceIds = [...new Set(records.flatMap((record) => [record.source_id, ...(Array.isArray(record.source) ? record.source : [])]).filter(Boolean))].sort();
const stagingLedger = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));
const latest = records.filter((record) => Number.isFinite(Number(record.sarga))).sort((a, b) => Number(b.sarga) - Number(a.sarga))[0];
const inventory = {
  inventoryId: "ramaverse-pre-run-physical-inventory-v1",
  generatedAt: new Date().toISOString(),
  scope: "physical source-backed staging only; reconciliation candidates excluded",
  historicalCanonicalBaseline: 550,
  physicalStagingFiles: payloads.map((payload) => ({ path: payload.path, recordCount: payload.records.length })),
  physicalStagingCount: records.length,
  physicalUniqueIds: [...new Set(ids)].length,
  duplicateIds,
  duplicateCount: duplicateIds.length,
  sourceIds: sourceIds,
  sourceCount: sourceIds.length,
  ledgerCount: stagingLedger.physicallyAvailableUniqueRecords,
  latestCompletedSourceLocator: latest ? { kanda: latest.kanda, sarga: latest.sarga, verseLocator: latest.verse_locator, sourceId: latest.source_id } : null,
  nextAcquisitionPoint: stagingLedger.nextAcquisitionPoint,
  physicalLedgerMatch: records.length === stagingLedger.physicallyAvailableUniqueRecords && new Set(ids).size === records.length,
  valid: records.length === stagingLedger.physicallyAvailableUniqueRecords && duplicateIds.length === 0,
};
fs.writeFileSync(path.join(root, "PRE_RUN_PHYSICAL_INVENTORY.json"), JSON.stringify(inventory, null, 2) + "\n");
console.log(JSON.stringify(inventory, null, 2));
if (!inventory.valid) process.exit(1);
