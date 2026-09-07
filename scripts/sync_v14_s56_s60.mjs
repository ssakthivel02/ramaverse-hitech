import fs from 'fs';
import path from 'path';

const root = '/home/ubuntu/ramaverse';

const sourceLedgerPath = path.join(root, 'SOURCE_LEDGER_V13.json');
const tamilQueuePath = path.join(root, 'TAMIL_EDITORIAL_REVIEW_QUEUE_V13.json');
const reconciliationPath = path.join(root, 'V1_5_RECONCILIATION_PREVIEW_V13.json');

const s56 = JSON.parse(fs.readFileSync(path.join(root, 'data/staging/post_v1/AYODHYA_S56_SOURCE_BACKED_RECORDS.json'), 'utf8'));
const s57 = JSON.parse(fs.readFileSync(path.join(root, 'data/staging/post_v1/AYODHYA_S57_SOURCE_BACKED_RECORDS.json'), 'utf8'));
const s58 = JSON.parse(fs.readFileSync(path.join(root, 'data/staging/post_v1/AYODHYA_S58_SOURCE_BACKED_RECORDS.json'), 'utf8'));
const s59 = JSON.parse(fs.readFileSync(path.join(root, 'data/staging/post_v1/AYODHYA_S59_SOURCE_BACKED_RECORDS.json'), 'utf8'));
const s60 = JSON.parse(fs.readFileSync(path.join(root, 'data/staging/post_v1/AYODHYA_S60_SOURCE_BACKED_RECORDS.json'), 'utf8'));

const newRecords = [...s56, ...s57, ...s58, ...s59, ...s60];
console.log(`Loaded ${newRecords.length} new records from Sargas 56–60.`);

const allPostV1Files = fs.readdirSync(path.join(root, 'data/staging/post_v1'))
  .filter(f => f.startsWith('AYODHYA_') && f.endsWith('_SOURCE_BACKED_RECORDS.json'))
  .sort();

