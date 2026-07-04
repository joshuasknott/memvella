# Architecture

Status: canonical
Scope: root
Last reviewed: 2026-07-04
Owners: engineering
Read when: touching routing, backend integration, schema design, or repo structure
Depends on: docs/product.md, docs/data-model.md

## Monorepo Layout

- `apps/core`: Next.js product frontend
- `apps/backend-convex`: Convex backend (exports `@memvella/backend` and `@memvella/backend/dataModel`)
- `apps/marketing`: Next.js marketing app
- `apps/internal`: disabled-by-default internal tools scaffold
- `packages/ui`: shared design system components and tokens (`@memvella/ui`)
- `packages/domain-circle`: shared Workspace-domain helpers and policies
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

### Internal Routes

`apps/internal` is a separate disabled-by-default internal app. It is not wired to product Supporter auth.

- `/`: HQ access gate and minimal home

The internal app intentionally does not expose product dashboards, runbooks, QA tooling, or Convex read models. See `docs/internal-hq.md`.

### Workspace Routes

- `/`: role-selection entry point
- `/onboarding/organiser`: account and Workspace creation
- `/organiser/signin`: account sign-in page
- `/organiser/verify-email`: account verification status and resend flow
- `/organiser/forgot-password`: account password recovery request
- `/organiser/reset-password`: account password reset
- `/onboarding/member`: Supporter invite-code preview, sign-up, sign-in, and join flow
- `/circle`: shared Workspace home
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
- `/circle/people`
- `/circle/people/[personId]`
- `/circle/people/[personId]/edit`
- `/circle/add-person`
- `/circle/insights`
- `/circle/settings`
- `/circle/settings/account`
- `/circle/settings/members`
- `/circle/settings/invite`
- `/circle/settings/notifications`
- `/circle/settings/pairing`

Current route facts:

- `/circle` is the canonical Workspace shell. The route name remains internal for now.
- Workspace owners and Supporters share the same `/circle` shell.
- There is no dedicated `/circle/activity` route.
- There is no separate `/circle/alerts` route.

### Senior Routes

- `/assisted/login`: companion tablet connection flow
- `/assisted`: companion tablet dashboard

### Product API Routes

- `/api/auth/[...all]`: Better Auth handler exposed through Next.js
- `/api/member-invite/preview`: preview a 6-digit Supporter invite code before auth
- `/api/assisted/pairing`: redeem a 6-digit tablet code
- `/api/device/fingerprint`: device fingerprint helper
- `/api/voice/live/token`: live voice token route

## Runtime Architecture

### Frontend

- Next.js 16 App Router powers both apps.
- `apps/core/app/providers.tsx` wires `ConvexBetterAuthProvider` with the shared Convex client and Better Auth client.
- The Workspace shell lives under `apps/core/app/circle/layout.tsx` with `CircleHeader` and `CircleBottomNav`.
- The bottom nav currently exposes `Home`, `Routines`, `Memories`, and `Settings` only.

### Backend

- Convex is the system of record for product data and backend logic.
- The Convex backend lives in `apps/backend-convex/convex/`.
- Better Auth routes are registered into the Convex HTTP router in `apps/backend-convex/convex/http.ts`.
- Next.js exposes those auth routes through `apps/core/app/api/auth/[...all]/route.ts`.
- Convex functions implement account auth, Supporter invites, companion tablet sessions, routines, memories, notifications, and live voice.

## Auth Architecture

- Better Auth handles authenticated account sessions for Workspace participants.
- Account email verification and password-reset delivery use Resend from the Convex runtime.
- Convex-managed `seniorAccessSessions` handle assisted tablet access.

## Data Architecture

### Workspace-Scoped Data

Workspace-scoped data coordinates signed-in Supporters and Workspace-level settings. Internal tables retain `circle` names until a schema migration is justified.

Current tables:

- `circles`
- `circleMemberships`
- `circleInviteCodes`
- `notificationSettings`
- `pushSubscriptions`
- `notificationDeliveries`
- `appEvents`

### Senior-Scoped Data

Senior-scoped data represents the senior's world rather than the Workspace admin surface.

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

Current scope notes:

- product activity history is not modeled as a separate `activityEvents` table
- `appEvents` is a sanitized internal observability table, not a product activity feed
- there is no dedicated activity route
- alerts exist as their own table, but the UI reviews alerts and insights together inside `/circle/insights`

Rules:

- Senior-facing content should anchor on `seniorProfileId`.
- Workspace-facing coordination data should anchor on `circleId`.
- When a senior is linked to a Workspace, visibility derives from that relationship.
- Senior profiles are Workspace-linked for the family-led product.

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
