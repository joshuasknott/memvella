# Launch Runbook

Status: canonical
Scope: release
Last reviewed: 2026-07-05
Owners: engineering, product
Read when: preparing, verifying, deploying, or rolling back a launch
Depends on: docs/env.md, docs/testing.md

## Automated Gate

Run the root gate from a clean checkout with the pinned package manager:

```sh
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm check:env
corepack pnpm check:public
corepack pnpm check:copy
corepack pnpm lint
corepack pnpm type-check
corepack pnpm test
corepack pnpm build
```

`corepack pnpm verify` runs the guardrails and the main lint/type/test/build sequence in order.

## Environment Checklist

- Confirm `NEXT_PUBLIC_SITE_URL`, `BETTER_AUTH_URL`, and `BETTER_AUTH_TRUSTED_ORIGINS` match the production browser origin.
- Confirm Convex production values are set in the Convex runtime, not only in Next.js.
- Confirm `BETTER_AUTH_SECRET` and `MEMVELLA_AUTH_PEPPER` are configured.
- Confirm `RESEND_API_KEY` and `MEMVELLA_AUTH_EMAIL_FROM` are configured before testing production sign-up and password recovery.
- Confirm `GEMINI_API_KEY` is configured or live voice failure states are accepted for launch.
- Confirm web push keys are configured or push is explicitly treated as unavailable.
- Confirm `MEMVELLA_TEST_MODE`, `NEXT_PUBLIC_MEMVELLA_TEST_MODE`, and `MEMVELLA_TEST_AUTH_TOKEN` are absent from production unless running a controlled test deployment.
- Confirm marketing has `CONVEX_URL` for waitlist submissions.

## Browser And Device Smoke

- Create a Workspace owner account, verify email, and land in `/circle`.
- Sign out and sign in through `/organiser/signin`.
- Preview and redeem a Supporter invite, then verify Supporter permissions are limited.
- Pair a companion tablet through `/assisted/login`, refresh the tablet, revoke it, and pair again.
- Create, view, edit, and delete text, media, audio, and voice memories.
- Create routines and verify routine list/timeline behavior.
- Create, edit, delete, and view People with owner and Supporter roles.
- Review and dismiss queued insights and alerts in `/circle/insights`.
- Verify notification settings with push unavailable and, if configured, push enabled.
- Request and complete password recovery, then confirm old sessions are revoked.
- Check small mobile heights for onboarding, fixed navigation, pairing, voice, memory, and settings screens.

## E2E Gate

Run Playwright only against a configured local Convex dev deployment:

```sh
corepack pnpm test:e2e
```

Local e2e requires `apps/backend-convex/.env.local` with `CONVEX_DEPLOYMENT`. The Playwright helper temporarily enables test mode in the Convex dev deployment and removes the temporary values during teardown.

## Rollout

1. Deploy Convex backend changes.
2. Deploy `apps/core`.
3. Deploy `apps/marketing`.
5. Run the browser and device smoke checklist against production.

## Rollback

- Roll back the frontend deployment first if the failure is isolated to UI, routing, or client-side auth origin handling.
- Roll back Convex only after confirming no new schema dependency or data migration has made the previous backend incompatible.
- Remove production test-mode variables immediately if they are discovered.
- Preserve error logs and affected route names before retrying deploys.
