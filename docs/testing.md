# Testing

Status: canonical
Scope: root
Last reviewed: 2026-04-04
Owners: engineering
Read when: changing onboarding, auth, senior sessions, or marketing conversion flows
Depends on: docs/auth-and-identity.md, docs/env.md

## Preflight

Before testing auth-sensitive changes:

- confirm the browser origin matches `NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_URL`
- confirm Convex is running and the app is connected to the intended deployment
- confirm any server-side secrets required for the path under test are configured

## Manual Smoke Tests

### Family-Side Account

- create a new family-side account
- sign out and sign back in
- confirm the dashboard resolves a Circle membership
- confirm pairing settings, memories, routines, and notifications still load

### Tablet User

- generate a 6-digit pairing code from the Organiser side
- pair a tablet or browser session through the assisted login screen
- verify the assisted dashboard loads and the session survives a refresh
- verify an expired or revoked session falls back to reconnect messaging

### Independent User

- complete first-run onboarding
- verify passwordless sign-in works end to end
- verify verification/finalization creates a usable senior session
- verify passkey enrollment succeeds when supported
- verify recovery works through the available recovery path

### Cross-Device And Origin

- test auth from the same origin that is configured in env
- test the intended phone or tablet origin explicitly
- if testing from a different host fails with `invalid origin`, treat that as an auth configuration issue, not as a data issue

### Marketing

- verify the marketing app renders without placeholder metadata
- verify the waitlist form behavior matches the documented current state

## Current Testing Gaps

- No documented join-existing-Circle onboarding test yet because the feature is not implemented.
- Independent onboarding direction is changing toward SMS-only, so auth tests will need updating when that work lands.
- The marketing waitlist is currently a frontend-only placeholder flow and should not be treated as a production signup pipeline.
