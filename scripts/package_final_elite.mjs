import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
const root = "/home/ubuntu/ramaverse";
const out = path.join(root, "release_evidence", "final_elite");
mkdirSync(out, { recursive: true });
const required = ["PROJECT_STATE.json", "CONTINUATION.md", "FEATURE_MATRIX.json", "ROUTE_MATRIX.json", "LANGUAGE_STATE.json", "CORPUS_STATE.json", "RECOVERY.md", "DEPLOYMENT.md", "release_evidence/FINAL_ELITE_VALIDATION.json", "release_evidence/PREMIUM_COMPLETION_VALIDATION.json", "release_evidence/PERFORMANCE_VALIDATION.json", "client/public/manifest.json", "client/public/robots.txt", "client/public/sitemap.xml", "client/public/sw.js", "client/public/favicon.svg", "shared/intelligence.ts", "server/intelligence.ts"];
const missing = required.filter((file) => { try { readFileSync(path.join(root, file)); return false; } catch { return true; } });
if (missing.length) throw new Error(`Missing required files: ${missing.join(", ")}`);
const archives = [
  ["RAMAVERSE-WEB-FINAL-ELITE-PRODUCTION-RC.zip", ["client", "server", "shared", "drizzle", "scripts", "package.json", "pnpm-lock.yaml", "tsconfig.json", "vite.config.ts", "vitest.config.ts", "components.json", "template.json", ".gitignore", ".prettierignore", ".prettierrc", "PROJECT_STATE.json", "SOURCE_MANIFEST.json", "CORPUS_STATE.json", "LANGUAGE_STATE.json", "FEATURE_MATRIX.json", "ROUTE_MATRIX.json", "CONTINUATION.md", "RECOVERY.md", "DEPLOYMENT.md", "release_evidence/FINAL_ELITE_VALIDATION.json", "release_evidence/PREMIUM_COMPLETION_VALIDATION.json", "release_evidence/PERFORMANCE_VALIDATION.json", "release_evidence/VISUAL_VERIFICATION_2026-08-25.md", "release_evidence/visual_assets"]],
  ["RAMAVERSE-WEBSITE-FINAL-ELITE-SOURCE-ESCROW.zip", ["client", "server", "shared", "drizzle", "scripts", "package.json", "pnpm-lock.yaml", "tsconfig.json", "vite.config.ts", "vitest.config.ts", "components.json", "template.json", ".gitignore", ".prettierignore", ".prettierrc", "PROJECT_STATE.json", "SOURCE_MANIFEST.json", "CORPUS_STATE.json", "LANGUAGE_STATE.json", "FEATURE_MATRIX.json", "ROUTE_MATRIX.json", "CONTINUATION.md", "RECOVERY.md", "DEPLOYMENT.md", "release_evidence/FINAL_ELITE_VALIDATION.json", "release_evidence/PREMIUM_COMPLETION_VALIDATION.json", "release_evidence/PERFORMANCE_VALIDATION.json", "release_evidence/VISUAL_VERIFICATION_2026-08-25.md", "release_evidence/visual_assets"]]
];
const reports = [];
for (const [name, inputs] of archives) {
  const target = path.join(out, name);
  execFileSync("rm", ["-f", target]);
  execFileSync("zip", ["-qr", target, ...inputs, "-x", "node_modules/*", "-x", "dist/*", "-x", "*.zip", "-x", ".git/*", "-x", "*.log", "-x", ".cache/*", "-x", "coverage/*", "-x", "*.env", "-x", "*.key", "-x", "*.pem"], { cwd: root, stdio: "ignore" });
  execFileSync("unzip", ["-tq", target], { stdio: "ignore" });
  const listing = execFileSync("unzip", ["-Z1", target], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const entries = listing.split("\n").filter(Boolean);
  const forbidden = entries.filter((entry) => /(^|\/)(node_modules|dist|\.git|coverage|\.cache)(\/|$)|\.env$|\.(key|pem)$|\.log$|\.zip$/i.test(entry));
  const sha256 = createHash("sha256").update(readFileSync(target)).digest("hex");
  reports.push({ file: name, bytes: statSync(target).size, entries: entries.length, sha256, integrity: "PASS", required_files_present: required.every((file) => entries.includes(file)), forbidden_entries: forbidden.length });
}
if (reports.some((report) => report.integrity !== "PASS" || !report.required_files_present || report.forbidden_entries !== 0)) throw new Error("Final elite archive gate failed");
writeFileSync(path.join(out, "ARCHIVE_VERIFICATION.json"), JSON.stringify({ generated_at: new Date().toISOString(), archives: reports, deployment: "NOT_PERFORMED", canonical_mutation: 0, staging_publication: 0, mobile_modified: false, status: "PASS" }, null, 2) + "\n");
writeFileSync(path.join(out, "SHA256SUMS.txt"), reports.map((report) => `${report.sha256}  ${report.file}`).join("\n") + "\n");
console.log(JSON.stringify({ archives: reports, status: "PASS" }, null, 2));
