# Experience Center visual QA

## Desktop — 1280 × 720

The new `/experience-center` route renders with the existing deep-navy and Ayodhya-gold design language, a readable serif hero, a contained gold light motif, clear primary and secondary actions, and a five-mode accessible selector. The Home route retains its existing multilingual hero and discovery controls. The private Owner Command Center correctly shows an owner-access gate when the preview session is not authenticated; operational evidence is not exposed anonymously.

## Mobile — 390 × 844

The Experience Center hero wraps without clipping, the decorative light remains secondary, actions stack into touch-sized controls, and the mode selector wraps into a readable grid. Text remains legible against the dark background, and the page remains usable without motion. No new image, audio, or network dependency is required for the initial viewport.

## Safety/accessibility observations

Mode and age selectors use buttons with `aria-pressed`; section headings and evidence labels are semantic; source IDs and locators remain visible; the Share Card action is explicit and copies a source-aware card rather than an invented quotation. Festival, devotional, and Rama Setu sections disclose review boundaries and avoid unsupported dates, historical claims, rights claims, or promised outcomes.
