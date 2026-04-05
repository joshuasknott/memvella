# Testing

Status: canonical
Scope: root
Last reviewed: 2026-04-04
Owners: engineering
Read when: changing onboarding, auth, senior sessions, or marketing conversion flows
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

## Manual Smoke Tests

### Family-Side Account

- create a new family-side account
- sign out and sign back in
- confirm the Circle workspace resolves a Circle membership
- confirm pairing settings, memories, routines, and notifications still load

### Member Join Flow

- create or sign in to a family-side account from `/onboarding/member`
- enter a valid 6-digit invite code
- confirm the account lands in the Circle workspace
- confirm organiser-only settings remain unavailable to the Member account

### Tablet User

- generate a 6-digit pairing code from the Organiser side
- pair a tablet or browser session through the assisted login screen
- verify the assisted dashboard loads and the session survives a refresh
- verify an expired or revoked session falls back to reconnect messaging

### Independent User

- complete first-run onboarding
- verify SMS code delivery and verification work end to end
- verify verification/finalization creates a usable senior session
- verify passkey enrollment succeeds when supported
- verify recovery works through SMS or passkey

### Cross-Device And Origin

- test auth from the same origin that is configured in env
- test the intended phone or tablet origin explicitly
- if testing from a different host fails with `invalid origin`, treat that as an auth configuration issue, not as a data issue

### Marketing

- verify `/`, `/experience`, `/philosophy`, and `/waitlist` all render
- verify the waitlist form submits successfully and repeat submissions dedupe cleanly

## Current Testing Gaps

- There is not yet an end-to-end browser test suite for the full onboarding matrix.
- Existing lint still reports several pre-existing `<img>` warnings in older Circle workspace pages.
