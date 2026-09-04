# Memvella

Memvella keeps familiar memories, gentle routines, and a friendly voice close to older people and their families.

This PNPM/Turbo monorepo contains the family app, companion tablet experience, Convex backend, and marketing site.

## Workspace

- `apps/core`: the product frontend. Contains the shared `/circle` Workspace shell, the companion tablet flow, and the Next.js frontend.
- `apps/backend-convex`: the Convex backend. Owns all server-side functions, schema, auth config, and AI actions. Exports `@memvella/backend` for frontend consumers.
- `apps/marketing`: the marketing and waitlist app.
- `packages/ui`: shared design system components and tokens (`@memvella/ui`).
- `packages/domain-circle`: shared Workspace-domain helpers and policies.
- `packages/config-typescript`: shared TypeScript base configs.
- `packages/config-eslint`: shared ESLint configs.

## Product Surface

- `/`: welcome and sign-in entry
- `/circle`: Today: routines, memories, and companion access
- `/circle/routines`: one clear routine schedule
- `/circle/memories`: memory library, detail, edit, and add flows
- `/circle/people`: familiar people, reached through Settings
- `/circle/insights`: owner review of conversation updates, reached through Settings
- `/circle/settings`: account, Supporters, invite codes, notifications, and companion tablet access
- `/assisted/login` and `/assisted`: companion tablet experience

## Stack

- Next.js 16
- React 19
- Convex
- Better Auth with `@convex-dev/better-auth`
- PNPM workspaces
- Turbo

## Requirements

- Node.js 20+
- PNPM 9+

## Getting Started

1. Install dependencies with `pnpm install`.
2. Create `apps/core/.env.local` from `apps/core/.env.example` and fill in the required values.
3. Create `apps/backend-convex/.env.local` from `apps/backend-convex/.env.example` with your `CONVEX_DEPLOYMENT` value.
4. If you are working on the marketing waitlist flow, create `apps/marketing/.env.local` from `apps/marketing/.env.example` too.
5. Start the Convex dev backend with `pnpm convex:dev`.
6. Start the monorepo dev processes with `pnpm dev`.

## Common Commands

- `pnpm dev`: start workspace dev tasks.
- `pnpm build`: build all apps.
- `pnpm lint`: run lint tasks across the workspace.
- `pnpm type-check`: run type-check tasks across the workspace.
- `pnpm test`: run workspace tests.
- `pnpm test:e2e`: run the Playwright browser suite.
- `pnpm test:e2e:ui`: open the Playwright UI runner.
- `pnpm test:e2e:headed`: run Playwright headed.
- `pnpm verify`: run lint, type-check, test, and build in sequence.
- `pnpm check:env`, `pnpm check:public`, and `pnpm check:copy`: run launch guardrail checks.
- `pnpm convex:dev`: run Convex dev for `apps/backend-convex`.
- `pnpm convex:deploy`: deploy the Convex backend.

## Documentation

Use AGENTS.md to select the relevant context for your task. The maintained documentation is:

1. `docs/product.md`
2. `docs/terminology.md`
3. `docs/architecture.md`
4. `docs/auth-and-identity.md`
5. `docs/data-model.md`
6. `docs/legacy-removal.md`
7. `docs/env.md`
8. `docs/testing.md`
9. `docs/launch-runbook.md`
10. `apps/core/design.md` or `apps/marketing/design.md`, depending on scope

The root `docs/` files are expected to describe the current shipped product and architecture. If implementation changes a contract, update the relevant canonical doc in the same change.

## Security

Report suspected vulnerabilities privately. See `SECURITY.md` for the reporting process.

## License

See `LICENSE`. Public repository access does not grant reuse rights unless the license is changed.

## Repo Rules

- Root `docs/` files are the canonical written source of truth.
- `apps/backend-convex/convex/_generated/ai/guidelines.md` must be read before editing Convex code.
- Build artifacts such as `.next/` and `.turbo/` are disposable and should not be treated as source material.
- Historical or superseded notes belong under `docs/archive/`.
