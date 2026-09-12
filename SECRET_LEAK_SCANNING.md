# Secret leak scanning

RamaVerse HI-TECH uses an independent CI secret-leak scan in addition to GitHub-native security features when those are available.

## Scope

The workflow scans pull requests, pushes to `main`, a weekly scheduled run, and manual dispatches. Checkout uses full Git history (`fetch-depth: 0`) so historical leaks are not hidden by a shallow clone.

## Implementation

- `actions/checkout` is pinned to an immutable commit.
- `gitleaks/gitleaks-action` v3.0.0 is pinned to immutable commit `e0c47f4f8be36e29cdc102c57e68cb5cbf0e8d1e`.
- Workflow permissions are read-only (`contents: read`).
- A failed secret scan is a security failure and must not be bypassed merely to obtain a green build.

## Finding handling

If a credential or secret is detected:

1. Treat it as potentially compromised; do not paste the secret into issues, PR comments, logs, or chat.
2. Revoke or rotate the credential at the issuing system before relying on repository cleanup.
3. Determine whether the secret exists in Git history, artifacts, releases, logs, or deployments.
4. Remove the secret from the source and, when necessary, perform a deliberate history-remediation procedure with owner approval.
5. Re-run the exact-head scan and the normal RamaVerse Quality Gate before merge.

A suppression or allowlist must be narrowly scoped, evidence-backed, and reviewed as a security exception. Broad exclusions are prohibited.

## Boundaries

This workflow does not enable GitHub-native Secret Scanning or Push Protection and must not be described as doing so. Issue #50 tracks that separate repository-administration control.

Secret scanning is not authorization for provider selection, database/schema changes, deployment execution, DNS changes, production release, corpus acquisition/promotion, credentials changes, or OLD/LEGACY writes.
