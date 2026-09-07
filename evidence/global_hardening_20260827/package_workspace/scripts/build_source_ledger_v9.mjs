import fs from "node:fs";
import path from "node:path";

const root="/home/ubuntu/ramaverse";
const ledger=JSON.parse(fs.readFileSync(path.join(root,"SOURCE_LEDGER_V8.json"),"utf8"));
ledger.ledgerId="ramaverse-master-source-ledger-v9";ledger.generatedAt=new Date().toISOString();
ledger.sources.push(
  {source_id:"src-valmiki-ayodhya-s28-sanskritdocuments",title:"Valmiki Ramayana — Ayodhya Kanda — Sarga 28",repository:"SanskritDocuments.org",language:"Sanskrit with English translation",sourceType:"PRIMARY_TEXT_DIGITAL_RENDITION",kanda:"Ayodhya Kanda",sarga:28,verse_range:"2.28.1–2.28.26",url:"https://sanskritdocuments.org/sites/valmikiramayan/ayodhya/sarga28/ayodhyaroman28.htm",accessedAt:"2026-08-19",rights_status:"External digital text; only original structured paraphrases are stored in staging.",tradition:"Valmiki",confidence:"high",caveat:"Forest risk, ascetic, and ritual material is retained only with non-instructional context safeguards."},
  {source_id:"src-valmiki-ayodhya-s28-stotranidhi-crosscheck",title:"Ayodhya Kanda Sarga 28",repository:"StotraNidhi",language:"Sanskrit IAST",sourceType:"PRIMARY_TEXT_DIGITAL_CROSSCHECK",kanda:"Ayodhya Kanda",sarga:28,verse_range:"2.28.1–2.28.26",url:"https://stotranidhi.com/en/ayodhya-kanda-sarga-28-in-english/",accessedAt:"2026-08-19",rights_status:"External reference; no continuous source text is reproduced in staging.",tradition:"Valmiki",confidence:"high",caveat:"Used to independently corroborate the Sarga's full verse range."},
  {source_id:"src-valmiki-ayodhya-s28-vedapath-v7-crosscheck",title:"Valmiki Ramayana 2.28.7",repository:"Vedapath",language:"Sanskrit with English translation",sourceType:"SINGLE_VERSE_CROSSCHECK",kanda:"Ayodhya Kanda",sarga:28,verse_range:"2.28.7",url:"https://vedapath.app/en/ramayana/ayodhya-kanda/28/7",accessedAt:"2026-08-19",rights_status:"External reference; no continuous source text is reproduced in staging.",tradition:"Valmiki",confidence:"medium",caveat:"Used to independently corroborate the forest-hardship argument."}
);
fs.writeFileSync(path.join(root,"SOURCE_LEDGER_V9.json"),JSON.stringify(ledger,null,2)+"\n");console.log(JSON.stringify({sources:ledger.sources.length,added:3},null,2));
