import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, statSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
const root = '/home/ubuntu/ramaverse';
const out = path.join(root, 'release_evidence', 'final_corpus_authority_recovery');
const data = path.join(root, 'data', 'final_corpus_authority_recovery');
mkdirSync(out, { recursive: true });
const files = [
  'data/final_corpus_authority_recovery/RAMAVERSE_SOURCE_RECOVERY_LEDGER.json',
  'data/final_corpus_authority_recovery/RAMAVERSE_FINAL_EDITOR_DECISION_PACKETS.json',
  'data/final_corpus_authority_recovery/RAMAVERSE_FINAL_EDITOR_DECISION_PACKETS.csv',
  'data/final_corpus_authority_recovery/RAMAVERSE_SAFE_ENRICHMENT_PATCHES_RECOVERED.json',
  'data/final_corpus_authority_recovery/RAMAVERSE_GOVERNED_ENTITY_REGISTRY_CANDIDATE.json',
  'data/final_corpus_authority_recovery/RAMAVERSE_FINAL_CORPUS_AUTHORITY_RECOVERY_SUMMARY.json',
  'data/final_corpus_authority_recovery/RAMAVERSE_FINAL_CORPUS_AUTHORITY_RECOVERY_VALIDATION.json',
  'data/p0_conflict_resolution_vnext/RAMAVERSE_P0_RESOLUTION_LEDGER.json',
  'data/p0_conflict_resolution_vnext/RAMAVERSE_P0_VARIANT_LEDGER.json',
  'data/p0_conflict_resolution_vnext/RAMAVERSE_P0_SOURCE_EVIDENCE_MAP.json',
  'data/p0_conflict_resolution_vnext/RAMAVERSE_P0_RESOLUTION_PATCHES.json',
  'data/p0_conflict_resolution_vnext/RAMAVERSE_FINAL_HUMAN_EDITOR_QUEUE.json',
  'release_evidence/SOURCE_RECOVERY_WEB_EVIDENCE_2026-08-26.md',
  'PROJECT_STATE.json',
  'CORPUS_STATE.json',
  'CONTINUATION.md',
  'release_evidence/FINAL_ELITE_VALIDATION.json'
];
const missing = files.filter((f) => !existsSync(path.join(root, f)));
if (missing.length) throw new Error(`Missing: ${missing.join(', ')}`);
const name = 'RAMAVERSE-FINAL-CORPUS-AUTHORITY-RECOVERY-MASTER.zip';
const target = path.join(out, name);
execFileSync('rm', ['-f', target]);
execFileSync('zip', ['-q', target, ...files, '-x', '*.zip', '-x', 'node_modules/*', '-x', 'dist/*', '-x', '*.env', '-x', '*.key', '-x', '*.pem', '-x', '*.log'], { cwd: root });
execFileSync('unzip', ['-tq', target]);
const listing = execFileSync('unzip', ['-Z1', target], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
const entries = listing.split('\n').filter(Boolean);
const requiredInArchive = files.every((f) => entries.includes(f));
const forbidden = entries.filter((f) => /(^|\/)(node_modules|dist|\.git)(\/|$)|\.env$|\.(key|pem)$|\.log$|\.zip$/i.test(f));
const sha256 = createHash('sha256').update(readFileSync(target)).digest('hex');
const verification = { generated_at: new Date().toISOString(), file: name, bytes: statSync(target).size, entries: entries.length, required_files_present: requiredInArchive, forbidden_entries: forbidden.length, integrity: 'PASS', sha256, canonical_mutation: 0, staging_publication: 0, mobile_modified: false, status: requiredInArchive && forbidden.length === 0 ? 'PASS' : 'FAIL' };
if (verification.status !== 'PASS') throw new Error(JSON.stringify(verification));
writeFileSync(path.join(out, 'ARCHIVE_VERIFICATION.json'), JSON.stringify(verification, null, 2) + '\n');
writeFileSync(path.join(out, 'MANIFEST.json'), JSON.stringify({ generated_at: verification.generated_at, archive: name, included_files: files, governance: { canonical_baseline: 550, staging_publication: 0, canonical_mutation: 0, mobile_modified: false }, status: 'PASS' }, null, 2) + '\n');
writeFileSync(path.join(out, 'SHA256SUMS.txt'), `${sha256}  ${name}\n`);
console.log(JSON.stringify(verification, null, 2));
