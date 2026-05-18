# Memvella

Memvella is a PNPM/Turbo monorepo for the shipped Memvella product, its Convex backend, marketing site, and internal tooling.

## Workspace

- `apps/core`: the product frontend. Contains the shared `/circle` family-side workspace, the assisted tablet flow, the independent senior flow, and the Next.js frontend.
- `apps/backend-convex`: the Convex backend. Owns all server-side functions, schema, auth config, and AI actions. Exports `@memvella/backend` for frontend consumers.
- `apps/marketing`: the marketing and waitlist app.
- `apps/internal`: Memvella HQ, the founder-only internal operating system and mission-control app.
- `packages/ui`: shared design system components and tokens (`@memvella/ui`).
- `packages/config-typescript`: shared TypeScript base configs.
- `packages/config-eslint`: shared ESLint configs.
- `packages/testing`: shared test fixtures and seed helpers (scaffold).

## Current Product Surface

- `/`: role-selection entry screen
- `/circle`: shared family-side workspace for Organisers and Members
- `/circle/routines`: routine list and timeline
- `/circle/memories`: memory library, detail, edit, and add flows
- `/circle/insights`: combined organiser review queue for alerts and insights
- `/circle/settings`: account, members, invite codes, notifications, and tablet pairing
- `/assisted/login` and `/assisted`: paired tablet experience
- `/onboarding/independent`, `/independent`, `/independent/security`, `/independent/recover`: independent senior flow

Current deferred gaps:

- there is no dedicated Activity route yet; `/circle` shows current status and a routines-focused timeline instead
- there is no separate Alerts page yet; alerts are reviewed inside `/circle/insights`
- People is currently a limited add-person surface, not a full directory
- browser coverage currently focuses on the first deterministic Playwright smoke flows; see `docs/testing.md` for scope and remaining gaps

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
5. If you are working on Memvella HQ, create `apps/internal/.env.local` from `apps/internal/.env.example` and set the HQ access variables.
6. Start the Convex dev backend with `pnpm convex:dev`.
7. Start the monorepo dev processes with `pnpm dev`.

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
- `pnpm convex:dev`: run Convex dev for `apps/backend-convex`.
- `pnpm convex:deploy`: deploy the Convex backend.

## Documentation

Read these files in order when you need product or implementation context:

1. `docs/product.md`
2. `docs/terminology.md`
3. `docs/architecture.md`
4. `docs/auth-and-identity.md`
5. `docs/data-model.md`
6. `docs/legacy-removal.md`
7. `docs/env.md`
8. `docs/testing.md`
9. `apps/core/design.md` or `apps/marketing/design.md`, depending on scope

The root `docs/` files are expected to describe the current shipped product and architecture. If implementation changes a contract, update the relevant canonical doc in the same change.

## Repo Rules

- Root `docs/` files are the canonical written source of truth.
- `apps/backend-convex/convex/_generated/ai/guidelines.md` must be read before editing Convex code.
- Legacy build artifacts such as `.next/` and `.turbo/` are disposable and should not be treated as source material.
- Historical or superseded notes belong under `docs/archive/`.
