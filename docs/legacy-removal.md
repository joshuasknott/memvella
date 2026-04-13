# Legacy Removal

Status: canonical
Scope: root
Last reviewed: 2026-04-12
Owners: engineering
Read when: touching routes, schema names, migrations, compatibility code, or role naming
Depends on: docs/product.md, docs/terminology.md, docs/architecture.md, docs/auth-and-identity.md, docs/data-model.md

## Purpose

This document defines the approved rename map and rollout order for removing legacy concepts from Memvella.

Use it when changing:

- route names
- file and module names
- schema table names
- field names
- compatibility tables and migration helpers

## Current Migration Status

- Batch 1 route cleanup: largely complete. `app/supporter` runtime routes are gone, `/circle` owns the active family-side workspace, and `next.config.ts` no longer redirects `/supporter*` or `/admin*`.
- Batch 2 role cleanup: complete on active auth paths. Organiser and Member are the only family-side roles used by current authorization logic.
- Batch 3 circle table introduction: in progress but canonical-first in hot paths. Runtime auth, invites, and notification/voice helper resolution now prefer `circles`, `circleMemberships`, and `circleInviteCodes`, while legacy tables remain for compatibility and migration proof.
- Batch 4 people and awareness split: canonical writes now land on `people`, `alerts`, and `insights`; canonical-to-legacy reverse writes are disabled by default.
- Batch 5 canonical field/helper rename cleanup: in progress. Runtime helpers are moving toward `circle` naming, but persisted field names such as `familySpaceId` still exist widely.
- Batch 6 retirement of compatibility surfaces: not ready. Legacy tables and compatibility fields remain until verification shows they are fully unused.

## Non-Negotiables

- No new work may be built on retired names.
- The end state must contain no surviving `supporter`, `admin`, `FamilySpace`, or `familyMembers` concepts.
- Schema and data changes must follow widen-migrate-narrow.
- Temporary compatibility code is allowed only when it has a named rollout step and a removal step.
- Generated files should only change as a consequence of source changes. Do not treat generated code as the migration plan.

## Current Legacy Surfaces

### Routes And File Structure

- `apps/core/app/supporter/**/*` has already been removed from the runtime route tree.
- `apps/core/app/circle/**/*` owns the active family-side workspace routes.
- `apps/core/next.config.ts` no longer redirects `/admin*` or `/supporter*` routes.
- `apps/core/app/onboarding/supporter/page.tsx` has already been removed.

### Shared Family-Side Components And Helpers

- The legacy route and shared hook renames for this batch have already landed.
- Use canonical surfaces such as `apps/core/lib/use-circle-profile.ts` for new work.

### Backend Modules

- `apps/core/convex/familySpaceAuth.ts`
- `apps/core/convex/familyInvites.ts`
- `apps/core/convex/familyMembershipMigrations.ts`
- `apps/core/convex/organiser.ts`
- `apps/core/convex/voiceHelpers.ts`
- `apps/core/convex/voiceSession.ts`
- `apps/core/convex/routineHelpers.ts`
- `apps/core/convex/seniorAccessHelpers.ts`

### Schema And Data Surfaces

Legacy or retired tables and fields still present in `apps/core/convex/schema.ts`:

- `familySpaces`
- `familySpaceMemberships`
- `familyInvites`
- `familyMembers`
- `supporterInsights`
- legacy `memories`
- legacy `routines`
- `primarySupporterAuthUserId`
- `role: "supporter"`
- widespread `familySpaceId` and `...MembershipId` naming

### Auth And Environment Compatibility

- `SITE_URL` still exists as a fallback in auth helpers.

### Tooling And Rewrite Safety

- The legacy bulk terminology rewrite script has been removed. Blind global terminology rewrites are not an approved migration mechanism.

## Approved Target Names

### Routes

| Current | Target | Notes |
| --- | --- | --- |
| `/supporter/*` | removed | Real implementation must live under `/circle/*` |
| `/supporter/signin` | removed | Use `/organiser/signin` |
| `/onboarding/supporter/*` | removed | Use `/onboarding/organiser/*` |
| `/admin/*` | removed | Use `/organiser/*` for organiser-only entry or `/circle/*` for shared family-side workspace |
| `/onboarding/admin/*` | removed | Use `/onboarding/organiser/*` |

### Internal Names

| Current | Target | Notes |
| --- | --- | --- |
| `familySpace` | `circle` | Applies to variables, helper names, file names, and table names |
| `familySpaceMembership` | `circleMembership` | Applies everywhere |
| `supporter` | `organiser` | Applies to roles, helpers, routes, and copy |
| `familyMembers` | `people` | Senior-grounding people only, not Circle participants |
| `supporterInsights` | `alerts` and `insights` | Split urgent versus non-urgent concepts |
| `routineRetreatCheckIns` | `routineCheckIns` | Remove the legacy retreat-specific name |

### Backend Module Names

