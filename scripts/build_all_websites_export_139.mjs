import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = '/home/ubuntu/ramaverse';
const date = '2026-08-27';
const outRoot = path.join(root, 'release_evidence', `all_websites_export_${date.replaceAll('-', '')}`);
const stage = path.join(outRoot, 'MANUS_ALL_WEBSITES_LATEST_EXPORT');
const zip = path.join(outRoot, `MANUS_ALL_WEBSITES_LATEST_EXPORT_${date}.zip`);
fs.rmSync(outRoot, { recursive: true, force: true }); fs.mkdirSync(stage, { recursive: true });

const excludedNames = new Set(['node_modules', '.git', '.cache', '.vite', '.turbo', 'coverage', 'tmp', 'temp']);
const excludedExt = new Set(['.zip', '.tar', '.gz', '.tgz', '.log']);
const secretName = /(^|\/)(\.env|\.env\.[^/]+|.*\.pem|.*\.key|.*\.p12|.*\.pfx|.*\.jks|.*service-account.*|.*credentials.*)$/i;
const secretText = /(sk-[A-Za-z0-9]{32,}|AIza[A-Za-z0-9_-]{30,}|ghp_[A-Za-z0-9]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|AKIA[0-9A-Z]{16})/i;
const included = [];
function shouldInclude(rel, stat) {
  const parts = rel.split('/'); const base = parts.at(-1) ?? '';
  if (parts.some(p => excludedNames.has(p))) return false;
  if (secretName.test(rel)) return base.endsWith('.example') || base === '.env.example';
  if (excludedExt.has(path.extname(base).toLowerCase())) return false;
  if (stat.isDirectory()) return true;
  return !base.startsWith('.') || ['.gitignore', '.prettierignore', '.prettierrc', '.gitlab-ci.yml'].includes(base);
}
function copyTree(srcRel, dstRel = srcRel) {
  const src = path.join(root, srcRel); if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src); if (stat.isDirectory()) {
    for (const name of fs.readdirSync(src)) copyTree(path.join(srcRel, name), path.join(dstRel, name));
    return;
  }
  if (!shouldInclude(srcRel, stat)) return;
  const dst = path.join(stage, '02_RamaVerse', dstRel); fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst); included.push({ project: 'RamaVerse', path: path.relative(stage, dst).replaceAll('\\','/'), source: srcRel, size: stat.size, mtime: stat.mtime.toISOString(), kind: 'source_or_generated' });
}

// Editable source and required reconstruction files.
for (const p of ['client','server','shared','data','drizzle','scripts','patches','package.json','pnpm-lock.yaml','tsconfig.json','vite.config.ts','vitest.config.ts','components.json','template.json','README.md','.gitignore','.prettierrc','.prettierignore','.gitlab-ci.yml','todo.md','PROJECT_STATE.json','RAMAVERSE_PROJECT_STATE.json','CONTINUATION.md','RECOVERY_README.md','REQUIRED_SECRETS_TEMPLATE.env.example']) copyTree(p);
// Latest build as secondary artifact only.
copyTree('dist', '99_build_artifacts/dist');
// Latest governance/release evidence needed to understand current state, excluding old nested archives.
for (const p of ['release_evidence/global_final_completion_20260827','release_evidence/master_completion_20260827','release_evidence/owner_command_center_20260827','release_evidence/visual_assets','release_evidence/walk_with_rama_20260827','release_evidence/world_class_completion_20260827','release_evidence/knowledge_os_20260827','release_evidence/forgotten_requirements_20260827','release_evidence/master_product_gap_recovery_20260827','release_evidence/final_blocker_closure_20260827','release_evidence/global_hardening_20260827']) copyTree(p, `evidence/${p.split('/').at(-1)}`);
// Ensure a secret-free env template exists even if the source template is absent.
const envTemplate = path.join(stage, '02_RamaVerse', 'REQUIRED_SECRETS_TEMPLATE.env.example');
if (!fs.existsSync(envTemplate)) { fs.mkdirSync(path.dirname(envTemplate), {recursive:true}); fs.writeFileSync(envTemplate, '# Secret names only; provide values through the deployment secret manager.\nDATABASE_URL=\nJWT_SECRET=\nVITE_APP_ID=\nOAUTH_SERVER_URL=\nBUILT_IN_FORGE_API_URL=\nBUILT_IN_FORGE_API_KEY=\n'); included.push({ project:'RamaVerse', path:'02_RamaVerse/REQUIRED_SECRETS_TEMPLATE.env.example', source:'generated-safe-template', size:fs.statSync(envTemplate).size, mtime:new Date().toISOString(), kind:'configuration' }); }

// Redact accidental secret-looking text from text files in the staging copy by failing closed rather than editing source.
const violations=[]; for (const item of included) { const p=path.join(stage,item.path); if (item.size < 20_000_000) { const b=fs.readFileSync(p); const text=b.toString('utf8'); if (secretText.test(text)) violations.push(item.path); } }
if (violations.length) throw new Error(`Secret-like content found in export files: ${violations.join(', ')}`);

