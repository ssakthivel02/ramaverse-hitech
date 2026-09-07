import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/ramaverse";
const ledger = JSON.parse(fs.readFileSync(path.join(root, "SOURCE_LEDGER_V2.json"), "utf8"));
ledger.ledgerId = "ramaverse-master-source-ledger-v3";
ledger.generatedAt = new Date().toISOString();
ledger.sources.push(
  {
    source_id: "src-valmiki-ayodhya-s22-sanskritdocuments",
    title: "Valmiki Ramayana — Ayodhya Kanda — Sarga 22",
    repository: "SanskritDocuments.org",
    edition_or_recension: "Traditional digital Sanskrit recension with English word-for-word translation",
    language: "Sanskrit with English translation",
    sourceType: "PRIMARY_TEXT_DIGITAL_RENDITION",
    kanda: "Ayodhya Kanda",
    sarga: 22,
    verse_range: "2.22.1–2.22.30",
    url: "https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga22/ayodhyaroman22.htm",
    accessedAt: "2026-08-19",
    rights_status: "External digital text; only short excerpts and original structured paraphrases are stored in staging.",
    tradition: "Valmiki",
    confidence: "high",
    caveat: "Section-specific digital source locator; not represented as a critical edition."
  },
  {
    source_id: "src-valmiki-ayodhya-s22-stotranidhi-crosscheck",
    title: "Ayodhya Kanda Sarga 22 — IAST text cross-check",
    repository: "Stotra Nidhi",
    edition_or_recension: "Traditional digital IAST text presentation",
    language: "Sanskrit (IAST)",
    sourceType: "PRIMARY_TEXT_DIGITAL_CROSSCHECK",
    kanda: "Ayodhya Kanda",
    sarga: 22,
    verse_range: "2.22.1–2.22.30",
    url: "https://stotranidhi.com/en/ayodhya-kanda-sarga-22-in-english/",
    accessedAt: "2026-08-19",
    rights_status: "External reference; no continuous source text is reproduced in staging.",
    tradition: "Valmiki",
    confidence: "medium",
    caveat: "Used only to corroborate chapter identity and traditional-text continuity."
  }
);

fs.writeFileSync(path.join(root, "SOURCE_LEDGER_V3.json"), JSON.stringify(ledger, null, 2) + "\n");
console.log(JSON.stringify({ sources: ledger.sources.length, added: 2 }, null, 2));
