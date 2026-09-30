# RamaVerse HI-TECH Repository Governance

This document defines the repository-level collaboration controls expected for `ssakthivel02/ramaverse-hitech`.

## Canonical repository

This repository is the only active RamaVerse HI-TECH source of truth. OLD/LEGACY RamaVerse repositories, exports, and historical website files are read-only reference only and must not be developed, repaired, redesigned, deployed, or used as current authority.

## Verified GitHub enforcement state

A fresh GitHub settings check on 2026-09-30 confirmed repository ruleset `Protect main` (ruleset ID `23981067`) is active and targets the default branch. The live ruleset requires pull-request changes, dismisses stale reviews on push, requires Code Owner review and review-thread resolution, blocks branch deletion and non-fast-forward updates, and requires status check `validate`. GitHub reports no bypass actors and `current_user_can_bypass` as `never`.

This supersedes the 2026-09-11 audit state in which `main` was unprotected and the repository had no rulesets. Repository files such as CODEOWNERS and this document do not themselves provide branch protection; the live GitHub ruleset is the enforcement authority and must be fresh-checked before relying on it.

## Enforced controls for `main`

The current `Protect main` ruleset provides these controls:

1. Require changes to enter through a pull request rather than direct pushes.
2. Require status check `validate` before merge.
3. Require Code Owner review for protected/high-risk files.
4. Dismiss stale approvals when the head commit changes.
5. Require all review conversations to be resolved before merge.
6. Block force-pushes/non-fast-forward updates and branch deletion for `main`.
7. Keep bypass actors empty; no generic “proceed” or “continue” instruction grants a bypass.

The ruleset currently allows merge, squash, and rebase merge methods and requires zero general approving reviews. Do not silently reinterpret those settings as a different review policy. Any future settings change must be verified from GitHub before repository authority files are updated.

## Required operating sequence

Every write task must follow:

**fresh-check → collision check → narrow branch → implementation → tests → Draft PR → exact-head CI → pre-merge collision check → merge → exact-main post-merge verification**

Before a write:

- check the exact current `main` SHA;
- check open PRs and issues;
- check queued/running Actions;
- check whether another branch/agent is already modifying the same area;
- inspect the existing implementation before creating a replacement;
- fresh-check the live GitHub ruleset when enforcement state matters;
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

`.github/CODEOWNERS` assigns the repository owner to the complete repository and explicitly calls out governance, corpus/staging, server, and client surfaces. Code Owner review is currently enforced by the active `Protect main` ruleset. That statement remains conditional on a fresh GitHub settings check because repository files cannot guarantee that an administrator has not subsequently changed the ruleset.

## Pull-request contract

`.github/pull_request_template.md` requires every PR to record its exact base SHA, collision checks, authority/safety boundary, validation steps, and post-merge verification plan. PR authors must replace template placeholders with real evidence rather than checking boxes mechanically.
