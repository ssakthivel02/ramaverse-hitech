# RamaVerse Preview Runtime Readiness

## Purpose

This contract defines the minimum runtime configuration required before a RamaVerse preview deployment may be called ready. GitHub remains the canonical source repository. The current Reader and public discovery surfaces depend on the Express/tRPC backend and database-backed canonical records, so GitHub Pages alone is not sufficient for the current architecture.

## Required preview configuration

### Core
- `NODE_ENV=production`
- `DATABASE_URL` — dedicated preview/test database containing the canonical Reader data required by the validated Sarga routes
- `JWT_SECRET` where authentication/session features are enabled
- provider-neutral AI variables only where optional intelligence features are enabled

### Canonical corpus
- the active corpus pointer and canonical corpus artifacts committed in this repository must remain available and pass `assertActiveCorpus()`
- staging/reconciliation artifacts must remain non-public unless explicitly promoted through the canonical governance process
- no staging identifiers may be returned through public Reader/search routes

## Runtime gates

- `/healthz` = process liveness only.
- `/readyz` = preview readiness gate. It requires both the active canonical corpus and Reader database configuration.
- `/ops/health` = operational health with corpus version/count and database status.
- `/ops/release-state` = release/corpus state without exposing secrets or user content.
- A preview is not ready while `/readyz` or `/ops/health` returns HTTP 503.

## Integration validation

The opt-in `RamaVerse Integration Gate` uses `RAMAVERSE_TEST_DATABASE_URL` and must never point to production. It validates the database-backed Sarga registry, canonical discovery surfaces and grounded retrieval behavior separately from portable source CI.

## Preview QA after readiness

Run Sarga Reader direct-route refresh, source panel and provenance disclosure, previous/next navigation, canonical-only discovery, multilingual UI, mobile/desktop navigation, accessibility, PWA/service-worker behavior, console/network checks, and staging-exclusion checks.

## Prohibited preview shortcuts

- Do not use Manus preview runtime as a hidden dependency.
- Do not use GitHub Pages as the only runtime for this full-stack application.
- Do not point preview tests at production data.
- Do not publish staging/reconciliation data through public routes.
- Do not commit secrets to GitHub.
- Do not configure custom production DNS until preview QA passes.
