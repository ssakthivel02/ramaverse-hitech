# RamaVerse Hi-Tech

Clean canonical repository for the new RamaVerse hi-tech website.

## Source policy

- The latest owner-approved Manus website export is the only website donor/source baseline.
- Do not import or merge legacy RamaVerse repositories or historical website files into this repository.
- Do not use Cloudflare storage as the canonical website source.
- GitHub is the canonical source repository.
- Manus source will be integrated only after the owner supplies the latest complete export.

## Deployment model

Target flow: Manus latest export -> this repository -> build/validation -> GitHub Pages -> custom DNS -> HTTPS -> production validation.

## Current status

Repository foundation initialized. Manus website source is intentionally not present yet.

## Release rule

Do not claim production-ready until the exact deployed commit passes build, route, responsive, accessibility, link, asset and production smoke-test gates.