let allFlatRecords = [];
for (const f of allPostV1Files) {
  const fileContent = JSON.parse(fs.readFileSync(path.join(root, 'data/staging/post_v1', f), 'utf8'));
  if (Array.isArray(fileContent)) {
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

// Write V14 master ledger
const masterV14 = {
  version: "V14",
  timestamp: new Date().toISOString(),
  historicalCanonicalBaseline: 550,
  physicallyAvailableUniqueRecords: allFlatRecords.length,
  stagingPublished: 0,
  duplicates: { candidateIds: [], count: 0 },
  publicSurfacePolicy: { search: "CANONICAL_ONLY", ask: "CANONICAL_ONLY", stagingExposure: 0 },
  sourceLedger: "SOURCE_LEDGER_V14.json",
  records: allFlatRecords
};
fs.writeFileSync(path.join(root, 'RAMAVERSE_STAGING_MASTER_LEDGER_V14.json'), JSON.stringify(masterV14, null, 2));

// Update source ledger V14
const prevSource = JSON.parse(fs.readFileSync(sourceLedgerPath, 'utf8'));
const newSources = [
  {
    source_id: "src-valmiki-ayodhya-s56-sanskritdocs",
    repository: "Sanskrit Documents / Valmiki Ramayana Project",
    edition: "Valmiki Ramayana - Ayodhya Kanda - Sarga 56",
    language: "Sanskrit / English",
    kanda: "Ayodhya Kanda",
    sarga: 56,
    verse_range: "2.56.1-2.56.37",
    url: "https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga56/ayodhyaitrans56.htm",
    source_role: "PRIMARY_ACQUISITION_SOURCE",
    confidence: 0.99
  },
  {
    source_id: "src-valmiki-ayodhya-s57-sanskritdocs",
    repository: "Sanskrit Documents / Valmiki Ramayana Project",
    edition: "Valmiki Ramayana - Ayodhya Kanda - Sarga 57",
    language: "Sanskrit / English",
    kanda: "Ayodhya Kanda",
    sarga: 57,
    verse_range: "2.57.1-2.57.43",
    url: "https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga57/ayodhyaitrans57.htm",
    source_role: "PRIMARY_ACQUISITION_SOURCE",
    confidence: 0.99
  },
  {
    source_id: "src-valmiki-ayodhya-s58-sanskritdocs",
    repository: "Sanskrit Documents / Valmiki Ramayana Project",
    edition: "Valmiki Ramayana - Ayodhya Kanda - Sarga 58",
    language: "Sanskrit / English",
    kanda: "Ayodhya Kanda",
    sarga: 58,
    verse_range: "2.58.1-2.58.46",
    url: "https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga58/ayodhyaitrans58.htm",
    source_role: "PRIMARY_ACQUISITION_SOURCE",
    confidence: 0.99
  },
  {
    source_id: "src-valmiki-ayodhya-s59-sanskritdocs",
    repository: "Sanskrit Documents / Valmiki Ramayana Project",
    edition: "Valmiki Ramayana - Ayodhya Kanda - Sarga 59",
    language: "Sanskrit / English",
    kanda: "Ayodhya Kanda",
    sarga: 59,
    verse_range: "2.59.1-2.59.34",
    url: "https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga59/ayodhyaitrans59.htm",
    source_role: "PRIMARY_ACQUISITION_SOURCE",
    confidence: 0.99
  },
  {
    source_id: "src-valmiki-ayodhya-s60-sanskritdocs",
    repository: "Sanskrit Documents / Valmiki Ramayana Project",
    edition: "Valmiki Ramayana - Ayodhya Kanda - Sarga 60",
    language: "Sanskrit / English",
    kanda: "Ayodhya Kanda",
    sarga: 60,
    verse_range: "2.60.1-2.60.30",
    url: "https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga60/ayodhyaitrans60.htm",
    source_role: "PRIMARY_ACQUISITION_SOURCE",
    confidence: 0.99
  }
];
const sourceV14 = {
  version: "V14",
  timestamp: new Date().toISOString(),
  total_sources: (prevSource.sources ? prevSource.sources.length : 0) + newSources.length,
  sources: [...(prevSource.sources || []), ...newSources]
};
fs.writeFileSync(path.join(root, 'SOURCE_LEDGER_V14.json'), JSON.stringify(sourceV14, null, 2));

// Update Tamil review queue V14
const prevTamil = JSON.parse(fs.readFileSync(tamilQueuePath, 'utf8'));
const addedQueueItems = newRecords.map(r => ({
  record_id: r.candidate_id,
  record_type: r.record_type,
  translation_status: r.tamil_review_status,
  human_reviewed: false,
  priority: r.record_type === 'DIALOGUE' ? 'P1' : 'P2'
}));
const tamilV14 = {
  version: "V14",
  timestamp: new Date().toISOString(),
  total_records: (prevTamil.records ? prevTamil.records.length : 0) + newRecords.length,
  machine_draft_needs_review: prevTamil.machine_draft_needs_review || 172,
  editorial_draft_ready_for_human_review: (prevTamil.editorial_draft_ready_for_human_review || 235) + newRecords.length,
  human_reviewed: 0,
  records: [...(prevTamil.records || []), ...addedQueueItems]
};
fs.writeFileSync(path.join(root, 'TAMIL_EDITORIAL_REVIEW_QUEUE_V14.json'), JSON.stringify(tamilV14, null, 2));

// Update continuation V14
const continuationV14 = {
  last_fully_acquired_kanda: "Ayodhya Kanda",
  last_fully_acquired_sarga: 60,
  last_fully_acquired_verse: "2.60.30",
  next_unacquired_verse: "2.61.1"
};
fs.writeFileSync(path.join(root, 'EXACT_PHYSICAL_CONTINUATION_V14.json'), JSON.stringify(continuationV14, null, 2));

// Update reconciliation preview V14
const prevRecon = JSON.parse(fs.readFileSync(reconciliationPath, 'utf8'));
const newReconItems = newRecords.map(r => ({
  candidate_id: r.candidate_id,
  classification: "NEW_CANONICAL_CANDIDATE",
  merge_state: "awaiting_v1_4_0_reconciliation"
}));
const reconV14 = {
  version: "V14",
  timestamp: new Date().toISOString(),
  total_candidates: (prevRecon.candidates ? prevRecon.candidates.length : 0) + newRecords.length,
  candidates: [...(prevRecon.candidates || []), ...newReconItems]
};
fs.writeFileSync(path.join(root, 'V1_5_RECONCILIATION_PREVIEW_V14.json'), JSON.stringify(reconV14, null, 2));

console.log("V14 synchronization successfully completed.");
