import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/ramaverse";
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const postV1 = fs.readdirSync(path.join(root, "data/staging/post_v1"))
  .filter((name) => /^AYODHYA_S\d+_SOURCE_BACKED_RECORDS\.json$/.test(name))
  .sort((a, b) => Number(a.match(/S(\d+)/)[1]) - Number(b.match(/S(\d+)/)[1]));
const payloads = [
  { path: "data/staging/physical/STAGING_RECORDS.json", records: read("data/staging/physical/STAGING_RECORDS.json") },
  ...postV1.map((name) => ({ path: `data/staging/post_v1/${name}`, records: read(`data/staging/post_v1/${name}`).records ?? [] }))
];
const records = payloads.flatMap((payload) => payload.records);
const ids = records.map((record) => record.candidate_id).filter(Boolean);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))].sort();
const ledger = read("RAMAVERSE_STAGING_MASTER_LEDGER_V10.json");
const postRun = read("POST_RUN_PHYSICAL_INVENTORY.json");
const continuation = read("EXACT_PHYSICAL_CONTINUATION_V10.json");
const sourceLedger = read("SOURCE_LEDGER_V10.json");
const tamilQueue = read("TAMIL_EDITORIAL_REVIEW_QUEUE.json");
const state = {
  stateId: "ramaverse-pre-run-authority-state-vnext",
  generatedAt: new Date().toISOString(),
  authorityRule: "Derived from physical staging payloads, V10 ledger, post-run inventory, exact continuation, source ledger, and Tamil queue; no stale count is trusted.",
  canonicalProduction: 550,
  physicalStaging: records.length,
  ledgerStaging: ledger.physicallyAvailableUniqueRecords,
  physicalLedgerMatch: records.length === ledger.physicallyAvailableUniqueRecords && postRun.physicalLedgerMatch,
  physicalPayloads: payloads.map((payload) => ({ path: payload.path, records: payload.records.length })),
  duplicateIds,
  stagingPublished: ledger.stagingPublished,
  publicSearch: ledger.publicSurfacePolicy.search,
  publicAsk: ledger.publicSurfacePolicy.ask,
  latestFullyAcquired: {
    kanda: continuation.last_fully_acquired_kanda,
    sarga: continuation.last_fully_acquired_sarga,
    verse: continuation.last_fully_acquired_verse
  },
  nextUnacquired: continuation.next_unacquired_verse,
  tamilReviewQueue: { count: tamilQueue.records.length, byTranslationState: tamilQueue.countsByTranslationState },
  sourceCount: sourceLedger.sources.length,
  sourceRecordIds: [...new Set(records.flatMap((record) => [record.source_id, ...(record.source ?? [])].filter(Boolean)))].sort(),
  acquisitionGate: records.length === ledger.physicallyAvailableUniqueRecords && duplicateIds.length === 0 && ledger.stagingPublished === 0 && continuation.next_unacquired_verse === "2.30.1" ? "PASS_START_AYODHYA_SARGA_30" : "NO_GO_USE_ACTUAL_PHYSICAL_CONTINUATION"
};
fs.writeFileSync(path.join(root, "PRE_RUN_AUTHORITY_STATE.json"), JSON.stringify(state, null, 2) + "\n");
console.log(JSON.stringify(state, null, 2));
if (state.acquisitionGate !== "PASS_START_AYODHYA_SARGA_30") process.exit(1);
