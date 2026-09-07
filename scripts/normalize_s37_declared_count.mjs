import fs from "node:fs";
const file = "/home/ubuntu/ramaverse/data/staging/post_v1/AYODHYA_S37_SOURCE_BACKED_RECORDS.json";
const payload = JSON.parse(fs.readFileSync(file, "utf8"));
payload.recordCount = payload.records.length;
fs.writeFileSync(file, JSON.stringify(payload, null, 2) + "\n");
console.log(JSON.stringify({ declared: payload.recordCount, actual: payload.records.length }));
