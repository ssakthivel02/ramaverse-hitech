# RamaVerse HI-TECH Repository Governance

This document defines the repository-level collaboration controls expected for `ssakthivel02/ramaverse-hitech`.

## Canonical repository

This repository is the only active RamaVerse HI-TECH source of truth. OLD/LEGACY RamaVerse repositories, exports, and historical website files are read-only reference only and must not be developed, repaired, redesigned, deployed, or used as current authority.

## Verified GitHub settings gap

During the 2026-09-11 governance audit, GitHub reported `main` as unprotected and the repository had no rulesets. Repository files cannot themselves enable GitHub branch protection or repository rulesets. Until an administrator enables those settings, CODEOWNERS and the pull-request template improve review discipline but do not technically prevent a direct push to `main`.

Do not misrepresent these repository files as branch protection.

## Required target settings for `main`

When GitHub administration is available, configure branch protection or a repository ruleset for `main` with the following minimum controls:

1. Require changes to enter through a pull request rather than direct pushes.
2. Require the RamaVerse Quality Gate to pass before merge.
3. Require Code Owner review for protected/high-risk files.
4. Dismiss stale approvals when the head commit changes.
5. Require all review conversations to be resolved before merge.
6. Block force-pushes and branch deletion for `main`.
7. Do not create broad bypass permissions. Any break-glass bypass must remain an intentional owner action and must not be inferred from a generic “proceed” or “continue” instruction.
8. Preserve the repository's merge-commit workflow; do not enable a linear-history rule unless the project deliberately changes merge strategy.

## Required operating sequence

Every write task must follow:

**fresh-check → collision check → narrow branch → implementation → tests → Draft PR → exact-head CI → pre-merge collision check → merge → exact-main post-merge verification**

Before a write:

- check the exact current `main` SHA;
- check open PRs and issues;
- check queued/running Actions;
- check whether another branch/agent is already modifying the same area;
- inspect the existing implementation before creating a replacement;
- stop rather than duplicate overlapping work.

## High-risk authority boundaries

`CURRENT_PROJECT_AUTHORITY.json` is the current operational/release authority. `CONTINUATION_AUTHORITY.json` is the corpus-continuation authority.

Generic instructions such as “proceed”, “continue”, or “start the next task” are not permission to:

- select or approve an infrastructure provider;
- create paid infrastructure;
- acquire or promote corpus material;
- mutate a live database;
- enable a deployment executor;
- deploy preview or production;
- change production DNS or routing.

Those actions require their separately defined evidence/approval gates.

## CODEOWNERS scope

`.github/CODEOWNERS` assigns the repository owner to the complete repository and explicitly calls out governance, corpus/staging, server, and client surfaces. Code Owner review only becomes an enforceable merge requirement when GitHub branch/ruleset settings require it.

## Pull-request contract

`.github/pull_request_template.md` requires every PR to record its exact base SHA, collision checks, authority/safety boundary, validation steps, and post-merge verification plan. PR authors must replace template placeholders with real evidence rather than checking boxes mechanically.
