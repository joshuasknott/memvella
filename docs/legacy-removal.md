# Legacy Removal

Status: canonical
Scope: root
Last reviewed: 2026-07-04
Owners: engineering
Read when: touching routes, schema names, migrations, compatibility code, or role naming
Depends on: docs/product.md, docs/terminology.md, docs/architecture.md, docs/auth-and-identity.md, docs/data-model.md

## Purpose

This document records retired terminology and compatibility rules that should
not be reintroduced into active product work.

## Current Runtime Status

- `/circle` owns the Workspace route tree.
- Supporter-side participant roles are `organiser` and `member` internally.
- Active auth and invite flows use `circles`, `circleMemberships`, and `circleInviteCodes`.
- Active invite APIs use `circleInvites`.
- Active auth helpers use `circleAuth`.
- Active awareness tables are `alerts` and `insights`.
- Assisted routine check-ins use `routineCheckIns`.

## Current Compatibility Notes

- `SITE_URL` still exists as a fallback when Better Auth resolves its base URL.
- `family_side` may appear as an internal grouping label for organiser/member permissions.
- `family_side` is internal shorthand only and must not become a route, table, or user-facing term.

## Retired Surfaces

These surfaces are retired from the active runtime:

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

## Rules

- No new work may be built on retired names.
- Do not add product features to retired tables or route families.
- Schema and data changes must follow widen-migrate-narrow when persisted data moves.
- Generated files should change only as a consequence of source changes.
- Bulk rewrites must be reviewed against the canonical terminology docs before landing.

## Verification Rule For Remaining Cleanup

Do not delete a remaining compatibility surface until all of the following are true:

- all reads and writes are on the canonical surface
- there is proof that the compatibility surface is no longer needed
- the relevant auth or product smoke flows complete without touching the compatibility path
- the matching canonical docs stay accurate after the change
