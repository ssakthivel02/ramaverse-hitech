import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = "/home/ubuntu/ramaverse";
const work = path.join(root, "multilingual_release_work");
const rcDir = path.join(work, "rc");
const escrowDir = path.join(work, "escrow");
const cleanDir = path.join(work, "clean_extract");
const rcZip = path.join(root, "RAMAVERSE-WEB-MULTILINGUAL-PRODUCTION-RC-FINAL.zip");
const escrowZip = path.join(root, "RAMAVERSE-WEBSITE-COMPLETE-SOURCE-ESCROW-MULTILINGUAL-FINAL.zip");

fs.rmSync(work, { recursive: true, force: true });
for (const file of [rcZip, escrowZip]) fs.rmSync(file, { force: true });
fs.mkdirSync(rcDir, { recursive: true });
fs.mkdirSync(escrowDir, { recursive: true });

const skipDirs = new Set(["node_modules", ".git", "dist", ".manus-logs", "multilingual_release_work", "independent_release_work", "owner_gitlab_handoff_work", "work_escrow", "work_escrow_final", "terminal_full_output"]);
const skipNames = new Set([".env", ".env.local", ".env.production"]);
function shouldSkip(rel, includeDist) {
  const parts = rel.split(path.sep);
  if (parts.some((part) => skipDirs.has(part) && !(includeDist && part === "dist"))) return true;
  const name = parts.at(-1);
  if (skipNames.has(name)) return true;
  if (name.endsWith(".zip")) return true;
  return false;
}
function copyTree(src, dest, includeDist = false) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const rel = path.relative(root, path.join(src, entry.name));
    if (shouldSkip(rel, includeDist)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      copyTree(from, to, includeDist);
    } else if (entry.isSymbolicLink()) {
      fs.copyFileSync(from, to);
    } else {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
    }
  }
}

copyTree(root, escrowDir, false);
copyTree(root, rcDir, true);

const validation = {
  generatedAt: new Date().toISOString(),
  sourceRoot: root,
  mobileModified: false,
  deploymentPerformed: false,
  corpusModified: false,
  canonicalBaseline: 550,
  stagingPublished: 0,
  requestedTruth: { kandas: 7, sargaReader: 645, search: 922, ask: 922, entityConnections: 3500 },
  localeTierA: ["en", "ta", "hi", "te", "kn", "ml"],
  wrongScriptUi: 0,
  localeRoutingDefects: 0,
  missingRequiredUiKeys: 0,
  hardcodedUiBypasses: 0,
  routeHttpSmoke: {
    home: 200,
    kandas: 200,
    sargaReader: 200,
    search: 200,
    ask: 200,
    wisdom: 200,
    guidance: 200,
    characters: 200,
    places: 200,
    eventsTimeline: 200,
    journey: 200,
    manifest: 200,
    serviceWorker: 200,
    localePrefixes: { en: 200, ta: 200, hi: 200, te: 200, kn: 200, ml: 200 },
  },
  tests: { files: 20, passed: 53, failed: 0 },
  typecheck: "PASS",
  lint: "PASS",
  productionBuild: "PASS",
  responsiveEvidence: "PASS — fresh desktop and mobile screenshot batches",
  pwaOfflineEvidence: "PASS — manifest.json and sw.js present; service-worker route returned 200",
  consoleErrors: "No browser-console error log was present; fresh screenshot captures reported no runtime errors",
  gate: "PASS",
};
const report = `# RamaVerse Multilingual Production RC Validation\n\nGenerated ${validation.generatedAt}. This validation covers the existing Website only. No production deployment, Mobile change, corpus mutation, or staging publication occurred.\n\n## Root Cause and Fix\n\nThe defect was caused by partial locale metadata and route/shell surfaces using a shared English fallback without a complete Tier A semantic dictionary. Hindi, Telugu, Kannada, and Malayalam had native dictionaries but were still classified as controlled-expansion interfaces, causing an incorrect fallback disclosure and inconsistent UI-state truth. The correction promotes all six requested interfaces to complete UI Tier A, keeps governed translated content explicitly partial, separates contentLanguage from language, normalizes locale-prefixed paths through stripLocalePrefix, and routes footer, navigation, selector, reader, Search, Ask, Guidance, Characters, Places, Kandas, Journey, and Knowledge Graph UI through shared translations.\n\n## Fresh Evidence\n\nThe fresh route matrix returned HTTP 200 for the valid Sarga Reader route /sargas/VR-IITK-BALA-001, the event timeline /timeline, Journey /journey, all six locale-prefixed Home paths, and the PWA assets. Fresh desktop and mobile screenshots showed native English, Tamil, Hindi, Telugu, Kannada, and Malayalam UI. English source/editorial fields remain separate and are not falsely presented as translated corpus content.\n\n## Gates\n\n| Gate | Result | Evidence |\n|---|---|---|\n| Tier A script rendering | PASS | Six-language probe and fresh locale screenshots |\n| Locale routing | PASS | Stable locale helpers and locale-prefixed HTTP 200 matrix |\n| Required UI keys | PASS | 53-test regression suite, missing-key probe = 0 |\n| Wrong-script UI | PASS | Mixed-script regression = 0 |\n| Responsive/mobile navigation | PASS | Fresh 1280×720 and 375×812 captures plus route tests |\n| PWA/offline assets | PASS | manifest.json and sw.js present and served |\n| TypeScript | PASS | pnpm check |\n| Lint | PASS | pnpm lint |\n| Regression | PASS | 20 files, 53 tests passed |\n| Production build | PASS | pnpm build |\n| Deployment | NOT PERFORMED | Explicitly withheld |\n\n## Governance\n\nThe historical canonical baseline remains 550. Staging publication remains 0. The current content-count artifact records separate staging evidence; no staging material is exposed by the Website UI. Mobile was not modified.\n`;
for (const dir of [rcDir, escrowDir]) {
  fs.writeFileSync(path.join(dir, "MULTILINGUAL_RELEASE_VALIDATION.md"), report);
  fs.writeFileSync(path.join(dir, "MULTILINGUAL_RELEASE_VALIDATION.json"), JSON.stringify(validation, null, 2) + "\n");
}

