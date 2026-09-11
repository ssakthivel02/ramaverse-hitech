# RamaVerse TiDB Cloud Starter Live Validation Plan

Status: **CANDIDATE ONLY — NOT APPROVED FOR PREVIEW RUNTIME**

This runbook exists to validate a dedicated TiDB Cloud Starter instance without weakening RamaVerse database isolation, corpus governance, or exact-commit release gates.

## Authority and boundaries

- Canonical repository: `ssakthivel02/ramaverse-hitech`.
- Shared cross-project database services remain prohibited.
- Do not reuse `hitech-preview-mysql`.
- Do not mark TiDB approved merely because an instance was created or the schema exists.
- Do not fabricate or infer missing Sarga rows.
- Production DNS and production deployment remain out of scope until all preview gates pass.

## Official evidence reviewed

TiDB Cloud documentation states that TiDB is highly compatible with the MySQL protocol and common MySQL 5.7/8.0 syntax, while some MySQL feature families remain unsupported. RamaVerse guards those unsupported families in its portable-schema tests.

TiDB Cloud Starter uses certificates issued by Let's Encrypt for TLS. Clients that use the system root store can validate the connection without a private CA bundle.

TiDB documentation states that `SHOW STATUS LIKE "Ssl%"` exposes connection TLS details including cipher and TLS version. The RamaVerse read-only preflight uses that provider-documented mechanism before any schema mutation.

TiDB Cloud documentation also states that an organization can create up to five free Starter instances by default, with a free quota for each of the first five.

Authoritative references:

- https://docs.pingcap.com/tidbcloud/mysql-compatibility/
- https://docs.pingcap.com/tidbcloud/secure-connections-to-serverless-clusters/
- https://docs.pingcap.com/tidb/stable/enable-tls-between-clients-and-servers/
- https://docs.pingcap.com/tidbcloud/serverless-limitations/
- https://docs.pingcap.com/tidbcloud/tidb-cloud-quickstart/

## Required live-validation sequence

### Gate 1 — owner/provider approval

Before provisioning, obtain explicit owner approval for **TiDB Cloud Starter** as the RamaVerse preview database candidate. Generic permission to continue repository work is not provider approval.

Expected state before approval:

- `provider_selection_approved`: `false`
- TiDB candidate status remains `STATIC_COMPATIBILITY_REVIEWED_LIVE_VALIDATION_REQUIRED`.

### Gate 2 — dedicated instance creation

Create a new TiDB Cloud Starter instance dedicated to RamaVerse preview only.

Reject the instance if:

- it is shared with KirthiVerse, SakthiAI, RamaVerse legacy, or any other project;
- ownership cannot be proven;
- the hostname is ambiguous or reused by another project;
- TLS cannot be verified.

Record, but do not commit, secrets for:

- full MySQL connection URL;
- exact database hostname;
- credentials generated for the dedicated instance.

Never commit credentials to GitHub.

### Gate 3 — GitHub secret configuration

Configure repository secrets used by the existing provider-neutral workflows:

- `RAMAVERSE_TEST_DATABASE_URL`
- `RAMAVERSE_PREVIEW_DATABASE_HOST`
- `RAMAVERSE_PREVIEW_DATABASE_CA_CERT_B64` only if the selected provider/driver requires a custom CA bundle.

For TiDB Cloud Starter, system-root TLS is expected to be sufficient because Starter certificates are issued by Let's Encrypt. If live evidence shows otherwise, fail closed rather than disabling certificate verification.

### Gate 4 — read-only provider preflight

Before applying any schema, run **RamaVerse Provider Read-Only Preflight**.

The workflow dispatcher must:

- select the exact provider candidate being validated;
- explicitly confirm that the owner approved that provider candidate for live validation.

The workflow fails closed if this confirmation is false or missing. This confirmation authorizes **candidate validation only**; it does not approve the provider for preview runtime or production.

This gate must remain non-destructive. It may inspect only connection/server state and must not execute `db:push`, DDL, or DML.

Required evidence:

