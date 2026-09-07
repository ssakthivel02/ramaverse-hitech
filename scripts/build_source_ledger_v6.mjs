import fs from "node:fs";
import path from "node:path";

const root="/home/ubuntu/ramaverse";
const ledger=JSON.parse(fs.readFileSync(path.join(root,"SOURCE_LEDGER_V5.json"),"utf8"));
ledger.ledgerId="ramaverse-master-source-ledger-v6";ledger.generatedAt=new Date().toISOString();
ledger.sources.push(
  {source_id:"src-valmiki-ayodhya-s25-sanskritdocuments",title:"Valmiki Ramayana — Ayodhya Kanda — Sarga 25",repository:"SanskritDocuments.org",edition_or_recension:"Traditional digital Sanskrit rendition with English word-for-word translation",language:"Sanskrit with English translation",sourceType:"PRIMARY_TEXT_DIGITAL_RENDITION",kanda:"Ayodhya Kanda",sarga:25,verse_range:"2.25.1–2.25.47",url:"https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga25/ayodhyaitrans25.htm",accessedAt:"2026-08-19",rights_status:"External digital text; only short excerpts and original structured paraphrases are stored in staging.",tradition:"Valmiki",confidence:"high",caveat:"Section-specific digital source locator; a second IAST rendering corroborates the full chapter sequence."},
  {source_id:"src-valmiki-ayodhya-s25-stotranidhi-crosscheck",title:"Ayodhya Kanda Sarga 25",repository:"StotraNidhi",language:"Sanskrit IAST",sourceType:"PRIMARY_TEXT_DIGITAL_CROSSCHECK",kanda:"Ayodhya Kanda",sarga:25,verse_range:"2.25.1–2.25.47",url:"https://stotranidhi.com/en/ayodhya-kanda-sarga-25-in-english/",accessedAt:"2026-08-19",rights_status:"External reference; no continuous source text is reproduced in staging.",tradition:"Valmiki",confidence:"high",caveat:"Used to independently cross-check the Sarga's verse range and narrative sequence."},
  {source_id:"src-valmiki-ayodhya-s25-vedapath-v26-crosscheck",title:"Valmiki Ramayana 2.25.26",repository:"Vedapath",language:"Sanskrit with English translation",sourceType:"SINGLE_VERSE_CROSSCHECK",kanda:"Ayodhya Kanda",sarga:25,verse_range:"2.25.26",url:"https://vedapath.app/en/ramayana/ayodhya-kanda/25/26",accessedAt:"2026-08-19",rights_status:"External reference; no continuous source text is reproduced in staging.",tradition:"Valmiki",confidence:"medium",caveat:"Used to confirm the ritual-worship description at verse 2.25.26."}
);
fs.writeFileSync(path.join(root,"SOURCE_LEDGER_V6.json"),JSON.stringify(ledger,null,2)+"\n");console.log(JSON.stringify({sources:ledger.sources.length,added:3},null,2));
