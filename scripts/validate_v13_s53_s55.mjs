import fs from 'fs';
import path from 'path';

const root = '/home/ubuntu/ramaverse';

const masterLedger = JSON.parse(fs.readFileSync(path.join(root, 'RAMAVERSE_STAGING_MASTER_LEDGER_V13.json'), 'utf8'));
const sourceLedger = JSON.parse(fs.readFileSync(path.join(root, 'SOURCE_LEDGER_V13.json'), 'utf8'));
const continuation = JSON.parse(fs.readFileSync(path.join(root, 'EXACT_PHYSICAL_CONTINUATION_V13.json'), 'utf8'));

// Count physical records from post_v1 JSON files properly flattened
const allPostV1Files = fs.readdirSync(path.join(root, 'data/staging/post_v1'))
  .filter(f => f.startsWith('AYODHYA_') && f.endsWith('_SOURCE_BACKED_RECORDS.json'));

let physicalCount = 0;
let allIds = new Set();
let duplicates = [];
let missingSources = 0;

for (const f of allPostV1Files) {
  const fileContent = JSON.parse(fs.readFileSync(path.join(root, 'data/staging/post_v1', f), 'utf8'));
  const recs = [];
  if (Array.isArray(fileContent)) {
    for (const item of fileContent) {
      if (item.records && Array.isArray(item.records)) {
        recs.push(...item.records);
      } else {
        recs.push(item);
      }
    }
  } else if (fileContent.records && Array.isArray(fileContent.records)) {
    recs.push(...fileContent.records);
  } else {
    recs.push(fileContent);
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

console.log(`Validation V13: Physical count = ${physicalCount}, Ledger count = ${masterLedger.physicallyAvailableUniqueRecords}`);
console.log(`Duplicates = ${duplicates.length}, Missing sources = ${missingSources}`);

const match = physicalCount === masterLedger.physicallyAvailableUniqueRecords && duplicates.length === 0 && missingSources === 0;

const report = {
  version: "V13",
  timestamp: new Date().toISOString(),
  physical_staging: physicalCount,
  ledger_staging: masterLedger.physicallyAvailableUniqueRecords,
  match,
  duplicates: duplicates.length,
  missing_sources: missingSources,
  staging_published: masterLedger.stagingPublished,
  canonical_baseline: masterLedger.historicalCanonicalBaseline,
  sources_total: sourceLedger.sources.length,
  continuation
};

fs.writeFileSync(path.join(root, 'VALIDATION_SEQUENTIAL_V13.json'), JSON.stringify(report, null, 2));

if (!match) {
  console.error("V13 Validation FAILED!");
  process.exit(1);
} else {
  console.log("V13 Validation PASSED successfully!");
}
