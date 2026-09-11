# RamaVerse Provider Candidate Selection Runbook

## Purpose

This gate records explicit owner selection of one dedicated preview provider candidate for **live validation only**. It creates evidence before the read-only provider preflight can connect to that candidate.

`PROVIDER_CANDIDATE_SELECTION_APPROVED` means only that the named candidate may proceed to controlled live-preview candidate validation.

It does **not** mean:

- the provider is approved for preview runtime;
- any paid plan, cloud or region is approved;
- provider infrastructure may be provisioned automatically;
- credentials may be created or changed automatically;
- the database may be mutated;
- preview may be deployed;
- production is ready;
- production DNS or deployment may change.

## Required inputs

The `RamaVerse Provider Candidate Selection` workflow requires:

1. the exact `provider_candidate`;
2. `owner_provider_candidate_approval: true`;
3. a non-empty `selection_reason`.

A generic instruction such as **proceed**, **continue**, or **start the next task** is not provider-candidate approval and must not be substituted for the explicit workflow input.

## Evidence

A successful run emits a non-secret artifact with:

- `result: PROVIDER_CANDIDATE_SELECTION_APPROVED`;
- exact repository and evidence-producing commit;
- exact provider candidate;
- selection reason;
- explicit owner approval;
- `selection_scope: live_preview_candidate_validation_only`;
- all provisioning, connection, mutation and deployment flags false;
- all production authorization flags false.

The selection artifact contains no provider credentials and performs no provider API calls, database connections, provisioning, mutation or deployment.

## Next controlled step

Any dedicated-provider provisioning remains a separate owner-controlled external action. Once a candidate exists and the required repository secrets are configured, `RamaVerse Provider Read-Only Preflight` must receive the successful selection workflow run ID and independently validate its evidence before attempting database connectivity.

The preflight must reject an artifact for a different candidate. Selection evidence is not tied to one source commit so an unchanged owner decision can survive later repository commits, but it remains bound to the exact candidate and repository.

## Supersession and revocation

A later explicit owner selection can supersede an earlier candidate. Operators must never silently substitute a provider name or reuse an approval artifact for another candidate. If the owner revokes a candidate, do not run the read-only preflight from the old evidence; create a new explicit decision only if another candidate is approved.

## Production boundary

Provider candidate selection is a preview-validation governance decision only. Production remains **NO-GO** until the independent production gates are satisfied and explicitly approved.
