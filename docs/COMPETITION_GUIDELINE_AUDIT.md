# LandTech 2026 guideline audit — JomiGuard BD

## Scope decision
**Primary problem:** cross-check supplied deed/khatian/mutation/plot/inheritance fields and explain possible inconsistencies before a citizen proceeds with a land transaction.

This audit is based on the guidelines pasted by the team. The official rulebook containing the six selectable problem statements was not included in the supplied files, so exact compliance with one of those six cannot be certified until the team identifies the chosen statement.

## Current implementation status

| Requirement | Status | Evidence / remaining work |
|---|---|---|
| One genuine Bangladesh land problem | Partial | Risk engine focuses on record inconsistency; map/GIS uses supplied coordinates only, no authoritative cadastral data. |
| 4–5 core features | Partial | Rule-based cross-checking, findings, synthetic cases, OCR upload-validation endpoint, evaluation metrics endpoint. Keep UI extras secondary. |
| Handwritten Bangla OCR | Not implemented | `/api/ocr/preview` only validates upload in memory and explicitly returns `ocr_provider_not_configured`. Connect an OCR model/provider before claiming OCR. |
| Dates, deed IDs, names, dag/khatian, mouza | Partial | Rules added for owner, deed number missing, date validity, dag, khatian and mouza mismatch. Need field-extraction/OCR model and reviewed ground truth. |
| Seal verification | Partial/manual | A supplied seal review flag can trigger a caution. No seal detection/authentication model exists; a visible seal cannot prove validity. |
| Duplicate sale / ownership history | Partial | Rules can flag a repeated deed number or overlapping supplied prior-sale records. It is not a registry search and can produce false positives/negatives. |
| Inheritance / family share | Partial | Checks missing shares and totals other than 100%; does not calculate legal shares, which depend on facts and applicable law. |
| Plot boundary / coordinate mapping | Partial | Coordinates can be compared by distance; no trusted cadastral boundary dataset or authoritative geospatial verification is integrated. |
| Synthetic/hard cases | Partial | Three synthetic cases exist; expanded unit tests cover invalid dates, conflicting names, duplicate deed, inheritance shares, mouza and boundary flags. More labelled hard cases required. |
| OCR/model metric >=90% | Not met / not measured | Do not claim 90%. `scripts/evaluate_ocr.py` calculates CER/WER from manually reviewed JSONL predictions. No OCR predictions/ground truth benchmark is bundled. |
| Field extraction precision/recall/F1 | Not measured | Build a manually labelled field-level benchmark before reporting. |
| GitHub + README | Partial | Repo-specific README and dataset plan exist; fill in actual run/build results, chosen official statement, model details and sources before submission. |
| 3-minute demo video | Not recorded | `docs/DEMO_SCRIPT.md` provides a suggested outline; record a real working demo and show only measured results. |

## Data-source handling

- Mendeley dataset URL supplied by team: `https://data.mendeley.com/datasets/yk3c3xy9vm/1`. Confirm current record metadata, licence, attribution and any conditions when downloading. Do not state that the project trained on it until the images and labels have actually been downloaded and evaluated.
- LandRegistrationBD deed sample pages are document-format references, not automatically a reusable labelled dataset. Confirm rights before redistributing downloaded examples.
- DLRS forms page: use as a reference source; record retrieval date, document name and licence/terms.
- NLM Dataset Catalog query: relevance to Bangladeshi land deeds is not confirmed from the supplied query URL; exclude unless its metadata proves relevance and permission.

## Important architecture note
The current project has a participant-controlled Express backend and Firebase configuration. If the actual official LandTech rulebook requires frontend-only or forbids participant-controlled backend/database/storage, this architecture would violate that rule. Check the exact LandTech rulebook before submitting; do not assume the pasted guideline summary overrides the official rulebook.

## Acceptance criteria before claiming complete
1. Select and quote the exact official problem statement.
2. Run `npm run typecheck`, `npm test`, and `npm run build` successfully in backend and frontend repositories; record actual output.
3. Add a manually reviewed, licence-compliant benchmark split by source document, not page/crop.
4. Report OCR CER/WER and per-field extraction exact-match/precision/recall/F1 with sample counts; no invented numbers.
5. Demonstrate five or fewer reliable core features using synthetic/anonymized records.
6. Make all findings explainable and label them as screening alerts, not legal conclusions.
