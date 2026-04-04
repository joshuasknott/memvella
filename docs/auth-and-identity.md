# Auth And Identity

Status: canonical
Scope: root
Last reviewed: 2026-04-04
Owners: engineering
Read when: touching auth, onboarding, passkeys, sessions, or recovery
Depends on: docs/product.md, docs/architecture.md, docs/env.md

## Overview

Memvella currently uses two identity layers:

- Better Auth for account-backed user sessions
- Convex-managed senior access sessions for assisted and independent senior device access

## Current Flows

### Supporter Account Auth

- Sign-up UI: `apps/core/app/onboarding/supporter/page.tsx`
- Sign-in UI: `apps/core/app/supporter/signin/SupporterSignInClient.tsx`
- Better Auth client calls: `authClient.signUp.email` and `authClient.signIn.email`
- After auth succeeds, `SupporterProfileBootstrap` ensures a matching Circle membership exists by calling `createSupporterProfile` or `patchSupporterProfile`

Current behavior:

- A new Supporter account creates a new Circle when no existing membership is found.
- A Supporter can optionally seed the senior display name during onboarding.
- Supporter auth is currently email and password.

### Independent Senior Auth

- Onboarding UI: `apps/core/app/onboarding/independent/page.tsx`
- Verification UI: `apps/core/app/onboarding/independent/verify/page.tsx`
- Recovery UI: `apps/core/app/independent/recover/page.tsx`
- Finalization mutation: `apps/core/convex/independentAuth.ts`

Current behavior:

- The user enters a name and email address.
- Better Auth sends an email magic link.
- After sign-in, Convex finalizes the identity into an `independent_senior` membership and mints a senior access session.
- The user can then enroll a passkey for future access on that device.
- Recovery supports another email magic link or a passkey challenge.

Guardrails:

- This flow is passwordless.
- This flow is currently email-based.
- Product direction is moving toward SMS-only onboarding, but that change has not been implemented yet.

### Assisted Senior Device Access

- Pairing UI: `apps/core/app/assisted/login/page.tsx`
- Pairing API route: `apps/core/app/api/assisted/pairing/route.ts`
- Convex pairing logic: `apps/core/convex/kiosk.ts`

Current behavior:

- A Supporter generates a 6-digit code.
- The assisted device submits that code.
- Convex validates the pairing and mints an `assisted_device` senior access session that is bound to the device fingerprint.

## Identity Model

- Better Auth identities are mapped through `identity.tokenIdentifier`.
- Application authorization is anchored on `familySpaceMemberships`.
- Senior-side device access is anchored on `seniorAccessSessions`.
- Assisted and independent seniors are distinguished by `seniorProfiles.seniorMode`.

## Origin And Callback Rules

### Better Auth Base URL

`apps/core/convex/auth.ts` derives the Better Auth base URL from:

1. `BETTER_AUTH_URL`
2. `SITE_URL`
3. `NEXT_PUBLIC_SITE_URL`

### Passkey Origin

`apps/core/lib/passkey.ts` derives WebAuthn origin and RP ID from:

1. `NEXT_PUBLIC_SITE_URL`
2. `BETTER_AUTH_URL`
3. the current request URL as a last fallback

### Current Risk

The current auth setup does not define extra `trustedOrigins` in `apps/core/convex/auth.ts`.
In practice, that means local auth flows are safest when the browser origin exactly matches the configured app origin.

Examples of risky setups:

- `BETTER_AUTH_URL=http://localhost:3000` while testing from a phone on `http://192.168.x.x:3000`
- using one host for the initial page load and another for callbacks
- changing host or port between sign-in initiation and verification

Expected failure mode:

- Better Auth responds with `invalid origin`

## Role Collision Rules

- Independent onboarding prevents reuse of an identity that is already linked to the Supporter experience.
- That collision is surfaced in `finalizeMagicLinkSignIn` as a `role_collision` result.

## Known Gaps

- Independent onboarding is not SMS-only yet.
- There is no implemented flow for joining an existing Circle during onboarding.
- Trusted-origin handling needs a dedicated implementation for local multi-device testing and multi-origin environments.
