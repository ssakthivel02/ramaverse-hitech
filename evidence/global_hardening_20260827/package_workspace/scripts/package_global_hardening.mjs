import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = '/home/ubuntu/ramaverse';
const evidence = path.join(root, 'release_evidence', 'global_hardening_20260827');
const staging = path.join(evidence, 'package_workspace');
fs.rmSync(staging, { recursive: true, force: true });
fs.mkdirSync(staging, { recursive: true });
const copy = (src, dest) => { const target = path.join(staging, dest); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(path.join(root, src), target); };
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const copyTree = (dir, rel = dir) => { for (const name of fs.readdirSync(path.join(root, dir))) { const source = path.join(root, dir, name); const relative = path.join(rel, name); const stat = fs.statSync(source); if (stat.isDirectory()) { if (!['node_modules','dist','.git','coverage','.pnpm-store','release_evidence'].includes(name)) copyTree(path.join(dir, name), relative); } else if (!name.endsWith('.zip') && !name.endsWith('.env') && !name.endsWith('.key') && !name.endsWith('.pem')) { const target = path.join(staging, relative); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(source, target); } } };
// RC includes the complete editable source while excluding local build/cache/secret material.
for (const dir of ['client','server','shared','drizzle','scripts','patches','data']) copyTree(dir);
for (const file of ['package.json','pnpm-lock.yaml','tsconfig.json','vite.config.ts','vitest.config.ts','components.json','.gitignore','.prettierrc','.prettierignore','eslint.config.mjs','.gitlab-ci.yml','README.md','RECONCILIATION_DRY_RUN.json','RAMAVERSE_STAGING_MASTER_LEDGER.json']) if (fs.existsSync(path.join(root,file))) copy(file,file);
for (const file of fs.readdirSync(evidence)) if (file.endsWith('.json') || file.endsWith('.md')) copy(path.join('release_evidence','global_hardening_20260827',file), path.join('release_evidence',file));
const files = []; const walk = d => { for (const name of fs.readdirSync(d)) { const p=path.join(d,name); if (fs.statSync(p).isDirectory()) walk(p); else files.push(path.relative(staging,p)); } }; walk(staging);
fs.writeFileSync(path.join(staging,'SHA256SUMS.txt'), files.sort().map(f => `${sha(path.join(staging,f))}  ${f}`).join('\n')+'\n');
const rc = path.join(evidence,'RAMAVERSE-WEB-v1.5-GLOBAL-PRODUCTION-HARDENING-RC.zip'); fs.rmSync(rc,{force:true}); execFileSync('zip',['-q','-X','-r',rc,'.'],{cwd:staging}); execFileSync('unzip',['-tq',rc]);
const opsDir = path.join(evidence,'ops_workspace'); fs.rmSync(opsDir,{recursive:true,force:true}); fs.mkdirSync(opsDir,{recursive:true});
for (const file of ['OPERATIONS_HANDOFF.md','RELEASE_STATE.json','HEALTH_CONTRACT.json','CORPUS_VERSION.json','ROUTE_MATRIX.json','SEO_VALIDATION.json','PWA_VALIDATION.json','PERFORMANCE_REPORT.json','HARDENING_EVIDENCE_MANIFEST.json','OPS_RUNTIME_SMOKE.md']) fs.copyFileSync(path.join(evidence,file),path.join(opsDir,file));
fs.writeFileSync(path.join(opsDir,'SHA256SUMS.txt'),fs.readdirSync(opsDir).filter(f=>f.endsWith('.json')||f.endsWith('.md')).sort().map(f=>`${sha(path.join(opsDir,f))}  ${f}`).join('\n')+'\n');
const ops = path.join(evidence,'RAMAVERSE-WEB-v1.5-OPERATIONS-HANDOFF.zip'); fs.rmSync(ops,{force:true}); execFileSync('zip',['-q','-X','-r',ops,'.'],{cwd:opsDir}); execFileSync('unzip',['-tq',ops]);
const entries = file => execFileSync('unzip',['-Z1',file],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
const result = { rc: { filename:path.basename(rc), integrity:'PASS', entries:entries(rc).length, bytes:fs.statSync(rc).size, sha256:sha(rc) }, operations: { filename:path.basename(ops), integrity:'PASS', entries:entries(ops).length, bytes:fs.statSync(ops).size, sha256:sha(ops) } };
fs.writeFileSync(path.join(evidence,'ARCHIVE_VERIFICATION.json'),JSON.stringify(result,null,2)+'\n'); console.log(JSON.stringify(result,null,2));
