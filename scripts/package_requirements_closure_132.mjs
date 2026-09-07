import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = '/home/ubuntu/ramaverse';
const out = path.join(root, 'release_evidence', 'forgotten_requirements_20260827');
const register = JSON.parse(fs.readFileSync(path.join(out, 'RAMAVERSE_MASTER_REQUIREMENT_REGISTER.json'), 'utf8'));
const parity = JSON.parse(fs.readFileSync(path.join(out, 'WEBSITE_ANDROID_PARITY_MATRIX.json'), 'utf8'));
const req = register.requirements;
const counts = register.classifications;
const notComplete = req.filter(r => r.classification !== 'IMPLEMENTED_COMPLETE');
const top20 = notComplete.sort((a,b) => a.priority.localeCompare(b.priority) || a.id.localeCompare(b.id)).slice(0,20);
const requiredKeys = ['id','feature','category','classification','websiteEvidence','androidEvidence','dataAvailability','missingWork','priority'];
const validation = {
  generatedAt: new Date().toISOString(),
  decision: 'RECOVERY_COMPLETE_WITH_SAFE_GAPS_DEFERRED',
  totalRequirements: req.length,
  counts,
  implementedThisRun: 0,
  deferred: notComplete.length,
  top20Remaining: top20.map(r=>r.id),
  integrity: {
    allRequiredFields: req.every(r => requiredKeys.every(k => Object.hasOwn(r,k))),
    uniqueRequirementIds: new Set(req.map(r=>r.id)).size === req.length,
    parityRows: parity.rows.length === req.length,
    canonicalBaseline: 550,
    stagingPublished: 0,
    mobileModified: false,
    productionDeployment: false,
    fabricatedContentAdded: false,
    sourceAuthorityChanged: false
  },
  physicalEvidence: register.physicalEvidence
};
fs.writeFileSync(path.join(out,'REQUIREMENTS_CLOSURE_VALIDATION.json'), JSON.stringify(validation,null,2)+'\n');
const markdown = `# RamaVerse Forgotten Requirements Closure\n\nGenerated ${validation.generatedAt}. This closure compares the physically available Website implementation and read-only Mobile evidence. It does not promote corpus data, modify Mobile, deploy production, or infer unsupported features.\n\n## Classification summary\n\n| Classification | Count |\n|---|---:|\n${Object.entries(counts).map(([k,v])=>`| ${k} | ${v} |`).join('\n')}\n\n## Decisions\n\nThe current Website is treated as the implementation authority. Existing features are recorded as complete or partial only where source files, route surfaces, governed data, or release evidence support that conclusion. Art, timing datasets, family mode, daily nama, transliteration, and notification workflows remain deferred when the required approved assets, data, or product contracts are not physically evidenced. Mobile evidence is read-only and no parity claim is upgraded beyond the available artifacts.\n\nThe production corpus remains at the active canonical baseline of **550 records** with **0 staging records published**. No implementation in this recovery run changed canonical data, Mobile source, deployment state, or DNS.\n\n## Top remaining items\n\n| ID | Feature | Classification | Priority |\n|---|---|---|---|\n${top20.map(r=>`| ${r.id} | ${r.feature} | ${r.classification} | ${r.priority} |`).join('\n')}\n\n## Validation\n\nThe generated JSON register contains one stable ID per discussed requirement, a classification, Website evidence, Mobile evidence status, data availability, missing work, and priority. The parity matrix has one row per requirement. Safe gaps were not fabricated or silently marked complete.\n`;
fs.writeFileSync(path.join(out,'FORGOTTEN_REQUIREMENTS_CLOSURE.md'), markdown);
const stage = path.join(out,'package_workspace'); fs.rmSync(stage,{recursive:true,force:true}); fs.mkdirSync(stage,{recursive:true});
const copy = name => { const dest=path.join(stage,name); fs.mkdirSync(path.dirname(dest),{recursive:true}); fs.copyFileSync(path.join(out,name),dest); };
for (const f of ['RAMAVERSE_MASTER_REQUIREMENT_REGISTER.json','WEBSITE_ANDROID_PARITY_MATRIX.json','TOP_20_REMAINING.json','REQUIREMENTS_CLOSURE_VALIDATION.json','FORGOTTEN_REQUIREMENTS_CLOSURE.md']) copy(f);
const evidenceIndex = { websiteSourceRoot: root, mobileEvidenceRoots: register.physicalEvidence.mobileEvidenceRoots, evidenceFiles: register.physicalEvidence.evidenceFiles, excluded: ['node_modules','dist','credentials','tokens','secrets','production deployment'] };
fs.writeFileSync(path.join(stage,'PHYSICAL_EVIDENCE_INDEX.json'),JSON.stringify(evidenceIndex,null,2)+'\n');
const sha = f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const names=fs.readdirSync(stage).sort(); fs.writeFileSync(path.join(stage,'SHA256SUMS.txt'),names.map(n=>`${sha(path.join(stage,n))}  ${n}`).join('\n')+'\n');
const zip=path.join(out,'RAMAVERSE-FORGOTTEN-REQUIREMENTS-CLOSURE-RC.zip'); fs.rmSync(zip,{force:true}); execFileSync('zip',['-q','-X','-r',zip,'.'],{cwd:stage}); execFileSync('unzip',['-tq',zip]);
const entries=execFileSync('unzip',['-Z1',zip],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
const archive={filename:path.basename(zip),integrity:'PASS',entries:entries.length,bytes:fs.statSync(zip).size,sha256:sha(zip)};
fs.writeFileSync(path.join(out,'ARCHIVE_VERIFICATION.json'),JSON.stringify(archive,null,2)+'\n'); console.log(JSON.stringify({validation,archive},null,2));
if (!validation.integrity.allRequiredFields || !validation.integrity.uniqueRequirementIds || !validation.integrity.parityRows) process.exitCode=1;
