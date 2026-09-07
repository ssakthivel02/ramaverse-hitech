import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/ramaverse";
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const names = fs.readdirSync(path.join(root, "data/staging/post_v1")).filter((name) => /^AYODHYA_S\d+_SOURCE_BACKED_RECORDS\.json$/.test(name)).sort((a, b) => Number(a.match(/S(\d+)/)[1]) - Number(b.match(/S(\d+)/)[1]));
const payloads = [{ path: "data/staging/physical/STAGING_RECORDS.json", records: read("data/staging/physical/STAGING_RECORDS.json") }, ...names.map((name) => ({ path: `data/staging/post_v1/${name}`, records: read(`data/staging/post_v1/${name}`).records ?? [] }))];
const records = payloads.flatMap((payload) => payload.records);
const ids = records.map((record) => record.candidate_id).filter(Boolean);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))].sort();
const ledger = read("RAMAVERSE_STAGING_MASTER_LEDGER_VNEXT.json"), continuation = read("EXACT_PHYSICAL_CONTINUATION_VNEXT.json"), postRun = read("POST_RUN_AUTHORITY_STATE.json"), sources = read("SOURCE_LEDGER_VNEXT.json"), tamil = read("TAMIL_EDITORIAL_REVIEW_QUEUE_VNEXT.json");
const state = { stateId: "ramaverse-pre-run-authority-state-v2", generatedAt: new Date().toISOString(), authorityRule: "Derived exclusively from physical payloads and the current VNEXT ledger, continuation, post-run, source, and editorial evidence.", canonicalProduction: 550, physicalStaging: records.length, ledgerStaging: ledger.physicallyAvailableUniqueRecords, physicalLedgerMatch: records.length === ledger.physicallyAvailableUniqueRecords && postRun.physicalLedgerMatch, payloads: payloads.map((payload) => ({ path: payload.path, records: payload.records.length })), duplicateIds, stagingPublished: ledger.stagingPublished, publicSearchStaging: ledger.publicSurfacePolicy.stagingExposure, publicAskStaging: ledger.publicSurfacePolicy.stagingExposure, latestFullyAcquired: { kanda: continuation.last_fully_acquired_kanda, sarga: continuation.last_fully_acquired_sarga, verse: continuation.last_fully_acquired_verse }, nextUnacquired: continuation.next_unacquired_verse, sourceCount: sources.sources.length, tamilReviewQueue: { count: tamil.records.length, translationStates: tamil.countsByTranslationState }, acquisitionGate: records.length === 172 && records.length === ledger.physicallyAvailableUniqueRecords && duplicateIds.length === 0 && ledger.stagingPublished === 0 && ledger.publicSurfacePolicy.stagingExposure === 0 && continuation.next_unacquired_verse === "2.32.1" ? "PASS_START_AYODHYA_SARGA_32" : "NO_GO_USE_ACTUAL_PHYSICAL_CONTINUATION" };
fs.writeFileSync(path.join(root, "PRE_RUN_AUTHORITY_STATE_V2.json"), JSON.stringify(state, null, 2) + "\n");
console.log(JSON.stringify(state, null, 2));
if (state.acquisitionGate !== "PASS_START_AYODHYA_SARGA_32") process.exit(1);
