import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/ramaverse";
const ledger = JSON.parse(fs.readFileSync(path.join(root, "SOURCE_LEDGER_V3.json"), "utf8"));
ledger.ledgerId = "ramaverse-master-source-ledger-v4";
ledger.generatedAt = new Date().toISOString();
ledger.sources.push(
  {
    source_id: "src-valmiki-ayodhya-s23-sanskritdocuments",
    title: "Valmiki Ramayana — Ayodhya Kanda — Sarga 23",
    repository: "SanskritDocuments.org",
    edition_or_recension: "Traditional digital Sanskrit rendition with English word-for-word translation",
    language: "Sanskrit with English translation",
    sourceType: "PRIMARY_TEXT_DIGITAL_RENDITION",
    kanda: "Ayodhya Kanda",
    sarga: 23,
    verse_range: "2.23.1–2.23.41",
    url: "https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga23/ayodhyaitrans23.htm",
    accessedAt: "2026-08-19",
    rights_status: "External digital text; only short excerpts and original structured paraphrases are stored in staging.",
    tradition: "Valmiki",
    confidence: "high",
    caveat: "Section-specific digital source locator; not represented as a critical edition."
  },
  {
    source_id: "src-valmiki-ayodhya-s23-prose-crosscheck",
    title: "Valmiki Ramayana — Ayodhya Kanda — Sarga 23 prose presentation",
    repository: "SanskritDocuments.org",
    language: "English prose",
    sourceType: "NARRATIVE_SEQUENCE_CROSSCHECK",
    kanda: "Ayodhya Kanda",
    sarga: 23,
    verse_range: "2.23.1–2.23.41",
    url: "https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga23/ayodhya_23_prose.htm",
    accessedAt: "2026-08-19",
    rights_status: "External reference; no continuous source text is reproduced in staging.",
    tradition: "Valmiki",
    confidence: "medium",
    caveat: "Used only to corroborate narrative sequence."
  },
  {
    source_id: "src-valmiki-ayodhya-s23-vedapath-v41-crosscheck",
    title: "Valmiki Ramayana 2.23.41",
    repository: "Vedapath",
    language: "Sanskrit with English translation",
    sourceType: "SINGLE_VERSE_CROSSCHECK",
    kanda: "Ayodhya Kanda",
    sarga: 23,
    verse_range: "2.23.41",
    url: "https://vedapath.app/en/ramayana/ayodhya-kanda/23/41",
    accessedAt: "2026-08-19",
    rights_status: "External reference; no continuous source text is reproduced in staging.",
    tradition: "Valmiki",
    confidence: "medium",
    caveat: "Used to confirm the closing verse locator and Rama's response."
  }
);
fs.writeFileSync(path.join(root, "SOURCE_LEDGER_V4.json"), JSON.stringify(ledger, null, 2) + "\n");
console.log(JSON.stringify({ sources: ledger.sources.length, added: 3 }, null, 2));
