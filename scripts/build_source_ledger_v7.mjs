import fs from "node:fs";
import path from "node:path";

const root="/home/ubuntu/ramaverse";
const ledger=JSON.parse(fs.readFileSync(path.join(root,"SOURCE_LEDGER_V6.json"),"utf8"));
ledger.ledgerId="ramaverse-master-source-ledger-v7";ledger.generatedAt=new Date().toISOString();
ledger.sources.push(
  {source_id:"src-valmiki-ayodhya-s26-sanskritdocuments",title:"Valmiki Ramayana — Ayodhya Kanda — Sarga 26",repository:"SanskritDocuments.org",edition_or_recension:"Traditional digital Sanskrit rendition with English word-for-word translation",language:"Sanskrit with English translation",sourceType:"PRIMARY_TEXT_DIGITAL_RENDITION",kanda:"Ayodhya Kanda",sarga:26,verse_range:"2.26.1–2.26.38",url:"https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga26/ayodhyaitrans26.htm",accessedAt:"2026-08-19",rights_status:"External digital text; only short excerpts and original structured paraphrases are stored in staging.",tradition:"Valmiki",confidence:"high",caveat:"Section-specific source locator; courtly and gendered directions are retained with historical-context safeguards."},
  {source_id:"src-valmiki-ayodhya-s26-vedapath-v14-crosscheck",title:"Valmiki Ramayana 2.26.14",repository:"Vedapath",language:"Sanskrit with English translation",sourceType:"SINGLE_VERSE_CROSSCHECK",kanda:"Ayodhya Kanda",sarga:26,verse_range:"2.26.14",url:"https://vedapath.app/en/ramayana/ayodhya-kanda/26/14",accessedAt:"2026-08-19",rights_status:"External reference; no continuous source text is reproduced in staging.",tradition:"Valmiki",confidence:"medium",caveat:"Used to independently corroborate Sita's civic-procession question."}
);
fs.writeFileSync(path.join(root,"SOURCE_LEDGER_V7.json"),JSON.stringify(ledger,null,2)+"\n");console.log(JSON.stringify({sources:ledger.sources.length,added:2},null,2));
