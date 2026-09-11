## Scope

Describe the single bounded change this PR makes.

## Why

State the verified gap or failure that justifies the change. Do not create work merely because a generic “continue” instruction was received.

## Collision check

- [ ] I fresh-checked exact `main` immediately before starting this branch.
- [ ] I checked open PRs, open issues, queued/running Actions, and overlapping branches/workstreams.
- [ ] No other active task is modifying the same area. If there is overlap, I stopped instead of duplicating work.
- [ ] The base SHA used to create this branch is recorded below.

Base SHA: `REPLACE_WITH_EXACT_SHA`

## Authority and safety boundary

- [ ] `CURRENT_PROJECT_AUTHORITY.json` and, when corpus continuation is involved, `CONTINUATION_AUTHORITY.json` were reviewed first.
- [ ] OLD/LEGACY repositories and historical exports were treated as read-only reference only.
- [ ] No historical project-state marker was promoted to current authority.
- [ ] Generic “proceed/continue/next task” instructions were not interpreted as provider selection, paid-plan approval, corpus acquisition/promotion approval, deployment authorization, DNS approval, or production approval.
- [ ] No credentials, tokens, connection strings containing secrets, or private keys are included.
- [ ] Any corpus/staging/public-surface mutation is explicitly authorized and provenance-backed; otherwise this PR makes none.
- [ ] Any provider/database/deployment/DNS/production mutation is explicitly authorized; otherwise this PR makes none.

## Validation

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm check`
- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] Relevant neutrality/security/runtime guards pass.
- [ ] Exact-head CI is green before merge.
- [ ] `main` and competing work are rechecked immediately before merge.
- [ ] Post-merge `main` workflows will be verified on the exact merge SHA before another write stream starts.

## Evidence / notes

Add links, run IDs, exact SHAs, or other evidence needed to audit the decision.
