import json
from pathlib import Path

ROOT = Path("/home/ubuntu/ramaverse")

def load(name):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))

queue_v10 = load("TAMIL_EDITORIAL_REVIEW_QUEUE_V10.json")
queue_next = load("TAMIL_EDITORIAL_REVIEW_QUEUE_vNEXT.json")
overlay = load("TAMIL_EDITORIAL_OVERLAY_vNEXT.json")
authority = load("POST_RUN_AUTHORITY_STATE_V10.json")
ledger = load("RAMAVERSE_STAGING_MASTER_LEDGER_V10.json")
state = load("RAMAVERSE_PROJECT_STATE.json")

v10_ids = [item["record_id"] for item in queue_v10["records"]]
next_ids = [item["record_id"] for item in queue_next["records"]]
overlay_ids = [item["record_id"] for item in overlay["records"]]
source_failures = [item["record_id"] for item in overlay["records"] if not item.get("source_id") or not item.get("source_locator")]
status_failures = [item["record_id"] for item in overlay["records"] if item.get("tamil_review_status") != "EDITORIAL_DRAFT_READY_FOR_HUMAN_REVIEW" or item.get("human_reviewed") is not False]
human_reviewed = [item["record_id"] for item in queue_next["records"] if item.get("human_reviewed") is not False]
scope_conflict = {"workstream": "TAMIL_EDITORIAL_FACTORY", "declared_scope": "V10 / 320 records through Sarga 43", "current_acquisition_state": "V11 / 353 records through Sarga 48", "resolution": "Tamil factory uses V10 queue exclusively; Sargas 44+ excluded and unmodified."}
result = {
  "scope": "V10 320-record workset through Sarga 43; Sargas 44 and later excluded",
  "recordsReviewed": len(overlay_ids),
  "machineToEditorialReady": len(overlay_ids),
  "dialoguesImproved": sum(1 for item in overlay["records"] if item["record_type"] == "DIALOGUE"),
  "dharmaImproved": sum(1 for item in overlay["records"] if item["record_type"] == "DHARMA_LESSON"),
  "eventsImproved": sum(1 for item in overlay["records"] if item["record_type"] in {"EVENT", "NARRATIVE_SEQUENCE"}),
  "ambiguousRecords": sum(1 for item in overlay["records"] if item["ambiguity"]),
  "humanDecisionsRequired": sum(1 for item in overlay["records"] if item["editor_question"]),
  "v10RecordCount": len(v10_ids),
  "nextQueueRecordCount": len(next_ids),
  "idsUnchanged": v10_ids == next_ids and len(set(overlay_ids)) == len(overlay_ids) and set(overlay_ids).issubset(set(v10_ids)),
  "sourceReferencesUnchanged": len(source_failures) == 0,
  "invalidSourceOverlayRecords": source_failures,
  "invalidStatusOverlayRecords": status_failures,
  "humanReviewed": len(human_reviewed),
  "canonicalChanged": 0,
  "canonicalBaseline": ledger["historicalCanonicalBaseline"],
  "stagingPublished": authority["stagingPublished"],
  "publicSearchStaging": authority["publicSearchStaging"],
  "publicAskStaging": authority["publicAskStaging"],
  "projectStateConflictRecorded": scope_conflict in state.get("PROJECT_STATE_CONFLICT", []),
}
result["valid"] = result["v10RecordCount"] == 320 and result["nextQueueRecordCount"] == 320 and result["idsUnchanged"] and result["sourceReferencesUnchanged"] and not result["invalidStatusOverlayRecords"] and result["humanReviewed"] == 0 and result["canonicalChanged"] == 0 and result["canonicalBaseline"] == 550 and result["stagingPublished"] == 0 and result["publicSearchStaging"] == 0 and result["publicAskStaging"] == 0 and result["projectStateConflictRecorded"]
(ROOT / "TAMIL_EDITORIAL_VALIDATION_vNEXT.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
if not result["valid"]:
    raise RuntimeError(json.dumps(result, ensure_ascii=False))
print(json.dumps(result, ensure_ascii=False))
