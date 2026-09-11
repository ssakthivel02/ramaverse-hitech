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
- Provider-specific preview deployment execution is disabled until the executor registry separately records a reviewed and enabled executor for the exact provider.

## Required preview runtime values

- `NODE_ENV=production`
- `DATABASE_URL=mysql://<ramaverse-preview-user>:<password>@<host>:<port>/ramaverse_preview`
- `DATABASE_EXPECTED_NAME=ramaverse_preview`
- `RAMAVERSE_PREVIEW_DATABASE_HOST=<exact dedicated service hostname>`
- `DATABASE_CA_CERT_B64` only when the selected provider requires a private/custom CA. Publicly trusted certificates use the system trust store; TLS verification must never be disabled.
- deployed repository identity and commit identity must be provided by the host as described in `PREVIEW_RUNTIME_READINESS.md`
- `PORT` is supplied by the hosting runtime.

## Required GitHub preview-DB gate secrets

The manually dispatched RamaVerse database workflows must fail closed until the owner-approved dedicated RamaVerse preview service is configured with the required secret values:

- `RAMAVERSE_TEST_DATABASE_URL` — full connection URL for the dedicated RamaVerse preview database only.
- `RAMAVERSE_PREVIEW_DATABASE_HOST` — exact expected hostname of the dedicated RamaVerse database service. Workflows lowercase and compare the URL hostname exactly; a different host is rejected.
- `RAMAVERSE_PREVIEW_DATABASE_CA_CERT_B64` — optional trusted provider CA certificate encoded as base64. Configure it only where the provider requires a private/custom CA. Aiven targets continue to require a CA; public-CA providers use the system trust store.

The known shared `hitech-preview-mysql` service is explicitly rejected and must not be configured in these secrets. Exact host equality proves the workflow is targeting the owner-approved endpoint; provider account/service ownership must also be established during provisioning and recorded outside committed credentials.

## Database isolation rule

The preview database **service** must be dedicated to RamaVerse and separate from production and from other projects. A shared database server/service containing multiple project databases is not an approved preview dependency, even when `ramaverse_preview` itself has a separate schema/name or user.

Never point `RAMAVERSE_TEST_DATABASE_URL`, `DATABASE_URL`, or the preview runtime at a production database or at an ambiguous cross-project database service.

Schema existence is not proof that Reader content is present. Canonical Reader rows are verified as loaded; schema-only success is insufficient. Reader rows must be loaded through an owner-approved, lossless process and verified independently before `/readyz`, integration QA, or deployed-preview qualification can be treated as passing.

## Controlled preview qualification chain

Preview may advance only through the following evidence chain, in order:

1. Exact-commit GitHub Quality Gate, Preview Deployment Preflight, and Preview Release Candidate are green.
2. The owner explicitly selects the provider candidate through `PROVIDER_CANDIDATE_SELECTION_APPROVED`; generic proceed/continue instructions do not count.
3. A dedicated RamaVerse preview database service is provisioned and its exact identity is verified.
4. The read-only provider preflight verifies exact provider/database identity and verified TLS without mutation.
5. Controlled schema setup runs only after successful matching preflight evidence and emits schema-setup evidence.
6. Owner-approved canonical Reader rows are loaded and independently verified; schema-only success remains insufficient.
7. The exact commit/provider passes the Integration Gate and emits `LIVE_INTEGRATION_PASS`.
8. A previously green exact commit is verified as a source rollback target through `PREVIEW_ROLLBACK_READY`; this does not imply database rollback safety.
9. Explicit owner preview-deployment approval plus exact release/integration/rollback evidence produces `PREVIEW_DEPLOYMENT_AUTHORIZED`; authorization performs no deployment.
10. The sanitized deployment handoff emits `PREVIEW_DEPLOYMENT_HANDOFF_READY` and contains secret names only, never secret values.
11. `PREVIEW_DEPLOYMENT_EXECUTOR_REGISTRY.json` must contain a separately reviewed, enabled provider-specific executor mapped to a concrete workflow; otherwise the default policy is DENY.
12. Matching handoff/registry evidence must produce `PREVIEW_DEPLOYMENT_EXECUTOR_ADMITTED`; admission performs no deployment.
13. Only the reviewed provider-specific preview executor may perform preview deployment for that exact commit/provider.
14. Deployed preview HTTP smoke verifies `/healthz`, `/readyz`, `/releasez`, root serving, canonical corpus/database readiness, security/cache headers, legacy-runtime absence, and exact deployed commit identity.
15. The owner explicitly accepts the validated preview through `PREVIEW_ACCEPTANCE_PASS`.
16. Preview acceptance still does **not** authorize production DNS or production deployment. Production remains a separate explicit decision and NO-GO until its own gates pass.

## Additional qualification expectations

Throughout the chain:

- Sarga Reader must retrieve verified source-located content from the preview database.
- Canonical/staging separation tests must remain green.
- Desktop/mobile route, link, asset, console, network and accessibility smoke tests must pass before production consideration.
- Exact deployed repository/commit identity is verified.
- No stage may infer that a prior evidence artifact proves a later stage occurred.

## Existing shared Aiven service

Any previously created cross-project Aiven MySQL service must remain outside the RamaVerse preview dependency chain unless it is formally replaced by a separately provisioned RamaVerse-only service. Do not power on, repurpose, migrate, or delete a shared service merely to satisfy RamaVerse preview readiness.

## Provisioning boundary

Provisioning a new managed database or hosted runtime is an external infrastructure decision. Before creation, confirm the selected provider plan, cloud/region, cost tier, service name, and repository/branch binding through the provider's supported workflow. Do not guess these values and do not silently reuse an existing shared service.

After provisioning the dedicated database service, record its exact hostname only in the approved GitHub/provider secret configuration, not in committed credentials. The repository gate will then bind schema setup to that explicit host identity.

Secrets must be entered only through the hosting/provider secret store. Never commit or paste database credentials into the repository.
