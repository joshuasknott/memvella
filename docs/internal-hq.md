# Memvella HQ

Status: canonical
Scope: apps/internal
Last reviewed: 2026-07-04
Owners: engineering
Read when: touching internal tooling or HQ access
Depends on: docs/architecture.md, docs/auth-and-identity.md, docs/data-model.md, docs/env.md

## Framing

Memvella HQ is a disabled-by-default internal app scaffold. It is separate from
the product application and is not a user-facing product surface.

Product Supporter access does not grant HQ access, and HQ does not impersonate
product users.

## Route Map

- `/`: HQ access gate and minimal home

## Access Model

Required app variables:

- `MEMVELLA_HQ_ENABLED=1`
- `MEMVELLA_HQ_ACCESS_KEY`
- `MEMVELLA_HQ_COOKIE_SECRET`

The internal app authenticates with `MEMVELLA_HQ_ACCESS_KEY` and stores an
HTTP-only, same-site signed session cookie.

HQ access is intentionally separate from Better Auth Supporter sessions and
Convex senior access sessions.

## Current Scope

- Keep the HQ access gate working.
- Show one minimal internal home page.
- Link back to the product and marketing apps during local development.
- Do not expose product data, dashboards, runbooks, QA actions, or placeholder departments.

## Expansion Rule

Add internal functionality only when all of the following are true:

- it supports a documented operational workflow
- the owner and expected action are clear
- the page does not duplicate product UI
- the page does not expose raw sensitive product content
- the route and environment requirements are documented

## Safety Boundaries

HQ must not expose production reset, revoke, edit, delete, impersonation, or
generation tools without a documented access model and release checklist.

Existing product test support remains guarded by `MEMVELLA_TEST_MODE=1` and the
product test route protections.

## Verification

Before release, verify:

- HQ is inaccessible unless `MEMVELLA_HQ_ENABLED=1`
- HQ login requires `MEMVELLA_HQ_ACCESS_KEY`
- the signed session cookie is HTTP-only and same-site
- the signed-in page stays minimal
- removed routes return 404
- no sensitive product data appears in the internal app
- `pnpm lint`, `pnpm type-check`, `pnpm test`, and `pnpm build` pass or failures are documented
