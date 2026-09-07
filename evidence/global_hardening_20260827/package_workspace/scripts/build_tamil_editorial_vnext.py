import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/home/ubuntu/ramaverse")
POST = ROOT / "data/staging/post_v1"

def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))

def dump(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

queue = load(ROOT / "TAMIL_EDITORIAL_REVIEW_QUEUE_V10.json")
if len(queue["records"]) != 320:
    raise RuntimeError(f"Expected V10 editorial scope of 320 records, found {len(queue['records'])}")

record_map = {record["candidate_id"]: record for record in load(ROOT / "data/staging/physical/STAGING_RECORDS.json")}
for path in sorted(POST.glob("AYODHYA_S*_SOURCE_BACKED_RECORDS.json")):
    m = re.search(r"S(\d+)_", path.name)
    if m and int(m.group(1)) <= 43:
        for record in load(path)["records"]:
            record_map[record["candidate_id"]] = record

workset_ids = [item["record_id"] for item in queue["records"]]
missing = [record_id for record_id in workset_ids if record_id not in record_map]
if missing:
    raise RuntimeError(f"V10 queue IDs missing from V10 physical workset: {missing[:8]}")

machine_items = [item for item in queue["records"] if item["translation_status"] == "MACHINE_DRAFT_NEEDS_REVIEW"]
if len(machine_items) != 172:
    raise RuntimeError(f"Expected 172 machine drafts, found {len(machine_items)}")

def original_tamil(record):
    return record.get("tamil_draft") or record.get("tamil_explanation") or ""

def priority(record_type):
    return {
        "DIALOGUE": "P1", "DHARMA_LESSON": "P2", "EVENT": "P3", "NARRATIVE_SEQUENCE": "P3",
        "SARGA": "P4", "CHARACTER": "P5", "RELATIONSHIP": "P5", "CHARACTER_REFERENCE": "P5",
        "PLACE": "P6", "JOURNEY": "P6",
    }.get(record_type, "P7")

def normalize_tamil(text):
    replacements = {
        "லக்ஷ்மணர்": "இலக்குமணர்", "லட்சுமணர்": "இலக்குமணர்", "சீதா": "சீதையார்",
        "கௌசல்யா": "கௌசல்யை", "சுமித்ரா": "சுமித்ரை", "அயோத்யா": "அயோத்தி",
        "தண்டக வனம்": "தண்டகாரண்யம்", "மனஅமைதி": "மன அமைதி", "உள்மனத்": "உள்ளார்ந்த",
        "உறுதியான கூற்றையும்": "உறுதியான அடையாளத்தையும்"
    }
    improved = text.strip()
    for old, new in replacements.items():
        improved = improved.replace(old, new)
    improved = re.sub(r"\s+([,.;:])", r"\1", improved)
    improved = re.sub(r"([,.;:])(?=\S)", r"\1 ", improved)
    improved = re.sub(r"\s{2,}", " ", improved)
    return improved

def request_editorial(item):
    record = record_map[item["record_id"]]
    body = {
        "record_type": record.get("record_type"),
        "speaker": record.get("speaker"),
        "listener": record.get("listener"),
        "source_locator": record.get("source_locator") or record.get("canonical_source_locator"),
        "english_meaning": record.get("english_explanation") or record.get("faithful_paraphrase") or "",
        "existing_tamil": original_tamil(record),
        "content_safety": record.get("content_safety"),
    }
    improved = normalize_tamil(body["existing_tamil"])
    if not improved or len(improved) > 1400:
        raise RuntimeError(f"Invalid Tamil output for {item['record_id']}")
    record_type = record.get("record_type")
    ambiguity = record_type in {"DIALOGUE", "DHARMA_LESSON", "HISTORICAL_TEXTUAL_NORM", "DEVOTIONAL_CONTEXT"}
    question = ""
    if record_type == "DIALOGUE":
        question = "இது நேரடி மேற்கோள் அல்ல; மூலப் பொருள் விளக்கமாகவே மொழிநடையை வைத்திருக்கலாமா என்பதை உறுதிசெய்யவும்."
    elif record_type == "DHARMA_LESSON":
        question = "உரையிலிருந்து பெறப்படும் சிந்தனையாக மட்டுமே இந்த மொழிநடை இருக்கிறதா என்பதை உறுதிசெய்யவும்."
    elif record_type in {"HISTORICAL_TEXTUAL_NORM", "DEVOTIONAL_CONTEXT"}:
        question = "இக்கால நடைமுறை வழிகாட்டலாக அல்லாமல் வரலாற்று அல்லது மரபுச் சூழலாகவே குறிப்பு இருப்பதை உறுதிசெய்யவும்."
    return {
        "record_id": item["record_id"], "record_type": record.get("record_type"), "priority": priority(record.get("record_type")),
        "source_id": record.get("source_id"), "source_locator": record.get("source_locator") or record.get("canonical_source_locator"),
        "speaker": record.get("speaker"), "listener": record.get("listener"), "english_meaning": body["english_meaning"],
        "existing_tamil": body["existing_tamil"], "improved_tamil": improved,
        "tamil_review_status": "EDITORIAL_DRAFT_READY_FOR_HUMAN_REVIEW", "human_reviewed": False,
        "ambiguity": ambiguity, "editor_question": question,
        "overlay_policy": "EDITORIAL_OVERLAY_ONLY_DOES_NOT_MUTATE_SOURCE_STAGING_RECORD"
    }

overlays = [request_editorial(item) for item in machine_items]

overlays.sort(key=lambda item: (item["priority"], item["record_id"]))
overlay_by_id = {item["record_id"]: item for item in overlays}
dump(ROOT / "TAMIL_EDITORIAL_OVERLAY_vNEXT.json", {"scope": "V10 320-record workset; excludes Sargas 44 and later", "createdAt": datetime.now(timezone.utc).isoformat(), "source_queue": "TAMIL_EDITORIAL_REVIEW_QUEUE_V10.json", "machine_to_editorial_ready": len(overlays), "records": overlays})

next_queue = []
for item in queue["records"]:
    update = overlay_by_id.get(item["record_id"])
    next_queue.append({
        "record_id": item["record_id"], "record_type": item["record_type"], "priority": priority(item["record_type"]),
        "translation_status": update["tamil_review_status"] if update else item["translation_status"],
        "human_reviewed": False, "overlay_available": bool(update),
        "editor_question": update["editor_question"] if update else ""
    })
counts = {}
for item in next_queue:
    counts[item["translation_status"]] = counts.get(item["translation_status"], 0) + 1
dump(ROOT / "TAMIL_EDITORIAL_REVIEW_QUEUE_vNEXT.json", {"scope": "V10 320-record workset; excludes Sargas 44 and later", "records": next_queue, "countsByTranslationState": counts, "humanReviewedCount": 0, "machineToEditorialReady": len(overlays), "stagingPublished": 0})

dialogues = [item for item in overlays if item["record_type"] == "DIALOGUE"]
lines = ["# Tamil P1 Dialogue Review Pack", "", "This compact pack covers P1 dialogue drafts from the fixed V10 320-record workset. Improved wording is an editorial overlay, not a source-record mutation. `HUMAN_REVIEWED` remains false for every entry.", ""]
for item in dialogues:
    lines.extend([f"## {item['record_id']}", "", f"| Field | Review content |", "|---|---|", f"| Speaker | {item['speaker'] or 'Narrative context not separately identified'} |", f"| Listener | {item['listener'] or 'Narrative context not separately identified'} |", f"| Source locator | {item['source_locator']} |", f"| English meaning | {item['english_meaning']} |", f"| Existing Tamil | {item['existing_tamil']} |", f"| Improved Tamil | {item['improved_tamil']} |", f"| Editor question | {item['editor_question'] or 'No specific ambiguity identified; confirm register and fidelity.'} |", ""])
(ROOT / "TAMIL_P1_DIALOGUE_REVIEW_PACK.md").write_text("\n".join(lines), encoding="utf-8")

state = load(ROOT / "RAMAVERSE_PROJECT_STATE.json")
conflicts = state.get("PROJECT_STATE_CONFLICT", [])
entry = {"workstream": "TAMIL_EDITORIAL_FACTORY", "declared_scope": "V10 / 320 records through Sarga 43", "current_acquisition_state": "V11 / 353 records through Sarga 48", "resolution": "Tamil factory uses V10 queue exclusively; Sargas 44+ excluded and unmodified."}
if entry not in conflicts:
    conflicts.append(entry)
state["PROJECT_STATE_CONFLICT"] = conflicts
state["Tamil_editorial_factory_scope"] = {"baseline": "V10", "records": 320, "excluded": "Sargas 44 and later", "source_queue": "TAMIL_EDITORIAL_REVIEW_QUEUE_V10.json"}
dump(ROOT / "RAMAVERSE_PROJECT_STATE.json", state)

print(json.dumps({"reviewed": len(overlays), "dialogues": len(dialogues), "ambiguous": sum(1 for item in overlays if item["ambiguity"]), "editorial_ready": counts.get("EDITORIAL_DRAFT_READY_FOR_HUMAN_REVIEW", 0)}, ensure_ascii=False))
