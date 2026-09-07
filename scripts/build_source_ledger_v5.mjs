import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/ramaverse";
const ledger = JSON.parse(fs.readFileSync(path.join(root, "SOURCE_LEDGER_V4.json"), "utf8"));
ledger.ledgerId = "ramaverse-master-source-ledger-v5";
ledger.generatedAt = new Date().toISOString();
ledger.sources.push(
  {
    source_id:"src-valmiki-ayodhya-s24-sanskritdocuments", title:"Valmiki Ramayana — Ayodhya Kanda — Sarga 24", repository:"SanskritDocuments.org", edition_or_recension:"Traditional digital Sanskrit rendition with English word-for-word translation", language:"Sanskrit with English translation", sourceType:"PRIMARY_TEXT_DIGITAL_RENDITION", kanda:"Ayodhya Kanda", sarga:24, verse_range:"2.24.1–2.24.38", url:"https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga24/ayodhyaroman24.htm", accessedAt:"2026-08-19", rights_status:"External digital text; only short excerpts and original structured paraphrases are stored in staging.", tradition:"Valmiki", confidence:"high", caveat:"Section-specific digital locator; an independent page labels a different total shloka count while displaying locators through 2.24.38."
  },
  {
    source_id:"src-valmiki-ayodhya-s24-ramayanainfo-crosscheck", title:"Ayodhya Kanda — Sarga 24", repository:"Ramayana.info", language:"Sanskrit with English translation", sourceType:"PRIMARY_TEXT_DIGITAL_CROSSCHECK", kanda:"Ayodhya Kanda", sarga:24, verse_range:"2.24.1–2.24.38", url:"https://ramayana.info/story/ayodhya/24/", accessedAt:"2026-08-19", rights_status:"External reference; no continuous source text is reproduced in staging.", tradition:"Valmiki", confidence:"medium", caveat:"The page labels 36 shlokas but displays locators through verse 38; retained as an edition-variance flag."
  }
);
fs.writeFileSync(path.join(root,"SOURCE_LEDGER_V5.json"),JSON.stringify(ledger,null,2)+"\n");
console.log(JSON.stringify({sources:ledger.sources.length,added:2},null,2));
