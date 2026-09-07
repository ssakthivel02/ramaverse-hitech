import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root = '/home/ubuntu/ramaverse';
const outDir = path.join(root, 'release_evidence', 'sundara_completion_yuddha_20260826');
fs.mkdirSync(outDir, { recursive: true });
const archive = 'RAMAVERSE-CORPUS-SUNDARA-COMPLETION-YUDDHA-vNEXT.zip';
const archivePath = path.join(outDir, archive);
const members = [
  'RAMAVERSE_STAGING_MASTER_LEDGER_SUNDARA_COMPLETION_YUDDHA.json',
  'SUNDARA_SOURCE_EVIDENCE_INDEX_2026-08-26.json',
  'SUNDARA_COMPLETION_BOUNDARY_2026-08-26.json',
  'SUNDARA_COMPLETION_YUDDHA_VALIDATION_2026-08-26.json',
  'PROJECT_STATE.json',
  'CONTINUATION.md',
  'data/staging/sundara_11_68_source_evidence_20260826',
  'data/staging/yuddha_1_source_evidence_20260826'
];
for (const m of members) {
  const p = path.join(root, m);
  if (!fs.existsSync(p)) throw new Error(`Missing required package member: ${m}`);
}
const stagingState = { generatedAt: new Date().toISOString(), archive, start: 'Sundara Kanda 5.11.1', end: 'Yuddha Kanda 6.1.1 source-note boundary', canonicalBaseline: 550, startPhysical: 922, finalPhysical: 981, newRecords: 59, sargasWithPhysicalSourceEvidence: 58, yuddhaSourceNotes: 1, tamilHumanReviewed: 0, stagingPublished: 0, websiteModified: false, mobileModified: false, candidateV4Modified: false, inheritedLedgerDuplicateBlocker: { duplicateIds: 31, duplicateOccurrences: 437, newDuplicateIds: 0 }, status: 'PASS_WITH_INHERITED_LEDGER_DUPLICATE_BLOCKER' };
fs.writeFileSync(path.join(outDir, 'ACQUISITION_PACKAGE_MANIFEST.json'), JSON.stringify(stagingState, null, 2) + '\n');
const work = path.join(outDir, 'work');
fs.rmSync(work, { recursive: true, force: true });
fs.mkdirSync(work, { recursive: true });
for (const m of members) {
  const src = path.join(root, m); const dest = path.join(work, m); fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (fs.statSync(src).isDirectory()) execFileSync('cp', ['-a', src, dest]); else fs.copyFileSync(src, dest);
}
fs.copyFileSync(path.join(outDir, 'ACQUISITION_PACKAGE_MANIFEST.json'), path.join(work, 'ACQUISITION_PACKAGE_MANIFEST.json'));
execFileSync('rm', ['-f', archivePath]);
execFileSync('zip', ['-q', '-X', '-r', archivePath, '.'], { cwd: work });
execFileSync('unzip', ['-tq', archivePath]);
const listing = execFileSync('unzip', ['-Z1', archivePath], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
const entries = listing.split('\n').filter(Boolean);
const sha = crypto.createHash('sha256').update(fs.readFileSync(archivePath)).digest('hex');
const forbidden = entries.filter((e) => /(^|\/)(node_modules|dist|\.git)(\/|$)|\.env$|\.(key|pem)$|\.zip$/i.test(e));
const verify = { ...stagingState, archiveEntries: entries.length, archiveBytes: fs.statSync(archivePath).size, sha256: sha, integrity: 'PASS', requiredTopLevelMembers: members.every((m) => entries.some((e) => e === m || e.startsWith(`${m}/`))), forbiddenEntries: forbidden.length, status: forbidden.length === 0 ? stagingState.status : 'FAIL' };
fs.writeFileSync(path.join(outDir, 'ARCHIVE_VERIFICATION.json'), JSON.stringify(verify, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'SHA256SUMS.txt'), `${sha}  ${archive}\n`);
console.log(JSON.stringify(verify, null, 2));
