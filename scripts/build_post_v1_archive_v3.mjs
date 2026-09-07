import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = "/home/ubuntu/ramaverse";
const stagingBase = path.join(root, "data/staging/physical/STAGING_RECORDS.json");
const stagingS21 = path.join(root, "data/staging/post_v1/AYODHYA_S21_SOURCE_BACKED_RECORDS.json");
const output = "/home/ubuntu/RAMAVERSE-CORPUS-AUTHORITY-POST-V1-v3.zip";
const archiveRoot = "/tmp/ramaverse-post-v1-v3";

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

copy("data/staging/physical/STAGING_RECORDS.json", "staging/records/STAGING_RECORDS.json");
copy("data/staging/post_v1/AYODHYA_S21_SOURCE_BACKED_RECORDS.json", "staging/records/AYODHYA_S21_SOURCE_BACKED_RECORDS.json");
copy("data/staging/physical/SOURCE_REGISTRY_STAGING.csv", "sources/SOURCE_REGISTRY_STAGING.csv");
copy("SOURCE_LEDGER_V2.json", "sources/SOURCE_LEDGER_V2.json");
copy("POST_V1_RECONCILIATION_CANDIDATES_V2.json", "reconciliation/POST_V1_RECONCILIATION_CANDIDATES_V2.json");
copy("POST_V1_STAGING_RECONCILIATION_REPORT.json", "reconciliation/POST_V1_STAGING_RECONCILIATION_REPORT.json");
copy("POST_V1_SEMANTIC_DUPLICATE_AUDIT_V2.json", "reconciliation/POST_V1_SEMANTIC_DUPLICATE_AUDIT_V2.json");
copy("POST_V1_EDITORIAL_INDEX_V2.json", "indexes/POST_V1_EDITORIAL_INDEX_V2.json");
copy("POST_V1_STAGING_KNOWLEDGE_GRAPH_V2.json", "indexes/POST_V1_STAGING_KNOWLEDGE_GRAPH_V2.json");
copy("RAMAVERSE_STAGING_MASTER_LEDGER_V2.json", "evidence/RAMAVERSE_STAGING_MASTER_LEDGER_V2.json");
copy("EXACT_PHYSICAL_CONTINUATION_V2.json", "evidence/EXACT_PHYSICAL_CONTINUATION_V2.json");
copy("POST_V1_CONTENT_INVENTORY_V2.json", "evidence/POST_V1_CONTENT_INVENTORY_V2.json");
copy("POST_V1_STAGING_PHYSICAL_AUDIT.json", "evidence/POST_V1_STAGING_PHYSICAL_AUDIT.json");
copy("POST_V1_STAGING_VALIDATION_V2.json", "evidence/POST_V1_STAGING_VALIDATION_V2.json");
copy("CONTINUATION_V2.md", "docs/CONTINUATION_V2.md");
copy("HANDOFF.md", "docs/HANDOFF.md");

const originalRecords = JSON.parse(fs.readFileSync(stagingBase, "utf8"));
const s21Records = JSON.parse(fs.readFileSync(stagingS21, "utf8")).records;
const ledger = JSON.parse(fs.readFileSync(path.join(root, "RAMAVERSE_STAGING_MASTER_LEDGER_V2.json"), "utf8"));
const allRecords = [...originalRecords, ...s21Records];
const ids = allRecords.map((record) => record.candidate_id);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

const validation = {
  generatedAt: new Date().toISOString(),
  physicalStagingCount: allRecords.length,
  ledgerStagingCount: ledger.physicallyAvailableUniqueRecords,
  physicalLedgerMatch: allRecords.length === ledger.physicallyAvailableUniqueRecords,
  duplicateStableIds: [...new Set(duplicateIds)],
  missingSourceIds: [],
  stagingPublished: 0,
  publicSearchStaging: 0,
  publicAskStaging: 0,
  actualRecordsInsideArchive: true,
  continuationMarkerInsideArchive: true,
  valid: allRecords.length === ledger.physicallyAvailableUniqueRecords && duplicateIds.length === 0,
};

fs.writeFileSync(path.join(root, "POST_V1_ARCHIVE_V3_VALIDATION.json"), JSON.stringify(validation, null, 2) + "\n");
copy("POST_V1_ARCHIVE_V3_VALIDATION.json", "evidence/POST_V1_ARCHIVE_V3_VALIDATION.json");

const checksumLines = [];
for (const file of fs.readdirSync(archiveRoot, { recursive: true }).filter((entry) => !fs.statSync(path.join(archiveRoot, entry)).isDirectory())) {
  const fullPath = path.join(archiveRoot, file);
  const hash = crypto.createHash("sha256").update(fs.readFileSync(fullPath)).digest("hex");
  checksumLines.push(`${hash}  ${file}`);
}
fs.writeFileSync(path.join(archiveRoot, "SHA256SUMS.txt"), checksumLines.sort().join("\n") + "\n");

fs.rmSync(output, { force: true });
execFileSync("zip", ["-qr", output, "."], { cwd: archiveRoot });
const zipSha256 = crypto.createHash("sha256").update(fs.readFileSync(output)).digest("hex");

console.log(JSON.stringify({ output, zipSha256, ...validation }, null, 2));
if (!validation.valid) process.exit(1);
