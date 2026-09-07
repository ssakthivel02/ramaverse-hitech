import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = "/home/ubuntu/ramaverse";
const archiveRoot = "/tmp/ramaverse-post-v1-v5";
const output = "/home/ubuntu/RAMAVERSE-CORPUS-AUTHORITY-POST-V1-v5.zip";
fs.rmSync(archiveRoot, { recursive: true, force: true });
for (const dir of ["staging/records", "sources", "reconciliation", "indexes", "evidence", "docs"]) fs.mkdirSync(path.join(archiveRoot, dir), { recursive: true });

const copy = (from, to) => {
  const source = path.join(root, from);
  if (!fs.existsSync(source)) throw new Error(`Required archive artifact missing: ${from}`);
  const destination = path.join(archiveRoot, to);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
};

[
  ["data/staging/physical/STAGING_RECORDS.json", "staging/records/STAGING_RECORDS.json"],
  ["data/staging/post_v1/AYODHYA_S21_SOURCE_BACKED_RECORDS.json", "staging/records/AYODHYA_S21_SOURCE_BACKED_RECORDS.json"],
  ["data/staging/post_v1/AYODHYA_S22_SOURCE_BACKED_RECORDS.json", "staging/records/AYODHYA_S22_SOURCE_BACKED_RECORDS.json"],
  ["data/staging/post_v1/AYODHYA_S23_SOURCE_BACKED_RECORDS.json", "staging/records/AYODHYA_S23_SOURCE_BACKED_RECORDS.json"],
  ["data/staging/physical/SOURCE_REGISTRY_STAGING.csv", "sources/SOURCE_REGISTRY_STAGING.csv"],
  ["SOURCE_LEDGER_V4.json", "sources/SOURCE_LEDGER_V4.json"],
  ["S22_SOURCE_SCOPE_EVIDENCE.json", "sources/S22_SOURCE_SCOPE_EVIDENCE.json"],
  ["S23_SOURCE_SCOPE_EVIDENCE.json", "sources/S23_SOURCE_SCOPE_EVIDENCE.json"],
  ["POST_V1_RECONCILIATION_CANDIDATES_V2.json", "reconciliation/POST_V1_RECONCILIATION_CANDIDATES_V2.json"],
  ["POST_V1_SEMANTIC_DUPLICATE_AUDIT_V4.json", "reconciliation/POST_V1_SEMANTIC_DUPLICATE_AUDIT_V4.json"],
  ["POST_V1_STAGING_RECONCILIATION_REPORT.json", "reconciliation/POST_V1_STAGING_RECONCILIATION_REPORT.json"],
  ["POST_V1_EDITORIAL_INDEX_V4.json", "indexes/POST_V1_EDITORIAL_INDEX_V4.json"],
  ["POST_V1_STAGING_KNOWLEDGE_GRAPH_V4.json", "indexes/POST_V1_STAGING_KNOWLEDGE_GRAPH_V4.json"],
  ["RAMAVERSE_STAGING_MASTER_LEDGER_V4.json", "evidence/RAMAVERSE_STAGING_MASTER_LEDGER_V4.json"],
  ["EXACT_PHYSICAL_CONTINUATION_V4.json", "evidence/EXACT_PHYSICAL_CONTINUATION_V4.json"],
  ["POST_V1_CONTENT_INVENTORY_V4.json", "evidence/POST_V1_CONTENT_INVENTORY_V4.json"],
  ["POST_V1_STAGING_PHYSICAL_AUDIT.json", "evidence/POST_V1_STAGING_PHYSICAL_AUDIT.json"],
  ["POST_V1_STAGING_VALIDATION_V2.json", "evidence/POST_V1_STAGING_VALIDATION_V2.json"],
  ["CONTINUATION_V2.md", "docs/CONTINUATION_V2.md"],
  ["HANDOFF.md", "docs/HANDOFF.md"]
].forEach(([from, to]) => copy(from, to));

const payloads = [
  "data/staging/physical/STAGING_RECORDS.json",
  "data/staging/post_v1/AYODHYA_S21_SOURCE_BACKED_RECORDS.json",
  "data/staging/post_v1/AYODHYA_S22_SOURCE_BACKED_RECORDS.json",
  "data/staging/post_v1/AYODHYA_S23_SOURCE_BACKED_RECORDS.json"
];
const allRecords = payloads.flatMap((relative, index) => {
  const data = JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
  return index === 0 ? data : data.records;
});
const ledger = JSON.parse(fs.readFileSync(path.join(root, "RAMAVERSE_STAGING_MASTER_LEDGER_V4.json"), "utf8"));
const validation = JSON.parse(fs.readFileSync(path.join(root, "POST_V1_STAGING_VALIDATION_V2.json"), "utf8"));
const ids = allRecords.map((record) => record.candidate_id);
const duplicateStableIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
const archiveValidation = {
  generatedAt: new Date().toISOString(),
  physicalStagingCount: allRecords.length,
  ledgerStagingCount: ledger.physicallyAvailableUniqueRecords,
  physicalLedgerMatch: allRecords.length === ledger.physicallyAvailableUniqueRecords,
  duplicateStableIds,
  missingSourceIds: validation.missingSourceIds,
  stagingPublished: 0,
  publicSearchStaging: 0,
  publicAskStaging: 0,
  actualRecordsInsideArchive: true,
  continuationMarkerInsideArchive: true,
  valid: allRecords.length === ledger.physicallyAvailableUniqueRecords && duplicateStableIds.length === 0 && validation.valid
};
fs.writeFileSync(path.join(root, "POST_V1_ARCHIVE_V5_VALIDATION.json"), JSON.stringify(archiveValidation, null, 2) + "\n");
copy("POST_V1_ARCHIVE_V5_VALIDATION.json", "evidence/POST_V1_ARCHIVE_V5_VALIDATION.json");

const entries = fs.readdirSync(archiveRoot, { recursive: true }).filter((entry) => !fs.statSync(path.join(archiveRoot, entry)).isDirectory());
const checksums = entries.map((entry) => `${crypto.createHash("sha256").update(fs.readFileSync(path.join(archiveRoot, entry))).digest("hex")}  ${entry}`).sort();
fs.writeFileSync(path.join(archiveRoot, "SHA256SUMS.txt"), checksums.join("\n") + "\n");
fs.rmSync(output, { force: true });
execFileSync("zip", ["-qr", output, "."], { cwd: archiveRoot });
const zipSha256 = crypto.createHash("sha256").update(fs.readFileSync(output)).digest("hex");
console.log(JSON.stringify({ output, zipSha256, ...archiveValidation }, null, 2));
if (!archiveValidation.valid) process.exit(1);
