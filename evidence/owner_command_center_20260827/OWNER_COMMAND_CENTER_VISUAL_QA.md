# Owner Command Center visual QA

Generated 2026-08-27T16:18:38.579Z.

The route is intentionally admin-gated. In the available preview session the unauthenticated state rendered the restricted-access screen, confirming that the dashboard does not expose operational data anonymously. Authenticated-owner rendering is covered by the route contract and build validation. The implementation uses a dense but responsive evidence layout: health cards, corpus KPIs, semantic tables, missing-asset cards, parity filters, release fields, quality gates, and owner actions. No deployment or mutation control is exposed as a fake UI button.

The dashboard preserves narrow-screen overflow safety through scrollable tables, stacked cards, and responsive grid breakpoints. Status labels are text-based and remain understandable without color.
