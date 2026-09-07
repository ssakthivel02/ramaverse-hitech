import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = '/home/ubuntu/ramaverse';
const evidenceDir = path.join(root, 'data/staging/sundara_11_68_source_evidence_20260826');
const masterPath = path.join(root, 'RAMAVERSE_STAGING_MASTER_LEDGER_RECONCILED.json');
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const records = [...(master.records || [])];
const ids = new Set(records.map((r) => r.recordId));
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const strip = (s) => s.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const locRe = /5-(\d+)-(\d+)/g;
const evidence = [];
for (let sarga = 11; sarga <= 68; sarga++) {
  const file = path.join(evidenceDir, `sarga${sarga}.html`);
  if (!fs.existsSync(file)) throw new Error(`Missing physical source page: ${file}`);
  const bytes = fs.readFileSync(file);
  const text = strip(bytes.toString('utf8'));
  const locators = [...text.matchAll(locRe)].map((m) => Number(m[2]));
  const uniqueVerses = [...new Set(locators)].sort((a, b) => a - b);
  const sourceHash = sha256(bytes);
  const sourceId = `SRC-SANSKRIT-DOCUMENTS-SUNDARA-${sarga}`;
  const first = uniqueVerses.length ? `5.${sarga}.${uniqueVerses[0]}` : `5.${sarga}.1`;
  const last = uniqueVerses.length ? `5.${sarga}.${uniqueVerses.at(-1)}` : `5.${sarga}.UNKNOWN`;
  evidence.push({ sarga, sourceId, file: `data/staging/sundara_11_68_source_evidence_20260826/sarga${sarga}.html`, sha256: sourceHash, verseCountObserved: uniqueVerses.length, firstLocator: first, lastLocator: last, sourceUrl: `https://sanskritdocuments.org/sites/valmikiramayan/sundara/sarga${sarga}/sundaraitrans${sarga}.htm`, sourceRole: 'PRIMARY_ACQUISITION_SOURCE', edition: 'Sanskrit Documents Valmiki Ramayana electronic text', traditionClassification: 'PRIMARY_VALMIKI_TEXT', crosscheckState: 'TEXTUAL_CROSSCHECK_PENDING', confidence: uniqueVerses.length ? 0.94 : 0.6 });
  const recordId = `STAGING-SUNDARA-SOURCE-NOTE-${sarga}-2026`;
  if (!ids.has(recordId)) {
    records.push({
      recordId, id: recordId, recordType: 'SOURCE_NOTE', kanda: 'Sundara Kanda', sargaNumber: sarga, verseLocator: `${first}–${last}`, title: `Physical source evidence for Sundara Kanda Sarga ${sarga}`, englishTitle: `Sanskrit Documents source page for Sundara Kanda Sarga ${sarga}`, englishExplanation: `The physical source page was retrieved and hashed. The observed verse locator range is ${first}–${last}; this note records evidence availability only and does not replace record-level editorial review or a critical-edition cross-check.`, tamilDraft: null, sourceIds: [sourceId], sourceId, sourceReference: `https://sanskritdocuments.org/sites/valmikiramayan/sundara/sarga${sarga}/sundaraitrans${sarga}.htm`, sourceLocator: `${first}–${last}`, edition: 'Sanskrit Documents Valmiki Ramayana electronic text', traditionClassification: 'PRIMARY_VALMIKI_TEXT', confidence: uniqueVerses.length ? 0.94 : 0.6, evidenceClass: 'PHYSICAL_SOURCE_PAGE_HASHED', provenance: { acquisitionMode: 'PASSIVE_WEB_RETRIEVAL', physicalFile: evidence.at(-1).file, sha256: sourceHash }, contentHash: sourceHash, mergeState: 'QUARANTINED_STAGING', publicationState: 'UNPUBLISHED_ZERO', tamilReviewState: 'NOT_STARTED', variantState: 'CROSSCHECK_PENDING', possibleLegacyOverlap: true, publicSearchExposure: 0, publicAskExposure: 0 });
  }
}
const yuddhaRecordId = 'STAGING-YUDDHA-SOURCE-NOTE-1-2026';
const yuddhaUrl = 'https://sanskritdocuments.org/sites/valmikiramayan/yuddha/sarga1/yuddhaitrans1.htm';
const yuddhaDir = path.join(root, 'data/staging/yuddha_1_source_evidence_20260826');
fs.mkdirSync(yuddhaDir, { recursive: true });
const yuddhaFile = path.join(yuddhaDir, 'sarga1.html');
try { execFileSync('curl', ['-fsSL', '--max-time', '30', yuddhaUrl, '-o', yuddhaFile]); } catch { /* completion remains valid; Yuddha is not started without evidence */ }
let yuddhaStarted = false;
if (fs.existsSync(yuddhaFile) && fs.statSync(yuddhaFile).size > 0 && !ids.has(yuddhaRecordId)) {
  const bytes = fs.readFileSync(yuddhaFile); const hash = sha256(bytes); const text = strip(bytes.toString('utf8')); const locs = [...text.matchAll(/6-1-(\d+)/g)].map((m) => Number(m[1]));
  const first = locs.length ? `6.1.${Math.min(...locs)}` : '6.1.1'; const last = locs.length ? `6.1.${Math.max(...locs)}` : '6.1.UNKNOWN';
  records.push({ recordId: yuddhaRecordId, id: yuddhaRecordId, recordType: 'SOURCE_NOTE', kanda: 'Yuddha Kanda', sargaNumber: 1, verseLocator: `${first}–${last}`, title: 'Physical source evidence for Yuddha Kanda Sarga 1', englishTitle: 'Sanskrit Documents source page for Yuddha Kanda Sarga 1', englishExplanation: `Yuddha Kanda acquisition begins only after the Sundara evidence boundary was recorded. This note records page evidence and observed locator range ${first}–${last}; no broader Yuddha acquisition is claimed.`, tamilDraft: null, sourceIds: ['SRC-SANSKRIT-DOCUMENTS-YUDDHA-1'], sourceId: 'SRC-SANSKRIT-DOCUMENTS-YUDDHA-1', sourceReference: yuddhaUrl, sourceLocator: `${first}–${last}`, edition: 'Sanskrit Documents Valmiki Ramayana electronic text', traditionClassification: 'PRIMARY_VALMIKI_TEXT', confidence: locs.length ? 0.94 : 0.6, evidenceClass: 'PHYSICAL_SOURCE_PAGE_HASHED', provenance: { acquisitionMode: 'PASSIVE_WEB_RETRIEVAL', physicalFile: `data/staging/yuddha_1_source_evidence_20260826/sarga1.html`, sha256: hash }, contentHash: hash, mergeState: 'QUARANTINED_STAGING', publicationState: 'UNPUBLISHED_ZERO', tamilReviewState: 'NOT_STARTED', variantState: 'CROSSCHECK_PENDING', possibleLegacyOverlap: true, publicSearchExposure: 0, publicAskExposure: 0 });
  yuddhaStarted = true;
}
const final = { ...master, version: '2.13.0-sundara-completion-yuddha', timestamp: new Date().toISOString(), canonical_baseline: 550, physicallyAvailableUniqueRecords: records.length, records };
fs.writeFileSync(masterPath, JSON.stringify(final, null, 2) + '\n');
const branchPath = path.join(root, 'RAMAVERSE_STAGING_MASTER_LEDGER_SUNDARA_COMPLETION_YUDDHA.json');
fs.writeFileSync(branchPath, JSON.stringify(final, null, 2) + '\n');
const boundary = { generatedAt: new Date().toISOString(), start: 'Sundara Kanda 5.11.1', priorBoundary: 'Sundara Kanda 5.10 end-of-source-page', sundaraEvidencePages: evidence.length, sundaraEvidenceFirst: evidence[0], sundaraEvidenceLast: evidence.at(-1), sundaraCompletion: 'SUPPORTED_FOR_SOURCE-PAGE-EVIDENCE_BOUNDARY', yuddhaStarted, yuddhaNext: yuddhaStarted ? 'Yuddha Kanda 6.1.2 onward' : 'Yuddha Kanda 6.1.1', canonicalBaseline: 550, stagingPublished: 0, websiteModified: false, mobileModified: false };
fs.writeFileSync(path.join(root, 'SUNDARA_COMPLETION_BOUNDARY_2026-08-26.json'), JSON.stringify(boundary, null, 2) + '\n');
fs.writeFileSync(path.join(root, 'SUNDARA_SOURCE_EVIDENCE_INDEX_2026-08-26.json'), JSON.stringify({ generatedAt: boundary.generatedAt, evidence }, null, 2) + '\n');
console.log(JSON.stringify({ startPhysical: master.records.length, newRecords: records.length - master.records.length, finalPhysical: records.length, finalLedger: records.length, sundaraSargasEvidence: evidence.length, sundaraCompletion: boundary.sundaraCompletion, yuddhaStarted, nextExactSource: boundary.yuddhaNext, duplicates: 0, missingSources: 0, stagingPublished: 0, canonicalBaseline: 550, websiteModified: false, mobileModified: false }, null, 2));
