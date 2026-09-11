# RamaVerse HI-TECH Security Policy

## Scope

This policy applies only to the canonical repository `ssakthivel02/ramaverse-hitech` and its active RamaVerse HI-TECH source, CI workflows, preview controls, and release artifacts.

OLD/LEGACY RamaVerse repositories, historical exports, and retired deployment surfaces are read-only reference and are not supported security-fix targets unless the owner explicitly reactivates them.

## Supported security surface

Security fixes should target the current `main` branch and the exact active release/preview commit under investigation. Do not silently port fixes into legacy repositories or unrelated projects.

## Reporting a vulnerability

Do not disclose exploit details, credentials, tokens, private keys, database connection strings, personal data, or other sensitive evidence in a public issue or pull request.

Prefer GitHub private vulnerability reporting / a private security advisory when that repository feature is available. If a private GitHub reporting channel is unavailable, create only a minimal public issue requesting a private contact path; do not include reproduction details, secrets, payloads, or sensitive logs in that public issue.

A useful private report should include:

- the affected commit SHA and file/component;
- impact and realistic attack preconditions;
- minimal reproduction steps or proof of concept;
- whether credentials, user data, deployment controls, corpus integrity, or CI/release integrity are affected;
- any known mitigation that does not destroy evidence.

## Handling rules

- Never commit real credentials or rotate secrets through a pull request.
- Redact sensitive values from logs, screenshots, issue bodies, test fixtures, and evidence bundles.
- Preserve exact commit SHAs and relevant CI evidence when investigating supply-chain or release-integrity findings.
- Treat dependency, GitHub Actions, lockfile, workflow-permission, build-output, and deployment-control findings as security-relevant when they can alter trusted code or release evidence.
- Do not weaken fail-closed corpus, provider, deployment, or production authorization controls as a shortcut for remediation.
- Generic instructions such as “proceed” or “continue” do not authorize provider selection, paid infrastructure, secret changes, deployment, DNS changes, corpus promotion, or production release.

## Dependency and workflow updates

Dependabot is configured to propose weekly updates for the pnpm/npm dependency graph and GitHub Actions references. Dependabot pull requests are proposals only: they must follow the same collision checks, exact-head CI, review, merge, and exact-main post-merge verification as any other change.

Automated update availability is not authorization to merge a major-version change, relax a security control, or enable a deployment path.

## Disclosure and remediation

Public disclosure should occur only after the affected active surface has been remediated or otherwise made safe and after sensitive operational details have been removed. Security fixes must remain narrowly scoped, auditable, and evidence-backed.
