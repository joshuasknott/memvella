# Legacy Removal

Status: canonical
Scope: root
Last reviewed: 2026-04-14
Owners: engineering
Read when: touching routes, schema names, migrations, compatibility code, or role naming
Depends on: docs/product.md, docs/terminology.md, docs/architecture.md, docs/auth-and-identity.md, docs/data-model.md

## Purpose

This document records what cleanup has already landed, what legacy surfaces are still present, and what must not be extended.

## Post-Cleanup Runtime Status

These cleanup phases are complete in the shipped runtime:

- `/circle` owns the family-side workspace route tree
- legacy `/supporter*` and `/admin*` runtime routes are gone
- family-side participant roles are `organiser` and `member` only
- active auth and invite flows use `circles`, `circleMemberships`, and `circleInviteCodes`
- active invite APIs use `circleInvites`
- active auth helpers use `circleAuth`
- active awareness tables are `alerts` and `insights`
- assisted routine check-ins use `routineCheckIns`

## Phase 8 Completion Snapshot

Phase 8 removed the main family-side compatibility layer.

Completed changes:

- deleted `apps/core/convex/circleCompat.ts`
- deleted `apps/core/convex/circleMigrations.ts`
- replaced legacy auth and invite modules with canonical modules:
- `apps/core/convex/familySpaceAuth.ts` -> `apps/core/convex/circleAuth.ts`
- `apps/core/convex/familyInvites.ts` -> `apps/core/convex/circleInvites.ts`
- removed `independent_senior` from Circle participant roles
- removed active runtime `legacyFamily*` auth and invite paths
- migrated frontend callsites from `api.familyInvites.*` to `api.circleInvites.*`

## Current Remaining Legacy Surfaces

### Schema Debt

These legacy tables still exist in `apps/core/convex/schema.ts` and should not receive new product work:

- `routines`
- `memories`

Current facts:

- both are transitional compatibility tables
- both still use `familySpaceId` index naming
- the shipped product uses `routineSchedules`, `routineOccurrences`, `routineCheckIns`, `memoryRecords`, and `memoryAssets` instead

### Auth And Environment Compatibility

- `SITE_URL` still exists as a fallback when Better Auth resolves its base URL

### Internal Naming Leftovers

- some internal auth helper code still uses `family_side` as a grouping label for organiser/member permissions
- this is internal shorthand only and should not become a route, table, or user-facing term

### Module Shape Still Deferred

- `apps/core/convex/organiser.ts` still acts as a mixed family-side dashboard and settings module
- splitting that file by domain is still deferred work, not completed cleanup

### Activity Still Deferred

- there is no shipped `activityEvents` table yet
- there is no dedicated Activity route yet
- the current `/circle` home timeline is routines-focused and should not be documented as a completed activity system

## Removed Surfaces

These legacy surfaces are already retired from the active runtime:

- `supporter` routes
- `admin` routes
- `familySpaces`
- `familySpaceMemberships`
- `familyInvites`
- `circleCompat.ts`
- `circleMigrations.ts`
- `familySpaceAuth.ts`
- `familyInvites.ts`
- `role: "independent_senior"`

## Canonical Rename Map

| Retired | Current |
| --- | --- |
| `familySpace` | `circle` |
| `familySpaceMembership` | `circleMembership` |
| `supporter` | `organiser` |
| `familyMembers` | `people` |
| `supporterInsights` | `alerts` and `insights` |
| `routineRetreatCheckIns` | `routineCheckIns` |

## Non-Negotiables

- No new work may be built on retired names.
- Do not add product features to legacy `routines` or `memories` tables.
- Schema and data changes must still follow widen-migrate-narrow when persisted data moves.
- Generated files should change only as a consequence of source changes.
- Blind bulk-rewrite scripts are not an approved migration mechanism.

## Verification Rule For Remaining Cleanup

Do not delete a remaining legacy surface until all of the following are true:

- all reads and writes are on the canonical surface
- there is proof that the legacy surface is no longer needed
- the relevant auth or product smoke flows complete without touching the legacy path
- the matching canonical docs stay accurate after the change
