# RamaVerse Hi-Tech — Production Architecture Boundary

Status: ARCHITECTURE_VALIDATED / DEPLOYMENT_NOT_YET_APPROVED
Date: 2026-09-07

## Verified current architecture

- React 19 + Vite frontend under `client/`.
- Express + tRPC backend under `server/`.
- Drizzle ORM + MySQL runtime through `DATABASE_URL`.
- Canonical RamaVerse records are served through `server/routers/ramaverse.ts`.
- `client/src/pages/SargaReader.tsx` calls `trpc.ramaverse.getSargaDetail`.
- `getSargaDetail` reads the canonical `sargas` table and calculates previous/next navigation server-side.
- Source-review/staging preview endpoints also read governed evidence files server-side.
- Intelligence endpoints are server-owned and must not expose provider credentials to the browser.

## Static versus server boundary

### Browser/static-safe

The compiled React shell, styles, fonts, icons, public assets, service-worker assets and client-side reading/bookmark UI can be served as static assets.

### Server-required in the current source

- Sarga/Kanda canonical data retrieval.
- Sarga Reader current/previous/next record retrieval.
- Wisdom, characters, places, guidance, stories, quizzes and other canonical collection queries.
- Canonical intelligence/search/grounded-answer operations.
- Authentication/session handling where enabled.
- Database-backed user operations.
- Server-side evidence/reconciliation preview reads.

## Hosting decision

Do not deploy the current project as GitHub Pages-only. That would remove the tRPC/Express/MySQL runtime and break core data-backed pages including Sarga Reader.

Approved target architecture for the next phase:

1. GitHub repository remains canonical source.
2. Frontend may be built and served separately as static assets if API origin handling is made explicit.
3. Backend remains a separately deployable Node/Express service unless canonical data is deliberately redesigned into a static-export architecture.
4. Database remains server-only.
5. Provider secrets remain server-only.
6. Cloudflare may later provide DNS/security/proxy functions, but not canonical source storage.

## Provider decoupling required

The current environment contract still contains Forge-era names:

- `BUILT_IN_FORGE_API_URL`
- `BUILT_IN_FORGE_API_KEY`

These must not be assumed to be the long-term production AI provider contract. Replace only after baseline quality gates are passing and usages are fully mapped.

## Deployment blockers

- Baseline GitHub Actions quality gate has been added but a successful run is not yet evidenced.
- Production database target is not configured.
- Production API/backend host is not selected/configured.
- Provider-neutral AI runtime contract is not completed.
- Production CORS/cookie/origin policy is not yet fixed.
- Exact deployed commit has not passed route/mobile/accessibility/console smoke gates.

## Current gate

SOURCE: PASS
LATEST SARGA READER PRESENT: PASS
ARCHITECTURE CLASSIFICATION: PASS
STATIC-ONLY DEPLOYMENT: NO-GO
FULL PRODUCTION DEPLOYMENT: NO-GO pending runtime and validation gates
