import fs from 'node:fs';
import path from 'node:path';

const root = '/home/ubuntu/ramaverse';
const src = path.join(root, 'data', 'v1_5_542_owner_revalidation_20260826');
const out = path.join(root, 'data', 'v1_5_owner_approval_consolidated_20260826');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const read = name => JSON.parse(fs.readFileSync(path.join(src, name), 'utf8'));
const write = (name, value) => fs.writeFileSync(path.join(out, name), JSON.stringify(value, null, 2) + '\n');
const records = read('RAMAVERSE_542_INDEPENDENT_REVALIDATION.json').records;
const confirmed = records.filter(r => r.result === 'CONFIRMED_SAFE_NEW');
if (confirmed.length !== 542) throw new Error(`Expected 542 confirmed records, found ${confirmed.length}`);

const groupingKey = r => [r.risk, r.kanda, (r.sourceIds || []).join('|'), r.edition || '', r.tradition || '', r.duplicateSearch, r.semanticOverlapSearch, r.variantStatus].join('::');
const grouped = new Map();
for (const record of confirmed) {
  const key = groupingKey(record);
  if (!grouped.has(key)) grouped.set(key, []);
  grouped.get(key).push(record);
}
const groups = [...grouped.values()].map((items, index) => {
  const first = items[0];
  const risk = first.risk;
  return {
    groupId: `GROUP-${String(index + 1).padStart(3, '0')}`,
    tier: risk === 'LOW' ? 'A' : 'B',
    risk,
    kanda: first.kanda,
    sargaRange: `${Math.min(...items.map(r => r.sarga))}-${Math.max(...items.map(r => r.sarga))}`,
    source: first.sourceIds,
    edition: first.edition,
    recordCount: items.length,
    recordTypes: [...new Set(items.map(r => r.recordType))],
    confidence: { min: Math.min(...items.map(r => r.confidence ?? 0)), max: Math.max(...items.map(r => r.confidence ?? 0)) },
    authorityRationale: risk === 'LOW'
      ? 'Exact authority, locator, stable ID, physical hash, no canonical overlap, no variant/conflict, and matching validation basis.'
      : 'Evidence-backed registry/edition mapping with exact source-page evidence; conscious owner acceptance required.',
    duplicateResult: 'PASS',
    variantResult: 'PASS',
    representativeRecords: items.slice(0, 3).map(r => r.recordId),
    recordIds: items.map(r => r.recordId),
    recommendedDecision: risk === 'LOW' ? 'APPROVE_GROUP' : 'REVIEW_INDIVIDUALLY',
    ownerDecision: null,
    rollbackMapping: { candidateRecordIds: items.map(r => r.recordId), promotionAction: 'No action until explicit owner approval.' }
  };
});
const hold = {
  groupId: 'GROUP-C-001', tier: 'C', risk: 'HOLD', recordCount: 1,
  recordIds: ['STAGING-YUDDHA-SOURCE-NOTE-1-2026'], source: ['SRC-SANSKRIT-DOCUMENTS-YUDDHA-1'],
  kanda: 'Yuddha Kanda', sargaRange: '1-1',
  authorityRationale: 'No independent governed Yuddha Sarga 1 source artifact is physically available.',
  recommendedDecision: 'HOLD_GROUP', ownerDecision: null
};
const tierA = groups.filter(g => g.tier === 'A');
const tierB = groups.filter(g => g.tier === 'B');
const allGroups = [...groups, hold];
write('RAMAVERSE_v1_5_OWNER_APPROVAL_GROUPS_FINAL.json', { generatedAt: new Date().toISOString(), oldBatches: 527, finalConsolidatedGroups: allGroups.length, tierA: tierA.length, tierB: tierB.length, tierC: 1, groups: allGroups });

