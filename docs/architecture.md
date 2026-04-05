# Architecture

Status: canonical
Scope: root
Last reviewed: 2026-04-04
Owners: engineering
Read when: touching routing, backend integration, or repo structure
Depends on: docs/product.md, docs/data-model.md

## Monorepo Layout

- `apps/core`: Next.js product app and Convex backend
- `apps/marketing`: Next.js marketing app
- `docs/`: canonical product and engineering documentation

## Core App Structure

- `apps/core/app`: App Router routes, layouts, and API routes
- `apps/core/components`: shared UI and experience-specific components
- `apps/core/lib`: frontend helpers, auth glue, device fingerprinting, push helpers
- `apps/core/convex`: schema, queries, mutations, actions, HTTP router, and auth integration

## Runtime Architecture

### Frontend

- Next.js 16 App Router powers both apps.
- `apps/core` exposes a shared family-side workspace at `/circle`, plus role-specific onboarding and senior-side routes.
- `apps/core/app/providers.tsx` wires the Convex client and Better Auth provider integration.
- `apps/marketing` now ships a real multi-page surface and posts waitlist submissions through a server route to the Convex backend.

### Backend

- Convex is the system of record for product data and backend logic.
- Better Auth routes are registered into the Convex HTTP router in `apps/core/convex/http.ts`.
- Next.js exposes those auth routes through `apps/core/app/api/auth/[...all]/route.ts`.

### Auth Path

- Better Auth configuration lives in `apps/core/convex/auth.ts`.
- Next.js server helpers live in `apps/core/lib/auth-server.ts`.
- Client auth calls use `apps/core/lib/auth-client.ts`.
- Senior-side device sessions are separate from Better Auth sessions and are handled in Convex.
- Organiser and Member family-side account sessions use Better Auth email and password.
- Independent User onboarding uses Better Auth phone verification plus Convex-managed senior sessions and optional passkeys.

## Data Architecture

- The current canonical model is anchored on `familySpaces`, `familySpaceMemberships`, and `seniorProfiles`.
- New routines, memories, notifications, and voice records should attach to `familySpaceId` or `seniorProfileId` through canonical tables.
- Marketing waitlist submissions are stored separately from product data.
- Legacy compatibility tables still exist in the schema and must be treated as transitional.

## Documentation Rules

- `docs/` is canonical.
- `docs/archive/` is non-canonical and historical.
- One-off audits should be archived or removed once replaced by canonical docs.

## Generated And Local Files

These are not source material and should not be treated as product or architecture truth:

- `.next/`
- `.turbo/`
- `next-env.d.ts`
- generated Convex files, except when needed for codegen output inspection

## New Work Guidance

- Update the relevant canonical doc when a contract changes.
- Prefer the smallest change that keeps the current FamilySpace model coherent.
- Do not rebuild removed caregiver-era architecture through new docs or new code.
