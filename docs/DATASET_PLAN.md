# Dataset and evaluation plan

## Sources supplied by the team
1. Mendeley Data: Bangla Handwritten Dolil Dataset, 653 images, DOI 10.17632/yk3c3xy9vm.1, publisher listing says CC BY 4.0. Re-check licence and attribution at use time.
2. Land Registration BD sample deed references: sample deed category, Saf Kabla, Baynapatra, partition deed and deed format. Treat as document-format references; confirm redistribution rights for downloaded files.
3. DLRS forms page: reference source; verify document type and terms.
4. NLM dataset catalogue query URL: relevance to Bangladeshi land documents not confirmed. Do not use until its actual dataset metadata and licence are inspected.

## Recommended workflow
- Download only datasets permitted by their licence and keep provenance metadata.
- Create a manifest with image ID, source, document/page ID, transcription path, document type, split and reviewer.
- Split by source document/person/scan session before cropping to prevent near-duplicate leakage.
- Double-review ground truth for owner name, deed number/date, dag, khatian, mouza, area and share values.
- Include hard cases: blur, stains, skew, handwriting variation, missing fields, conflicting records and invalid dates.
- Baseline OCR: measure Character Error Rate (CER) and Word Error Rate (WER).
- Field extraction: report exact match, precision, recall and F1 for each field; show per-field sample counts and confidence intervals where feasible.
- Risk engine: test known injected discrepancies separately; report confusion matrix, precision/recall/F1 per risk class. Synthetic cases do not demonstrate real-world model performance.
- Never label an OCR read as legally valid. Low OCR confidence or conflicts should trigger human review.
