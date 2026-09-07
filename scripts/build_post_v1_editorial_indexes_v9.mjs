import fs from "node:fs";
import path from "node:path";

const root="/home/ubuntu/ramaverse";
const batches=[21,22,23,24,25,26,27,28].map(s=>JSON.parse(fs.readFileSync(path.join(root,"data/staging/post_v1",`AYODHYA_S${s}_SOURCE_BACKED_RECORDS.json`),"utf8")));
const records=batches.flatMap(batch=>batch.records);
const index={indexId:"ramaverse-post-v1-editorial-index-v9",generatedAt:new Date().toISOString(),visibility:"EDITORIAL_ONLY",publicSearchStaging:0,publicAskStaging:0,entries:records.map(record=>({id:record.candidate_id,type:record.record_type,kanda:record.kanda,sarga:record.sarga,verseLocator:record.verse_locator,sourceId:record.source_id,contentSafety:record.content_safety??"STANDARD_SOURCE_REVIEW",reconciliationClassification:record.reconciliation_classification,previewText:record.english_explanation??record.faithful_paraphrase}))};
const graph={graphId:"ramaverse-post-v1-staging-knowledge-graph-v9",generatedAt:new Date().toISOString(),visibility:"EDITORIAL_ONLY",nodes:records.map(record=>({id:record.candidate_id,label:record.record_type,type:record.record_type})),edges:[
  {from:"stg-postv1-ayodhyakanda-s27-event-001",to:"stg-postv1-ayodhyakanda-s28-event-001",relation:"narrative_sequence_after"},
  {from:"stg-postv1-ayodhyakanda-s28-sarga-001",to:"stg-postv1-ayodhyakanda-s28-event-001",relation:"contains"},
  {from:"stg-postv1-ayodhyakanda-s28-dialogue-001",to:"stg-postv1-ayodhyakanda-s28-event-001",relation:"expressed_in"},
  {from:"stg-postv1-ayodhyakanda-s28-historical-context-001",to:"stg-postv1-ayodhyakanda-s28-verse-section-003",relation:"contextualizes"},
  {from:"stg-postv1-ayodhyakanda-s28-relationship-001",to:"stg-postv1-ayodhyakanda-s28-dialogue-001",relation:"source_bound_context"}
]};
fs.writeFileSync(path.join(root,"POST_V1_EDITORIAL_INDEX_V9.json"),JSON.stringify(index,null,2)+"\n");fs.writeFileSync(path.join(root,"POST_V1_STAGING_KNOWLEDGE_GRAPH_V9.json"),JSON.stringify(graph,null,2)+"\n");console.log(JSON.stringify({editorialEntries:index.entries.length,graphNodes:graph.nodes.length,graphEdges:graph.edges.length,publicSearchStaging:0,publicAskStaging:0},null,2));
