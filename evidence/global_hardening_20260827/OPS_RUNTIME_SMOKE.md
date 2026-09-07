# Global Hardening Runtime Smoke — 2026-08-27

The local Website server returned HTTP 200 for `/`, `/kandas`, `/search`, `/ask`, `/knowledge`, `/robots.txt`, `/sitemap.xml`, `/manifest.json`, `/ops/health`, and `/ops/release-state`.

The root response included `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `Content-Security-Policy-Report-Only`. Internal and staging-like paths are configured for `noindex, nofollow, noarchive`.

`/ops/health` reported `ok: true`, active corpus version `v1.4.0`, canonical count `550`, and PWA cache `ramaverse-cache-v5`. `/ops/release-state` reported staging publication `0` and user-question logging disabled. The v1.5 approved candidate remains a separate, non-active reference and was not promoted.
