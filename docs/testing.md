# Testing

Status: canonical
Scope: root
Last reviewed: 2026-04-14
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

Current gate:

- GitHub Actions runs `pnpm verify` on pushes to `main` and on pull requests.
- GitHub Actions can also run the Chromium Playwright smoke on pull requests when `MEMVELLA_E2E_ENABLED=1` is configured with the required Convex deployment secrets.

## Playwright Coverage

The repository now includes a deterministic Playwright Chromium suite under `tests/e2e/`.

Current deterministic coverage:

- organiser onboarding from `/` through `/onboarding/organiser` into `/circle`
- organiser sign-in through `/organiser/signin`
- organiser routine creation through `/circle/add-routine`
- voice memory dictation through `/circle/add-memory/voice` with fake browser speech
- member join plus organiser-vs-member authorization boundaries on organiser-only settings routes
- assisted recovery fallback when the stored tablet session is invalid

Deterministic browser scaffolding now included:

- guarded test mode with `MEMVELLA_TEST_MODE=1`
- guarded `/api/test/**` reset and senior-session bootstrap helpers
- deterministic Circle bootstrap readiness marker via `data-testid="circle-ready"`
- stable selectors on the primary organiser, member, routine, invite, pairing, and voice flows
- fake browser speech recognition and instant speech synthesis for Playwright
- fake assisted live-voice mode so browser tests do not require a real Gemini session or microphone

Local note:

- `pnpm test:e2e` uses the Playwright dev-server helper to start Convex dev plus the `apps/core` Next dev server in test mode
- browser-origin-sensitive auth still depends on `NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_URL` matching the Playwright origin

## Release Principle

Before any rollout, the core product is the priority verification surface.

- deterministic automated coverage comes first
- exploratory browser testing comes after deterministic coverage, not instead of it
- origin-sensitive auth and cross-device pairing still require manual smoke coverage

## Manual Smoke Tests

### Root Entry And Organiser Setup

- open `/` and confirm the four entry actions are present
- create a new organiser account from `/onboarding/organiser`
- confirm the new account lands in `/circle`
- sign out and sign back in through `/organiser/signin`
- confirm the Circle workspace resolves a Circle membership and settings load

### Member Join Flow

- enter a valid invite code at `/onboarding/member`
- confirm the target Circle name is shown before auth
- create or sign in to a family-side account without re-entering the code
- confirm the account lands in `/circle`
- confirm organiser-only settings remain unavailable to the Member account
- confirm the Member can create, edit, and delete memories
- confirm the Member can view routines and Circle members without gaining organiser controls

Coverage note:

- deterministic Playwright coverage now covers the member-vs-organiser authorization boundary with deterministic member bootstrap and organiser-only settings denial

### Circle Home, Insights, And Settings

- verify `/circle` loads `Current Status`, quick actions, and `Today's Updates`
- verify `/circle/insights` loads the combined organiser queue for alerts and insights
- verify reviewing or dismissing an item updates the queue
- verify `/circle/settings/account` loads the current profile and session information
- verify `/circle/settings/members` lists current Circle participants

Current shipped scope note:

- there is no dedicated Activity page to smoke test yet
- there is no separate Alerts page; test the combined `/circle/insights` queue instead

### Memories

- verify `/circle/memories` loads the memory library
- verify each add flow still works: text, media, audio, and voice
- verify memory detail and edit pages still load
- verify organiser and member memory CRUD still works

### Routines

- verify `/circle/routines` loads the current schedule list and today's timeline
- verify `/circle/add-routine` can create a routine that appears in the list
- verify assisted routine check-ins still prompt and resolve through the live voice flow

Coverage note:

- deterministic Playwright coverage now covers organiser routine creation and list visibility

### People

- verify `/circle/add-person` still saves a person for the current Circle context

Current shipped scope note:

- the People UI is still limited to add-person; there is no dedicated people list, edit, or delete surface to smoke test yet

### Notifications

- verify `/circle/settings/notifications` loads for an Organiser
- if web push keys are configured, verify browser subscription can be enabled and disabled
- verify notification toggles save correctly
- verify active organiser device subscriptions appear in the settings page

### Tablet User

- generate a pairing code from `/circle/settings/pairing`
- pair a tablet or browser session through `/assisted/login`
- verify `/assisted` loads and the session survives a refresh
- verify an expired or revoked session falls back to reconnect messaging
- verify the assisted dashboard remains low-friction and does not expose family-side navigation

Coverage note:

- deterministic Playwright coverage now covers the invalid-session recovery fallback only

### Independent User

- complete first-run onboarding at `/onboarding/independent`
- verify passkey creation succeeds on a compatible browser
- verify onboarding lands in `/independent` without requiring a Circle
- verify recovery codes can be created and are shown once
- verify repeat sign-in works with the device passkey
- verify `/independent/security` can add or revoke trusted devices and rotate recovery codes
- verify `/independent/recover` can redeem a recovery code and set up a fresh passkey

### Cross-Device And Origin

- test auth from the same origin that is configured in env
- test the intended phone or tablet origin explicitly
- if testing from a different host fails with `invalid origin`, treat that as an auth configuration issue, not as a data issue

## Current Testing Gaps

- The current Playwright suite is still a first smoke layer, not a full product matrix.
- Media upload, audio upload, memory detail/edit, people creation, insights review, notification toggles, and tablet pairing success are not yet in deterministic browser coverage.
- Real passkey onboarding, real recovery-code rotation, cross-origin auth, real push-delivery integrations, and real Gemini live-voice behavior still require manual or nightly device coverage.
- There is not yet a `convex-test` transaction-level suite that seeds auth identities and exercises public Convex functions end-to-end.
