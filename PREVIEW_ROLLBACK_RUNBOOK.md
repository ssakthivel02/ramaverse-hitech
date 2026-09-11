# RamaVerse Preview Rollback Runbook

Status: **PREVIEW SAFETY CONTROL — NO AUTOMATIC ROLLBACK EXECUTION**

This runbook defines how to prepare a safe rollback target for the RamaVerse non-production preview environment. It does not authorize or perform a deployment, DNS change, production rollback, database restore, or provider mutation.

## Scope and invariants

- Canonical repository: `ssakthivel02/ramaverse-hitech`.
- Preview only. Production remains separately blocked.
- A rollback target must be an older ancestor commit of the currently deployed preview commit.
- The target must already have successful RamaVerse Quality Gate, Preview Deployment Preflight, and Preview Release Candidate evidence.
- The target must not be selected merely because it is older.
- Database/data rollback is not implied by application rollback. Schema/data compatibility must be evaluated separately for the actual provider state.
- No shared cross-project database may be introduced during recovery.
- No production DNS, production deployment, or root-domain routing change is authorized by rollback readiness.

## When to prepare rollback

Prepare rollback readiness when a deployed preview has a material defect, for example:

- release identity mismatch;
- readiness failure;
- canonical Reader regression;
- security-header regression;
- service-worker/cache regression;
- provider/runtime incompatibility;
- post-deployment failure discovered after smoke or preview acceptance.

Do not use rollback as a shortcut around fixing corpus governance, provider identity, or canonical-data approval failures.

## Gate 1 — identify exact current deployed commit

Read `/releasez` from the preview and record the exact 40-character commit SHA. If exact repository/commit identity is unavailable, fail closed and do not guess.

## Gate 2 — choose an older candidate target

The proposed target must:

- exist in `ssakthivel02/ramaverse-hitech`;
- differ from the currently deployed commit;
- be an ancestor of the currently deployed commit;
- represent a previously known-good preview candidate.

Do not choose arbitrary branches, forks, legacy repositories, or unrelated historical exports.

## Gate 3 — verify historical release evidence

Before declaring the target rollback-ready, prove that the exact target SHA has successful completed runs for:

1. `RamaVerse Quality Gate`
2. `RamaVerse Preview Deployment Preflight`
3. `RamaVerse Preview Release Candidate`

Any missing evidence means **NOT ROLLBACK READY**.

## Gate 4 — explicit owner rollback approval

Run `RamaVerse Preview Rollback Readiness` only after the owner explicitly approves preparing the exact rollback target.

Required inputs:

- `current_deployed_commit`
- `rollback_target_commit`
- `provider_candidate`
- `rollback_reason`
- `owner_rollback_approval=true`

This approval authorizes readiness evaluation only. It does not authorize an actual provider deployment or production change.

## Gate 5 — readiness evidence

A successful workflow emits a non-secret `preview-rollback-readiness-<target-sha>` artifact containing:

- `result: PREVIEW_ROLLBACK_READY`
- exact repository
- current deployed commit
- rollback target commit
- provider candidate
- rollback reason
- explicit owner approval
- ancestor verification
- successful target Quality/Preflight/RC evidence flags
- `preview_scope_only: true`
- `execution_performed: false`
- production authorization fields all `false`

## Gate 6 — provider-specific execution remains separate

Actual rollback execution must be designed against the selected dedicated preview provider after that provider is approved and live. The execution procedure must consume the rollback-readiness evidence and must independently verify:

- exact provider/service identity;
- exact currently deployed commit immediately before mutation;
- target artifact/build identity;
- database/schema compatibility with the target;
- no production DNS/routing impact.

Until those provider-specific controls exist, `PREVIEW_ROLLBACK_READY` means only that the source target is safe to consider.

## Gate 7 — post-rollback validation

After any future provider-specific rollback execution, rerun the same deployed-preview verification chain against the rolled-back exact commit:

- release identity;
- `/healthz`;
- `/readyz`;
- canonical Reader behavior;
- security and cache headers;
- Preview HTTP Smoke.

A rollback is not successful merely because a provider reports a successful deployment.

## Fail-closed states

- `CURRENT_DEPLOYED_IDENTITY_UNKNOWN`
- `ROLLBACK_TARGET_INVALID`
- `ROLLBACK_TARGET_NOT_ANCESTOR`
- `ROLLBACK_TARGET_QUALITY_EVIDENCE_MISSING`
- `ROLLBACK_TARGET_PREFLIGHT_EVIDENCE_MISSING`
- `ROLLBACK_TARGET_RC_EVIDENCE_MISSING`
- `OWNER_ROLLBACK_APPROVAL_REQUIRED`
- `DATABASE_COMPATIBILITY_REQUIRES_REVIEW`
- `PROVIDER_SPECIFIC_EXECUTION_NOT_DEFINED`

Production authorization remains outside this entire rollback path.
