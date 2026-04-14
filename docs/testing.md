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
- `pnpm build`
- `pnpm verify` to run the full loop in sequence

Current gate:

- GitHub Actions runs `pnpm verify` on pushes to `main` and on pull requests.

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

- There is not yet an end-to-end browser test suite for the onboarding and permissions matrix.
- There is not yet a `convex-test` transaction-level suite that seeds auth identities and exercises public Convex functions end-to-end.
- Manual smoke coverage is still required for origin-sensitive auth, cross-device pairing, real push-delivery integrations, and senior voice flows.