const projectRoot = path.join(stage, '02_RamaVerse');
const files = included.sort((a,b)=>a.path.localeCompare(b.path));
const fileInventory = ['project,path,type,size_bytes,last_modified_if_known,source_or_generated,notes'];
for (const f of files) { const ext=path.extname(f.path).toLowerCase(); const type=ext ? ext.slice(1) : 'file'; fileInventory.push([f.project,f.path,type,f.size,f.mtime,f.kind,'Latest physically available RamaVerse Website source/evidence export'].map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')); }
fs.writeFileSync(path.join(stage, 'FILE_INVENTORY.csv'), fileInventory.join('\n')+'\n');
const manifest = `# MANUS All Websites Latest Export\n\nGenerated: ${new Date().toISOString()}\n\n## Scope\n\nOnly one website project has physically recoverable editable Website source in the accessible workspace: **RamaVerse**. No separate editable source roots for OmSaravanaBhava, KirthiVerse, SakthiAI, Shiva, DivyaNexus, SaravanAI, Kandan, SitaRama, ArivuKids, or other Website projects were physically available outside the RamaVerse workspace during discovery.\n\n## 02_RamaVerse\n\n| Field | Value |\n|---|---|\n| Project name | RamaVerse |\n| Latest version/date | ${date}; current Website workspace |\n| Source chat/project | Manus project 'ramaverse'; project ID 'LWbT4fpC5GZY8jFGGp3i9x' |\n| Deployed Manus URL | https://ramaverse-lwbt4fpc.manus.space |\n| Framework | React 19, Vite, Express 4, tRPC 11, Drizzle ORM |\n| Entry point | client/src/main.tsx; server/_core/index.ts |\n| Build command | pnpm build |\n| Output directory | dist/ |\n| Approximate file count | ${files.length} |\n| Source completeness | SOURCE COMPLETE for current editable workspace; external projects not found |\n| Visual-assets completeness | Kanda/CSS/SVG project-original foundations present; approved raster hero/character/place/audio assets remain incomplete/review-required |\n| Known working features | Home, Seven Kandas, Reader, Search, Ask, Knowledge Universe, Walk with Rama, Experience Center, Owner Command Center, multilingual UI, PWA shell |\n| Known non-working/deferred features | Physical Mobile/VC14 QA; source-cleared raster/audio completion; several governed domain datasets require review |\n| Older versions | Historical/release evidence is preserved selectively under 02_RamaVerse/evidence; nested prior ZIPs excluded to avoid duplication |\n\n## Export policy\n\nEditable source is preserved under 02_RamaVerse/. The current generated build is included only under 02_RamaVerse/99_build_artifacts/dist/. Secrets, credentials, node_modules, caches, ZIP archives, logs, and private keys are excluded.\n`;
fs.writeFileSync(path.join(stage, 'MASTER_EXPORT_MANIFEST.md'), manifest);
const rootReadme = `# Recovery root\n\nThis export contains the latest physically recoverable Website source available in the accessible workspace. Read ` + '`MASTER_EXPORT_MANIFEST.md`' + ` first. RamaVerse is the only project with an editable Website source tree found.\n`;
fs.writeFileSync(path.join(stage, 'RECOVERY_START_HERE.md'), rootReadme);

execFileSync('zip',['-q','-X','-r',zip,'.'],{cwd:stage}); execFileSync('unzip',['-tq',zip]);
const entries=execFileSync('unzip',['-Z1',zip],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
const sha=crypto.createHash('sha256').update(fs.readFileSync(zip)).digest('hex');
const validation={generatedAt:new Date().toISOString(),projectsIncluded:['RamaVerse'],projectCount:1,totalFiles:entries.length,sourceFiles:files.length,zipBytes:fs.statSync(zip).size,zipSha256:sha,zipIntegrity:'PASS',requiredFolders:['01_OmSaravanaBhava','02_RamaVerse'],presentFolders:['02_RamaVerse'],sourceCompleteness:{RamaVerse:'SOURCE_COMPLETE',otherProjects:'NOT_PHYSICALLY_AVAILABLE'},checks:{zeroByteKeyFiles:files.filter(f=>f.size===0).map(f=>f.path),secrets:violations,nodeModules:entries.filter(x=>x.includes('node_modules/')),caches:entries.filter(x=>/(^|\/)(\.cache|coverage|tmp|temp)(\/|$)/.test(x)),sourceTreePresent:entries.some(x=>x==='02_RamaVerse/client/src/main.tsx'),buildConfigPresent:entries.some(x=>x==='02_RamaVerse/package.json'),assetsReferencedIncluded:'MANIFESTED_OR_NOT_PHYSICALLY_AVAILABLE'}};
fs.writeFileSync(path.join(outRoot,'EXPORT_VALIDATION.json'),JSON.stringify(validation,null,2)+'\n');
fs.writeFileSync(path.join(outRoot,'SHA256SUMS.txt'),`${sha}  ${path.basename(zip)}\n`);
console.log(JSON.stringify(validation,null,2));
