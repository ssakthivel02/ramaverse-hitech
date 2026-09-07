import fs from "node:fs";
import path from "node:path";

const file = "/home/ubuntu/ramaverse/data/staging/physical/STAGING_RECORDS.json";
const records = JSON.parse(fs.readFileSync(file, "utf8"));
let changed = 0;
for (const record of records) {
  const reference = String(record.sarga_reference ?? "");
  const sargas = [...reference.matchAll(/2\.(\d+)/g)].map((match) => Number(match[1]));
  const before = JSON.stringify(record);
  if (record.sarga === undefined && sargas.length) record.sarga = sargas.length === 1 ? sargas[0] : `${sargas[0]}–${sargas.at(-1)}`;
  if (!record.verse_locator && reference) record.verse_locator = reference;
  if (!record.source_locator && record.canonical_source_locator) record.source_locator = record.canonical_source_locator;
  if (!record.source_id && Array.isArray(record.source) && record.source[0]) record.source_id = record.source[0];
  if (!record.tamil_review_status) record.tamil_review_status = "MACHINE_DRAFT_NEEDS_REVIEW";
  if (!record.edition_or_recension) record.edition_or_recension = "Legacy staging provenance; edition/recension reconciliation pending.";
  if (JSON.stringify(record) !== before) changed += 1;
}
fs.writeFileSync(file, JSON.stringify(records, null, 2) + "\n");
console.log(JSON.stringify({ file, records: records.length, normalizedRecords: changed, policy: "Metadata aliases derived from existing staging fields only" }, null, 2));
