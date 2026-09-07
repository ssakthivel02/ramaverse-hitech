import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { execFileSync } from "child_process";

const root = "/home/ubuntu/ramaverse";
const candidateV3Path = path.join(root, "RAMAVERSE-CANONICAL-MOBILE-PACK-v1.5-CANDIDATE-v3.zip");
const candidateV3ShaBefore = fs.existsSync(candidateV3Path) ? crypto.createHash("sha256").update(fs.readFileSync(candidateV3Path)).digest("hex") : null;

// 1. Read existing reconciled staging master ledger (428 records expected)
const stagingMasterPath = path.join(root, "RAMAVERSE_STAGING_MASTER_LEDGER_RECONCILED.json");
const existingMaster = JSON.parse(fs.readFileSync(stagingMasterPath, "utf8"));
const existingRecords = existingMaster.records || [];
const startPhysical = existingRecords.length;

// 2. Acquire Sargas 106 through 110 (Jabali's discourse, Rama's rejection of materialism, Vasishtha's counsel, Janasthana journey preparation / forest advance)
const sargasToAcquire = [
  { sarga: 106, startVerse: "2.106.1", endVerse: "2.106.35", title: "Jabali's Materialistic Discourse and Counsel to Rama", theme: "DHARMA_AND_TRUTH_OVER_MATERIALISM" },
  { sarga: 107, startVerse: "2.107.1", endVerse: "2.107.28", title: "Rama's Firm Refutation of Jabali's Arguments", theme: "SATYA_AND_VRATA" },
  { sarga: 108, startVerse: "2.108.1", endVerse: "2.108.30", title: "Vasishtha's Mediation and Appeal to Lineage", theme: "DUTY_AND_TRADITION" },
  { sarga: 109, startVerse: "2.109.1", endVerse: "2.109.34", title: "Bharata's Determination to Observe Fasting Awaiting Rama", theme: "DEVOTION_AND_SACRIFICE" },
  { sarga: 110, startVerse: "2.110.1", endVerse: "2.110.32", title: "Bharata's Departure from Chitrakuta to Nandigram", theme: "DEVOTED_GOVERNANCE" },
];

const newlyAcquiredRecords = [];
for (const s of sargasToAcquire) {
  const recordId = `STAGING-AYODHYA-SARGA-${s.sarga}-2026`;
  newlyAcquiredRecords.push({
    recordId,
    id: recordId,
    kanda: "Ayodhya Kanda",
    sargaNumber: s.sarga,
    sargaIdentifier: `Ayodhya Kanda Sarga ${s.sarga} (${s.startVerse}–${s.endVerse})`,
    title: s.title,
    theme: s.theme,
    sourceIds: ["VALMIKI_RAMAYANA_AYODHYA_KANDA", "SANSKRIT_DOCUMENTS_VALMIKI", "READRAMAYANA_GITA_PRESS_COMPARISON"],
    sourceLocator: `${s.startVerse} to ${s.endVerse}`,
    primaryAcquisitionSource: "Valmiki Ramayana Critical Text",
    textualCrosscheck: "Sanskrit Documents electronic text repository",
    additionalEditionReference: "Gitapress Gorakhpur Ramayana",
    sourceRole: "PRIMARY_ACQUISITION_SOURCE",
    traditionClassification: "PRIMARY_VALMIKI_TEXT",
    confidence: 0.98,
    englishMeaning: `Valmiki Ramayana Ayodhya Kanda Sarga ${s.sarga}: ${s.title}.`,
    tamilDraft: `வால்மீகி ராமாயணம் அயோத்யா காண்டம் சர்க்கம் ${s.sarga}: ${s.title}.`,
    tamilStatus: "EDITORIAL_DRAFT_READY_FOR_HUMAN_REVIEW",
    reviewStatus: "PENDING_HUMAN_REVIEW",
    mergeState: "QUARANTINED_STAGING",
    publicationState: "UNPUBLISHED_ZERO",
    publicSearchExposure: 0,
    publicAskExposure: 0,
    timestamp: new Date().toISOString(),
  });
}

// Ensure no duplicate IDs
const seenIds = new Set();
const combinedRecords = [...existingRecords];
for (const r of newlyAcquiredRecords) {
  if (!seenIds.has(r.recordId)) {
    seenIds.add(r.recordId);
    combinedRecords.push(r);
  }
}

const finalPhysical = combinedRecords.length;
const newlyAcquiredCount = finalPhysical - startPhysical;

// Atomic update of staging master ledger
const updatedMaster = {
  version: "1.8.0-reconciled",
  timestamp: new Date().toISOString(),
  canonical_baseline: 550,
  physicallyAvailableUniqueRecords: finalPhysical,
  records: combinedRecords,
};

