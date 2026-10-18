# LandTech 2026 Rulebook v1.2 — compliance audit

**Chosen statement:** P3 — Catch Fraud & Double-Selling (official rulebook Section 5). The implementation must remain focused on this single problem statement for the submission.

| Official rulebook item | Current position | Required action before submission |
|---|---|---|
| Original project (Section 10) | Team-specific implementation | Credit reused code/assets and keep authentic Git history. |
| Dummy data only; no real names/NIDs/phones/land records (Section 10 + FAQ) | Bundled records use fictional identifiers | Inspect screenshots/demo exports to ensure no real personal data appears. |
| No scraping/bulk-download of government sites (Section 10) | No government API/scraper implemented | Keep it that way unless organizers give explicit approval. |
| Security tests only on own system (Section 10) | Local app and team-controlled deployment | Do not probe government or third-party systems. |
| Explainable code and AI-tool disclosure (Section 10 + FAQ) | AI tools may have assisted development | Team must list actual tools used and explain the code. |
| Concept note up to 4 pages (Section 8) | Outline included | Fill in actual team/mentor details, export PDF, check page count. |
| Code link + README (Section 8) | README and deploy docs included | Push both repos, verify access for judges, run build/test and record truthful status. |
| Demo video <= 3 minutes (Section 8) | Script included | Record the actual working app and time it. |
| Live link optional but recommended (Section 8) | Cloudflare config included | Deploy and test before listing a URL; do not represent placeholders as live. |

## What is and is not implemented

Implemented in the Worker: synthetic case catalogue, `/api/transactions/scenarios`, `/api/transactions/screen`, eight rule-based checks, health endpoint, and a Firebase-token-protected Cloudinary profile upload signature route.

Not implemented/claimed: OCR, seal verification, government registry access, authoritative cadastral data, ML fraud classification, or measured real-world accuracy. No performance metrics should be claimed until measured with an appropriate dataset and evaluation protocol.

## Acceptance checklist

- [ ] `npm install` succeeds for frontend and Worker.
- [ ] Frontend `npm run typecheck` and `npm run build` succeed.
- [ ] Worker `npm run typecheck` succeeds.
- [ ] Test all seven scenarios and export JSON.
- [ ] Verify client/admin sign-in and admin role behavior with a real test Firebase project.
- [ ] Verify profile upload only with a test account and a configured Cloudinary project.
- [ ] Confirm all records are fictional and no secrets are committed.
- [ ] Fill team/mentor details, AI tools, third-party credits and source links in concept note/README.
- [ ] Record <=3-minute demo; submit the <=4-page concept note and accessible code link.
