import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = "/home/ubuntu/ramaverse";
const archiveRoot = "/tmp/ramaverse-post-v1-vnext";
const output = "/home/ubuntu/RAMAVERSE-CORPUS-AUTHORITY-POST-V1-vNEXT.zip";
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const sha256File = (fullPath) => crypto.createHash("sha256").update(fs.readFileSync(fullPath)).digest("hex");
const copy = (from, to) => {
  const source = path.join(root, from);
  if (!fs.existsSync(source)) throw new Error(`Required archive artifact missing: ${from}`);
  const destination = path.join(archiveRoot, to);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
};

fs.rmSync(archiveRoot, { recursive: true, force: true });
for (const directory of ["staging/records", "sources", "reconciliation", "tamil-review", "indexes", "knowledge-graph", "evidence", "docs"]) fs.mkdirSync(path.join(archiveRoot, directory), { recursive: true });

const payloadNames = fs.readdirSync(path.join(root, "data/staging/post_v1")).filter((name) => /^AYODHYA_S\d+_SOURCE_BACKED_RECORDS\.json$/.test(name)).sort((a, b) => Number(a.match(/S(\d+)/)[1]) - Number(b.match(/S(\d+)/)[1]));
copy("data/staging/physical/STAGING_RECORDS.json", "staging/records/STAGING_RECORDS.json");
for (const name of payloadNames) copy(`data/staging/post_v1/${name}`, `staging/records/${name}`);

const sources = [
  ["SOURCE_LEDGER_V10.json", "sources/SOURCE_LEDGER.json"],
  ["SOURCE_LEDGER_V10.json", "SOURCE_LEDGER.json"],
  ["S29_SOURCE_SCOPE_EVIDENCE.json", "sources/S29_SOURCE_SCOPE_EVIDENCE.json"],
];
const reconciliation = [
  ["V1_5_RECONCILIATION_PREVIEW.json", "reconciliation/V1_5_RECONCILIATION_PREVIEW.json"],
  ["POST_V1_RECONCILIATION_CANDIDATES.json", "reconciliation/POST_V1_RECONCILIATION_CANDIDATES.json"],
  ["POST_V1_SEMANTIC_DUPLICATE_AUDIT_V10.json", "reconciliation/POST_V1_SEMANTIC_DUPLICATE_AUDIT_V10.json"],
];
const indexes = [["POST_V1_EDITORIAL_INDEX_V10.json", "indexes/POST_V1_EDITORIAL_INDEX_V10.json"]];
const graph = [["POST_V1_STAGING_KNOWLEDGE_GRAPH_V10.json", "knowledge-graph/POST_V1_STAGING_KNOWLEDGE_GRAPH_V10.json"], ["RELATIONAL_DIALOGUE_EVIDENCE_V10.json", "knowledge-graph/RELATIONAL_DIALOGUE_EVIDENCE_V10.json"]];
const evidence = [
  ["PRE_RUN_PHYSICAL_INVENTORY.json", "evidence/PRE_RUN_PHYSICAL_INVENTORY.json"],
  ["POST_RUN_PHYSICAL_INVENTORY.json", "evidence/POST_RUN_PHYSICAL_INVENTORY.json"],
  ["RAMAVERSE_STAGING_MASTER_LEDGER_V10.json", "evidence/RAMAVERSE_STAGING_MASTER_LEDGER.json"],
  ["RAMAVERSE_STAGING_MASTER_LEDGER_V10.json", "RAMAVERSE_STAGING_MASTER_LEDGER.json"],
  ["EXACT_PHYSICAL_CONTINUATION_V10.json", "evidence/EXACT_PHYSICAL_CONTINUATION_V10.json"],
  ["EXACT_NEXT_ACQUISITION_POINT.json", "EXACT_NEXT_ACQUISITION_POINT.json"],
  ["POST_V1_CONTENT_INVENTORY_V10.json", "evidence/POST_V1_CONTENT_INVENTORY_V10.json"],
  ["POST_V1_STAGING_PHYSICAL_AUDIT_V10.json", "evidence/POST_V1_STAGING_PHYSICAL_AUDIT_V10.json"],
  ["POST_V1_STAGING_VALIDATION_V10.json", "evidence/POST_V1_STAGING_VALIDATION_V10.json"],
  ["RAMAVERSE_PROJECT_STATE.json", "evidence/RAMAVERSE_PROJECT_STATE.json"],
];
for (const [from, to] of [...sources, ...reconciliation, ...indexes, ...graph, ...evidence]) copy(from, to);
copy("TAMIL_EDITORIAL_REVIEW_QUEUE.json", "tamil-review/TAMIL_EDITORIAL_REVIEW_QUEUE.json");

