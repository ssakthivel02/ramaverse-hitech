import fs from "node:fs";
import path from "node:path";
import { runCanonicalImportDryRun } from "../server/importDryRun";

const sharedRoot = "/home/ubuntu/projects/rama-rama-860b936e";
const ledger = JSON.parse(fs.readFileSync(path.join(sharedRoot, "STAGING_MASTER_LEDGER.json"), "utf8"));
const sourceIds = fs.readFileSync(path.join(sharedRoot, "SOURCE_REGISTRY_STAGING.csv"), "utf8").trim().split("\n").slice(1).map((line) => line.split(",")[0]).filter(Boolean);
const inputPath = "/tmp/ramaverse-verified-master-dry-run.json";

const dryRunInput = {
  dataset_id: ledger.ledger_id,
  dataset_status: "staging_only",
  historical_baseline: { total_records: ledger.historical_baseline.total_records },
  staging_defaults: { merge_state: "awaiting_v1_4_0_reconciliation", review_status: "needs_human_tamil_review" },
  sources: sourceIds.map((source_id) => ({ source_id, tradition_classification: "PRIMARY_TEXT" })),
  records: ledger.records,
};

fs.writeFileSync(inputPath, JSON.stringify(dryRunInput), "utf8");
const report = runCanonicalImportDryRun(inputPath, { expectedObservedRecords: 61 });
fs.unlinkSync(inputPath);
console.log(JSON.stringify(report, null, 2));
