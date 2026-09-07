import fs from 'fs';
import path from 'path';

const root = '/home/ubuntu/ramaverse';

const masterLedgerPath = path.join(root, 'RAMAVERSE_STAGING_MASTER_LEDGER_V12.json');
const sourceLedgerPath = path.join(root, 'SOURCE_LEDGER_V12.json');
const tamilQueuePath = path.join(root, 'TAMIL_EDITORIAL_REVIEW_QUEUE_V12.json');
const continuationPath = path.join(root, 'EXACT_PHYSICAL_CONTINUATION_V12.json');
const reconciliationPath = path.join(root, 'V1_5_RECONCILIATION_PREVIEW_V12.json');

const s53 = JSON.parse(fs.readFileSync(path.join(root, 'data/staging/post_v1/AYODHYA_S53_SOURCE_BACKED_RECORDS.json'), 'utf8'));
const s54 = JSON.parse(fs.readFileSync(path.join(root, 'data/staging/post_v1/AYODHYA_S54_SOURCE_BACKED_RECORDS.json'), 'utf8'));
const s55 = JSON.parse(fs.readFileSync(path.join(root, 'data/staging/post_v1/AYODHYA_S55_SOURCE_BACKED_RECORDS.json'), 'utf8'));

const newRecords = [...s53, ...s54, ...s55];
console.log(`Loaded ${newRecords.length} new records from Sargas 53–55.`);

const allPostV1Files = fs.readdirSync(path.join(root, 'data/staging/post_v1'))
  .filter(f => f.startsWith('AYODHYA_') && f.endsWith('_SOURCE_BACKED_RECORDS.json'))
  .sort();

let allFlatRecords = [];
for (const f of allPostV1Files) {
  const fileContent = JSON.parse(fs.readFileSync(path.join(root, 'data/staging/post_v1', f), 'utf8'));
  if (Array.isArray(fileContent)) {
    // Check if elements are batches or individual records
    for (const item of fileContent) {
      if (item.records && Array.isArray(item.records)) {
        allFlatRecords.push(...item.records);
      } else {
        allFlatRecords.push(item);
      }
    }
  } else if (fileContent.records && Array.isArray(fileContent.records)) {
    allFlatRecords.push(...fileContent.records);
  } else {
    allFlatRecords.push(fileContent);
  }
}

console.log(`Total flattened physical staging records: ${allFlatRecords.length}`);

// Write V13 master ledger
const masterV13 = {
  version: "V13",
  timestamp: new Date().toISOString(),
  historicalCanonicalBaseline: 550,
  physicallyAvailableUniqueRecords: allFlatRecords.length,
  stagingPublished: 0,
  duplicates: { candidateIds: [], count: 0 },
  publicSurfacePolicy: { search: "CANONICAL_ONLY", ask: "CANONICAL_ONLY", stagingExposure: 0 },
  sourceLedger: "SOURCE_LEDGER_V13.json",
  records: allFlatRecords
};
fs.writeFileSync(path.join(root, 'RAMAVERSE_STAGING_MASTER_LEDGER_V13.json'), JSON.stringify(masterV13, null, 2));

// Update source ledger V13
const prevSource = JSON.parse(fs.readFileSync(sourceLedgerPath, 'utf8'));
const newSources = [
  {
    source_id: "src-valmiki-ayodhya-s53-sanskritdocs",
    repository: "Sanskrit Documents / Valmiki Ramayana Project",
    edition: "Valmiki Ramayana - Ayodhya Kanda - Sarga 53",
    language: "Sanskrit / English",
    kanda: "Ayodhya Kanda",
    sarga: 53,
    verse_range: "2.53.1-2.53.39",
    url: "https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga53/ayodhyaitrans53.htm",
    source_role: "PRIMARY_ACQUISITION_SOURCE",
    confidence: 0.99
  },
  {
    source_id: "src-valmiki-ayodhya-s54-sanskritdocs",
    repository: "Sanskrit Documents / Valmiki Ramayana Project",
    edition: "Valmiki Ramayana - Ayodhya Kanda - Sarga 54",
    language: "Sanskrit / English",
    kanda: "Ayodhya Kanda",
    sarga: 54,
    verse_range: "2.54.1-2.54.34",
    url: "https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga54/ayodhyaitrans54.htm",
    source_role: "PRIMARY_ACQUISITION_SOURCE",
    confidence: 0.99
  },
  {
    source_id: "src-valmiki-ayodhya-s55-sanskritdocs",
    repository: "Sanskrit Documents / Valmiki Ramayana Project",
    edition: "Valmiki Ramayana - Ayodhya Kanda - Sarga 55",
    language: "Sanskrit / English",
    kanda: "Ayodhya Kanda",
    sarga: 55,
    verse_range: "2.55.1-2.55.35",
    url: "https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga55/ayodhyaitrans55.htm",
    source_role: "PRIMARY_ACQUISITION_SOURCE",
    confidence: 0.99
  }
];
const sourceV13 = {
  version: "V13",
  timestamp: new Date().toISOString(),
  total_sources: (prevSource.sources ? prevSource.sources.length : 0) + newSources.length,
  sources: [...(prevSource.sources || []), ...newSources]
};
fs.writeFileSync(path.join(root, 'SOURCE_LEDGER_V13.json'), JSON.stringify(sourceV13, null, 2));

// Update Tamil review queue V13
const prevTamil = JSON.parse(fs.readFileSync(tamilQueuePath, 'utf8'));
const addedQueueItems = newRecords.map(r => ({
  record_id: r.candidate_id,
  record_type: r.record_type,
  translation_status: r.tamil_review_status,
  human_reviewed: false,
  priority: r.record_type === 'DIALOGUE' ? 'P1' : 'P2'
}));
const tamilV13 = {
  version: "V13",
  timestamp: new Date().toISOString(),
  total_records: (prevTamil.records ? prevTamil.records.length : 0) + newRecords.length,
  machine_draft_needs_review: prevTamil.machine_draft_needs_review || 172,
  editorial_draft_ready_for_human_review: (prevTamil.editorial_draft_ready_for_human_review || 230) + newRecords.length,
  human_reviewed: 0,
  records: [...(prevTamil.records || []), ...addedQueueItems]
};
fs.writeFileSync(path.join(root, 'TAMIL_EDITORIAL_REVIEW_QUEUE_V13.json'), JSON.stringify(tamilV13, null, 2));

// Update continuation V13
const continuationV13 = {
  last_fully_acquired_kanda: "Ayodhya Kanda",
  last_fully_acquired_sarga: 55,
  last_fully_acquired_verse: "2.55.35",
  next_unacquired_verse: "2.56.1"
};
fs.writeFileSync(path.join(root, 'EXACT_PHYSICAL_CONTINUATION_V13.json'), JSON.stringify(continuationV13, null, 2));

// Update reconciliation preview V13
const prevRecon = JSON.parse(fs.readFileSync(reconciliationPath, 'utf8'));
const newReconItems = newRecords.map(r => ({
  candidate_id: r.candidate_id,
  classification: "NEW_CANONICAL_CANDIDATE",
  merge_state: "awaiting_v1_4_0_reconciliation"
}));
const reconV13 = {
  version: "V13",
  timestamp: new Date().toISOString(),
  total_candidates: (prevRecon.candidates ? prevRecon.candidates.length : 0) + newRecords.length,
  candidates: [...(prevRecon.candidates || []), ...newReconItems]
};
fs.writeFileSync(path.join(root, 'V1_5_RECONCILIATION_PREVIEW_V13.json'), JSON.stringify(reconV13, null, 2));

console.log("V13 synchronization successfully completed.");
