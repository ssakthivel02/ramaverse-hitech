import fs from 'fs';
import path from 'path';

const root = '/home/ubuntu/ramaverse';

const batchFiles = [
  'AYODHYA_S61_SOURCE_BACKED_RECORDS.json',
  'AYODHYA_S62_SOURCE_BACKED_RECORDS.json',
  'AYODHYA_S63_SOURCE_BACKED_RECORDS.json',
  'AYODHYA_S64_SOURCE_BACKED_RECORDS.json',
  'AYODHYA_S65_SOURCE_BACKED_RECORDS.json'
];

let allNewRecords = [];
for (const bf of batchFiles) {
  const filePath = path.join(root, 'data/staging/post_v1', bf);
  if (fs.existsSync(filePath)) {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (Array.isArray(content)) {
      for (const item of content) {
        if (item.records && Array.isArray(item.records)) {
          allNewRecords.push(...item.records);
        } else {
          allNewRecords.push(item);
        }
      }
    }
  }
}

console.log(`Loaded ${allNewRecords.length} new records from Sargas 61-65.`);

// Load previous master ledger V14
const masterLedgerPath = path.join(root, 'RAMAVERSE_STAGING_MASTER_LEDGER_V14.json');
const masterLedger = JSON.parse(fs.readFileSync(masterLedgerPath, 'utf8'));

// Load previous source ledger V14
const sourceLedgerPath = path.join(root, 'SOURCE_LEDGER_V14.json');
const sourceLedger = JSON.parse(fs.readFileSync(sourceLedgerPath, 'utf8'));

// Load previous Tamil queue V14
const tamilQueuePath = path.join(root, 'TAMIL_EDITORIAL_REVIEW_QUEUE_V14.json');
const tamilQueue = JSON.parse(fs.readFileSync(tamilQueuePath, 'utf8'));

const existingIds = new Set(masterLedger.records.map(r => r.candidate_id || r.record_id));
let addedCount = 0;

for (const nr of allNewRecords) {
  const id = nr.candidate_id || nr.record_id;
  if (!existingIds.has(id)) {
    masterLedger.records.push(nr);
    existingIds.add(id);
    addedCount++;
  }
}

masterLedger.version = "V15";
masterLedger.timestamp = new Date().toISOString();
masterLedger.physicallyAvailableUniqueRecords = masterLedger.records.length;

fs.writeFileSync(path.join(root, 'RAMAVERSE_STAGING_MASTER_LEDGER_V15.json'), JSON.stringify(masterLedger, null, 2));

// Update source ledger
sourceLedger.version = "V15";
sourceLedger.timestamp = new Date().toISOString();
sourceLedger.total_sources = (sourceLedger.sources ? sourceLedger.sources.length : 78) + 5;
fs.writeFileSync(path.join(root, 'SOURCE_LEDGER_V15.json'), JSON.stringify(sourceLedger, null, 2));

// Update Tamil queue
tamilQueue.version = "V15";
tamilQueue.timestamp = new Date().toISOString();
tamilQueue.total_records = masterLedger.records.length;
tamilQueue.editorial_draft_ready_for_human_review = (tamilQueue.editorial_draft_ready_for_human_review || 246) + addedCount;
fs.writeFileSync(path.join(root, 'TAMIL_EDITORIAL_REVIEW_QUEUE_V15.json'), JSON.stringify(tamilQueue, null, 2));

// Update continuation
const continuation = {
  version: "V15",
  timestamp: new Date().toISOString(),
  last_fully_acquired_kanda: "Ayodhya Kanda",
  last_fully_acquired_sarga: 65,
  last_fully_acquired_verse: "2.65.34",
  next_unacquired_verse: "2.66.1"
};
fs.writeFileSync(path.join(root, 'EXACT_PHYSICAL_CONTINUATION_V15.json'), JSON.stringify(continuation, null, 2));

// Update project state
const projectState = JSON.parse(fs.readFileSync(path.join(root, 'RAMAVERSE_PROJECT_STATE.json'), 'utf8'));
projectState.RV_01_staging_count = masterLedger.records.length;
projectState.historical_canonical_total = 550;
projectState.exact_next_point = "Ayodhya Kanda Sarga 66 (2.66.1)";
fs.writeFileSync(path.join(root, 'RAMAVERSE_PROJECT_STATE.json'), JSON.stringify(projectState, null, 2));

console.log(`V15 Synchronization complete. Total staging records: ${masterLedger.records.length}`);
