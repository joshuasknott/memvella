# Memvella Agent Guide

Memvella is a PNPM/Turbo monorepo with three applications and several shared packages:

- `apps/core`: the product frontend (Next.js)
- `apps/backend-convex`: the Convex backend (exports `@memvella/backend`)
- `apps/marketing`: the marketing and waitlist app

## Context by task

Start with README.md, then read only the relevant canonical sources:

- Product behavior and copy: docs/product.md, docs/terminology.md, docs/legacy-removal.md.
- Shared architecture: docs/architecture.md.
- Auth, sessions, onboarding, permissions, or schema: docs/auth-and-identity.md and docs/data-model.md.
- Environment and verification: docs/env.md and docs/testing.md.
- UI: apps/core/design.md or apps/marketing/design.md for the target app.

Use the pinned pnpm version. Target apps with `pnpm dev:core` or `pnpm dev:marketing`; the backend uses `pnpm convex:dev`. Run affected lint, type-check, tests, and build tasks; `pnpm verify` is the broad integration/release gate. Documentation-only edits need link/command and diff validation.

## Canonical Sources

- Root `docs/` files are canonical.
- `docs/archive/` is historical only.
- Generated artifacts such as `.next/`, `.turbo/`, and `next-env.d.ts` are not authoritative.
- Retired legacy terminology is documented in `docs/legacy-removal.md` and should not be reintroduced.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code and heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `apps/backend-convex/convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

If you touch auth, sessions, onboarding, or the data model, also read `docs/auth-and-identity.md` and `docs/data-model.md` before editing.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->


Installed Convex skills provide task-specific technical guidance. A complex fix already authorized by the user does not need a second approval just because a skill suggests presenting options. Prepare and verify local changes within scope; pause only the step that needs missing credentials, a material product decision, or ungranted production authority.
