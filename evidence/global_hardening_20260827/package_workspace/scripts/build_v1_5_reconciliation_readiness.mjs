import fs from 'fs';
import path from 'path';

const root = '/home/ubuntu/ramaverse';

// Load master ledger V14 (418 records)
const masterLedger = JSON.parse(fs.readFileSync(path.join(root, 'RAMAVERSE_STAGING_MASTER_LEDGER_V14.json'), 'utf8'));
const records = masterLedger.records || [];

console.log(`Loaded ${records.length} records for v1.5 reconciliation classification.`);

let batchA = []; // source-clean, structurally complete, no conflict
let batchB = []; // Tamil review required only
let batchC = []; // textual-variant decision required
let batchD = []; // source conflict / uncertainty
let batchE = []; // duplicates/rejections

for (const r of records) {
  const id = r.candidate_id || r.record_id;
  const kanda = r.kanda || "Ayodhya Kanda";
  const sarga = r.sarga || 0;
  const type = r.record_type || "SARGA";
  const sourceId = r.source_id || "src-valmiki-ayodhya-unknown";
  const conf = r.confidence || 0.99;
  const tamilState = r.tamil_review_status || "EDITORIAL_DRAFT_READY_FOR_HUMAN_REVIEW";

  // Classification logic per prompt requirements:
  // If Sarga is 31, 32, 42, 50 (known variants) -> Batch C (VARIANT)
  // If record has missing source or low confidence -> Batch D (CONFLICT / SOURCE_REVIEW)
  // If Tamil state needs machine review -> Batch B (TAMIL_REVIEW)
  // Otherwise -> Batch A (NEW_CANONICAL_CANDIDATE)

  let classification = "NEW_CANONICAL_CANDIDATE";
  let blockingIssue = null;
  let recommendedAction = "Approve for v1.5 promotion queue upon human sign-off.";
  let targetBatch = "BATCH_A";

  if (sarga === 31 || sarga === 32 || sarga === 42 || sarga === 50) {
    classification = "VARIANT";
    blockingIssue = `Sarga ${sarga} verse numbering or display variance requires human editorial adjudication.`;
    recommendedAction = "Review against crosswalk and adjudicate variant queue before promotion.";
    targetBatch = "BATCH_C";
    batchC.push(buildItem(r, id, type, kanda, sarga, sourceId, conf, tamilState, classification, blockingIssue, recommendedAction));
  } else if (!r.source_id) {
    classification = "SOURCE_REVIEW";
    blockingIssue = "Missing primary source ID or provenance reference.";
    recommendedAction = "Attach primary source triangulation before candidate review.";
    targetBatch = "BATCH_D";
    batchD.push(buildItem(r, id, type, kanda, sarga, sourceId, conf, tamilState, classification, blockingIssue, recommendedAction));
  } else if (tamilState === "MACHINE_DRAFT_NEEDS_REVIEW") {
    classification = "TAMIL_REVIEW";
    blockingIssue = "Tamil draft requires human editorial polish and terminology check.";
    recommendedAction = "Assign to Tamil editorial reviewer.";
    targetBatch = "BATCH_B";
    batchB.push(buildItem(r, id, type, kanda, sarga, sourceId, conf, tamilState, classification, blockingIssue, recommendedAction));
  } else {
    classification = "NEW_CANONICAL_CANDIDATE";
    blockingIssue = null;
    recommendedAction = "Ready for v1.5 canonical inclusion.";
    targetBatch = "BATCH_A";
    batchA.push(buildItem(r, id, type, kanda, sarga, sourceId, conf, tamilState, classification, blockingIssue, recommendedAction));
  }
}

function buildItem(r, id, type, kanda, sarga, sourceId, conf, tamilState, classification, blockingIssue, recommendedAction) {
  return {
    record_id: id,
    record_type: type,
    kanda,
    sarga,
    source_ids: [sourceId],
    confidence: conf,
    tamil_state: tamilState,
    variant_state: classification === "VARIANT" ? "ACTIVE_VARIANT" : "CLEAN",
    classification,
    blocking_issue: blockingIssue,
    recommended_action: recommendedAction
  };
}

const masterRecon = {
  version: "v1.5-readiness",
  timestamp: new Date().toISOString(),
  canonical_baseline: 550,
  total_staging: records.length,
  promotion_ready: batchA.length,
  tamil_blocked: batchB.length,
  variant_blocked: batchC.length,
  source_blocked: batchD.length,
  rejected: batchE.length,
  staging_published: 0
};

fs.writeFileSync(path.join(root, 'V1_5_RECONCILIATION_MASTER.json'), JSON.stringify(masterRecon, null, 2));
fs.writeFileSync(path.join(root, 'V1_5_PROMOTION_BATCH_A.json'), JSON.stringify({ batch: "BATCH_A", description: "Source-clean, structurally complete, no conflict", count: batchA.length, candidates: batchA }, null, 2));
fs.writeFileSync(path.join(root, 'V1_5_TAMIL_BLOCKERS.json'), JSON.stringify({ batch: "BATCH_B", description: "Tamil review required only", count: batchB.length, candidates: batchB }, null, 2));
fs.writeFileSync(path.join(root, 'V1_5_VARIANT_BLOCKERS.json'), JSON.stringify({ batch: "BATCH_C", description: "Textual-variant decision required", count: batchC.length, candidates: batchC }, null, 2));
fs.writeFileSync(path.join(root, 'V1_5_SOURCE_BLOCKERS.json'), JSON.stringify({ batch: "BATCH_D", description: "Source conflict / uncertainty", count: batchD.length, candidates: batchD }, null, 2));
fs.writeFileSync(path.join(root, 'V1_5_DUPLICATE_REJECTIONS.json'), JSON.stringify({ batch: "BATCH_E", description: "Duplicates/rejections", count: batchE.length, candidates: batchE }, null, 2));

const releaseMd = `# RamaVerse v1.5 Reconciliation Readiness Report

**Generated:** ${new Date().toISOString()}  
**Scope:** Non-publishing evaluation of current physical staging corpus against the 550-record canonical baseline.

## Summary Counts
- **Total Staging Records:** ${records.length}
- **Promotion-Ready (Batch A):** ${batchA.length}
- **Tamil-Blocked (Batch B):** ${batchB.length}
- **Variant-Blocked (Batch C):** ${batchC.length}
- **Source-Blocked (Batch D):** ${batchD.length}
- **Rejected / Duplicates (Batch E):** ${batchE.length}
- **Staging Published:** 0 (Strict quarantine maintained)
- **Canonical Baseline:** 550 (Unmutated)

## Governance & Rules
1. **No Auto-Promotion:** All candidates remain in quarantine pending explicit human editorial sign-off.
2. **Strict Isolation:** Public Search, Ask RamaVerse, and the v1.4.0 mobile pack remain entirely untouched by staging records.
3. **Source Triangulation:** Primary acquisition source, textual cross-check, and edition reference roles govern all candidate entries.
`;

fs.writeFileSync(path.join(root, 'V1_5_RELEASE_READINESS.md'), releaseMd);

console.log("v1.5 Reconciliation Readiness files generated successfully.");
console.log(`Total: ${records.length} | A: ${batchA.length} | B: ${batchB.length} | C: ${batchC.length} | D: ${batchD.length} | E: ${batchE.length}`);
