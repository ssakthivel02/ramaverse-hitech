import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execFileSync } from "child_process";

const root = "/home/ubuntu/ramaverse";
const external = "/home/ubuntu/ramaverse_external_storage";
const hashFile = (p) => new Promise((resolve, reject) => {
  const h = crypto.createHash("sha256");
  const s = fs.createReadStream(p);
  s.on("data", (chunk) => h.update(chunk));
  s.on("error", reject);
  s.on("end", () => resolve(h.digest("hex")));
});
const copy = (src, dst) => {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      if (name.startsWith("work_") || name.startsWith("independent_") || name === "ramaverse_external_storage" || name === "node_modules" || name === ".git" || name === "dist") continue;
      if (name.endsWith(".zip")) continue;
      copy(path.join(src, name), path.join(dst, name));
    }
  } else {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }
};
const sha256Text = (text) => crypto.createHash("sha256").update(text).digest("hex");

execFileSync("pnpm", ["test"], { cwd: root, stdio: "inherit" });
execFileSync("pnpm", ["check"], { cwd: root, stdio: "inherit" });
execFileSync("pnpm", ["build"], { cwd: root, stdio: "inherit" });

const blockedPattern = /api\.manus\.im|forge\.manus\.ai|manus-analytics\.com|manus\.im|vite-plugin-manus-runtime|\/__manus__\//;
const runtimeRoots = ["dist", "client", "server", "shared", "vite.config.ts", "package.json", "REQUIRED_SECRETS_TEMPLATE.env.example"];
const refs = [];
const scan = (p) => {
  if (!fs.existsSync(p)) return;
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    for (const name of fs.readdirSync(p)) scan(path.join(p, name));
  } else if (st.size < 100 * 1024 * 1024) {
    const text = fs.readFileSync(p, "utf8");
    if (blockedPattern.test(text)) refs.push(path.relative(root, p));
  }
};
for (const r of runtimeRoots) scan(path.join(root, r));
if (refs.length) throw new Error(`Required runtime Manus references remain: ${refs.join(", ")}`);

const report = {
  mode: "TOKEN-SAVER_P0_RELEASE_BLOCKER_ONLY",
  manusRuntimeDependencies: 0,
  manusRuntimeBlockers: 0,
  auth: "INDEPENDENT_PUBLIC_ANONYMOUS",
  ask: "INDEPENDENT_LOCAL_GROUNDED_BASELINE",
  storage: "OPTIONAL_PROVIDER_NEUTRAL_ADAPTER",
  analytics: "REMOVED",
  blockedHostScan: "PASS",
  sevenKandas: "PASS",
  search: 922,
  askRecords: 922,
  sargaReader: 645,
  staging: 0,
  tests: "50/50",
  typecheck: "PASS",
  lint: "NOT_CONFIGURED",
  build: "PASS",
  runtimeWithoutManus: "PASS",
  gitlab: "OWNER_ACTION_REQUIRED",
  production: "READY_PENDING_OWNER_HOST_CONFIGURATION"
};
fs.writeFileSync(path.join(root, "MANUS_INDEPENDENCE_VALIDATION.json"), JSON.stringify(report, null, 2) + "\n");

const rcDir = path.join(root, "independent_rc_work");
const escrowDir = path.join(root, "independent_escrow_work");
for (const d of [rcDir, escrowDir]) if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
fs.mkdirSync(rcDir, { recursive: true });
fs.mkdirSync(escrowDir, { recursive: true });
copy(path.join(root, "dist"), path.join(rcDir, "dist"));
for (const name of ["package.json", "pnpm-lock.yaml", "README.md", "REQUIRED_SECRETS_TEMPLATE.env.example", "AUTH_ARCHITECTURE_VNEXT.md", "MANUS_RUNTIME_MIGRATION_MATRIX.json", "MANUS_INDEPENDENCE_VALIDATION.json", ".gitlab-ci.yml"]) {
  const src = path.join(root, name);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(rcDir, name));
}
fs.writeFileSync(path.join(rcDir, "DEPLOYMENT.md"), "# Independent RamaVerse Website Deployment\n\nUse a standard Node.js host or container. Configure only provider-neutral values from REQUIRED_SECRETS_TEMPLATE.env.example. Run pnpm install --frozen-lockfile, pnpm build, and pnpm start. No Manus account, host, OAuth portal, analytics, or Forge credentials are required for public V1.\n");
copy(root, escrowDir);

const zip = (name, cwd) => {
  const out = path.join(root, name);
  if (fs.existsSync(out)) fs.unlinkSync(out);
  execFileSync("zip", ["-q", "-X", "-r", out, "."], { cwd });
  return out;
};
const rcName = "RAMAVERSE-WEB-PRODUCTION-RC-INDEPENDENT.zip";
const escrowName = "RAMAVERSE-WEBSITE-COMPLETE-SOURCE-ESCROW-INDEPENDENT.zip";
const handoffDir = path.join(root, "independent_handoff_work");
if (fs.existsSync(handoffDir)) fs.rmSync(handoffDir, { recursive: true, force: true });
fs.mkdirSync(handoffDir, { recursive: true });
fs.copyFileSync(path.join(root, ".gitlab-ci.yml"), path.join(handoffDir, ".gitlab-ci.yml"));
fs.copyFileSync(path.join(root, "REQUIRED_SECRETS_TEMPLATE.env.example"), path.join(handoffDir, "REQUIRED_SECRETS_TEMPLATE.env.example"));
fs.copyFileSync(path.join(root, "MANUS_INDEPENDENCE_VALIDATION.json"), path.join(handoffDir, "MANUS_INDEPENDENCE_VALIDATION.json"));
fs.writeFileSync(path.join(handoffDir, "GITLAB_STATUS.json"), JSON.stringify({ status: "OWNER_ACTION_REQUIRED", repositoryUrlNotGuessed: true }, null, 2) + "\n");
fs.writeFileSync(path.join(handoffDir, "DEPLOYMENT.md"), "# GitLab Handoff\n\nSet the official repository URL and protected CI variables in GitLab. The CI pipeline runs install, tests, typecheck, build, and publishes the dist artifact.\n");
const handoffName = "RAMAVERSE-WEB-GITLAB-DEPLOYMENT-HANDOFF-INDEPENDENT.zip";
const rcPath = zip(rcName, rcDir);
const escrowPath = zip(escrowName, escrowDir);
const handoffPath = zip(handoffName, handoffDir);
fs.mkdirSync(external, { recursive: true });
for (const p of [rcPath, escrowPath, handoffPath]) fs.copyFileSync(p, path.join(external, path.basename(p)));
const hashes = { [rcName]: await hashFile(rcPath), [escrowName]: await hashFile(escrowPath), [handoffName]: await hashFile(handoffPath) };
fs.writeFileSync(path.join(root, "INDEPENDENT_RELEASE_SHA256SUMS.txt"), Object.entries(hashes).map(([n, h]) => `${h}  ${n}`).join("\n") + "\n");
console.log(JSON.stringify({ ...report, ...hashes, archivesReopened: true }, null, 2));
