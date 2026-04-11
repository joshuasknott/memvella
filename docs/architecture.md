# Architecture

Status: canonical
Scope: root
Last reviewed: 2026-04-11
Owners: engineering
Read when: touching routing, backend integration, schema design, or repo structure
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

## Routing Model

### Core Product Routes

- `/`: role-selection entry point
- `/circle`: shared family-side workspace for Organisers and Members
- `/onboarding/organiser`: organiser account creation
- `/organiser/signin`: organiser sign-in
- `/onboarding/member`: member join flow
- `/assisted/login`: Tablet User pairing and assisted session bootstrap
- `/assisted`: Tablet User experience
- `/onboarding/independent`: Independent User onboarding
- `/independent`: Independent User experience

Rules:

- `/circle` is the canonical family-side workspace route.
- Organiser and Member entry flows may differ, but they converge into `/circle`.
- Legacy `/supporter` and `/admin` routes are migration debt and should be removed.

### Marketing Routes

- `/`: single-page homepage
- `/privacy`: privacy policy
- `/terms`: terms of service
- `/contact`: contact page

Rules:

- Marketing is single-page-first.
- Separate marketing subpages should exist only when they have a real information architecture reason.
- Waitlist submission belongs to the homepage flow, even if the backend may expose a dedicated API route.

## Runtime Architecture

### Frontend

- Next.js 16 App Router powers both apps.
- `apps/core/app/providers.tsx` wires the Convex client and Better Auth provider integration.
- `apps/marketing` posts waitlist submissions through a server route to the Convex backend.

### Backend

- Convex is the system of record for product data and backend logic.
- Better Auth routes are registered into the Convex HTTP router in `apps/core/convex/http.ts`.
- Next.js exposes those auth routes through `apps/core/app/api/auth/[...all]/route.ts`.

## Auth Architecture

- Better Auth handles authenticated family-side account sessions for Circle participants.
- Convex-managed senior sessions handle Tablet User and Independent User device access.
- Independent auth is standalone and must not assume an existing Circle membership.

## Data Architecture

### Circle-Scoped Data

Circle-scoped data exists to coordinate human participants and Circle-level settings.

Examples:

- circles
- circle memberships
- invite codes
- Circle settings
- push subscriptions
- notification delivery state
- Circle activity visibility

### Senior-Scoped Data

Senior-scoped data exists to represent the senior's world, not the Circle's admin surface.

Examples:

- senior profiles
- people used for grounding and memory context
- memories and memory assets
- routines and routine history
- voice interactions
- insights
- alerts

Rules:

- Senior-facing content should anchor on `seniorProfileId`.
- Circle-facing coordination data should anchor on `circleId`.
- When a senior is linked to a Circle, Circle visibility derives from that senior's Circle relationship.
- Independent seniors remain valid without a Circle.

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
- Prefer the smallest change that moves the codebase toward the target `circle` model.
- Do not preserve legacy route, schema, or module names once a clean replacement exists.
- Do not rebuild retired caregiver-era or FamilySpace-era concepts through new code or docs.

## Implementation Note

The current implementation still contains legacy route aliases, module names, and schema surfaces. Those are temporary migration concerns, not the target architecture.
