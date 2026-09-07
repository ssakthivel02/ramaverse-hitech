import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = "/home/ubuntu/ramaverse";
const archiveRoot = "/tmp/ramaverse-website-implementation-authority-v1";
const output = "/home/ubuntu/RAMAVERSE-WEBSITE-POST-V1-IMPLEMENTATION-AUTHORITY-v1.zip";
fs.rmSync(archiveRoot, { recursive: true, force: true });
fs.mkdirSync(archiveRoot, { recursive: true });

const copy = (relative) => {
  const source = path.join(root, relative);
  const target = path.join(archiveRoot, relative);
  if (!fs.existsSync(source)) throw new Error(`Missing required authority artifact: ${relative}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true, filter: (candidate) => !candidate.includes("node_modules") && !candidate.includes("/dist") && !candidate.includes(".manus-logs") && !candidate.includes(".git") });
};

["client", "server", "shared", "drizzle", "scripts", "data", "package.json", "pnpm-lock.yaml", "tsconfig.json", "vite.config.ts", "vitest.config.ts", "todo.md", "RAMAVERSE_PROJECT_STATE.json", "IMPLEMENTATION_ACCESSIBILITY_EVIDENCE_V1.json", "POST_V1_ARCHIVE_V10_VALIDATION.json", "RAMAVERSE_STAGING_MASTER_LEDGER_V9.json", "EXACT_PHYSICAL_CONTINUATION_V9.json", "POST_V1_CONTENT_INVENTORY_V9.json", "SOURCE_LEDGER_V9.json", "POST_V1_EDITORIAL_INDEX_V9.json", "POST_V1_STAGING_KNOWLEDGE_GRAPH_V9.json", "POST_V1_STAGING_VALIDATION_V2.json", "HANDOFF.md"].forEach(copy);
const external = [
  ["/home/ubuntu/RAMAVERSE-CORPUS-AUTHORITY-POST-V1-v10.zip", "archives/RAMAVERSE-CORPUS-AUTHORITY-POST-V1-v10.zip"],
  ["/home/ubuntu/RAMAVERSE-CANONICAL-MOBILE-PACK-v1.4.0-FINAL-v2.zip", "archives/RAMAVERSE-CANONICAL-MOBILE-PACK-v1.4.0-FINAL-v2.zip"],
];
for (const [source, relative] of external) { if (!fs.existsSync(source)) throw new Error(`Missing external authority artifact: ${source}`); const target = path.join(archiveRoot, relative); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(source, target); }
const files = fs.readdirSync(archiveRoot, { recursive: true }).filter((entry) => fs.statSync(path.join(archiveRoot, entry)).isFile()).sort();
const sums = files.map((entry) => `${crypto.createHash("sha256").update(fs.readFileSync(path.join(archiveRoot, entry))).digest("hex")}  ${entry}`).join("\n") + "\n";
fs.writeFileSync(path.join(archiveRoot, "SHA256SUMS.txt"), sums);
const manifest = { archive: path.basename(output), generatedAt: new Date().toISOString(), sourceTree: "RamaVerse website implementation authority", excluded: ["node_modules", "dist", ".git", ".manus-logs", "credentials"], canonicalBaseline: 550, physicalStaging: 126, stagingPublished: 0, publicSearchStaging: 0, publicAskStaging: 0, includedFiles: files.length + 1, mobilePack: "RAMAVERSE-CANONICAL-MOBILE-PACK-v1.4.0-FINAL-v2.zip (frozen)", corpusAuthority: "RAMAVERSE-CORPUS-AUTHORITY-POST-V1-v10.zip" };
fs.writeFileSync(path.join(archiveRoot, "SOURCE_FREEZE_MANIFEST.json"), JSON.stringify(manifest, null, 2) + "\n");
fs.rmSync(output, { force: true });
execFileSync("zip", ["-qr", output, "."], { cwd: archiveRoot });
const hash = crypto.createHash("sha256").update(fs.readFileSync(output)).digest("hex");
const verification = { ...manifest, zipSha256: hash, zipEntries: fs.readdirSync(archiveRoot, { recursive: true }).filter((entry) => fs.statSync(path.join(archiveRoot, entry)).isFile()).length, valid: true };
fs.writeFileSync(path.join(root, "WEBSITE_IMPLEMENTATION_AUTHORITY_V1_VALIDATION.json"), JSON.stringify(verification, null, 2) + "\n");
console.log(JSON.stringify(verification, null, 2));
