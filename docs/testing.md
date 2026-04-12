# Testing

Status: canonical
Scope: root
Last reviewed: 2026-04-12
Owners: engineering
Read when: changing onboarding, auth, permissions, senior sessions, transitions, or marketing conversion flows
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

Before any early user rollout, the core product must be treated as the priority verification surface.

- deterministic automated coverage comes first
- browser-agent exploratory testing comes after deterministic coverage, not instead of it
- marketing verification is secondary until the core product is stable

## Manual Smoke Tests

### Organiser Account

- create a new organiser account
- sign out and sign back in
- confirm the Circle workspace resolves a Circle membership
- confirm memories, people, routines, alerts, insights, and settings still load

### Member Join Flow

- enter a valid invite code from `/onboarding/member`
- confirm the target Circle name is shown before auth
- create or sign in to a family-side account without re-entering the code
- confirm the account lands in the Circle workspace
- confirm organiser-only settings remain unavailable to the Member account
- confirm the Member can create, edit, and delete memories
- confirm the Member can view people and routines without gaining management controls

### Tablet User

- generate a pairing code from the Organiser side
- pair a tablet or browser session through the assisted login screen
- verify the assisted dashboard loads and the session survives a refresh
- verify an expired or revoked session falls back to reconnect messaging
- verify the dashboard remains low-friction and does not expose browsing-heavy flows

### Independent User

- complete first-run onboarding
- verify passkey creation succeeds on a compatible browser
- verify onboarding lands in the independent experience without requiring a Circle
- verify recovery codes can be created and are shown once
- verify repeat sign-in works with the device passkey
- verify the recovery flow can add a fresh passkey on a new device

### Alerts, Insights, And Activity

- verify urgent events surface as organiser-facing alerts
- verify non-urgent summaries surface as insights
- verify the Circle activity feed shows meaningful family-side and senior-side events without turning into a raw transcript log
- verify evidence snippets, where shown, are selective and relevant

### Transition Flows

- verify an Independent User can be prepared for transition into assisted or Circle-linked mode
- verify the transition flow can offer migrate versus start-fresh behavior when implemented
- verify no transition silently changes ownership, permissions, or senior data shape

### Cross-Device And Origin

- test auth from the same origin that is configured in env
- test the intended phone or tablet origin explicitly
- if testing from a different host fails with `invalid origin`, treat that as an auth configuration issue, not as a data issue

### Marketing

- verify `/`, `/privacy`, `/terms`, and `/contact` all render
- verify the homepage waitlist form submits successfully and repeat submissions dedupe cleanly

## Required Automated Coverage Direction

The codebase should grow deterministic coverage around:

- organiser and member permission boundaries
- invite flows
- pairing flows
- senior sessions
- independent onboarding and recovery
- routines and routine history
- memory CRUD and memory relationships
- alerts, insights, and activity generation
- independent-to-assisted transition flows

## Exploratory Testing Guidance

- Browser agents are useful for exploratory and cross-device regression testing.
- Use them to find UX and integration issues after the deterministic checks are in place.
- Do not rely on browser-agent output as the only release gate for auth-sensitive or senior-sensitive flows.

## Current Testing Gaps

- There is not yet an end-to-end browser test suite for the full onboarding and permissions matrix.
- There is not yet a `convex-test` transaction-level suite that seeds auth identities and exercises public Convex functions end-to-end.
- Manual smoke coverage is still required for origin-sensitive auth, cross-device pairing, and real push-delivery integrations.
- Marketing automation is intentionally lower priority until the core product is stable.