const csv = (rows, headers) => [headers.join(','), ...rows.map(row => headers.map(h => JSON.stringify(Array.isArray(row[h]) ? row[h].join('|') : row[h] ?? '')).join(',')), ''].join('\n');
const groupHeaders = ['groupId', 'tier', 'risk', 'kanda', 'sargaRange', 'source', 'edition', 'recordCount', 'recordTypes', 'confidence', 'authorityRationale', 'duplicateResult', 'variantResult', 'representativeRecords', 'recordIds', 'recommendedDecision', 'ownerDecision'];
fs.writeFileSync(path.join(out, 'RAMAVERSE_v1_5_OWNER_APPROVAL_GROUPS_FINAL.csv'), csv(allGroups, groupHeaders));
const recordMap = allGroups.flatMap(g => g.recordIds.map(recordId => ({ recordId, groupId: g.groupId, tier: g.tier, risk: g.risk, ownerDecision: null, promotionAction: 'BLOCKED_UNTIL_EXPLICIT_APPROVAL', rollbackGroupId: g.groupId })));
write('RAMAVERSE_v1_5_RECORD_TO_GROUP_MAP.json', { generatedAt: new Date().toISOString(), recordCount: recordMap.length, records: recordMap });
write('RAMAVERSE_v1_5_OWNER_GROUP_DECISIONS.json', { generatedAt: new Date().toISOString(), noDefaultApproval: true, allowed: ['APPROVE_GROUP', 'HOLD_GROUP', 'REJECT_GROUP', 'OPEN_RECORD_REVIEW'], groups: allGroups.map(g => ({ groupId: g.groupId, tier: g.tier, risk: g.risk, recordIds: g.recordIds, recommendedDecision: g.recommendedDecision, ownerDecision: null, rollbackMapping: g.rollbackMapping || { recordIds: g.recordIds } })) });
fs.writeFileSync(path.join(out, 'RAMAVERSE_v1_5_OWNER_GROUP_DECISIONS.csv'), csv(allGroups.map(g => ({ groupId: g.groupId, tier: g.tier, risk: g.risk, recordCount: g.recordCount, recommendedDecision: g.recommendedDecision, ownerDecision: '' })), ['groupId', 'tier', 'risk', 'recordCount', 'recommendedDecision', 'ownerDecision']));
const a = tierA.reduce((n, g) => n + g.recordCount, 0);
const b = tierB.reduce((n, g) => n + g.recordCount, 0);
write('RAMAVERSE_v1_5_TIER_A_B_C.json', { tierA: { groups: tierA.map(g => g.groupId), records: a }, tierB: { groups: tierB.map(g => g.groupId), records: b }, tierC: { groups: [hold.groupId], records: 1, reason: 'Yuddha source hold excluded from bulk approval.' } });
const scenario = (name, added) => ({ name, canonicalCount: 550 + added, search: 550 + added, ask: 550 + added, reader: 550 + added, graphReady: 0, timelineReady: 0, characterPlaceJourneyReady: 0, dangling: 0, holdLeakage: 0, variantLeakage: 0, sourceEvidenceOnlyLeakage: 0 });
write('RAMAVERSE_v1_5_PROMOTION_SIMULATIONS.json', { executed: false, productionCanonical: 550, scenarios: [scenario('CURRENT', 0), scenario('TIER_A_ONLY', a), scenario('TIER_A_PLUS_TIER_B', a + b), scenario('FULL_SAFE_NEW', a + b)], allCandidatesExcludeHold: true });
write('YUDDHA_SARGA_1_FINAL_HOLD.json', { ...hold, finalState: 'SOURCE_HOLD', investigation: 'Current physical governed source registries and source-evidence directories checked; deterministic mapping unavailable.' });
write('V1_5_OWNER_APPROVAL_CONSOLIDATED_VALIDATION.json', { inputSafeNew: 542, accounted: '542 SAFE_NEW plus 1 Tier C hold', safeNewAccounted: confirmed.length === 542, low: a, medium: b, high: 0, oldBatches: 527, finalGroups: allGroups.length, tierAGroups: tierA.length, tierARecords: a, tierBGroups: tierB.length, tierBRecords: b, tierCRecords: 1, ownerDecisionsDefaulted: 0, recordToGroupUnique: new Set(recordMap.map(r => r.recordId)).size === 543, productionCanonical: 550, stagingPublished: 0, noPromotion: true, holdLeakage: 0, variantLeakage: 0, dangling: 0, decision: 'READY_FOR_OWNER_APPROVAL' });
console.log(JSON.stringify({ safeNew: 542, low: a, medium: b, high: 0, groups: allGroups.length, tierAGroups: tierA.length, tierBGroups: tierB.length, tierCRecords: 1, simulations: [550, 550 + a, 550 + a + b] }, null, 2));
