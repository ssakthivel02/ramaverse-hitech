import fs from 'fs';
import path from 'path';

const root = '/home/ubuntu/ramaverse';

const master = JSON.parse(fs.readFileSync(path.join(root, 'V1_5_RECONCILIATION_MASTER.json'), 'utf8'));
const batchA = JSON.parse(fs.readFileSync(path.join(root, 'V1_5_PROMOTION_BATCH_A.json'), 'utf8'));
const batchC = JSON.parse(fs.readFileSync(path.join(root, 'V1_5_VARIANT_BLOCKERS.json'), 'utf8'));

console.log(`Master total staging: ${master.total_staging}`);
console.log(`Batch A promotion ready: ${batchA.count}`);
console.log(`Batch C variant blocked: ${batchC.count}`);

const sum = batchA.count + master.tamil_blocked + master.variant_blocked + master.source_blocked + master.rejected;

if (sum !== master.total_staging || master.staging_published !== 0 || master.canonical_baseline !== 550) {
  console.error("v1.5 Reconciliation Readiness Validation FAILED!");
  process.exit(1);
} else {
  console.log("v1.5 Reconciliation Readiness Validation PASSED successfully!");
}
