# STATE

Current Project Phase: Establishing testing baseline and feature parallelization.

Current Architecture Debt:
- `apps/core/convex/migrations.ts` had a stale legacy-table verification query and needed cleanup after the `routines` and `memories` table removal.
- `docs/data-model.md` and `docs/legacy-removal.md` are now behind the codebase. They still describe deleted legacy tables and the pre-split `organiser.ts` module.
- Independent onboarding does not yet enforce the documented role-collision rule against an already signed-in family-side Better Auth session.
- Independent onboarding currently creates a Circle-backed senior profile instead of a fully standalone `circleId = null` profile, which differs from the canonical docs.
- `assistedDevicePins.failedAttempts` exists in schema but is not incremented in the live pairing flow; brute-force protection currently relies on rate limiting.
- Unused Convex public surfaces remain, including `voice.handleAssistedVoiceTurn`, `agent.handleOnboardingInput`, `seniorAccess.endSession`, and the routine detail/edit/delete functions.
- Internal naming leftover remains in `apps/core/convex/notificationsWorker.ts` with `getActiveSubscriptionsForFamilySpace`.

Next Immediate Steps:
1. Install Playwright for E2E testing.
2. Draft the activityEvents product spec.
