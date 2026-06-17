# Memvella Convex Backend

This directory contains the Convex backend, exported as `@memvella/backend`.

## Before Editing

1. Read `apps/backend-convex/convex/_generated/ai/guidelines.md`.
2. Read `docs/auth-and-identity.md` if you are touching auth, onboarding, or senior sessions.
3. Read `docs/data-model.md` if you are touching schema, tables, or migrations.
4. Read `docs/legacy-removal.md` if you are renaming routes, modules, tables, or compatibility surfaces.

## What Lives Here

- `schema.ts`: the current database schema.
- `auth.ts`, `auth.config.ts`, `http.ts`: Better Auth and Convex auth integration.
- `organiser.ts`: signed-in supporter mutations and queries for the shared Workspace.
- `kiosk.ts`, `seniorAccessHelpers.ts`: companion tablet pairing and device-bound session handling.
- `voice*.ts`, `aiActions.ts`, `insights*.ts`: voice orchestration, AI processing, and insight generation.

## Data Model Guidance

- Prefer the target `circle`-based model for new work.
- Follow `docs/legacy-removal.md` for the approved rename map and rollout order when removing compatibility surfaces.
- Do not build new features on legacy compatibility tables unless the task is explicitly a migration.
- When schema changes affect existing data, document the migration plan in `docs/data-model.md` and use a safe rollout pattern.

## Commands

From the repo root:

- `pnpm convex:dev`
- `pnpm convex:deploy`

From `apps/backend-convex` directly:

- `pnpm exec convex dev`
- `pnpm exec convex deploy`

## Environment

The local app example lives in `apps/core/.env.example`.
Keep the documented contract in sync with `docs/env.md` when adding, renaming, or removing variables.
