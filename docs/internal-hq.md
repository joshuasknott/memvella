# Memvella HQ

Status: canonical
Scope: apps/internal
Last reviewed: 2026-06-15
Owners: founder, engineering
Read when: touching internal tooling or HQ access
Depends on: docs/architecture.md, docs/auth-and-identity.md, docs/data-model.md, docs/env.md

## Framing

Memvella HQ is currently a minimal founder-only internal app.

It exists only to keep a protected internal entry point available while the real product matures. It should grow one concrete workflow at a time, only when there is a clear operating need.

HQ is not a user-facing product surface. Product Supporter access does not grant HQ access.

## Route Map

- `/`: founder-gated minimal HQ placeholder

## Access Model

HQ is founder-only.

Required app variables:

- `MEMVELLA_HQ_ENABLED=1`
- `MEMVELLA_HQ_ACCESS_KEY`
- `MEMVELLA_HQ_COOKIE_SECRET`

The internal app authenticates the founder with `MEMVELLA_HQ_ACCESS_KEY` and stores an HTTP-only, same-site signed session cookie. The v1 issued role is `founder`.

HQ access is intentionally separate from Better Auth family-side sessions and Convex senior access sessions.

## Current Scope

- Keep the founder access gate working.
- Show one minimal internal home page.
- Link back to the product and marketing apps during local development.
- Do not expose product data, dashboards, runbooks, QA actions, or placeholder departments.

## Future Growth Rule

Add internal functionality only when all of the following are true:

- it supports an actual operational workflow
- the owner and expected action are clear
- the page does not duplicate product UI
- the page does not expose raw sensitive product content
- the route and environment requirements are documented

## QA And Production Safety

HQ v1 does not expose production reset, revoke, edit, delete, impersonation, or generation tools.

Existing product test support remains guarded by `MEMVELLA_TEST_MODE=1` and the product test route protections.

## Verification

Before release, verify:

- HQ is inaccessible unless `MEMVELLA_HQ_ENABLED=1`
- founder login requires `MEMVELLA_HQ_ACCESS_KEY`
- the signed session cookie is HTTP-only and same-site
- the signed-in page stays minimal
- removed routes return 404
- no sensitive product data appears in the internal app
- `pnpm lint`, `pnpm type-check`, `pnpm test`, and `pnpm build` pass or failures are documented
