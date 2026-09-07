import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root='/home/ubuntu/ramaverse';
const physicalPath='RAMAVERSE_STAGING_MASTER_LEDGER_RECONCILED.json';
const physical=JSON.parse(fs.readFileSync(path.join(root,physicalPath))); const records=physical.records||[];
const norm=x=>{const c=JSON.parse(JSON.stringify(x)); for(const k of ['createdAt','updatedAt','timestamp','ingestedAt','generatedAt'])delete c[k]; return c;};
const digest=x=>crypto.createHash('sha256').update(JSON.stringify(norm(x))).digest('hex');
const groups=new Map(); records.forEach((record,index)=>{const id=record.recordId??null;if(!groups.has(id))groups.set(id,[]);groups.get(id).push({record,index});});
const duplicateGroups=[...groups.entries()].filter(([,v])=>v.length>1);
const same=(a,b)=>JSON.stringify(norm(a))===JSON.stringify(norm(b));
const decisions=[]; const logical=[]; const quarantined=[];
for(const [id,items] of [...groups.entries()].sort((a,b)=>String(a[0]).localeCompare(String(b[0])))){
 const duplicate=items.length>1; let decision=null;
 if(id===null) decision=duplicate?'CORRUPT_OCCURRENCE_QUARANTINE':null;
 else if(duplicate && items.every(x=>same(x.record,items[0].record))) decision='SAFE_COLLAPSE_IDENTICAL';
 else if(duplicate) decision='EDITOR_REQUIRED';
 if(decision){const base=items[0];const entry={groupId:id,decision,occurrenceCount:items.length,duplicateOccurrences:Math.max(0,items.length-1),physicalEvidence:items.map(x=>({filePath:physicalPath,recordIndex:x.index,recordId:x.record.recordId??null,occurrenceHash:digest(x.record),sourceIds:x.record.sourceIds??[],sourceLocator:x.record.sourceLocator??x.record.verseLocator??null,kanda:x.record.kanda??null,sarga:x.record.sarga??null,recordType:x.record.recordType??x.record.type??null,publicationState:x.record.publicationState??x.record.publication_state??null})),preservation:'RETAINED'}; decisions.push(entry); if(id===null) quarantined.push({...entry,quarantineReason:'No deterministic governed record identity can be recovered from null recordId occurrences'}); else logical.push({...base.record,__logicalAuthority:{retainedPhysicalRecordIndex:base.index,duplicateDecision:decision,physicalOccurrenceCount:items.length,physicalOccurrenceIndices:items.map(x=>x.index)}});
 } else logical.push({...items[0].record,__logicalAuthority:{retainedPhysicalRecordIndex:items[0].index,duplicateDecision:'NO_DUPLICATE',physicalOccurrenceCount:1,physicalOccurrenceIndices:[items[0].index]}});
}
const counts={safeCollapseGroups:decisions.filter(x=>x.decision==='SAFE_COLLAPSE_IDENTICAL').length,recoveredIdGroups:decisions.filter(x=>x.decision==='RECOVER_ID_FROM_PHYSICAL_EVIDENCE').length,quarantinedGroups:decisions.filter(x=>x.decision==='CORRUPT_OCCURRENCE_QUARANTINE').length,variantGroups:decisions.filter(x=>x.decision==='VARIANT_PRESERVE').length,conflictGroups:decisions.filter(x=>x.decision==='CONFLICT_HOLD').length,editorRequiredGroups:decisions.filter(x=>x.decision==='EDITOR_REQUIRED').length,logicalDuplicateIdsAfterResolution:0};
const out={version:'1.0.0-inherited-duplicate-authority-resolution',generatedAt:new Date().toISOString(),sourcePhysicalLedger:physicalPath,policy:'Non-destructive logical reconciliation. No physical records deleted or overwritten.',canonicalBaseline:550,stagingPublished:0,physicalRecordOccurrences:records.length,duplicateIdGroups:duplicateGroups.length,duplicateOccurrences:duplicateGroups.reduce((n,[,v])=>n+v.length-1,0),...counts,logicalRecordCount:logical.length,logicalRecords:logical,quarantinedCorruptOccurrences:quarantined,variantHolds:decisions.filter(x=>x.decision==='VARIANT_PRESERVE'),conflictHolds:decisions.filter(x=>x.decision==='CONFLICT_HOLD'),editorRequired:decisions.filter(x=>x.decision==='EDITOR_REQUIRED'),allDuplicateGroups:decisions};
const dir=path.join(root,'data','authority_duplicate_resolution_20260826');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'RAMAVERSE_STAGING_DEDUP_LOGICAL_LEDGER.json'),JSON.stringify(out,null,2)+'\n');fs.writeFileSync(path.join(dir,'RAMAVERSE_STAGING_DEDUP_DECISION_LEDGER.json'),JSON.stringify({generatedAt:out.generatedAt,physicalRecordOccurrences:records.length,duplicateIdGroups:duplicateGroups.length,duplicateOccurrences:out.duplicateOccurrences,...counts,decisions},null,2)+'\n');console.log(JSON.stringify({physical:records.length,groups:duplicateGroups.length,occurrences:out.duplicateOccurrences,logical:logical.length,quarantined:quarantined.length,...counts},null,2));
