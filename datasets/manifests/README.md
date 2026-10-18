# Dataset manifest

Do not commit source images or personal/identifying land documents unless redistribution and privacy permissions are confirmed. Keep a local UTF-8 JSONL manifest with one row per image/document:

```json
{"id":"doc001-page01","source":"Mendeley DOI 10.17632/yk3c3xy9vm.1","license":"CC BY 4.0 - recheck at download","document_type":"deed","split":"test","image_path":"private-local-path/page01.jpg","ground_truth":"manually reviewed Bangla transcription","reviewer_count":2}
```

Use stable document-level grouping: pages/crops from the same original deed must remain in one split. Never place personal NID, phone numbers, real addresses or unredacted signatures in public examples. Store only authorized/anonymized data. The NLM catalogue query link supplied by the team has not been confirmed as a relevant land-document dataset; do not use it until title, data content and licence are checked.
