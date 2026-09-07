# RamaVerse Hi-Tech Source Audit

Audit date: 2026-09-07

## Classification

SOURCE_PRESENT — FULL_STACK_WEB

## Verified

- Current repository contains editable RamaVerse website source.
- Vite/React client is present under `client/`.
- Express/tRPC server runtime is present under `server/`.
- Shared/data/evidence project material is present.
- `client/src/pages/SargaReader.tsx` contains the current Sarga Reader implementation including evidence/source metadata, language controls, reading state, source locator and previous/next navigation.
- `package.json` defines build, typecheck, lint and Vitest test commands.

## Deployment implication

This is not a static-only project. The current build produces both a Vite frontend (`dist/public`) and a Node server (`dist/index.js`). GitHub Pages alone cannot execute the server/tRPC layer.

Before production deployment, choose and validate one of these architectures:

1. Static frontend extraction with all required data/API behavior made browser-safe; or
2. GitHub-hosted source + static frontend hosting plus a separately hosted API/server runtime.

Do not remove server dependencies until route/API usage has been audited.

## Gate

DEPLOYMENT_READY: NO
SOURCE_ACCEPTED_FOR_REMEDIATION: YES

No production-ready claim until exact deployed commit passes build, typecheck, tests, route/link/asset validation, responsive QA, accessibility basics, console/network checks and HTTPS/custom-domain smoke tests.