const continuation = `# RamaVerse Corpus Continuation — Post-V1 vNEXT\n\n**Authoritative baseline:** 550 canonical records, unchanged. **Physical staging:** 139 source-backed records. **Staging published:** 0.\n\nThe completed physical sequence ends at **Valmiki Ramayana, Ayodhya Kanda, Sarga 29, verse 2.29.24**. The exact next acquisition point is **Ayodhya Kanda, Sarga 30, verse 2.30.1**.\n\nSarga 29 is retained strictly in quarantined staging. Its historical marital-duty wording is labeled **HISTORICAL_LITERARY_CONTEXT** and its dramatic self-endangering expression is labeled **NARRATIVE_DRAMATIC_EXPRESSION; NOT_INSTRUCTIONAL**. No record is public, canonical, searchable, askable, or exported to the frozen mobile pack.\n\n## Sources\n\n1. [SanskritDocuments: Ayodhya Kanda Sarga 29](https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga29/ayodhyaroman29.htm)\n2. [Stotra Nidhi: Ayodhya Kanda Sarga 29](https://stotranidhi.com/en/ayodhya-kanda-sarga-29-in-english/)\n3. [Vedapath: Valmiki Ramayana 2.29.7](https://vedapath.app/sa/ramayana/ayodhya-kanda/29/7)\n`;
const handoff = `# RamaVerse Corpus Authority Handoff — Post-V1 vNEXT\n\n| Control | Verified state |\n|---|---|\n| Historical canonical baseline | 550, unchanged |\n| Physical staging | 139 records |\n| Staging published | 0 |\n| Public Search / Ask staging exposure | 0 / 0 |\n| Completed source boundary | Ayodhya Kanda 2.29.24 |\n| Exact next source | Ayodhya Kanda 2.30.1 |\n\nThe archive contains source-backed physical staging, a V1.5 editorial-only reconciliation preview, per-record Tamil review states, and an editorial-only knowledge graph. It is not a production publication artifact. Formal reconciliation remains required before any canonical merge.\n`;
fs.writeFileSync(path.join(root, "CONTINUATION.md"), continuation);
fs.writeFileSync(path.join(root, "HANDOFF.md"), handoff);
copy("CONTINUATION.md", "docs/CONTINUATION.md");
copy("HANDOFF.md", "docs/HANDOFF.md");

const ledger = read("RAMAVERSE_STAGING_MASTER_LEDGER_V10.json");
const validation = read("POST_V1_STAGING_VALIDATION_V10.json");
const postRun = read("POST_RUN_PHYSICAL_INVENTORY.json");
const allRecords = [read("data/staging/physical/STAGING_RECORDS.json"), ...payloadNames.map((name) => read(`data/staging/post_v1/${name}`).records ?? [])].flat();
const ids = allRecords.map((record) => record.candidate_id);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
const contentValidation = {
  validationId: "ramaverse-post-v1-vnext-content-validation",
  generatedAt: new Date().toISOString(),
  physicalStagingCount: allRecords.length,
  ledgerStagingCount: ledger.physicallyAvailableUniqueRecords,
  physicalLedgerMatch: allRecords.length === ledger.physicallyAvailableUniqueRecords,
  duplicateStableIds: duplicateIds,
  sourceReferencesResolved: validation.missingSourceIds.length === 0,
  requiredFieldsComplete: validation.missingFields.length === 0,
  stagingPublished: ledger.stagingPublished,
  publicSearchStaging: ledger.publicSurfacePolicy.stagingExposure,
  publicAskStaging: ledger.publicSurfacePolicy.stagingExposure,
  postRunInventoryValid: postRun.valid,
  stagingValidationValid: validation.valid,
  valid: allRecords.length === ledger.physicallyAvailableUniqueRecords && duplicateIds.length === 0 && validation.valid && postRun.valid && ledger.stagingPublished === 0 && ledger.publicSurfacePolicy.stagingExposure === 0
};
fs.writeFileSync(path.join(root, "POST_V1_ARCHIVE_VNEXT_CONTENT_VALIDATION.json"), JSON.stringify(contentValidation, null, 2) + "\n");
copy("POST_V1_ARCHIVE_VNEXT_CONTENT_VALIDATION.json", "evidence/POST_V1_ARCHIVE_VNEXT_CONTENT_VALIDATION.json");

const entries = fs.readdirSync(archiveRoot, { recursive: true }).filter((entry) => !fs.statSync(path.join(archiveRoot, entry)).isDirectory()).sort();
fs.writeFileSync(path.join(archiveRoot, "SHA256SUMS.txt"), entries.map((entry) => `${sha256File(path.join(archiveRoot, entry))}  ${entry}`).join("\n") + "\n");
fs.rmSync(output, { force: true });
execFileSync("zip", ["-qr", output, "."], { cwd: archiveRoot });
const zipEntries = execFileSync("unzip", ["-Z1", output], { encoding: "utf8" }).split("\n").filter(Boolean).sort();
const requiredEntries = ["staging/records/AYODHYA_S29_SOURCE_BACKED_RECORDS.json", "sources/SOURCE_LEDGER.json", "reconciliation/V1_5_RECONCILIATION_PREVIEW.json", "tamil-review/TAMIL_EDITORIAL_REVIEW_QUEUE.json", "indexes/POST_V1_EDITORIAL_INDEX_V10.json", "knowledge-graph/POST_V1_STAGING_KNOWLEDGE_GRAPH_V10.json", "evidence/PRE_RUN_PHYSICAL_INVENTORY.json", "evidence/POST_RUN_PHYSICAL_INVENTORY.json", "RAMAVERSE_STAGING_MASTER_LEDGER.json", "EXACT_NEXT_ACQUISITION_POINT.json", "docs/CONTINUATION.md", "docs/HANDOFF.md", "SHA256SUMS.txt"];
const zipValidation = {
  validationId: "ramaverse-post-v1-vnext-zip-validation",
  generatedAt: new Date().toISOString(),
  archive: output,
  archiveSha256: sha256File(output),
  entryCount: zipEntries.length,
  requiredEntries,
  missingRequiredEntries: requiredEntries.filter((entry) => !zipEntries.includes(entry)),
  contentValidation: contentValidation.valid,
  reopened: true,
  valid: contentValidation.valid && requiredEntries.every((entry) => zipEntries.includes(entry))
};
fs.writeFileSync(path.join(root, "POST_V1_ARCHIVE_VNEXT_VALIDATION.json"), JSON.stringify(zipValidation, null, 2) + "\n");
console.log(JSON.stringify(zipValidation, null, 2));
if (!zipValidation.valid) process.exit(1);
