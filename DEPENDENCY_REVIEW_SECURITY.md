# Dependency Review Security

RamaVerse HI-TECH uses GitHub Dependency Review to inspect dependency changes introduced by pull requests before merge.

## Scope

The workflow runs when a pull request changes package manifests/lockfiles, GitHub Actions workflow dependencies, local GitHub Actions, or Dependabot configuration.

## Policy

- Dependency Review is pinned to an immutable commit for release `v5.0.0`.
- The workflow has read-only repository contents permission.
- Pull requests introducing dependencies with High or Critical known vulnerabilities fail the dependency-review job.
- Findings are review evidence only; they do not authorize provider selection, database changes, deployment, DNS changes, or production release.
- Existing dependencies that are not changed by a pull request remain covered by Dependabot and CodeQL rather than being misrepresented as newly introduced by Dependency Review.

## Operating rule

A dependency-review failure must be investigated before merge. Upgrade, remove, or explicitly defer the affected dependency with documented rationale; do not bypass the gate simply to make CI green.
