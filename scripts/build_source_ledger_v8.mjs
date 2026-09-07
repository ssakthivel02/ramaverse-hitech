import fs from "node:fs";
import path from "node:path";

const root="/home/ubuntu/ramaverse";
const ledger=JSON.parse(fs.readFileSync(path.join(root,"SOURCE_LEDGER_V7.json"),"utf8"));
ledger.ledgerId="ramaverse-master-source-ledger-v8";ledger.generatedAt=new Date().toISOString();
ledger.sources.push(
  {source_id:"src-valmiki-ayodhya-s27-stotranidhi",title:"Ayodhya Kanda Sarga 27",repository:"StotraNidhi",language:"Sanskrit IAST",sourceType:"PRIMARY_TEXT_DIGITAL_RENDITION",kanda:"Ayodhya Kanda",sarga:27,verse_range:"2.27.1–2.27.23",url:"https://stotranidhi.com/en/ayodhya-kanda-sarga-27-in-english/",accessedAt:"2026-08-19",rights_status:"External digital text; only original structured paraphrases are stored in staging.",tradition:"Valmiki",confidence:"high",caveat:"The Sarga's marital-duty language is retained only with historical-context safeguards."},
  {source_id:"src-valmiki-ayodhya-s27-vedapath-v24-crosscheck",title:"Valmiki Ramayana 2.27.24",repository:"Vedapath",language:"Sanskrit with English translation",sourceType:"SINGLE_VERSE_CROSSCHECK",kanda:"Ayodhya Kanda",sarga:27,verse_range:"2.27.24",url:"https://vedapath.app/en/ramayana/ayodhya-kanda/27/24",accessedAt:"2026-08-19",rights_status:"External reference; no continuous source text is reproduced in staging.",tradition:"Valmiki",confidence:"medium",caveat:"The verse supplies a close adjacent cross-check for Sita's forest-resolve dialogue sequence, which follows the accessible Sarga 27 chapter ending."}
);
fs.writeFileSync(path.join(root,"SOURCE_LEDGER_V8.json"),JSON.stringify(ledger,null,2)+"\n");console.log(JSON.stringify({sources:ledger.sources.length,added:2},null,2));
