# RamaVerse Preview Deployment Handoff Runbook

## Purpose

This runbook defines the final provider-neutral handoff between an approved RamaVerse preview deployment candidate and any future provider-specific deployment executor.

The handoff is evidence only. It does not provision infrastructure, create or rotate secrets, mutate the database, deploy an application, change routing, or change production DNS.

## Required upstream evidence

Run `RamaVerse Preview Deployment Handoff` only after a successful `RamaVerse Preview Deployment Authorization` workflow exists for the exact preview deployment candidate.

The authorization artifact must prove all of the following:

- `result` is `PREVIEW_DEPLOYMENT_AUTHORIZED`;
- owner preview-deployment approval is true;
- exact release evidence passed;
- live integration evidence passed;
- rollback readiness evidence passed;
- scope is preview only;
- execution was not performed;
- production readiness remains false;
- production DNS and production deployment permissions remain false.

## Output

A successful handoff emits a sanitized `PREVIEW_DEPLOYMENT_HANDOFF_READY` artifact containing:

- exact repository and deployment commit;
- exact approved provider candidate string;
- upstream authorization, integration-gate and rollback-readiness run IDs;
- preview service name;
- expected preview database name;
- health and release-identity endpoints;
- required environment-variable names;
- required non-secret values;
- explicit statements that no secret values are present and no provider/database/deployment mutation occurred.

## Secret policy

The artifact contains secret **names only**. It must never contain database passwords, connection strings with credentials, private keys, OIDC client secrets, JWT secret material, provider API tokens, GitHub tokens, or any other credential value.

The workflow includes a leakage scan and fails closed if common credential patterns are detected.

## Execution boundary

`PREVIEW_DEPLOYMENT_HANDOFF_READY` means only that the evidence and sanitized runtime contract are ready to be consumed by a separately defined provider-specific preview deployment executor.

It does **not** mean:

- the provider has been provisioned;
- secrets have been configured;
- the database has been mutated;
- the application has been deployed;
- HTTP smoke has passed against a live preview;
- preview acceptance has been granted;
- production is ready;
- production DNS or production deployment is authorized.

## Provider-specific executor requirements

A future provider-specific executor must remain a separate change set. Before any implementation it must:

1. fresh-check `main`, open PRs/issues and active workflows;
2. verify an unexpired `PREVIEW_DEPLOYMENT_HANDOFF_READY` artifact for the exact commit/provider;
3. use least-privilege provider credentials supplied through protected secrets, never repository files or artifacts;
4. deploy the exact approved commit only;
5. keep auto-deploy disabled unless separately approved;
6. preserve the dedicated `ramaverse_preview` database boundary;
7. perform no production DNS or production deployment changes;
8. produce provider-specific deployment evidence;
9. require post-deployment `/releasez`, `/healthz`, `/readyz`, integration and preview-acceptance validation.

## Current state

Until a dedicated preview provider is explicitly selected and approved, this handoff layer is the terminal internal boundary. No provider-specific deploy executor should be invented or run merely to make the pipeline look complete.
