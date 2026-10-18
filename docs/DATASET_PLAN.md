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

## Dataset links supplied by the team

- Mendeley: https://data.mendeley.com/datasets/yk3c3xy9vm/1 — likely most directly relevant source; verify the current licence, metadata and transcription/annotation availability before use.
- Land deed sample category: https://landregistrationbd.com/category/দলিলের-নমুনা-sample-deed/
- Saf-Kabla sample: https://landregistrationbd.com/সাফ-কবলা-দলিলের-নমুনা/
- Baynapatra sample: https://landregistrationbd.com/বায়নাপত্র-দলিলের-নমুনা-sample/
- Partition deed sample: https://landregistrationbd.com/বন্টননামা-দলিলের-নমুনা/
- DLRS forms: https://dlrs.gov.bd/views/all-forms/6922d9f0933eb65569e0132a
- Deed format reference: https://landregistrationbd.com/দলিলের-ফরমেট-ফর্ম-dolil-formet/
- NLM catalogue query: https://datasetcatalog.nlm.nih.gov/dataset?q=0002937739 — relevance to Bangladeshi land documents has not been established; treat as unverified, not as a project dataset.

The deed sample webpages are format references, not assumed open datasets. Check terms and permissions before copying their files into the repository. The application currently ships only synthetic records; it does not claim to train on any linked dataset.
