# RamaVerse Preview Deployment Plan

Status: PREVIEW-READY SOURCE, DEPLOYMENT NOT STARTED

## Approved preview architecture

- Canonical source: GitHub `ssakthivel02/ramaverse-hitech` only.
- Preview web runtime: Render Web Service (Node.js / Express).
- Preview database: Aiven Free MySQL, isolated database `ramaverse_preview` with a dedicated user.
- Build command: `pnpm install --frozen-lockfile && pnpm build`
- Start command: `pnpm start`
- Health check: `/readyz`
- Production DNS: not attached during preview qualification.

## Required preview runtime values

- `NODE_ENV=production`
- `DATABASE_URL=mysql://<ramaverse-preview-user>:<password>@<host>:<port>/ramaverse_preview?ssl-mode=REQUIRED`
- `PORT` is supplied by the hosting runtime.

## Database rule

The preview database must be separate from any production database. Never point `RAMAVERSE_TEST_DATABASE_URL` or the preview runtime at a production database.

## Qualification gate

Preview can advance only when all are true:

1. GitHub quality gate is green on the exact deployed commit.
2. Dedicated database integration gate passes against the preview/test database.
3. `/healthz` returns process alive.
4. `/readyz` confirms active corpus and Reader database readiness.
5. Sarga Reader retrieves verified source-located content from the preview database.
6. Canonical/staging separation tests remain green.
7. Desktop/mobile route, link, asset, console, network and accessibility smoke tests pass.
8. Only after these checks may custom DNS/HTTPS promotion be considered.

## Manual owner action required

Create the Aiven Free MySQL service/database/user and create the Render Web Service. Do not enter production credentials. Share only non-secret status/screenshots in chat; secrets should be entered directly into Render/GitHub, never pasted into chat.
