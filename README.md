# JomiGuard BD — Backend

A screening API for comparing user-supplied land-document fields. It is a prototype using **synthetic records only**; it is not connected to Bangladesh government systems and does not establish legal ownership or document validity.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Default API: `http://localhost:4000`.

## Commands

```bash
npm run typecheck
npm test
npm run build
npm start
```

## Endpoints

- `GET /api/health` — API health and synthetic mode status
- `GET /api/cases` — list synthetic demo cases
- `GET /api/cases/:id` — fetch one case
- `POST /api/analyze` — analyze `{ "caseId": "case-high" }` or `{ "records": { ... } }`
- `POST /api/ocr/preview` — validates an uploaded file in memory; **does not perform OCR** until an OCR provider is configured
- `GET /api/metrics` — small synthetic rule-engine sanity check only; not a model benchmark

## Current checks

The rules screen for owner mismatch, missing deed number, invalid calendar dates, dag/khatian/mouza mismatch, area mismatch, mutation status, seal-review status, possible duplicate/overlapping sales, inheritance share totals, boundary verification and coordinate-distance mismatch. Each is a prompt for human verification, not a legal conclusion.

## Data and evaluation

See [`docs/COMPETITION_GUIDELINE_AUDIT.md`](docs/COMPETITION_GUIDELINE_AUDIT.md) and [`docs/DATASET_PLAN.md`](docs/DATASET_PLAN.md). The supplied Mendeley dataset must be downloaded and licence/attribution confirmed by the team before use. The supplied NLM query is not yet verified as a relevant dataset. Use `python scripts/evaluate_ocr.py path/to/reviewed-predictions.jsonl --split test` to calculate CER/WER when actual OCR predictions and manually reviewed ground truth exist. Do not report metrics before running on a properly grouped, held-out set.

## Security and limitations

- Do not submit real deeds, NID numbers, signatures or personal records in public demo data.
- Configure `CORS_ORIGIN` for your real frontend origins before deployment.
- This starter does not provide production authentication/authorization for sensitive record access.
- No government API or cadastral database is connected.
- OCR and seal authentication are not implemented by the upload endpoint.
