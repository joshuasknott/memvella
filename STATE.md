# STATE

Current Project Phase: Monorepo restructured; establishing testing baseline and feature parallelization.

Completed Structural Work:
- Extracted Convex backend from `apps/core/convex/` to `apps/backend-convex/`. Frontend imports now use `@memvella/backend` and `@memvella/backend/dataModel`.
- Centralized shared TypeScript (`packages/config-typescript`) and ESLint (`packages/config-eslint`) configs.
- Fixed `apps/marketing` cross-app relative import to use workspace dependency.
- Scaffolded `apps/internal` (ops/QA tools) and `packages/testing` (test fixtures).
- Updated all documentation (README, architecture, AGENTS) to reflect new layout.

Current Architecture Debt:
- `apps/backend-convex/convex/migrations.ts` had a stale legacy-table verification query and needed cleanup after the `routines` and `memories` table removal.
- `docs/data-model.md` and `docs/legacy-removal.md` are now behind the codebase. They still describe deleted legacy tables and the pre-split `organiser.ts` module.
- Independent onboarding does not yet enforce the documented role-collision rule against an already signed-in family-side Better Auth session.
- Independent onboarding currently creates a Circle-backed senior profile instead of a fully standalone `circleId = null` profile, which differs from the canonical docs.
- `assistedDevicePins.failedAttempts` exists in schema but is not incremented in the live pairing flow; brute-force protection currently relies on rate limiting.
- Unused Convex public surfaces remain, including `voice.handleAssistedVoiceTurn`, `agent.handleOnboardingInput`, `seniorAccess.endSession`, and the routine detail/edit/delete functions.
- Internal naming leftover remains in `apps/backend-convex/convex/notificationsWorker.ts` with `getActiveSubscriptionsForFamilySpace`.
- `pairing-rate-limit.ts` is duplicated between `apps/core/lib/` and `apps/backend-convex/convex/pairingRateLimit.ts` — candidate for future `packages/domain-circle` extraction.

Deferred Package Extractions:
- `packages/auth`: auth/session helpers (tightly coupled to Next.js server APIs)
- `packages/domain-circle`: Circle types and policies
- `packages/domain-senior`: senior identity/access types
- `packages/voice`: shared browser/live-voice helpers
- `packages/api-types`: already served by `@memvella/backend` exports

Next Immediate Steps:
1. Install Playwright for E2E testing.
2. Draft the activityEvents product spec.
3. Extract domain types and auth helpers into dedicated packages (future pass).
