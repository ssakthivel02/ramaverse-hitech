import fs from "node:fs";
import path from "node:path";

const file = path.join("/home/ubuntu/ramaverse", "data/staging/post_v1/AYODHYA_S25_SOURCE_BACKED_RECORDS.json");
const batch = JSON.parse(fs.readFileSync(file, "utf8"));
batch.recordCount = batch.records.length;
fs.writeFileSync(file, JSON.stringify(batch, null, 2) + "\n");
console.log(JSON.stringify({ declaredRecordCount: batch.recordCount, actualRecordCount: batch.records.length }, null, 2));
