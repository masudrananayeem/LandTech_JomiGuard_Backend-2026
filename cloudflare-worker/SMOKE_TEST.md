# Worker smoke test

After `npm run dev` (default local URL `http://localhost:8787`), run these checks in a second terminal:

```bash
curl -i http://localhost:8787/api/health
curl -i http://localhost:8787/api/transactions/scenarios
curl -i -X POST http://localhost:8787/api/transactions/screen \
  -H 'Content-Type: application/json' \
  -d '{"scenarioId":"clear-baseline"}'
curl -i -X POST http://localhost:8787/api/transactions/screen \
  -H 'Content-Type: application/json' \
  -d '{"scenarioId":"double-sale"}'
```

Expected: health `status: ok`; scenario list has seven fictional scenarios; baseline returns `risk: LOW`; double-sale returns `risk: HIGH` and a `DOUBLE_SALE` FAIL check. These are expected behavior checks, not an accuracy benchmark.
