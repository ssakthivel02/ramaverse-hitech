# CodeQL Security Scanning

RamaVerse HI-TECH uses GitHub CodeQL for JavaScript/TypeScript static application security testing.

## Scope

- Pull requests touching application or dependency files are analyzed before merge.
- Pushes to `main` for the same surfaces are analyzed.
- A weekly scheduled scan provides recurring coverage even when the repository is otherwise quiet.

## Safety controls

- The workflow uses an immutable `actions/checkout` reference.
- CodeQL actions are pinned to the verified CodeQL Action v4 commit.
- Workflow permissions are limited to `contents: read`, `actions: read`, and `security-events: write`.
- CodeQL findings are security evidence; they do not authorize deployment, provider selection, database mutation, DNS changes, or production release.

## Handling findings

Treat High/Critical findings as release-blocking until reviewed and resolved or explicitly risk-accepted by the project owner. Medium/Low findings should be triaged and tracked according to impact and exploitability.
