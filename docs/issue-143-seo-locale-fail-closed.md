# Issue #143 — SEO locale fail-closed contract

Baseline: `8909b56b264774b9bdb4be772031ada1a6c03a6e`

## Contract

- Unprefixed indexable public routes remain indexable.
- Locale-prefixed public routes are indexable only when the locale is in the governed SEO set: `en`, `ta`, `hi`, `te`, `kn`, `ml`.
- Recognized multilingual framework/controlled-expansion locales remain usable by the product, but their prefixed routes fail closed for crawler indexability until separately qualified.
- Non-indexable locations emit `noindex,nofollow`, canonicalize to the public root, and emit no hreflang alternates.

## Non-goals

This change does not alter multilingual product availability, translation-state metadata, corpus content, providers, databases, infrastructure, DNS, or deployment authority.
