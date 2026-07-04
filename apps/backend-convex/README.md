# Memvella Convex Backend

This workspace contains the Convex backend for the Memvella product.

## Before Editing

1. Read `apps/backend-convex/convex/_generated/ai/guidelines.md`.
2. Read `docs/auth-and-identity.md` if you are touching auth, onboarding, or senior sessions.
3. Read `docs/data-model.md` if you are touching schema, tables, or migrations.
4. Read `docs/legacy-removal.md` if you are renaming routes, modules, tables, or compatibility surfaces.

## What Lives Here

- `convex/schema.ts`: the current database schema, including tables, indexes, and validation contracts.
- `convex/auth.ts`, `convex/auth.config.ts`, `convex/http.ts`: Better Auth and Convex auth integration.
- `convex/organiser.ts`: Workspace owner-side mutations and queries.
- `convex/kiosk.ts`, `convex/seniorAccessHelpers.ts`: companion tablet connection and device-bound session handling.
- `convex/liveVoice.ts`, `convex/voice*.ts`, `convex/insights*.ts`: voice orchestration, AI processing, and insight generation.

## Data Model Guidance

- Prefer the current `circle`-based model for new work.
- Follow `docs/legacy-removal.md` for retired terminology and compatibility rules.
- Do not reintroduce retired routes, table names, or compatibility surfaces.
- When schema changes affect existing data, document the migration plan in `docs/data-model.md` and use a safe rollout pattern.

## Exports

This package exports:

- `@memvella/backend` — the Convex `api` object for frontend consumers
- `@memvella/backend/dataModel` — TypeScript types (`Id`, `Doc`, etc.)

Frontend apps import the backend contract through these workspace exports instead of reaching into the `convex/_generated/` directory directly.

## Commands

From the repo root:

- `pnpm convex:dev`
- `pnpm convex:deploy`

From `apps/backend-convex` directly:

- `pnpm exec convex dev`
- `pnpm exec convex deploy`

## Environment

Create `apps/backend-convex/.env.local` with `CONVEX_DEPLOYMENT=<your deployment>` for local development.

Account email verification and password reset are sent from the Convex runtime. Configure the Better Auth and Resend values from `apps/backend-convex/.env.example` in the Convex deployment as well as the frontend app environment.

Frontend env vars like `NEXT_PUBLIC_CONVEX_URL` remain in `apps/core/.env.local`.
