# RamaVerse Website Operations Handoff

**Scope.** This handoff covers the existing RamaVerse Website only. It does not authorize deployment, corpus promotion, Mobile changes, DNS changes, or production activation.

## Operational health

Use `GET /ops/health` for a privacy-safe liveness and corpus-parity check. It exposes deployment mode, active corpus version, canonical count, and PWA cache version. Use `GET /ops/release-state` for the corresponding release contract; it explicitly reports staging publication as zero and user-question logging as disabled. These endpoints never return user questions, credentials, tokens, or staging records.

## Owner-controlled release

The owner should run the provider-neutral CI pipeline, review all evidence JSON files, confirm the active corpus pointer and hashes, and perform the production smoke matrix before activation. Production remains frozen until the owner supplies a separate deployment authorization and control path.

## Website rollback

Restore the previous Website release through the hosting provider's version history or the saved source archive. Do not use a destructive filesystem reset. Verify `/ops/health`, route availability, security headers, and the production smoke matrix after rollback.

## Corpus rollback

The versioned corpus contract is implemented in `server/corpusActivation.ts`. Validate the active pointer, back up the current pointer and manifest, and use the guarded rollback operation to return to the previous corpus version. Verify canonical count and manifest hash before reopening public retrieval.

## PWA/cache recovery

The service worker uses `ramaverse-cache-v5`, deletes older RamaVerse caches on activation, excludes `/api/`, staging-like paths, reconciliation, and development modules, and exposes `GET_CACHE_VERSION` for diagnostics. If a stale shell persists, open `/offline-reset.html`, invoke the reset action, then reload once the network is available. Local Library data is not deleted by this flow.

## Incident boundaries

Do not log sacred or private user questions. Record only route status, endpoint status, deployment version, corpus version/count, PWA version, and manifest mismatch indicators. Any failure in active corpus validation is fail-closed and must block release.