- selected provider candidate is recorded;
- owner candidate-approval confirmation is recorded as `true`;
- exact hostname matches `RAMAVERSE_PREVIEW_DATABASE_HOST`;
- logical database is exactly `ramaverse_preview`;
- known shared `hitech-preview-mysql` host is rejected;
- certificate validation remains enabled with TLS 1.2 or later;
- `SELECT DATABASE(), VERSION(), @@version_comment` succeeds;
- `SHOW STATUS LIKE 'Ssl%'` reports a negotiated `Ssl_cipher` and `Ssl_version`;
- generated evidence records the exact repository commit and `mutation_performed: false`.

A successful read-only preflight proves only that an explicitly approved candidate was intentionally selected plus live identity/TLS/server compatibility evidence. It does **not** approve the provider or authorize schema/data changes.

### Gate 5 — schema setup

Only after Gate 4 passes on the same dedicated instance, run **RamaVerse Preview DB Setup**.

Required evidence:

- exact hostname matches `RAMAVERSE_PREVIEW_DATABASE_HOST`;
- logical database is exactly `ramaverse_preview`;
- known shared `hitech-preview-mysql` host is rejected;
- `pnpm db:push` succeeds against the dedicated target;
- TLS connection succeeds with `rejectUnauthorized: true`;
- no Reader-data readiness claim is made from schema success alone.

A schema-only success is **not** a provider approval.

### Gate 6 — canonical Reader data load

Load only owner-approved, lossless, source-identified RamaVerse Reader data.

Minimum currently expected canonical behavior for the integration gate:

- `VR-IITK-BALA-001` exists as the verified Bala Kanda record;
- its edition/source/tradition/review metadata remains intact;
- Ayodhya Kanda canonical Reader rows remain absent unless separately reconciled and approved;
- no `stg-v2-` staging identifiers appear through canonical Reader/search surfaces.

Do not use this gate to invent adjacent Sargas or reconcile the known continuation conflict.

### Gate 7 — live integration gate

Run **RamaVerse Integration Gate** against the same dedicated instance.

It must prove:

- exact host identity;
- exact database name;
- verified TLS;
- canonical Sarga API behavior;
- canonical surface isolation;
- grounding behavior;
- absence of fabricated/non-approved Reader rows.

Any failure leaves TiDB status as **not approved**.

### Gate 8 — preview runtime configuration

Only after Gates 1–7 pass, configure the preview runtime using the same exact host/database identity and TLS posture.

Required variables include:

- `DATABASE_URL`
- `DATABASE_EXPECTED_NAME=ramaverse_preview`
- `RAMAVERSE_PREVIEW_DATABASE_HOST`
- `DATABASE_CA_CERT_B64` only when actually required

Do not configure production DNS.

### Gate 9 — deployed preview exact-commit QA

Deploy only to the non-production preview environment and run the existing HTTP/release verification gates.

Required evidence includes:

- exact repository identity known;
- exact deployed commit known;
- `/readyz` live and not service-worker cached;
- `/releasez` returns the exact expected repository and commit;
- Reader surfaces reflect only approved canonical database state;
- no production DNS/routing change.

### Gate 10 — provider approval decision

TiDB Cloud Starter can move from candidate to approved only when all previous gates have evidence on the same dedicated instance.

Approval must never be inferred from:

- provider marketing claims;
- static SQL compatibility alone;
- successful account creation;
- successful read-only connectivity alone;
- successful schema creation alone;
- successful TCP/TLS connection alone.

## Fail-closed result states

Use one of these states when validation is incomplete or fails:

- `OWNER_PROVIDER_APPROVAL_REQUIRED`
- `DEDICATED_INSTANCE_REQUIRED`
- `EXACT_HOST_IDENTITY_FAILED`
- `READ_ONLY_PROVIDER_PREFLIGHT_FAILED`
- `TLS_VERIFICATION_FAILED`
- `SCHEMA_PUSH_FAILED`
- `CANONICAL_READER_DATA_UNVERIFIED`
- `INTEGRATION_GATE_FAILED`
- `DEPLOYED_COMMIT_QA_FAILED`

Only a fully evidenced run may justify a future status change to provider approved.
