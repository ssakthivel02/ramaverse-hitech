# RamaVerse Preview Runtime Readiness

## Purpose

This contract defines the minimum runtime configuration required before a RamaVerse preview deployment may be called ready. GitHub remains the canonical source repository. The current Reader and public discovery surfaces depend on the Express/tRPC backend and database-backed canonical records, so GitHub Pages alone is not sufficient for the current architecture.

## Required preview configuration

### Core
- `NODE_ENV=production`
- `DATABASE_URL` — dedicated preview/test MySQL database containing the canonical Reader data required by the validated Sarga routes
- `DATABASE_EXPECTED_NAME=ramaverse_preview` — mandatory in production so the runtime fails closed instead of accepting an unintended/shared logical database
- `DATABASE_CA_CERT_B64` — required when the preview MySQL provider requires a private/custom CA; certificate verification must remain enabled
- `JWT_SECRET` where authentication/session features are enabled
- provider-neutral AI variables only where optional intelligence features are enabled

### Release identity
- Render deployments must provide `RENDER_GIT_COMMIT` and `RENDER_GIT_REPO_SLUG`.
- Non-Render preview runtimes must provide equivalent `GIT_COMMIT` and `GIT_REPOSITORY` values.
- Repository identity must resolve to `ssakthivel02/ramaverse-hitech`; absence of runtime repository identity is not treated as verified.
- `/releasez` must report `exactCommitKnown: true` and `exactRepositoryKnown: true` before exact-deployed-commit QA can pass.

### Canonical corpus
- the active corpus pointer and canonical corpus artifacts committed in this repository must remain available and pass `assertActiveCorpus()`
- database schema existence alone does **not** prove Sarga Reader corpus rows are loaded
- the dedicated preview database must contain the canonical Reader rows required by the validated routes before preview readiness is claimed
- staging/reconciliation artifacts must remain non-public unless explicitly promoted through the canonical governance process
- no staging identifiers may be returned through public Reader/search routes
- while `CONTINUATION_AUTHORITY.json` is fail-closed, do not acquire, fabricate or promote additional Sarga rows to resolve the continuation conflict by assumption

## Runtime gates

- `/healthz` = process liveness only.
- `/readyz` = preview readiness gate. It requires both the active canonical corpus and Reader database configuration.
- `/releasez` = deployed source identity; exact commit and repository identity must both be known for deployed-commit verification.
- `/ops/health` = operational health with corpus version/count and database status.
- `/ops/release-state` = release/corpus state without exposing secrets or user content.
- A preview is not ready while `/readyz` or `/ops/health` returns HTTP 503.
- Operational/release endpoints must remain network-only/no-store and must not be served from the PWA service-worker cache.

## Integration validation

The opt-in `RamaVerse Integration Gate` uses `RAMAVERSE_TEST_DATABASE_URL` and must never point to production. It validates the database-backed Sarga registry, canonical discovery surfaces and grounded retrieval behavior separately from portable source CI.

Before running it against any external database, verify that the target is dedicated to RamaVerse preview/test use and that its logical database identity matches the expected RamaVerse preview database. Do not repurpose a generic/shared service merely because its engine is compatible.

## Preview QA after readiness

Run Sarga Reader direct-route refresh, source panel and provenance disclosure, previous/next navigation, canonical-only discovery, multilingual UI, mobile/desktop navigation, accessibility, PWA/service-worker behavior, console/network checks, staging-exclusion checks, `/releasez` exact repository/commit verification, and confirmation that the deployed PWA version matches the service-worker cache generation.

## Prohibited preview shortcuts

- Do not use Manus preview runtime as a hidden dependency.
- Do not use GitHub Pages as the only runtime for this full-stack application.
- Do not point preview tests at production data.
- Do not use an ambiguous/shared database service without verified RamaVerse ownership and logical database isolation.
- Do not treat schema presence as proof that Reader corpus data has been loaded.
- Do not publish staging/reconciliation data through public routes.
- Do not fabricate missing Sarga Reader rows.
- Do not commit secrets to GitHub.
- Do not configure custom production DNS until preview QA passes.
