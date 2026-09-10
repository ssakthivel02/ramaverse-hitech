# RamaVerse Preview Deployment Plan

Status: PREVIEW-READY SOURCE, DEPLOYMENT NOT STARTED

## Approved preview architecture

- Canonical source: GitHub `ssakthivel02/ramaverse-hitech` only.
- Preview web runtime: separately provisioned Render Web Service (Node.js / Express) dedicated to RamaVerse preview.
- Preview database service: separately provisioned Aiven MySQL service dedicated to RamaVerse preview.
- Preview database name inside that service: `ramaverse_preview` with a dedicated RamaVerse preview user.
- A database schema/name alone is not sufficient isolation. Do not place RamaVerse preview inside a MySQL service that also hosts KirthiVerse, SakthiAI, or any other project database.
- Build command: `pnpm install --frozen-lockfile && pnpm build`
- Start command: `pnpm start`
- Health check: `/readyz`
- Production DNS: not attached during preview qualification.

## Required preview runtime values

- `NODE_ENV=production`
- `DATABASE_URL=mysql://<ramaverse-preview-user>:<password>@<host>:<port>/ramaverse_preview?ssl-mode=REQUIRED`
- `DATABASE_EXPECTED_NAME=ramaverse_preview`
- deployed repository identity and commit identity must be provided by the host as described in `PREVIEW_RUNTIME_READINESS.md`
- `PORT` is supplied by the hosting runtime.

## Database isolation rule

The preview database **service** must be dedicated to RamaVerse and separate from production and from other projects. A shared database server/service containing multiple project databases is not an approved preview dependency, even when `ramaverse_preview` itself has a separate schema/name or user.

Never point `RAMAVERSE_TEST_DATABASE_URL`, `DATABASE_URL`, or the preview runtime at a production database or at an ambiguous cross-project database service.

Schema existence is not proof that Reader content is present. Canonical Reader rows must be loaded through an owner-approved, lossless process and verified independently before `/readyz`, integration QA, or deployed-preview qualification can be treated as passing.

## Qualification gate

Preview can advance only when all are true:

1. GitHub quality gate is green on the exact deployed commit.
2. Dedicated RamaVerse preview database service identity is verified.
3. Dedicated database integration gate passes against the RamaVerse preview/test database.
4. Canonical Reader rows are verified as loaded; schema-only success is insufficient.
5. `/healthz` returns process alive.
6. `/readyz` confirms active corpus and Reader database readiness.
7. Sarga Reader retrieves verified source-located content from the preview database.
8. Canonical/staging separation tests remain green.
9. Desktop/mobile route, link, asset, console, network and accessibility smoke tests pass.
10. Exact deployed repository/commit identity is verified.
11. Only after these checks may custom DNS/HTTPS promotion be considered.

## Existing shared Aiven service

Any previously created cross-project Aiven MySQL service must remain outside the RamaVerse preview dependency chain unless it is formally replaced by a separately provisioned RamaVerse-only service. Do not power on, repurpose, migrate, or delete a shared service merely to satisfy RamaVerse preview readiness.

## Provisioning boundary

Provisioning a new managed database or hosted runtime is an external infrastructure decision. Before creation, confirm the selected provider plan, cloud/region, cost tier, service name, and repository/branch binding through the provider's supported workflow. Do not guess these values and do not silently reuse an existing shared service.

Secrets must be entered only through the hosting/provider secret store. Never commit or paste database credentials into the repository.
