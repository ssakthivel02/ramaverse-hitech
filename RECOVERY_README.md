# RamaVerse Website Recovery

This archive contains website source and evidence artifacts, excluding dependencies, build output, caches, credentials, and archives.

1. Extract into a clean directory.
2. Install locked dependencies with pnpm install --frozen-lockfile.
3. Configure managed environment variables through project settings; do not copy local .env files.
4. Apply the schema through the managed migration workflow if the target database is new.
5. Run pnpm check && pnpm test && pnpm build.
6. Refresh dry-run and evidence files with node scripts/refreshReconciliationEvidence.mjs && node scripts/prepareEvidence.mjs.

> The historical 550-record baseline is protected. The verified 28-record staging branch and separate unavailable 50-record claim remain separate and unpublished until authoritative reconciliation approval.
