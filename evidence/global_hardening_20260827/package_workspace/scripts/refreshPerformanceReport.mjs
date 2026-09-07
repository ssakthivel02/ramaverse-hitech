import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = process.cwd();
const assetsDir = path.join(root, "dist", "public", "assets");
const assetFiles = fs.readdirSync(assetsDir).filter((file) => file.endsWith(".js"));
const measure = (file) => {
  const data = fs.readFileSync(path.join(assetsDir, file));
  return { file, bytes: data.length, gzipBytes: zlib.gzipSync(data).length };
};
const assets = assetFiles.map(measure).sort((a, b) => b.bytes - a.bytes);
const entry = assets.find((asset) => asset.file.startsWith("index-"));
const routeChunks = assets.filter((asset) => /^(SargaReader|ReconciliationWorkbench|RamaLife|Kandas|Search|Characters|Journey|Timeline|KnowledgeGraph)-/.test(asset.file));
const kb = (bytes) => `${(bytes / 1000).toFixed(2)} kB`;
const markdown = `# Performance Report\n\nGenerated: ${new Date().toISOString()}\n\n| Metric | Before route splitting | Current build | Change |\n|---|---:|---:|---:|\n| Initial JavaScript entry | 930.39 kB | ${entry ? kb(entry.bytes) : "Unavailable"} | ${entry ? `${(930.39 - entry.bytes / 1000).toFixed(2)} kB lower` : "Unavailable"} |\n| Initial JavaScript gzip | 239.90 kB | ${entry ? kb(entry.gzipBytes) : "Unavailable"} | ${entry ? `${(239.90 - entry.gzipBytes / 1000).toFixed(2)} kB lower` : "Unavailable"} |\n| Deferred route chunks | 0 | ${routeChunks.length} | Route-level loading enabled |\n\n## Deferred exploration chunks\n\n${routeChunks.map((asset) => `- \`${asset.file}\`: ${kb(asset.bytes)} raw / ${kb(asset.gzipBytes)} gzip`).join("\n") || "No measured route chunks."}\n\n## Offline safeguard\n\nThe service worker caches only the shell and same-origin GET responses. It bypasses API requests, reconciliation routes, and any staging-named path, preventing staging from being cached or represented as offline canonical content.\n\n> The entry bundle remains above the build tool advisory threshold. Route-level splitting reduced initial delivery; further manual vendor chunking should follow real route-usage measurement rather than speculative splitting.\n`;
fs.writeFileSync(path.join(root, "PERFORMANCE_REPORT.md"), markdown, "utf8");
console.log("Wrote PERFORMANCE_REPORT.md");
