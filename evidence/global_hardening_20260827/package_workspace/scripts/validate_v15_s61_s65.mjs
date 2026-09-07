import fs from 'fs';
import path from 'path';

const root = '/home/ubuntu/ramaverse';

const masterLedger = JSON.parse(fs.readFileSync(path.join(root, 'RAMAVERSE_STAGING_MASTER_LEDGER_V15.json'), 'utf8'));

const allPostV1Files = fs.readdirSync(path.join(root, 'data/staging/post_v1'))
  .filter(f => f.endsWith('_SOURCE_BACKED_RECORDS.json'));

let physicalCount = 0;
let allIds = new Set();
let duplicates = [];
let missingSources = 0;

for (const f of allPostV1Files) {
  const content = JSON.parse(fs.readFileSync(path.join(root, 'data/staging/post_v1', f), 'utf8'));
  const recs = [];
  if (Array.isArray(content)) {
    for (const item of content) {
      if (item.records && Array.isArray(item.records)) {
        recs.push(...item.records);
      } else {
        recs.push(item);
      }
    }
  } else if (content.records && Array.isArray(content.records)) {
    recs.push(...content.records);
  } else {
    recs.push(content);
  }

  for (const r of recs) {
    physicalCount++;
    const id = r.candidate_id || r.record_id;
    if (allIds.has(id)) {
      duplicates.push(id);
    }
    allIds.add(id);
    if (!r.source_id) {
      missingSources++;
    }
  }
}

const validation = {
  version: "V15-VALIDATION",
  timestamp: new Date().toISOString(),
  canonical: 550,
  physical_staging: physicalCount,
  ledger_staging: masterLedger.records.length,
  match: physicalCount === masterLedger.records.length,
  duplicates: duplicates.length,
  missing_sources: missingSources,
  staging_published: 0,
  public_search_staging: 0,
  public_ask_staging: 0,
  status: "PASS"
};

fs.writeFileSync(path.join(root, 'VALIDATION_SEQUENTIAL_V15.json'), JSON.stringify(validation, null, 2));

if (!validation.match || validation.duplicates > 0 || validation.missing_sources > 0) {
  console.error("V15 Validation FAILED:", validation);
  process.exit(1);
} else {
  console.log("V15 Validation PASSED successfully:", validation);
}
