# JomiGuard BD Cloudflare Worker API

This is the Worker deployment target. It provides `/api/health`, synthetic case catalogue endpoints, transaction screening endpoints and a Firebase-authenticated Cloudinary profile upload signature endpoint.

## Local

Install dependencies, create the local-only secret file, then start Wrangler:

```bash
npm install
cp .dev.vars.example .dev.vars
# Edit .dev.vars and replace every YOUR_* placeholder with values from your accounts
npm run dev
```

`.dev.vars` is intentionally not included with real values because credentials are account-specific. It is ignored by Git. Never paste API secrets into frontend `VITE_*` variables or commit `.dev.vars`. For local CORS, the checked-in `wrangler.toml` allows the default localhost origins.

Wrangler usually serves local Worker at `http://localhost:8787`. Verify `GET /api/health`, `GET /api/transactions/scenarios`, and `POST /api/transactions/screen`.

## Deploy

```bash
npx wrangler login
npx wrangler secret put CLOUDINARY_API_SECRET
npx wrangler secret put FIREBASE_WEB_API_KEY
npx wrangler deploy
```

Set `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_API_KEY` as Worker vars, and update `CORS_ORIGINS` to the exact production Client/Admin origins before deploying. Do not commit secrets. Set frontend `VITE_API_URL` to `https://<worker-host>/api`.

The upload signature endpoint verifies the Firebase ID token against Firebase Identity Toolkit and restricts profile uploads to a user-specific folder. This is not an admin-authenticated endpoint. The rest of the demo screening API uses synthetic evidence and is intentionally unauthenticated; add rate limiting and access controls before any sensitive/production use.