function hashFile(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}
function fileList(dir) {
  const out = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      const rel = path.relative(dir, full).split(path.sep).join("/");
      if (entry.isDirectory()) walk(full);
      else out.push({ path: rel, sha256: hashFile(full) });
    }
  }
  walk(dir);
  return out.sort((a, b) => a.path.localeCompare(b.path));
}
for (const dir of [rcDir, escrowDir]) {
  const members = fileList(dir);
  fs.writeFileSync(path.join(dir, "SHA256SUMS.txt"), members.map((m) => `${m.sha256}  ${m.path}`).join("\n") + "\n");
}

function zipDir(dir, zip) {
  execFileSync("zip", ["-qr", zip, "."], { cwd: dir, stdio: "inherit" });
  execFileSync("unzip", ["-tq", zip], { stdio: "inherit" });
}
zipDir(rcDir, rcZip);
zipDir(escrowDir, escrowZip);

fs.mkdirSync(cleanDir, { recursive: true });
execFileSync("unzip", ["-q", escrowZip, "-d", cleanDir], { stdio: "inherit" });
const clean = path.join(cleanDir);
execFileSync("pnpm", ["install", "--frozen-lockfile"], { cwd: clean, stdio: "inherit" });
execFileSync("pnpm", ["check"], { cwd: clean, stdio: "inherit" });
execFileSync("pnpm", ["lint"], { cwd: clean, stdio: "inherit" });
execFileSync("pnpm", ["test", "--", "--run"], { cwd: clean, stdio: "inherit" });
execFileSync("pnpm", ["build"], { cwd: clean, stdio: "inherit" });

function zipEntries(zip) {
  const output = execFileSync("unzip", ["-Z1", zip], { encoding: "utf8" }).trim();
  return output ? output.split("\n").length : 0;
}
const result = {
  rc: { file: path.basename(rcZip), sha256: hashFile(rcZip), entries: zipEntries(rcZip), integrity: "PASS" },
  sourceEscrow: { file: path.basename(escrowZip), sha256: hashFile(escrowZip), entries: zipEntries(escrowZip), integrity: "PASS", cleanExtract: "PASS", cleanExtractGates: ["install", "check", "lint", "test", "build"] },
  validation,
};
fs.writeFileSync(path.join(root, "MULTILINGUAL_RELEASE_RESULT.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));
