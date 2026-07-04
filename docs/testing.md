# Testing

Status: canonical
Scope: root
Last reviewed: 2026-07-04
Owners: engineering
Read when: changing onboarding, auth, permissions, senior sessions, voice flows, or notifications
Depends on: docs/auth-and-identity.md, docs/env.md

## Preflight

Before testing auth-sensitive or backend-sensitive changes:

- confirm the browser origin matches `NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_URL`
- confirm Convex is running and the app is connected to the intended deployment
- confirm any server-side secrets required for the path under test are configured
- confirm `pnpm type-check`, `pnpm test`, and `pnpm build` are part of your verification pass for non-trivial changes

## Automated Verification

- `pnpm lint`
- `pnpm type-check`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm test:e2e:ui`
- `pnpm test:e2e:headed`
- `pnpm build`
- `pnpm verify` to run the full loop in sequence

For Memvella HQ changes, also manually verify:

- HQ is inaccessible unless `MEMVELLA_HQ_ENABLED=1`
- HQ login requires `MEMVELLA_HQ_ACCESS_KEY`
- the HQ session cookie is HTTP-only and same-site
- the authenticated internal home page stays intentionally minimal
- no product dashboards, QA/dev actions, runbooks, or sensitive product data are exposed

Current gate:

- GitHub Actions runs `pnpm verify` on pushes to `main` and on pull requests.
- GitHub Actions can also run the Chromium Playwright smoke on pull requests when `MEMVELLA_E2E_ENABLED=1` is configured with the required Convex deployment secrets.

## Playwright Coverage

The repository now includes a deterministic Playwright Chromium suite under `tests/e2e/`.

Current deterministic coverage:

- account and Workspace creation from `/` through `/onboarding/organiser` into `/circle`
- account sign-in through `/organiser/signin`
- pre-auth Workspace invite preview and the full shipped Supporter join UI
- account password-recovery request without account enumeration
- account sign-out and protected-route redirect
- Workspace owner routine creation through `/circle/add-routine`
- Workspace owner People creation, edit, delete, and Supporter read-only People permissions
- voice memory dictation through `/circle/add-memory/voice` with fake browser speech
- Supporter join plus owner-vs-Supporter authorization boundaries on owner-only settings routes
- assisted recovery fallback when the stored tablet session is invalid

Deterministic browser scaffolding now included:

- guarded test mode with `MEMVELLA_TEST_MODE=1`
- guarded `/api/test/**` reset and senior-session bootstrap helpers
- deterministic Workspace bootstrap readiness marker via `data-testid="circle-ready"`
- stable selectors on the primary owner, Supporter, routine, invite, tablet connection, and voice flows
- fake browser speech recognition and instant speech synthesis for Playwright
- fake assisted live-voice mode so browser tests do not require a real Gemini session or microphone

Local note:

- `pnpm test:e2e` uses the Playwright dev-server helper to start Convex dev plus the `apps/core` Next dev server in test mode
- local e2e requires `apps/backend-convex/.env.local` to contain a valid `CONVEX_DEPLOYMENT`; run `pnpm convex:dev` once after configuring the backend before running `pnpm test:e2e`
- browser-origin-sensitive auth still depends on `NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_URL` matching the Playwright origin

## Release Principle

Before any rollout, the core product is the priority verification surface.

- deterministic automated coverage comes first
- exploratory browser testing comes after deterministic coverage, not instead of it
- origin-sensitive auth and cross-device pairing still require manual smoke coverage

## Manual Smoke Tests

### Root Entry And Workspace Setup

- open `/` and confirm sign-up, login, and the quiet companion tablet connection link are present
- create a new account and Workspace from `/onboarding/organiser`
- confirm the new account lands in `/circle`
- sign out and sign back in through `/organiser/signin`
- confirm the Workspace resolves a membership and settings load

### Supporter Join Flow

- enter a valid invite code at `/onboarding/member`
- confirm the target Workspace name is shown before auth
- confirm invite preview works without an existing account session
- create or sign in to an account without re-entering the code
- confirm the account lands in `/circle`
- confirm owner-only settings remain unavailable to the Supporter account
- confirm the Supporter can create, edit, and delete memories
- confirm the Supporter can view routines and Supporters without gaining owner controls

Coverage note:

- deterministic Playwright coverage now covers the Supporter-vs-owner authorization boundary with deterministic Supporter bootstrap and owner-only settings denial

### Workspace Home, Insights, And Settings

- verify `/circle` loads `Current Status`, quick actions, and `Today's Updates`
- verify `/circle/insights` loads the combined review queue for alerts and insights
- verify reviewing or dismissing an item updates the queue
- verify `/circle/settings/account` loads the current profile and session information
- verify `/circle/settings/members` lists current Supporters

Current shipped scope note:

- there is no dedicated Activity page to smoke test yet
- there is no separate Alerts page; test the combined `/circle/insights` queue instead

### Memories

- verify `/circle/memories` loads the memory library
- verify each add flow still works: text, media, audio, and voice
- verify memory detail and edit pages still load
- verify owner and Supporter memory CRUD still works

### Routines

- verify `/circle/routines` loads the current schedule list and today's timeline
- verify `/circle/add-routine` can create a routine that appears in the list
- verify assisted routine check-ins still prompt and resolve through the live voice flow

Coverage note:

- deterministic Playwright coverage now covers organiser routine creation and list visibility

### People

- verify `/circle/people` loads the People directory
- verify `/circle/add-person` saves a Person for the current Workspace context and returns to `/circle/people`
- verify `/circle/people/[personId]` shows Person details
- verify `/circle/people/[personId]/edit` lets a Workspace owner update the Person
- verify deleting a Person removes it from the directory
- verify Supporters can view People but cannot add, edit, or delete People

### Notifications

- verify `/circle/settings/notifications` loads for a Workspace owner
- if web push keys are configured, verify browser subscription can be enabled and disabled
- verify notification toggles save correctly
- verify active device subscriptions appear in the settings page

### Companion Tablet

- generate a tablet code from `/circle/settings/pairing`
- pair a tablet or browser session through `/assisted/login`
- verify `/assisted` loads and the session survives a refresh
- verify an expired or revoked session falls back to reconnect messaging
- verify the companion dashboard remains low-friction and does not expose Workspace navigation

Coverage note:

- deterministic Playwright coverage now covers the invalid-session recovery fallback only

### Cross-Device And Origin

- test auth from the same origin that is configured in env
- test the intended phone or tablet origin explicitly
- if testing from a different host fails with `invalid origin`, treat that as an auth configuration issue, not as a data issue

### Account Verification And Recovery

- create an account outside test mode and confirm no usable session exists before email verification
- confirm the verification email arrives and its link returns to the intended local Memvella route
- request a password reset for both an existing and unknown email and confirm the UI does not reveal which exists
- reset the password and confirm older sessions no longer work

## Manual And Integration Coverage

- The Playwright suite is a deterministic smoke layer and does not replace manual release verification.
- Media upload, audio upload, memory detail/edit, insights review, notification toggles, and tablet pairing success should be covered by targeted manual or automated checks when those areas change.
- Real email delivery, cross-origin auth, real push delivery, and real Gemini live-voice behavior require environment-backed manual or scheduled verification.
- `convex-test` covers selected backend auth, profile, invite, and People flows. Add targeted backend tests when changing untested public functions.
