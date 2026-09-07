import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/ramaverse";
const directory = path.join(root, "data/staging/post_v1");
const files = ["data/staging/physical/STAGING_RECORDS.json", ...fs.readdirSync(directory).filter((name) => /^AYODHYA_S\d+_SOURCE_BACKED_RECORDS\.json$/.test(name)).sort((a, b) => Number(a.match(/S(\d+)/)[1]) - Number(b.match(/S(\d+)/)[1])).map((name) => `data/staging/post_v1/${name}`)];
const changes = [];
for (const relative of files) {
  const absolute = path.join(root, relative);
  const parsed = JSON.parse(fs.readFileSync(absolute, "utf8"));
  const records = Array.isArray(parsed) ? parsed : parsed.records;
  let changed = 0;
  for (const record of records) {
    if (!record.publication_policy) { record.publication_policy = "STAGING_QUARANTINE_ONLY"; changed += 1; }
  }
  if (changed) fs.writeFileSync(absolute, JSON.stringify(parsed, null, 2) + "\n");
  changes.push({ path: relative, records: records.length, normalizedPublicationPolicies: changed });
}
console.log(JSON.stringify({ policy: "STAGING_QUARANTINE_ONLY", changes, totalNormalized: changes.reduce((sum, change) => sum + change.normalizedPublicationPolicies, 0) }, null, 2));
