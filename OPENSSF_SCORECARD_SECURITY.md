# OpenSSF Scorecard Security Contract

RamaVerse HI-TECH uses OpenSSF Scorecard as a repository-level supply-chain posture signal.

## Scope

The workflow evaluates repository security practices on `main`, on a weekly schedule, and when manually dispatched. It does not deploy application code, modify providers or databases, acquire/promote corpus data, change DNS, or authorize production release.

## Trust model

The workflow uses immutable commit SHA pins for every third-party GitHub Action. Mutable major tags are not permitted in this workflow.

The Scorecard result is advisory evidence for repository hardening. A low or changed score must be investigated rather than hidden, suppressed, or treated as permission to weaken other security gates.

## Permissions

The workflow is intentionally limited to:

- `contents: read` for repository analysis;
- `security-events: write` for security result publication;
- `id-token: write` for OpenSSF Scorecard result publication.

It must not receive repository contents write permission, deployment credentials, provider credentials, or production secrets.

## Fail-closed handling

A workflow failure must not be bypassed merely to obtain a green build. Determine whether the failure is caused by repository posture, GitHub/platform capability, or workflow configuration, then correct the underlying cause or record a bounded blocker.

## Relationship to other controls

This workflow complements, but does not replace:

- RamaVerse Quality Gate;
- CodeQL Security;
- Secret Leak Scan;
- branch protection / repository rulesets tracked by Issue #40;
- Dependency Graph prerequisite tracked by Issue #48;
- GitHub-native Secret Scanning / Push Protection tracked by Issue #50.

OpenSSF Scorecard output does not authorize provider selection, database/schema changes, deployment execution, DNS changes, production release, corpus acquisition/promotion, credential mutation, or OLD/LEGACY writes.
