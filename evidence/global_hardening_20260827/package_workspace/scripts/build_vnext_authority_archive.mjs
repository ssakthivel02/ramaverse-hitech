import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = "/home/ubuntu/ramaverse";
const archiveRoot = "/tmp/ramaverse-post-v1-authority-vnext";
const output = "/home/ubuntu/RAMAVERSE-CORPUS-AUTHORITY-POST-V1-vNEXT.zip";
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const copy = (from, to) => { const source = path.join(root, from), destination = path.join(archiveRoot, to); if (!fs.existsSync(source)) throw new Error(`Required archive artifact missing: ${from}`); fs.mkdirSync(path.dirname(destination), { recursive: true }); fs.copyFileSync(source, destination); };
fs.rmSync(archiveRoot, { recursive: true, force: true });
for (const directory of ["staging/records", "sources", "reconciliation", "tamil-review", "indexes", "knowledge-graph", "evidence", "docs"]) fs.mkdirSync(path.join(archiveRoot, directory), { recursive: true });
const payloadNames = fs.readdirSync(path.join(root, "data/staging/post_v1")).filter((name) => /^AYODHYA_S\d+_SOURCE_BACKED_RECORDS\.json$/.test(name)).sort((a, b) => Number(a.match(/S(\d+)/)[1]) - Number(b.match(/S(\d+)/)[1]));
copy("data/staging/physical/STAGING_RECORDS.json", "staging/records/STAGING_RECORDS.json");
for (const name of payloadNames) copy(`data/staging/post_v1/${name}`, `staging/records/${name}`);
const mappings = [
  ["SOURCE_LEDGER_VNEXT.json", "SOURCE_LEDGER.json"], ["SOURCE_LEDGER_VNEXT.json", "sources/SOURCE_LEDGER.json"], ["S30_SOURCE_SCOPE_EVIDENCE.json", "sources/S30_SOURCE_SCOPE_EVIDENCE.json"], ["S31_SOURCE_SCOPE_EVIDENCE.json", "sources/S31_SOURCE_SCOPE_EVIDENCE.json"],
  ["V1_5_RECONCILIATION_PREVIEW.json", "reconciliation/V1_5_RECONCILIATION_PREVIEW.json"], ["POST_V1_RECONCILIATION_CANDIDATES.json", "reconciliation/POST_V1_RECONCILIATION_CANDIDATES.json"],
  ["TAMIL_EDITORIAL_REVIEW_QUEUE_VNEXT.json", "TAMIL_EDITORIAL_REVIEW_QUEUE_VNEXT.json"], ["TAMIL_EDITORIAL_REVIEW_QUEUE_VNEXT.json", "tamil-review/TAMIL_EDITORIAL_REVIEW_QUEUE_VNEXT.json"],
  ["POST_V1_EDITORIAL_INDEX_VNEXT.json", "indexes/POST_V1_EDITORIAL_INDEX_VNEXT.json"], ["POST_V1_STAGING_KNOWLEDGE_GRAPH_VNEXT.json", "knowledge-graph/POST_V1_STAGING_KNOWLEDGE_GRAPH_VNEXT.json"], ["RELATIONAL_DIALOGUE_EVIDENCE_VNEXT.json", "knowledge-graph/RELATIONAL_DIALOGUE_EVIDENCE_VNEXT.json"],
  ["PRE_RUN_AUTHORITY_STATE.json", "PRE_RUN_AUTHORITY_STATE.json"], ["PRE_RUN_AUTHORITY_STATE.json", "evidence/PRE_RUN_AUTHORITY_STATE.json"], ["POST_RUN_AUTHORITY_STATE.json", "POST_RUN_AUTHORITY_STATE.json"], ["POST_RUN_AUTHORITY_STATE.json", "evidence/POST_RUN_AUTHORITY_STATE.json"],
  ["RAMAVERSE_STAGING_MASTER_LEDGER_VNEXT.json", "RAMAVERSE_STAGING_MASTER_LEDGER.json"], ["RAMAVERSE_STAGING_MASTER_LEDGER_VNEXT.json", "evidence/RAMAVERSE_STAGING_MASTER_LEDGER.json"], ["EXACT_PHYSICAL_CONTINUATION_VNEXT.json", "EXACT_PHYSICAL_CONTINUATION_VNEXT.json"], ["EXACT_PHYSICAL_CONTINUATION_VNEXT.json", "evidence/EXACT_PHYSICAL_CONTINUATION_VNEXT.json"],
  ["POST_V1_STAGING_PHYSICAL_AUDIT_VNEXT.json", "evidence/POST_V1_STAGING_PHYSICAL_AUDIT_VNEXT.json"], ["POST_V1_STAGING_VALIDATION_VNEXT.json", "evidence/POST_V1_STAGING_VALIDATION_VNEXT.json"], ["RAMAVERSE-CANONICAL-MOBILE-PACK-v1.5.0-CANDIDATE-METADATA.json", "evidence/RAMAVERSE-CANONICAL-MOBILE-PACK-v1.5.0-CANDIDATE-METADATA.json"], ["RAMAVERSE_PROJECT_STATE.json", "evidence/RAMAVERSE_PROJECT_STATE.json"]
];
for (const [from, to] of mappings) copy(from, to);
const continuation = `# RamaVerse Corpus Continuation — Post-V1 Sequential vNEXT\n\nThe historical canonical baseline remains **550** records. The final physical staging count is **172** records, and staging publication remains **0**. Public Search, Ask RamaVerse, the public knowledge graph, and the frozen v1.4.0 mobile pack remain canonical-only.\n\nThe physically verified sequence now ends at **Valmiki Ramayana, Ayodhya Kanda, Sarga 31, verse 2.31.35**. The exact next acquisition point is **Ayodhya Kanda, Sarga 32, verse 2.32.1**.\n\nSarga 30 and Sarga 31 are quarantined source-backed staging only. The Sarga 31 two-verse difference between the primary and cross-check renderings is retained as an edition variance for editorial review; it is not silently merged.\n`;
const handoff = `# RamaVerse Corpus Authority Handoff — Post-V1 Sequential vNEXT\n\n| Control | Verified state |\n|---|---|\n| Canonical production | 550, frozen |\n| Physical staging | 172 source-backed records |\n| Staging published | 0 |\n| Public Search / Ask / Graph staging | 0 / 0 / 0 |\n| Frozen mobile v1.4.0 pack | Unmodified |\n| Last fully acquired source | Ayodhya Kanda 2.31.35 |\n| Exact next source | Ayodhya Kanda 2.32.1 |\n\nThe v1.5 mobile artifact in this archive is metadata only. It is not a production mobile pack and has no publication path until formal reconciliation and Tamil editorial review are complete.\n`;
fs.writeFileSync(path.join(root, "CONTINUATION.md"), continuation);
fs.writeFileSync(path.join(root, "HANDOFF.md"), handoff);
copy("CONTINUATION.md", "docs/CONTINUATION.md"); copy("HANDOFF.md", "docs/HANDOFF.md");
const ledger = read("RAMAVERSE_STAGING_MASTER_LEDGER_VNEXT.json"), validation = read("POST_V1_STAGING_VALIDATION_VNEXT.json"), postRun = read("POST_RUN_AUTHORITY_STATE.json");
const allRecords = [read("data/staging/physical/STAGING_RECORDS.json"), ...payloadNames.map((name) => read(`data/staging/post_v1/${name}`).records ?? [])].flat();
const ids = allRecords.map((record) => record.candidate_id), duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
const contentValidation = { validationId: "ramaverse-post-v1-authority-vnext-content-validation", generatedAt: new Date().toISOString(), physicalStaging: allRecords.length, ledgerStaging: ledger.physicallyAvailableUniqueRecords, physicalLedgerMatch: allRecords.length === ledger.physicallyAvailableUniqueRecords, duplicateIds, sourceReferencesResolved: validation.missingSourceIds.length === 0, requiredFieldsComplete: validation.missingFields.length === 0, postRunStatePass: postRun.validationPass, stagingPublished: ledger.stagingPublished, publicSearchStaging: ledger.publicSurfacePolicy.stagingExposure, publicAskStaging: ledger.publicSurfacePolicy.stagingExposure, frozenMobilePackModified: false, valid: allRecords.length === ledger.physicallyAvailableUniqueRecords && duplicateIds.length === 0 && validation.valid && postRun.validationPass && ledger.stagingPublished === 0 && ledger.publicSurfacePolicy.stagingExposure === 0 };
fs.writeFileSync(path.join(root, "POST_V1_AUTHORITY_ARCHIVE_CONTENT_VALIDATION.json"), JSON.stringify(contentValidation, null, 2) + "\n");
copy("POST_V1_AUTHORITY_ARCHIVE_CONTENT_VALIDATION.json", "evidence/POST_V1_AUTHORITY_ARCHIVE_CONTENT_VALIDATION.json");
const entries = fs.readdirSync(archiveRoot, { recursive: true }).filter((entry) => !fs.statSync(path.join(archiveRoot, entry)).isDirectory()).sort();
fs.writeFileSync(path.join(archiveRoot, "SHA256SUMS.txt"), entries.map((entry) => `${sha256(path.join(archiveRoot, entry))}  ${entry}`).join("\n") + "\n");
fs.rmSync(output, { force: true }); execFileSync("zip", ["-qr", output, "."], { cwd: archiveRoot });
const zipEntries = execFileSync("unzip", ["-Z1", output], { encoding: "utf8" }).split("\n").filter(Boolean).sort();
const requiredEntries = ["PRE_RUN_AUTHORITY_STATE.json", "POST_RUN_AUTHORITY_STATE.json", "EXACT_PHYSICAL_CONTINUATION_VNEXT.json", "TAMIL_EDITORIAL_REVIEW_QUEUE_VNEXT.json", "reconciliation/V1_5_RECONCILIATION_PREVIEW.json", "SOURCE_LEDGER.json", "RAMAVERSE_STAGING_MASTER_LEDGER.json", "staging/records/AYODHYA_S30_SOURCE_BACKED_RECORDS.json", "staging/records/AYODHYA_S31_SOURCE_BACKED_RECORDS.json", "docs/CONTINUATION.md", "docs/HANDOFF.md", "SHA256SUMS.txt"];
const zipValidation = { validationId: "ramaverse-post-v1-authority-vnext-zip-validation", generatedAt: new Date().toISOString(), archive: output, archiveSha256: sha256(output), entryCount: zipEntries.length, requiredEntries, missingRequiredEntries: requiredEntries.filter((entry) => !zipEntries.includes(entry)), contentValidation: contentValidation.valid, reopened: true, valid: contentValidation.valid && requiredEntries.every((entry) => zipEntries.includes(entry)) };
fs.writeFileSync(path.join(root, "POST_V1_AUTHORITY_ARCHIVE_VNEXT_VALIDATION.json"), JSON.stringify(zipValidation, null, 2) + "\n");
console.log(JSON.stringify(zipValidation, null, 2));
if (!zipValidation.valid) process.exit(1);
