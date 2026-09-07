import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/ramaverse";
const batches = ["AYODHYA_S21_SOURCE_BACKED_RECORDS.json", "AYODHYA_S22_SOURCE_BACKED_RECORDS.json", "AYODHYA_S23_SOURCE_BACKED_RECORDS.json", "AYODHYA_S24_SOURCE_BACKED_RECORDS.json"]
  .map((name) => JSON.parse(fs.readFileSync(path.join(root, "data/staging/post_v1", name), "utf8")));
const records = batches.flatMap((batch) => batch.records);
const editorialIndex = {
  indexId:"ramaverse-post-v1-editorial-index-v5", generatedAt:new Date().toISOString(), visibility:"EDITORIAL_ONLY", publicSearchStaging:0, publicAskStaging:0,
  entries:records.map((record)=>({id:record.candidate_id,type:record.record_type,kanda:record.kanda,sarga:record.sarga,verseLocator:record.verse_locator,sourceId:record.source_id,contentSafety:record.content_safety??"STANDARD_SOURCE_REVIEW",editionVariance:record.edition_variance??null,reconciliationClassification:record.reconciliation_classification,previewText:record.english_explanation??record.faithful_paraphrase}))
};
const graph = {
  graphId:"ramaverse-post-v1-staging-knowledge-graph-v5",generatedAt:new Date().toISOString(),visibility:"EDITORIAL_ONLY",
  nodes:records.map((record)=>({id:record.candidate_id,label:record.record_type,type:record.record_type})),
  edges:[
    {from:"stg-postv1-ayodhyakanda-s21-event-001",to:"stg-postv1-ayodhyakanda-s21-dialogue-001",relation:"expressed_in"},
    {from:"stg-postv1-ayodhyakanda-s22-event-001",to:"stg-postv1-ayodhyakanda-s22-dialogue-001",relation:"expressed_in"},
    {from:"stg-postv1-ayodhyakanda-s23-event-001",to:"stg-postv1-ayodhyakanda-s23-dialogue-001",relation:"expressed_in"},
    {from:"stg-postv1-ayodhyakanda-s23-dialogue-004",to:"stg-postv1-ayodhyakanda-s23-dharma-001",relation:"grounds"},
    {from:"stg-postv1-ayodhyakanda-s24-event-001",to:"stg-postv1-ayodhyakanda-s24-dialogue-001",relation:"expressed_in"},
    {from:"stg-postv1-ayodhyakanda-s24-dialogue-003",to:"stg-postv1-ayodhyakanda-s24-dharma-001",relation:"grounds"},
    {from:"stg-postv1-ayodhyakanda-s24-historical-norm-001",to:"stg-postv1-ayodhyakanda-s24-dialogue-002",relation:"historical_context_for"},
    {from:"stg-postv1-ayodhyakanda-s24-event-002",to:"stg-postv1-ayodhyakanda-s24-sarga-001",relation:"within"}
  ]
};
fs.writeFileSync(path.join(root,"POST_V1_EDITORIAL_INDEX_V5.json"),JSON.stringify(editorialIndex,null,2)+"\n");
fs.writeFileSync(path.join(root,"POST_V1_STAGING_KNOWLEDGE_GRAPH_V5.json"),JSON.stringify(graph,null,2)+"\n");
console.log(JSON.stringify({editorialEntries:editorialIndex.entries.length,graphNodes:graph.nodes.length,graphEdges:graph.edges.length,publicSearchStaging:0,publicAskStaging:0},null,2));
