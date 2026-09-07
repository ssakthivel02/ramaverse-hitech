import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = "/home/ubuntu/ramaverse";
const archiveRoot = "/tmp/ramaverse-post-v1-v4";
const output = "/home/ubuntu/RAMAVERSE-CORPUS-AUTHORITY-POST-V1-v4.zip";

fs.rmSync(archiveRoot, { recursive: true, force: true });
for (const dir of ["staging/records", "sources", "reconciliation", "indexes", "evidence", "docs"]) {
  fs.mkdirSync(path.join(archiveRoot, dir), { recursive: true });
}

const copy = (relativeFromRoot, archiveRelative) => {
  const source = path.join(root, relativeFromRoot);
  if (!fs.existsSync(source)) throw new Error(`Required archive artifact missing: ${relativeFromRoot}`);
  const destination = path.join(archiveRoot, archiveRelative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
};

[
  ["data/staging/physical/STAGING_RECORDS.json", "staging/records/STAGING_RECORDS.json"],
  ["data/staging/post_v1/AYODHYA_S21_SOURCE_BACKED_RECORDS.json", "staging/records/AYODHYA_S21_SOURCE_BACKED_RECORDS.json"],
  ["data/staging/post_v1/AYODHYA_S22_SOURCE_BACKED_RECORDS.json", "staging/records/AYODHYA_S22_SOURCE_BACKED_RECORDS.json"],
  ["data/staging/physical/SOURCE_REGISTRY_STAGING.csv", "sources/SOURCE_REGISTRY_STAGING.csv"],
  ["SOURCE_LEDGER_V3.json", "sources/SOURCE_LEDGER_V3.json"],
  ["S22_SOURCE_SCOPE_EVIDENCE.json", "sources/S22_SOURCE_SCOPE_EVIDENCE.json"],
  ["POST_V1_RECONCILIATION_CANDIDATES_V2.json", "reconciliation/POST_V1_RECONCILIATION_CANDIDATES_V2.json"],
  ["POST_V1_SEMANTIC_DUPLICATE_AUDIT_V3.json", "reconciliation/POST_V1_SEMANTIC_DUPLICATE_AUDIT_V3.json"],
  ["POST_V1_STAGING_RECONCILIATION_REPORT.json", "reconciliation/POST_V1_STAGING_RECONCILIATION_REPORT.json"],
  ["POST_V1_EDITORIAL_INDEX_V3.json", "indexes/POST_V1_EDITORIAL_INDEX_V3.json"],
  ["POST_V1_STAGING_KNOWLEDGE_GRAPH_V3.json", "indexes/POST_V1_STAGING_KNOWLEDGE_GRAPH_V3.json"],
  ["RAMAVERSE_STAGING_MASTER_LEDGER_V3.json", "evidence/RAMAVERSE_STAGING_MASTER_LEDGER_V3.json"],
  ["EXACT_PHYSICAL_CONTINUATION_V3.json", "evidence/EXACT_PHYSICAL_CONTINUATION_V3.json"],
  ["POST_V1_CONTENT_INVENTORY_V3.json", "evidence/POST_V1_CONTENT_INVENTORY_V3.json"],
  ["POST_V1_STAGING_PHYSICAL_AUDIT.json", "evidence/POST_V1_STAGING_PHYSICAL_AUDIT.json"],
  ["POST_V1_STAGING_VALIDATION_V2.json", "evidence/POST_V1_STAGING_VALIDATION_V2.json"],
  ["CONTINUATION_V2.md", "docs/CONTINUATION_V2.md"],
  ["HANDOFF.md", "docs/HANDOFF.md"],
].forEach(([from, to]) => copy(from, to));

const baseRecords = JSON.parse(fs.readFileSync(path.join(root, "data/staging/physical/STAGING_RECORDS.json"), "utf8"));
const s21Records = JSON.parse(fs.readFileSync(path.join(root, "data/staging/post_v1/AYODHYA_S21_SOURCE_BACKED_RECORDS.json"), "utf8")).records;
const s22Records = JSON.parse(fs.readFileSync(path.join(root, "data/staging/post_v1/AYODHYA_S22_SOURCE_BACKED_RECORDS.json"), "utf8")).records;
const ledger = JSON.parse(fs.readFileSync(path.join(root, "RAMAVERSE_STAGING_MASTER_LEDGER_V3.json"), "utf8"));
const validation = JSON.parse(fs.readFileSync(path.join(root, "POST_V1_STAGING_VALIDATION_V2.json"), "utf8"));
const allRecords = [...baseRecords, ...s21Records, ...s22Records];
const ids = allRecords.map((record) => record.candidate_id);
const duplicateStableIds = ids.filter((id, index) => ids.indexOf(id) !== index);

const archiveValidation = {
  generatedAt: new Date().toISOString(),
  physicalStagingCount: allRecords.length,
  ledgerStagingCount: ledger.physicallyAvailableUniqueRecords,
  physicalLedgerMatch: allRecords.length === ledger.physicallyAvailableUniqueRecords,
  duplicateStableIds: [...new Set(duplicateStableIds)],
  missingSourceIds: validation.missingSourceIds,
  stagingPublished: 0,
  publicSearchStaging: 0,
  publicAskStaging: 0,
  actualRecordsInsideArchive: true,
  continuationMarkerInsideArchive: true,
  valid: allRecords.length === ledger.physicallyAvailableUniqueRecords && duplicateStableIds.length === 0 && validation.valid,
};

fs.writeFileSync(path.join(root, "POST_V1_ARCHIVE_V4_VALIDATION.json"), JSON.stringify(archiveValidation, null, 2) + "\n");
copy("POST_V1_ARCHIVE_V4_VALIDATION.json", "evidence/POST_V1_ARCHIVE_V4_VALIDATION.json");

const fileEntries = fs.readdirSync(archiveRoot, { recursive: true }).filter((entry) => !fs.statSync(path.join(archiveRoot, entry)).isDirectory());
const checksumLines = fileEntries.map((file) => {
  const hash = crypto.createHash("sha256").update(fs.readFileSync(path.join(archiveRoot, file))).digest("hex");
  return `${hash}  ${file}`;
}).sort();
fs.writeFileSync(path.join(archiveRoot, "SHA256SUMS.txt"), checksumLines.join("\n") + "\n");

fs.rmSync(output, { force: true });
execFileSync("zip", ["-qr", output, "."], { cwd: archiveRoot });
const zipSha256 = crypto.createHash("sha256").update(fs.readFileSync(output)).digest("hex");
console.log(JSON.stringify({ output, zipSha256, ...archiveValidation }, null, 2));
if (!archiveValidation.valid) process.exit(1);
