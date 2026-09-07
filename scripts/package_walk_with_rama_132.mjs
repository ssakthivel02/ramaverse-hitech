import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = '/home/ubuntu/ramaverse';
const out = path.join(root, 'release_evidence', 'walk_with_rama_20260827');
const stage = path.join(out, 'package_workspace');
fs.rmSync(stage, { recursive: true, force: true }); fs.mkdirSync(stage, { recursive: true });
const files = [
  'client/src/pages/WalkWithRama.tsx',
  'client/src/pages/WalkWithRama.test.tsx',
  'client/src/pages/Home.tsx',
  'client/src/App.tsx',
  'client/src/index.css',
  'shared/walkWithRamaTokens.ts',
  'client/src/lib/knowledgeUniverse.ts',
  'client/src/contexts/MultilingualContext.tsx',
  'client/src/components/RamaNavbar.tsx',
  'client/src/components/RamaFooter.tsx',
  'client/src/components/motion/MotionPrimitives.tsx',
  'release_evidence/walk_with_rama_20260827/WALK_WITH_RAMA_VISUAL_QA.md',
  'RAMAVERSE_PROJECT_STATE.json',
].filter(f => fs.existsSync(path.join(root, f)));
for (const file of files) { const dest=path.join(stage,file); fs.mkdirSync(path.dirname(dest),{recursive:true}); fs.copyFileSync(path.join(root,file),dest); }
const manifest = { generatedAt:new Date().toISOString(), name:'RAMAVERSE-WALK-WITH-RAMA-HITECH-RC', productionDeployment:false, mobileModified:false, canonicalBaseline:550, stagingPublished:0, sourceFiles:files, exclusions:['node_modules','dist','credentials','tokens','.env','production deployment'], safety:{reflectionLabel:'Source-grounded reflection inspired by Rama’s words and actions in the Ramayana.',literalSpeakingClaim:false,guaranteedOutcomeClaims:false,stagingIdentifiersFiltered:true,audioDefault:'off'} };
fs.writeFileSync(path.join(stage,'WALK_WITH_RAMA_RC_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
const sha = f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const names=[]; const walk=d=>{for(const n of fs.readdirSync(d)){const p=path.join(d,n);if(fs.statSync(p).isDirectory())walk(p);else names.push(path.relative(stage,p).replaceAll('\\','/'));}}; walk(stage); names.sort(); fs.writeFileSync(path.join(stage,'SHA256SUMS.txt'),names.map(n=>`${sha(path.join(stage,n))}  ${n}`).join('\n')+'\n');
const zip=path.join(out,'RAMAVERSE-WALK-WITH-RAMA-HITECH-RC.zip'); fs.rmSync(zip,{force:true}); execFileSync('zip',['-q','-X','-r',zip,'.'],{cwd:stage}); execFileSync('unzip',['-tq',zip]);
const entries=execFileSync('unzip',['-Z1',zip],{encoding:'utf8'}).trim().split('\n').filter(Boolean); const archive={filename:path.basename(zip),integrity:'PASS',entries:entries.length,bytes:fs.statSync(zip).size,sha256:sha(zip)}; fs.writeFileSync(path.join(out,'ARCHIVE_VERIFICATION.json'),JSON.stringify(archive,null,2)+'\n'); console.log(JSON.stringify({manifest,archive},null,2));
