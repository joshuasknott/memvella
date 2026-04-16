# Architecture

Status: canonical
Scope: root
Last reviewed: 2026-04-16
Owners: engineering
Read when: touching routing, backend integration, schema design, or repo structure
Depends on: docs/product.md, docs/data-model.md

## Monorepo Layout

- `apps/core`: Next.js product frontend
- `apps/backend-convex`: Convex backend (exports `@memvella/backend` and `@memvella/backend/dataModel`)
- `apps/marketing`: Next.js marketing app
- `apps/internal`: internal operations, support, and QA tools (scaffold)
- `packages/ui`: shared design system components and tokens (`@memvella/ui`)
- `packages/config-typescript`: shared TypeScript base configs
- `packages/config-eslint`: shared ESLint configs
- `packages/testing`: shared test fixtures and seed helpers (scaffold)
- `docs/`: canonical product and engineering documentation

## Core App Structure

- `apps/core/app`: App Router routes, layouts, and API routes
- `apps/core/components`: shared UI and experience-specific components
- `apps/core/lib`: frontend helpers, auth glue, device fingerprinting, push helpers, and senior session helpers

## Backend Structure

- `apps/backend-convex/convex`: schema, queries, mutations, actions, HTTP router, and auth integration
- Frontend apps import the Convex `api` object as `import { api } from "@memvella/backend"`
- Frontend apps import types as `import type { Id } from "@memvella/backend/dataModel"`

## Routing Model

### Family-Side Routes

- `/`: role-selection entry point
- `/onboarding/organiser`: organiser account creation
- `/organiser/signin`: family-side sign-in page currently used for organiser sign-in
- `/onboarding/member`: member invite-code preview, sign-up, sign-in, and join flow
- `/circle`: shared family-side home
- `/circle/routines`
- `/circle/add-routine`
- `/circle/memories`
- `/circle/memories/[memoryId]`
- `/circle/memories/[memoryId]/edit`
- `/circle/add-memory`
- `/circle/add-memory/text`
- `/circle/add-memory/media`
- `/circle/add-memory/audio`
- `/circle/add-memory/voice`
- `/circle/add-person`
- `/circle/insights`
- `/circle/settings`
- `/circle/settings/account`
- `/circle/settings/members`
- `/circle/settings/invite`
- `/circle/settings/notifications`
- `/circle/settings/pairing`

Current route facts:

- `/circle` is the canonical family-side workspace.
- Organisers and Members share the same `/circle` shell.
- There is no dedicated `/circle/activity` route.
- There is no separate `/circle/alerts` route.

### Senior Routes

- `/assisted/login`: tablet pairing flow
- `/assisted`: assisted tablet dashboard
- `/onboarding/independent`: independent onboarding
- `/onboarding/independent/verify`: redirect shim back to `/onboarding/independent`
- `/independent`: independent home
- `/independent/security`: trusted-device and recovery-code management
- `/independent/recover`: recovery-code sign-in and passkey reset

### Product API Routes

- `/api/auth/[...all]`: Better Auth handler exposed through Next.js
- `/api/member-invite/preview`: preview a 6-digit member invite code before auth
- `/api/assisted/pairing`: redeem a 6-digit tablet pairing code
- `/api/device/fingerprint`: device fingerprint helper
- `/api/independent/onboarding/start`: bootstrap independent onboarding
- `/api/independent/passkey/register/options`
- `/api/independent/passkey/register/verify`
- `/api/independent/passkey/authenticate/options`
- `/api/independent/passkey/authenticate/verify`
- `/api/independent/recovery-codes/redeem`
- `/api/voice/live/token`: live voice token route

## Runtime Architecture

### Frontend

- Next.js 16 App Router powers both apps.
- `apps/core/app/providers.tsx` wires `ConvexBetterAuthProvider` with the shared Convex client and Better Auth client.
- The family-side shell lives under `apps/core/app/circle/layout.tsx` with `CircleHeader` and `CircleBottomNav`.
- The bottom nav currently exposes `Home`, `Routines`, `Memories`, and `Settings` only.

### Backend

- Convex is the system of record for product data and backend logic.
- The Convex backend lives in `apps/backend-convex/convex/`.
- Better Auth routes are registered into the Convex HTTP router in `apps/backend-convex/convex/http.ts`.
- Next.js exposes those auth routes through `apps/core/app/api/auth/[...all]/route.ts`.
- Convex functions implement family-side auth, member invites, assisted sessions, independent passkeys and recovery, routines, memories, notifications, and live voice.

## Auth Architecture

- Better Auth handles authenticated family-side account sessions for Circle participants.
- Convex-managed `seniorAccessSessions` handle assisted tablet access and independent senior web access.
- Independent auth is standalone and must not assume an existing Circle membership.

## Data Architecture

### Circle-Scoped Data

Circle-scoped data coordinates human participants and Circle-level settings.

Current tables:

- `circles`
- `circleMemberships`
- `circleInviteCodes`
- `notificationSettings`
- `pushSubscriptions`
- `notificationDeliveries`

### Senior-Scoped Data

Senior-scoped data represents the senior's world rather than the Circle's admin surface.

Current tables:

- `seniorProfiles`
- `people`
- `memoryRecords`
- `memoryAssets`
- `routineSchedules`
- `routineOccurrences`
- `routineCheckIns`
- `voiceInteractions`
- `insights`
- `alerts`

Current omissions and deferred work:

- there is no shipped `activityEvents` table yet
- there is no dedicated activity route yet
- alerts exist as their own table, but the UI reviews alerts and insights together inside `/circle/insights`

Rules:

- Senior-facing content should anchor on `seniorProfileId`.
- Circle-facing coordination data should anchor on `circleId`.
- When a senior is linked to a Circle, family-side visibility derives from that Circle relationship.
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
- Prefer the smallest change that keeps the codebase on the canonical `circle` model.
- Do not add new product behavior to legacy `familySpace` surfaces.
- Do not reintroduce retired caregiver-era or `FamilySpace` terminology through code or docs.
