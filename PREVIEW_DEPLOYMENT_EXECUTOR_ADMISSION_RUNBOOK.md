# RamaVerse Preview Deployment Executor Admission

Status: **FAIL-CLOSED — NO EXECUTOR CURRENTLY ENABLED**

This control sits between `PREVIEW_DEPLOYMENT_HANDOFF_READY` evidence and any future provider-specific preview deploy workflow.

It does not deploy anything. It verifies the handoff, exact repository commit and provider candidate, then checks `PREVIEW_DEPLOYMENT_EXECUTOR_REGISTRY.json`.

Admission succeeds only when the registry contains the same provider candidate with all of the following:

- `executor_status: REVIEWED_AND_ENABLED`
- `reviewed: true`
- `enabled: true`
- a non-empty provider-specific workflow path

The registry default is `DENY`. At present every provider candidate is `NOT_IMPLEMENTED_NOT_APPROVED`, so this gate is intentionally expected to fail closed.

A future provider-specific executor must be reviewed independently before its registry record is enabled. Generic instructions to proceed or continue do not enable an executor and do not authorize deployment.

Even successful executor admission emits evidence with `execution_performed: false`, `production_ready: false`, `production_dns_change_allowed: false`, and `production_deployment_change_allowed: false`.
