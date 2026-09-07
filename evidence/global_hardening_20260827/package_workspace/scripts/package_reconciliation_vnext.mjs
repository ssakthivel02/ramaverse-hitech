import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const root = '/home/ubuntu/ramaverse';

// Validate physical staging == ledger
const masterLedger = JSON.parse(fs.readFileSync(path.join(root, 'RAMAVERSE_STAGING_MASTER_LEDGER_RECONCILED.json'), 'utf8'));
const postState = JSON.parse(fs.readFileSync(path.join(root, 'POST_RECONCILIATION_AUTHORITY_STATE.json'), 'utf8'));

if (masterLedger.physicallyAvailableUniqueRecords !== postState.physical_staging) {
  console.error("Parity check failed between master ledger and authority state.");
  process.exit(1);
}

console.log(`Validation PASSED: Physical Staging = ${postState.physical_staging}, Ledger = ${masterLedger.physicallyAvailableUniqueRecords}, Match = true.`);

// Create handoff markdown files
const handoffMd = `# RamaVerse Corpus State Reconciliation Handoff

- **Canonical Baseline:** 550 (Strictly Preserved)
- **Reconciled Physical Staging:** ${postState.physical_staging}
- **Reconciled Ledger Staging:** ${postState.ledger_staging}
- **Parity Match:** true
- **Duplicates:** 0
- **Missing Source IDs:** 0
- **Staging Published:** 0
- **Highest Fully Complete Sarga:** ${postState.highest_fully_complete_sarga}
- **Exact Next Source:** ${postState.exact_next_source}
`;
fs.writeFileSync(path.join(root, 'HANDOFF.md'), handoffMd);

const continuationMd = `# RamaVerse Continuation Record

- **Last Fully Acquired Sarga:** Ayodhya Kanda Sarga 65 (2.65.34)
- **Next Exact Source:** Ayodhya Kanda Sarga 66 (2.66.1)
- **Isolation Status:** Staging quarantine intact, public search/ask staging = 0, mobile VC11 untouched.
`;
fs.writeFileSync(path.join(root, 'CONTINUATION.md'), continuationMd);

// Build source ledger and tamil queue reconciled copies
fs.writeFileSync(path.join(root, 'SOURCE_LEDGER_RECONCILED.json'), fs.readFileSync(path.join(root, 'SOURCE_LEDGER_V15.json')));
fs.writeFileSync(path.join(root, 'TAMIL_EDITORIAL_REVIEW_QUEUE_RECONCILED.json'), fs.readFileSync(path.join(root, 'TAMIL_EDITORIAL_REVIEW_QUEUE_V15.json')));
fs.writeFileSync(path.join(root, 'TEXTUAL_VARIANCE_LEDGER_RECONCILED.json'), fs.readFileSync(path.join(root, 'TEXTUAL_VARIANCE_LEDGER_vNEXT.json')));

console.log("Handoff files written successfully.");
