# Auth And Identity

Status: canonical
Scope: root
Last reviewed: 2026-04-14
Owners: engineering
Read when: touching auth, onboarding, passkeys, sessions, recovery, or role permissions
Depends on: docs/product.md, docs/architecture.md, docs/env.md

## Overview

Memvella uses two auth families:

- Better Auth for family-side account sessions
- Convex-managed senior access sessions for assisted and independent device access

Memvella HQ in `apps/internal` uses a separate founder-only access gate. Product `Organiser` and `Member` sessions do not grant HQ access, and HQ does not impersonate product users.

## Current Flows

| Experience | Entry route | Auth bootstrap | Recovery path | Lands in |
| --- | --- | --- | --- | --- |
| `Organiser` | `/onboarding/organiser` | Better Auth email/password sign-up, then Circle bootstrap | Better Auth family-side account recovery | `/circle` |
| `Member` | `/onboarding/member` | invite preview, then Better Auth email/password sign-up or sign-in, then invite redeem | Better Auth family-side account recovery | `/circle` |
| `Tablet User` | `/assisted/login` | 6-digit pairing code | re-pair or organiser revocation/re-pair | `/assisted` |
| `Independent User` | `/onboarding/independent` | passkey-first standalone setup | recovery codes, then fresh passkey setup | `/independent` |

## Family-Side Account Auth

This path is for Organisers and Members.

- Sign-up route: `/onboarding/organiser`
- Sign-in route: `/organiser/signin`
- Member join route: `/onboarding/member`
- Better Auth client calls: `authClient.signUp.email` and `authClient.signIn.email`
- Better Auth routes are served through `apps/core/app/api/auth/[...all]/route.ts`

Rules:

- Family-side roles are `organiser` and `member` only.
- Better Auth identities are mapped through `identity.tokenIdentifier`.
- Circle authorization is anchored on `circleMemberships`.
- A new organiser account creates a new Circle when no membership already exists for that auth identity.
- The current organiser bootstrap path defaults new organiser-created senior profiles to `assisted` mode.
- A Circle may contain multiple Organisers.

## Member Join Flow

The shipped member flow is:

1. the future Member enters a 6-digit invite code at `/onboarding/member`
2. `/api/member-invite/preview` previews the target Circle before any account step
3. the person either creates an account or signs in with an existing Better Auth account
4. `api.circleInvites.redeemMemberInviteCode` redeems the invite into that authenticated session
5. the resulting membership role is `member`

Additional current behavior:

- The pending invite preview is kept in session storage during the auth step.
- If a signed-in account cannot redeem the invite, the UI offers sign-out and retry with a different account.

## Assisted Tablet Access

- Pairing UI: `apps/core/app/assisted/login/page.tsx`
- Pairing API route: `apps/core/app/api/assisted/pairing/route.ts`
- Organiser pairing settings: `/circle/settings/pairing`

Rules:

- An Organiser generates a 6-digit pairing code.
- The assisted device submits that code plus its device fingerprint.
- Convex validates the pairing and mints an `assisted_device` senior access session bound to the device fingerprint.
- Organisers can revoke individual tablet sessions or all tablet access.
- Revocation and re-pairing are explicit.

## Independent User Auth

- Onboarding UI: `apps/core/app/onboarding/independent/page.tsx`
- Security UI: `apps/core/app/independent/security/page.tsx`
- Recovery UI: `apps/core/app/independent/recover/page.tsx`
- Onboarding bootstrap route: `apps/core/app/api/independent/onboarding/start/route.ts`
- Passkey routes: `apps/core/app/api/independent/passkey/**/route.ts`
- Recovery-code route: `apps/core/app/api/independent/recovery-codes/redeem/route.ts`

Rules:

- Independent auth is standalone and does not require a Circle membership.
- Passkeys are the default sign-in mechanism.
- Recovery codes are the shipped fallback mechanism.
- Recovery-code sign-in is followed by fresh passkey setup on the new device.
- Independent users must not silently inherit family-side account state.

## Independent Recovery Help From An Organiser

When the linked senior mode is `independent`, `/circle/settings/account` exposes organiser-only recovery help.

Current organiser actions:

- review trusted devices
- revoke individual trusted devices
- revoke all trusted devices
- rotate recovery codes for the linked independent senior

These actions do not sign the organiser in as the senior.

## Identity Model

- `circleMemberships` are the family-side authorization records.
- `seniorProfiles` are the canonical senior identity records.
- `seniorProfiles.seniorMode` is `assisted` or `independent`.
- `independentOnboardingSessions` bootstrap independent setup.
- `independentSeniorPasskeys` store trusted-device passkeys.
- `independentSeniorRecoveryCodes` store recovery-code hashes.
- `seniorAccessSessions` store assisted tablet and independent web sessions.

## Role Collision Rules

- Independent onboarding must prevent reuse of an identity already linked to the family-side account experience.
- Family-side accounts must not silently become senior-side identities.
- Any later transition between independent and Circle-linked operation must be explicit and auditable.

## Origin And Callback Rules

### Better Auth Base URL

`apps/backend-convex/convex/auth.ts` derives the Better Auth base URL from:

1. `BETTER_AUTH_URL`
2. `SITE_URL`
3. `NEXT_PUBLIC_SITE_URL`

### Better Auth Trusted Origins

`apps/backend-convex/convex/auth.ts` derives trusted origins from:

1. the configured app origins above
2. `BETTER_AUTH_TRUSTED_ORIGINS`, parsed as a comma-separated list of additional origins
3. the current request origin when it is a local-development origin such as `localhost`, `127.0.0.1`, `*.local`, or a private LAN IP

### Passkey Origin

`apps/core/lib/passkey.ts` derives WebAuthn origin and RP ID from:

1. the current browser request origin in non-production, preferring `Origin` or forwarded proxy headers before the raw request URL
2. `NEXT_PUBLIC_SITE_URL` in production
3. `BETTER_AUTH_URL` as the next production fallback

### Expected Failure Mode For Bad Origin Config

Examples of risky setups:

- `BETTER_AUTH_URL=http://localhost:3000` while testing from a phone on another host
- using one host for the initial page load and another for callbacks
- changing host or port between sign-in initiation and verification

Expected failure mode:

- Better Auth responds with `invalid origin`