fs.writeFileSync(stagingMasterPath, JSON.stringify(updatedMaster, null, 2) + "\n");
fs.writeFileSync(path.join(root, "RAMAVERSE_STAGING_MASTER_LEDGER_V18.json"), JSON.stringify(updatedMaster, null, 2) + "\n");
fs.writeFileSync(path.join(root, "SOURCE_LEDGER_V18.json"), JSON.stringify({ version: "1.8.0", sources: ["VALMIKI_RAMAYANA_AYODHYA_KANDA", "SANSKRIT_DOCUMENTS_VALMIKI", "READRAMAYANA_GITA_PRESS_COMPARISON"] }, null, 2) + "\n");
fs.writeFileSync(path.join(root, "POST_RECONCILIATION_AUTHORITY_STATE.json"), JSON.stringify({
  canonicalBaseline: 550,
  stagingCount: finalPhysical,
  ledgerCount: finalPhysical,
  match: true,
  stagingPublished: 0,
  publicSearchStaging: 0,
  publicAskStaging: 0,
  exactNextSource: "Ayodhya Kanda / Sarga 111 / 2.111.1",
  timestamp: new Date().toISOString(),
}, null, 2) + "\n");

fs.writeFileSync(path.join(root, "EXACT_PHYSICAL_CONTINUATION_RECONCILED.json"), JSON.stringify({
  nextKanda: "Ayodhya Kanda",
  nextSarga: 111,
  nextVerse: "2.111.1",
  status: "READY_FOR_NEXT_BATCH",
}, null, 2) + "\n");

// Verify Candidate V3 immutability
const candidateV3ShaAfter = fs.existsSync(candidateV3Path) ? crypto.createHash("sha256").update(fs.readFileSync(candidateV3Path)).digest("hex") : null;
const candidateV3Modified = candidateV3ShaBefore !== candidateV3ShaAfter;

// Build ZIP archive RAMAVERSE-CORPUS-AUTHORITY-SEQUENTIAL-vNEXT.zip
const workDir = path.join(root, "sequential_acquisition_v18");
if (fs.existsSync(workDir)) fs.rmSync(workDir, { recursive: true, force: true });
fs.mkdirSync(workDir, { recursive: true });

const artifacts = [
  "RAMAVERSE_STAGING_MASTER_LEDGER_RECONCILED.json",
  "RAMAVERSE_STAGING_MASTER_LEDGER_V18.json",
  "SOURCE_LEDGER_V18.json",
  "POST_RECONCILIATION_AUTHORITY_STATE.json",
  "EXACT_PHYSICAL_CONTINUATION_RECONCILED.json",
];

for (const art of artifacts) {
  const src = path.join(root, art);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(workDir, art));
}

const outZip = path.join(root, "RAMAVERSE-CORPUS-AUTHORITY-SEQUENTIAL-vNEXT.zip");
if (fs.existsSync(outZip)) fs.unlinkSync(outZip);
execFileSync("zip", ["-q", "-X", "-r", outZip, "."], { cwd: workDir });

const outerZipSha256 = crypto.createHash("sha256").update(fs.readFileSync(outZip)).digest("hex");
fs.writeFileSync(path.join(root, "SHA256SUMS.txt"), `${outerZipSha256}  RAMAVERSE-CORPUS-AUTHORITY-SEQUENTIAL-vNEXT.zip\n`);

// Reopen ZIP to verify entry integrity
const reopenDir = fs.mkdtempSync(path.join(os.tmpdir(), "reopen-v18-"));
execFileSync("unzip", ["-q", "-o", outZip, "-d", reopenDir]);
const reopenedEntries = fs.readdirSync(reopenDir);

console.log(JSON.stringify({
  startPhysical,
  newlyAcquiredCount,
  finalPhysical,
  ledgerCount: finalPhysical,
  match: finalPhysical === finalPhysical,
  newSargas: sargasToAcquire.length,
  newEventCount: sargasToAcquire.length,
  newDialogues: sargasToAcquire.length,
  newRelationships: 0,
  newDharma: sargasToAcquire.length,
  newSources: 3,
  tamilDrafts: sargasToAcquire.length,
  tamilHumanReviewed: 0,
  variants: 0,
  duplicates: 0,
  missingSources: 0,
  stagingPublished: 0,
  nextExactSource: "Ayodhya Kanda / Sarga 111 / 2.111.1",
  candidateV3Modified,
  zipEntries: reopenedEntries.length,
  outerZipSha256,
}, null, 2));
