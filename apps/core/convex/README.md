# Memvella Convex Backend

This directory contains the Convex backend for `apps/core`.

## Before Editing

1. Read `apps/core/convex/_generated/ai/guidelines.md`.
2. Read `docs/auth-and-identity.md` if you are touching auth, onboarding, passkeys, or senior sessions.
3. Read `docs/data-model.md` if you are touching schema, tables, or migrations.

## What Lives Here

- `schema.ts`: the current database schema, including canonical tables and legacy compatibility tables that are still present during migration.
- `auth.ts`, `auth.config.ts`, `http.ts`: Better Auth and Convex auth integration.
- `supporter.ts`: Supporter-side mutations and queries.
- `independentAuth.ts`: independent onboarding, recovery, and passkey enrollment.
- `kiosk.ts`, `seniorAccessHelpers.ts`: Assisted Senior pairing and device-bound session handling.
- `voice*.ts`, `aiActions.ts`, `insights*.ts`: voice orchestration, AI processing, and insight generation.

## Data Model Guidance

- Prefer the FamilySpace-based model for new work.
- Do not build new features on legacy compatibility tables unless the task is explicitly a migration.
- When schema changes affect existing data, document the migration plan in `docs/data-model.md` and use a safe rollout pattern.

## Commands

From the repo root:

- `pnpm convex:dev`
- `pnpm convex:deploy`

From `apps/core` directly:

- `pnpm exec convex dev`
- `pnpm exec convex deploy`

## Environment

The local app example lives in `apps/core/.env.example`.
Keep the documented contract in sync with `docs/env.md` when adding, renaming, or removing variables.
