# Memvella

Memvella is a PNPM/Turbo monorepo for a voice-first digital wellness companion.

## Workspace

- `apps/core`: the product app. This includes the Organiser, Member, Tablet User, and Independent User experiences, the Next.js frontend, and the Convex backend.
- `apps/marketing`: the marketing and waitlist app.

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
3. If you are working on the marketing waitlist flow, create `apps/marketing/.env.local` from `apps/marketing/.env.example` too.
4. Start the Convex dev backend with `pnpm convex:dev`.
5. Start the monorepo dev processes with `pnpm dev`.

## Common Commands

- `pnpm dev`: start workspace dev tasks.
- `pnpm build`: build all apps.
- `pnpm lint`: run lint tasks across the workspace.
- `pnpm type-check`: run type-check tasks across the workspace.
- `pnpm test`: run workspace tests.
- `pnpm verify`: run lint, type-check, test, and build in sequence.
- `pnpm convex:dev`: run Convex dev for `apps/core`.
- `pnpm convex:deploy`: deploy the Convex backend for `apps/core`.

## Documentation

Read these files in order when you need product or implementation context:

1. `docs/product.md`
2. `docs/terminology.md`
3. `docs/architecture.md`
4. `docs/auth-and-identity.md`
5. `docs/data-model.md`
6. `docs/legacy-removal.md` when working on renames, migrations, or compatibility cleanup
7. `docs/env.md`
8. `docs/testing.md`
9. `apps/core/design.md` or `apps/marketing/design.md`, depending on scope

The root `docs/` files describe the target product and architecture contracts. During migrations, implementation may temporarily lag those contracts, but new work should move toward them rather than preserving legacy names or structures.

## Repo Rules

- Root `docs/` files are the canonical written source of truth.
- `apps/core/convex/_generated/ai/guidelines.md` must be read before editing Convex code.
- Legacy build artifacts such as `.next/` and `.turbo/` are disposable and should not be treated as source material.
- Historical or superseded notes belong under `docs/archive/`.
