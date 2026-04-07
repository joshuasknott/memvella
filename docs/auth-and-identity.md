# Auth And Identity

Status: canonical
Scope: root
Last reviewed: 2026-04-06
Owners: engineering
Read when: touching auth, onboarding, passkeys, sessions, or recovery
Depends on: docs/product.md, docs/architecture.md, docs/env.md

## Overview

Memvella currently uses two identity layers:

- Better Auth for account-backed user sessions
- Convex-managed senior access sessions for assisted and independent senior device access

## Current Flows

| Role | Entry route | Auth bootstrap | Secondary auth | Lands in |
| --- | --- | --- | --- | --- |
| `Organiser` | `/onboarding/organiser` | Better Auth email and password | none | `/circle` |
| `Member` | `/onboarding/member` | 6-digit Circle code, then Better Auth email and password | none | `/circle` |
| `Tablet User` | `/assisted/login` | 6-digit pairing code | device-bound senior session | `/assisted` |
| `Independent User` | `/onboarding/independent` | device passkey | recovery codes or organiser-assisted reset | `/independent` |

### Family-Side Account Auth

This is the current implementation path for `Organiser` and `Member` family-side roles.

- Sign-up route: `/onboarding/organiser`
- Sign-in route: `/organiser/signin`
- Better Auth client calls: `authClient.signUp.email` and `authClient.signIn.email`
- After auth succeeds, `apps/core/components/organiser/OrganiserProfileBootstrap.tsx` ensures a matching Circle membership exists by calling `createOrganiserProfile` or `patchOrganiserProfile`

Current behavior:

- A new family-side account creates a new Circle when no existing membership is found.
- The shipped UI now labels this account as `Organiser`.
- Family-side auth is currently email and password.
- Legacy `supporter` rows are still accepted during rollout, but new memberships now store `organiser` or `member`.

### Member Join Flow

Current behavior:

- The join flow is live at `/onboarding/member`.
- A family member or friend enters a 6-digit Circle invite code first.
- Memvella previews the target Circle before any family-side credential entry.
- If they already have an active family-side session, the invite redeems automatically.
- Otherwise they create or sign in to a family-side account and the invite redeems automatically after auth.
- Convex creates a `member` membership in `familySpaceMemberships`.
- The account lands in the shared Circle workspace with organiser-only settings blocked.

### Independent User Auth

- Onboarding UI: `apps/core/app/onboarding/independent/page.tsx`
- Recovery UI: `apps/core/app/independent/recover/page.tsx`
- Passkey and recovery backend: `apps/core/convex/independentAccess.ts`
- Passkey route handlers: `apps/core/app/api/independent/passkey/**/route.ts`
- Recovery code route: `apps/core/app/api/independent/recovery-codes/redeem/route.ts`

Current behavior:

- The user enters only the minimum profile information required to create the independent profile.
- Convex creates a short-lived onboarding session and the browser creates a platform passkey on that device.
- Passkey registration mints the first `independent_web` senior session directly, without a Better Auth bootstrap session.
- Repeat sign-in uses discoverable WebAuthn passkeys on the device.
- Recovery supports one-time recovery codes and organiser-side help for explicit device revocation or recovery-code rotation.

Guardrails:

- This flow is passwordless.
- Passkeys are the primary sign-in mechanism.
- Recovery codes are shown after setup and can be rotated later from independent security settings.
- Organiser-side recovery help must stay explicit and must not silently impersonate the Independent User.
- `seniorProfiles` do not store the independent phone credential directly.

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
- Independent onboarding bootstrap is anchored on `independentOnboardingSessions`.
- Independent passkeys are anchored on `independentSeniorPasskeys`.
- Independent recovery codes are anchored on `independentSeniorRecoveryCodes`.
- Senior-side device access is anchored on `seniorAccessSessions`.
- Assisted and independent seniors are distinguished by `seniorProfiles.seniorMode`.
- `seniorProfiles` carry only mode-neutral senior identity and access state.

## Migration Rule

- Legacy `seniorProfiles` rows that still held independent recovery data are migrated into `independentSeniorCredentials`.
- Legacy independent memberships with no recoverable phone source are left without a credential row and moved to `accessStatus = pending`, so they must complete fresh SMS bootstrap instead of inheriting invented data.
- The older phone-credential and SMS finalization surfaces remain transitional backend compatibility paths while existing independent profiles move onto passkeys and recovery codes.

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
- That collision is surfaced in `finalizePhoneNumberSignIn` as a `role_collision` result.

## Known Gaps

- Legacy `supporter` module and table names still exist in some backend implementation details.
- Some family-side backend APIs still use organiser-era naming even though the visible workspace is now `/circle`.
- Existing SMS-first independent profiles still need an explicit migration path to add recovery codes before legacy phone recovery can be removed completely.
