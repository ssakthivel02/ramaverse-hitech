# RamaVerse Hi-Tech

This repository is the canonical source for the new RamaVerse Hi-Tech website/runtime. The current owner-approved website source is present here as a full-stack React/Vite + Express/tRPC application.

## Source policy

- This repository is the only canonical website source for the HITECH RamaVerse build.
- Do not import or merge legacy RamaVerse repositories, historical website exports, or old application files into this repository.
- Cloudflare storage is not a canonical source repository.
- GitHub remains the canonical source and release authority.

## Current authority hierarchy

Before any new work, use `CURRENT_PROJECT_AUTHORITY.json` for the current operational/release state and `CONTINUATION_AUTHORITY.json` for corpus continuation authority.

`PROJECT_STATE.json` and `RAMAVERSE_PROJECT_STATE.json` are retained as historical evidence only. Their old continuation markers, runtime counts, test counts, deployment state, and exact-next-source fields are not current authority and must not be used to start acquisition, promotion, deployment, or release work.

If the authority files prohibit acquisition or promotion, agents must stop rather than infer a continuation point from historical files.

## Runtime boundary

RamaVerse is not a GitHub Pages-only application. The Sarga Reader and other governed discovery surfaces depend on the Express/tRPC backend and MySQL/Drizzle data access. Static React assets and the Node backend are built together for the first controlled preview.

The repository also contains an activated canonical corpus governed by `data/corpus/ACTIVE_CORPUS.json`. Corpus activation metadata and the Reader database are deliberately separate: a schema-only database must never be treated as proof that canonical Reader rows have been loaded.

## Provider-neutral runtime

- Core LLM access uses an explicit OpenAI-compatible endpoint when an intelligence feature is enabled.
- Optional account authentication uses standard OIDC/OAuth 2.0 authorization-code flow and RamaVerse-owned session JWTs.
- Public Reader access does not require identity.
- Imported Forge/WebDev/Manus runtime helpers and delivery scaffolding have been removed from the deployable runtime.
- CI scans both production-critical source and the compiled `dist/` artifact for prohibited legacy runtime markers.

## Preview architecture

See `PREVIEW_DEPLOYMENT_PLAN.md` and `PREVIEW_RUNTIME_READINESS.md`.

The first controlled preview uses a separately provisioned Node runtime and preview MySQL database. The database/runtime must be dedicated to RamaVerse and explicitly identified; a shared cross-project database service is not an acceptable preview dependency. `render.yaml` defines the preview web service. Production DNS is not attached until preview QA passes.

## Validation

The mandatory quality gate performs:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm lint
pnpm test
pnpm build
```

It then scans the deployable artifact, boots the built production server, verifies `/healthz` and `/`, and verifies `/readyz` fails closed when required preview dependencies are absent.

A separate preview DB workflow creates/verifies schema and connectivity. The separate integration gate is used only after an owner-approved lossless Sarga dataset is loaded. A deployed-preview HTTP workflow verifies HTTPS, live/readiness endpoints, root serving, baseline security headers, and absence of legacy runtime markers.

## Release rule

Do not claim production-ready until the exact deployed commit passes database/corpus integration, route/API smoke tests, responsive/accessibility/link/asset checks, security validation, custom-domain HTTPS checks, and production smoke/E2E gates.
