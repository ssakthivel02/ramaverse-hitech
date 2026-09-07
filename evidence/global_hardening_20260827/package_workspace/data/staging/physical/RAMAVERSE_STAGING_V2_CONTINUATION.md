# RamaVerse canonical staging v2 continuation

The separate staging dataset is **`ramaverse_canonical_staging_v2`**. It now contains **61 staging records**: 12 records for Ayodhya Kanda Sargas 18–19, 16 records for Sarga 20, 18 records for Sarga 21, and 15 newly added records for Sarga 22.

Every staging record is marked:

- `merge_state = awaiting_v1_4_0_reconciliation`
- `possible_legacy_overlap = true`
- `source_type = PRIMARY_TEXT`
- `review_status = needs_human_tamil_review`

The historical RamaVerse v1.4.0 evidence baseline remains unchanged at **550 records** and does not include staging records.

## Latest acquisition batch

**Ayodhya Kanda, Sarga 22**, verses **2.22.1–30**, covering Rama’s pacification of Lakshmana, withdrawal of the coronation preparations, preservation of Dasaratha’s promise, Rama’s interpretation of the reversal as destiny, and the continued decision to enter forest exile.

## Exact next source section

**Ayodhya Kanda, Sarga 23**, beginning with Lakshmana’s further angry response and Rama’s obtaining of Kausalya’s permission. Acquire and verify the complete source text and locators before adding the next staging batch.

## Current staging coverage

| Kanda | Sargas | Staging records |
|---|---|---:|
| Ayodhya Kanda | 18–19 | 12 |
| Ayodhya Kanda | 20 | 16 |
| Ayodhya Kanda | 21 | 18 |
| Ayodhya Kanda | 22 | 15 |
| **Total** | **18–22** | **61** |

## Lightweight validation status

The expanded JSON is valid, all 61 candidate IDs are unique, required fields are present, all records have source/provenance and copyright-status fields, all possible legacy overlaps are flagged, and all merge states remain `awaiting_v1_4_0_reconciliation`. No website, mobile, build, test, release, repository, production merge, or final QA work was performed.

## Evidence sources

The current records cite the SanskritDocuments pages for Ayodhya Kanda Sargas 18, 19, 20, 21, and 22 and use the GRETIL Rāmāyaṇa Kāṇḍas 1–7 file as a locator cross-check. Critical-edition reconciliation and legacy overlap resolution remain pending until the v1.4.0 corpus is restored.
