# RamaVerse Preview Deployment Plan

Status: PREVIEW-READY SOURCE, DEPLOYMENT NOT STARTED

## Approved preview architecture

- Canonical source: GitHub `ssakthivel02/ramaverse-hitech` only.
- Preview web runtime: separately provisioned Render Web Service (Node.js / Express) dedicated to RamaVerse preview.
- Preview database service: separately provisioned MySQL or MySQL-compatible managed service dedicated to RamaVerse preview and validated against the repository compatibility gates.
- Preview database name inside that service: `ramaverse_preview` with a dedicated RamaVerse preview user.
- A database schema/name alone is not sufficient isolation. Do not place RamaVerse preview inside a database service that also hosts KirthiVerse, SakthiAI, or any other project database.
- Build command: `pnpm install --frozen-lockfile && pnpm build`
- Start command: `pnpm start`
- Health check: `/readyz`
- Production DNS: not attached during preview qualification.

## Required preview runtime values

- `NODE_ENV=production`
- `DATABASE_URL=mysql://<ramaverse-preview-user>:<password>@<host>:<port>/ramaverse_preview`
- `DATABASE_EXPECTED_NAME=ramaverse_preview`
- `RAMAVERSE_PREVIEW_DATABASE_HOST=<exact dedicated service hostname>`
- `DATABASE_CA_CERT_B64` only when the selected provider requires a private/custom CA. Publicly trusted certificates use the system trust store; TLS verification must never be disabled.
- deployed repository identity and commit identity must be provided by the host as described in `PREVIEW_RUNTIME_READINESS.md`
- `PORT` is supplied by the hosting runtime.

## Required GitHub preview-DB gate secrets

The manually dispatched `RamaVerse Preview DB Setup` workflow must fail closed until these are configured for the owner-approved dedicated RamaVerse preview service:

- `RAMAVERSE_TEST_DATABASE_URL` — full connection URL for the dedicated RamaVerse preview database only.
- `RAMAVERSE_PREVIEW_DATABASE_HOST` — exact expected hostname of the dedicated RamaVerse database service. The workflow lowercases and compares the URL hostname exactly; a different host is rejected.
- `RAMAVERSE_PREVIEW_DATABASE_CA_CERT_B64` — optional trusted provider CA certificate encoded as base64. Configure it only where the provider requires a private/custom CA. Aiven targets continue to require a CA; public-CA providers use the system trust store.

The known shared `hitech-preview-mysql` service is explicitly rejected by the setup workflow and must not be configured in these secrets. Exact host equality proves the workflow is targeting the owner-approved endpoint; provider account/service ownership must also be established during provisioning and recorded outside committed credentials.

## Database isolation rule

The preview database **service** must be dedicated to RamaVerse and separate from production and from other projects. A shared database server/service containing multiple project databases is not an approved preview dependency, even when `ramaverse_preview` itself has a separate schema/name or user.

Never point `RAMAVERSE_TEST_DATABASE_URL`, `DATABASE_URL`, or the preview runtime at a production database or at an ambiguous cross-project database service.

Schema existence is not proof that Reader content is present. Canonical Reader rows must be loaded through an owner-approved, lossless process and verified independently before `/readyz`, integration QA, or deployed-preview qualification can be treated as passing.

## Qualification gate

Preview can advance only when all are true:

1. GitHub quality gate is green on the exact deployed commit.
2. Dedicated RamaVerse preview database service identity is verified.
3. Selected MySQL-compatible provider passes the repository schema/runtime compatibility gates and verified-TLS connectivity.
4. Dedicated database integration gate passes against the RamaVerse preview/test database.
5. Canonical Reader rows are verified as loaded; schema-only success is insufficient.
6. `/healthz` returns process alive.
7. `/readyz` confirms active corpus and Reader database readiness.
8. Sarga Reader retrieves verified source-located content from the preview database.
9. Canonical/staging separation tests remain green.
10. Desktop/mobile route, link, asset, console, network and accessibility smoke tests pass.
11. Exact deployed repository/commit identity is verified.
12. Only after these checks may custom DNS/HTTPS promotion be considered.

## Existing shared Aiven service

Any previously created cross-project Aiven MySQL service must remain outside the RamaVerse preview dependency chain unless it is formally replaced by a separately provisioned RamaVerse-only service. Do not power on, repurpose, migrate, or delete a shared service merely to satisfy RamaVerse preview readiness.

## Provisioning boundary

Provisioning a new managed database or hosted runtime is an external infrastructure decision. Before creation, confirm the selected provider plan, cloud/region, cost tier, service name, and repository/branch binding through the provider's supported workflow. Do not guess these values and do not silently reuse an existing shared service.

After provisioning the dedicated database service, record its exact hostname only in the approved GitHub/provider secret configuration, not in committed credentials. The repository gate will then bind schema setup to that explicit host identity.

Secrets must be entered only through the hosting/provider secret store. Never commit or paste database credentials into the repository.
