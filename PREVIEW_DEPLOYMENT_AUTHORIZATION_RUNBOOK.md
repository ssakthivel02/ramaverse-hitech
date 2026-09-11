# RamaVerse Preview Deployment Authorization Runbook

## Purpose

`PREVIEW_DEPLOYMENT_AUTHORIZED` is a fail-closed authorization record for one exact RamaVerse **preview** deployment candidate. It is not a deployment action and it is not production approval.

The authorization gate exists so a provider-specific deploy implementation cannot bypass the evidence chain already established by RamaVerse HI-TECH.

## Required evidence chain

Before authorization can be emitted, all of the following must be true for the exact deployment commit and provider candidate:

1. the commit exists in `ssakthivel02/ramaverse-hitech`;
2. RamaVerse Quality Gate succeeded for that commit;
3. RamaVerse Preview Deployment Preflight succeeded for that commit;
4. RamaVerse Preview Release Candidate succeeded for that commit;
5. RamaVerse Integration Gate succeeded for that commit;
6. the Integration Gate artifact is `LIVE_INTEGRATION_PASS` for the same provider candidate and confirms canonical Reader data plus canonical DB tests;
7. RamaVerse Preview Rollback Readiness succeeded;
8. the rollback artifact is `PREVIEW_ROLLBACK_READY`, protects the same proposed deployment commit/provider, has explicit owner rollback approval, and has not itself executed anything;
9. the owner explicitly approves this exact preview deployment candidate.

Only after all nine checks pass may the authorization workflow emit `PREVIEW_DEPLOYMENT_AUTHORIZED`.

## What authorization means

A successful artifact means only:

- the exact source commit has the required release evidence;
- live DB/canonical integration evidence exists for the same commit/provider;
- rollback readiness exists for the same proposed deployment;
- the owner has approved this exact preview deployment candidate;
- a provider-specific preview deployment implementation may now be invoked separately once that implementation exists and the selected provider is explicitly approved.

The artifact intentionally records:

- `preview_scope_only: true`;
- `execution_performed: false`;
- `production_ready: false`;
- `production_dns_change_allowed: false`;
- `production_deployment_change_allowed: false`.

## What authorization does NOT mean

`PREVIEW_DEPLOYMENT_AUTHORIZED` does **not**:

- provision a provider;
- create or mutate a database;
- run `db:push`;
- deploy the application;
- change preview routing;
- change production DNS;
- change production deployment configuration;
- approve production;
- replace Preview HTTP Smoke;
- replace Preview Acceptance Gate;
- make a provider approved if its live validation has not separately completed.

## Provider-specific execution boundary

RamaVerse currently has no provider-specific preview deploy executor because no dedicated preview provider has been explicitly selected and live-approved.

Do not add or invoke a deploy executor until:

1. the owner explicitly approves the provider candidate for live validation;
2. dedicated provider provisioning is complete;
3. the provider passes the existing preflight → schema → integration chain;
4. deployment authorization evidence exists for the exact commit/provider;
5. provider-specific deployment and rollback behavior has been documented and reviewed.

## After actual preview deployment

Authorization is **before** deployment, not the end of the preview qualification chain.

After a real preview deployment:

1. run RamaVerse Preview HTTP Smoke using the matching Integration Gate evidence;
2. require exact deployed repository and commit identity;
3. require security/readiness/canonical-corpus checks to pass;
4. obtain explicit owner preview acceptance through RamaVerse Preview Acceptance Gate;
5. retain production as NO-GO until a separate production decision is made.

The intended chain is therefore:

`provider approval → read-only preflight → schema evidence → canonical Reader load → live integration → rollback readiness → preview deployment authorization → provider-specific preview deploy → deployed smoke → explicit preview acceptance`

Production is outside this chain and remains separately blocked.
