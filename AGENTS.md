# Memvella Agent Guide

Memvella is a PNPM/Turbo monorepo with four applications and several shared packages:

- `apps/core`: the product frontend (Next.js)
- `apps/backend-convex`: the Convex backend (exports `@memvella/backend`)
- `apps/marketing`: the marketing and waitlist app
- `apps/internal`: internal ops/support/QA tools (scaffold)

## Read Order

Before making non-trivial changes, read the relevant canonical docs in this order:

1. `README.md`
2. `docs/product.md`
3. `docs/terminology.md`
4. `docs/architecture.md`
5. `docs/auth-and-identity.md`
6. `docs/data-model.md`
7. `docs/legacy-removal.md`
8. `docs/env.md`
9. `docs/testing.md`
10. `apps/core/design.md` or `apps/marketing/design.md`

## Canonical Sources

- Root `docs/` files are canonical.
- `docs/archive/` is historical only.
- Generated artifacts such as `.next/`, `.turbo/`, and `next-env.d.ts` are not authoritative.
- Legacy compatibility tables in the Convex schema are transitional and should not become the foundation for new work.

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