| Current | Target | Notes |
| --- | --- | --- |
| `familySpaceAuth.ts` | `circleAuth.ts` | Circle membership auth helpers |
| `familyInvites.ts` | `circleInvites.ts` | Invite generation, preview, redeem, revoke |
| `familyMembershipMigrations.ts` | `circleMembershipMigrations.ts` | Membership-specific migration helpers |
| `use-family-space-profile.ts` | `use-circle-profile.ts` | Shared family-side hook |
| `OrganiserHeader.tsx` | `CircleHeader.tsx` | Shared family-side shell component |
| `OrganiserBottomNav.tsx` | `CircleBottomNav.tsx` | Shared family-side shell component |

### Modules That Must Be Split, Not Just Renamed

- `apps/core/convex/organiser.ts` should not survive as a mixed bucket.
- Its responsibilities should be split across Circle bootstrap or dashboard logic, people management, and existing domain modules such as memories, routines, notifications, and insights.
- `supporterInsights` data should not simply be renamed in place. It must be split into separate `alerts` and `insights` concepts with distinct product behavior.

## Approved Target Table Families

### Circle-Scoped Tables

- `circles`
- `circleMemberships`
- `circleInviteCodes`
- `notificationSettings`
- `pushSubscriptions`
- `notificationDeliveries`

### Senior-Scoped Tables

- `seniorProfiles`
- `people`
- `memoryRecords`
- `memoryAssets`
- `routineSchedules`
- `routineOccurrences`
- `routineCheckIns`
- `voiceInteractions`
- `activityEvents`
- `alerts`
- `insights`

## Rollout Order

### Batch 1: Route And File Ownership Cleanup

- Move the real family-side implementation from `app/supporter` into `app/circle`.
- Rename shared family-side hooks and components away from organiser-specific or FamilySpace-specific names.
- Keep temporary redirects only while the move is landing.
- Remove `/supporter` and `/admin` redirects once the canonical routes are stable.

This batch should not change persisted data.

### Batch 2: Role And Membership Cleanup

- Backfill every `supporter` membership to `organiser`.
- Remove `supporter` from the allowed family-side role set.
- Normalize auth helpers so family-side roles are only `organiser` and `member`.
- Support multiple organisers explicitly in the authorization model.

This batch may patch existing rows but should not yet rename tables.

### Batch 3: Circle Table Introduction

Because Convex table names cannot be renamed in place, every table rename is a create-copy-switch-delete migration.

Introduce new canonical tables:

- `circles`
- `circleMemberships`
- `circleInviteCodes`

Rollout rules:

- Deploy widened schema that can read both old and new sources.
- Add migration-aware helpers that can dual-read and, where needed, dual-write.
- Backfill data from `familySpaces`, `familySpaceMemberships`, and `familyInvites`.
- Verify migration completeness before narrowing.
- Remove old tables only after all reads and writes are on canonical tables.

### Batch 4: Senior-Grounding And Awareness Split

Introduce new canonical senior-scoped tables:

- `people`
- `activityEvents`
- `alerts`
- `insights`

Rollout rules:

- Move senior-grounding writes off `familyMembers` and onto `people`.
- Add memory-to-person relationships where the source data supports them.
- Move urgent actionable events into `alerts`.
- Move non-urgent tracking and summaries into `insights`.
- Build `activityEvents` as the canonical source for the Circle activity feed.

### Batch 5: Canonical Field Renames

After new tables are in use, clean up the remaining field naming:

- `familySpaceId` -> `circleId`
- `...MembershipId` on Circle-scoped tables -> `...CircleMembershipId`
- lingering `familySpaceName` variables -> `circleName`
- any `supporter`-named helper or enum surface -> `organiser`

This batch should be done only after the table migrations are stable, otherwise field renames multiply the migration surface.

### Batch 6: Retire Compatibility Surfaces

Remove once the canonical replacements are fully live:

- `familyMembers`
- `supporterInsights`
- legacy `memories`
- legacy `routines`
- `primarySupporterAuthUserId`
- any read path that still depends on `familySpace*` names

## Migration Mechanics

### Default Strategy

Use widen-migrate-narrow for every breaking schema or data-model change.

### Table Rename Strategy

For Convex table renames:

1. add the new table
2. dual-read or dual-write where needed
3. backfill old rows into the new table
4. verify completeness
5. switch reads and writes fully to the new table
6. remove the old table

### Migration Tooling

- Use the existing `@convex-dev/migrations` component in `apps/core/convex/migrations.ts` for non-trivial backfills.
- Use dry runs before production writes when possible.
- Add a verification query for each migration that can prove the old surface is empty or no longer referenced.

## Verification Gates

Do not narrow or delete a legacy surface until all of the following are true:

- all new writes land on the canonical surface
- all reads prefer the canonical surface
- migration status shows no remaining unmigrated rows
- there is a verification query or equivalent proof for the relevant table or field
- the app can complete the relevant auth or product smoke flow without touching the old path

## Implementation Note

This document is the approved migration contract for later phases. If a later code change needs a different rename, table split, or rollout order, update this document first.
