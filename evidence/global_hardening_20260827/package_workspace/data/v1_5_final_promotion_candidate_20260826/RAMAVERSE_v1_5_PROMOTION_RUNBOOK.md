# RamaVerse v1.5 Promotion Runbook

This is a preparation artifact only. Promotion is not executed.

1. Create a pre-promotion backup of canonical 550 and record its hash.
2. Verify the freeze manifest, candidate archive, approval ledger, and every projection hash.
3. Validate candidate records and excluded hold boundaries.
4. Stage candidate pointer in an isolated transaction.
5. Validate Search, Ask, Reader, graph, timeline, entity, place, journey, and source projections.
6. Activate atomically only after explicit owner authorization.
7. On any failure, retain canonical 550 and do not publish staging.
8. Roll back by restoring the canonical pointer and all baseline projections, then clear candidate cache/index entries.
9. Verify canonical hash, projection parity, language state, PWA/offline state, and zero orphan caches.

Production canonical remains 550 and deployment is not performed by this package.