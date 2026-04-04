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

### Family-Side Account Auth

This is the current implementation path for the future `Organiser` and `Member` family-side roles.

- Sign-up UI: `apps/core/app/onboarding/supporter/page.tsx`
- Sign-in UI: `apps/core/app/supporter/signin/SupporterSignInClient.tsx`
- Better Auth client calls: `authClient.signUp.email` and `authClient.signIn.email`
- After auth succeeds, `SupporterProfileBootstrap` ensures a matching Circle membership exists by calling `createSupporterProfile` or `patchSupporterProfile`

Current behavior:

- A new family-side account creates a new Circle when no existing membership is found.
- The current shipped UI labels this account as `Admin` in some places and `Supporter` in others.
- Family-side auth is currently email and password.
- The current backend role string is still `supporter`.

### Member Join Flow

Current status:

- Terminology is decided, but there is no implemented onboarding path yet for joining an existing Circle as a `Member`.
- That means there is no current auth bootstrap for a new family or friend invitee.

### Independent User Auth

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

### Tablet User Device Access

- Pairing UI: `apps/core/app/assisted/login/page.tsx`
- Pairing API route: `apps/core/app/api/assisted/pairing/route.ts`
- Convex pairing logic: `apps/core/convex/kiosk.ts`

Current behavior:

- An Organiser generates a 6-digit code.
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

### Better Auth Trusted Origins

`apps/core/convex/auth.ts` now derives trusted origins from:

1. the configured app origins above
2. `BETTER_AUTH_TRUSTED_ORIGINS`, parsed as a comma-separated list of additional origins
3. in non-production only, the current request origin when it is a local-development origin such as `localhost`, `127.0.0.1`, `*.local`, or a private LAN IP

### Passkey Origin

`apps/core/lib/passkey.ts` derives WebAuthn origin and RP ID from:

1. the current request URL in non-production, so local multi-device testing uses the actual browser origin
2. `NEXT_PUBLIC_SITE_URL` in production
3. `BETTER_AUTH_URL` as the next production fallback

### Current Risk

The auth setup is now more forgiving for local multi-device testing, but production still depends on explicit origin configuration.

Examples of risky setups:

- `BETTER_AUTH_URL=http://localhost:3000` while testing from a phone on `http://192.168.x.x:3000` in production-like environments
- using one host for the initial page load and another for callbacks
- changing host or port between sign-in initiation and verification

Expected failure mode:

- Better Auth responds with `invalid origin`

## Role Collision Rules

- Independent onboarding prevents reuse of an identity that is already linked to the family-side account experience.
- That collision is surfaced in `finalizeMagicLinkSignIn` as a `role_collision` result.

## Known Gaps

- Independent onboarding is not SMS-only yet.
- There is no implemented flow for joining an existing Circle during onboarding.
- The data model still does not distinguish `Organiser` from `Member` as separate family-side roles.
