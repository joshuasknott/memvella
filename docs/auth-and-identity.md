# Auth And Identity

Status: canonical
Scope: root
Last reviewed: 2026-04-11
Owners: engineering
Read when: touching auth, onboarding, passkeys, sessions, recovery, or role permissions
Depends on: docs/product.md, docs/architecture.md, docs/env.md

## Overview

Memvella uses two identity families:

- Better Auth for Circle participant account sessions
- Convex-managed senior access sessions for Tablet User and Independent User device access

## Target Flows

| Role | Entry route | Auth bootstrap | Recovery path | Lands in |
| --- | --- | --- | --- | --- |
| `Organiser` | `/onboarding/organiser` | Better Auth account auth | standard family-side account recovery | `/circle` |
| `Member` | `/onboarding/member` | Circle invite code, then Better Auth account auth | standard family-side account recovery | `/circle` |
| `Tablet User` | `/assisted/login` | pairing code | re-pair or explicit organiser-side recovery | `/assisted` |
| `Independent User` | `/onboarding/independent` | passkey-first standalone setup | recovery codes, plus a narrow fallback path only when accessibility requires it | `/independent` |

## Circle Participant Auth

This path is for Organisers and Members.

- Sign-up route: `/onboarding/organiser`
- Sign-in route: `/organiser/signin`
- Member join route: `/onboarding/member`
- Better Auth client calls: `authClient.signUp.email` and `authClient.signIn.email`

Rules:

- A new Organiser account creates a new Circle when no existing Circle membership exists.
- A Member joins an existing Circle through an invite flow.
- Circle authorization is anchored on `circleMemberships`.
- A Circle may contain multiple Organisers.
- Role changes must be explicit and auditable.

## Member Join Flow

Target behavior:

- A future Member enters a valid Circle invite code first.
- Memvella previews the target Circle before any account step.
- If the person already has an active family-side session, the invite can redeem into that session.
- Otherwise they create or sign in to a family-side account and the invite redeems after auth.
- The resulting membership role is `member` unless explicitly promoted later.

## Independent User Auth

- Onboarding UI: `apps/core/app/onboarding/independent/page.tsx`
- Recovery UI: `apps/core/app/independent/recover/page.tsx`
- Passkey routes: `apps/core/app/api/independent/passkey/**/route.ts`
- Recovery code route: `apps/core/app/api/independent/recovery-codes/redeem/route.ts`

Rules:

- Independent auth is standalone and must not require a Circle.
- Passkeys are the default sign-in mechanism.
- Recovery codes are the primary recovery mechanism.
- A fallback path may exist when accessibility requires it, but it must stay narrow and must not become the main auth model.
- Independent users must not silently inherit family-side account state.
- Any trusted-helper recovery or transition flow must be explicit and auditable.

## Tablet User Device Access

- Pairing UI: `apps/core/app/assisted/login/page.tsx`
- Pairing API route: `apps/core/app/api/assisted/pairing/route.ts`

Rules:

- An Organiser generates a pairing code.
- The assisted device submits that code.
- Convex validates the pairing and mints an `assisted_device` senior access session bound to the device fingerprint.
- Revocation and re-pairing must be explicit.

## Identity Model

- Better Auth identities are mapped through `identity.tokenIdentifier`.
- Circle-side authorization is anchored on `circleMemberships`.
- Independent onboarding bootstrap is anchored on `independentOnboardingSessions`.
- Independent passkeys are anchored on `independentSeniorPasskeys`.
- Independent recovery codes are anchored on `independentSeniorRecoveryCodes`.
- Senior-side device access is anchored on `seniorAccessSessions`.
- Senior identity is anchored on `seniorProfiles`.
- Assisted and independent seniors are distinguished by `seniorProfiles.seniorMode`.

## Transition Rules

- Independent users begin outside any Circle.
- An explicit transition may later move an Independent User into assisted or Circle-linked mode.
- That transition should offer a choice to migrate existing senior data or start fresh.
- Migration must be explicit. It must never happen silently.

## Origin And Callback Rules

### Better Auth Base URL

`apps/core/convex/auth.ts` derives the Better Auth base URL from:

1. `BETTER_AUTH_URL`
2. `SITE_URL`
3. `NEXT_PUBLIC_SITE_URL`

### Better Auth Trusted Origins

`apps/core/convex/auth.ts` derives trusted origins from:

1. the configured app origins above
2. `BETTER_AUTH_TRUSTED_ORIGINS`, parsed as a comma-separated list of additional origins
3. in non-production only, the current request origin when it is a local-development origin such as `localhost`, `127.0.0.1`, `*.local`, or a private LAN IP

### Passkey Origin

`apps/core/lib/passkey.ts` derives WebAuthn origin and RP ID from:

1. the current browser request origin in non-production, preferring `Origin` or forwarded proxy headers before the raw request URL so tunnelled local testing keeps the public host
2. `NEXT_PUBLIC_SITE_URL` in production
3. `BETTER_AUTH_URL` as the next production fallback

### Current Risk

Production still depends on explicit origin configuration.

Examples of risky setups:

- `BETTER_AUTH_URL=http://localhost:3000` while testing from a phone on `http://192.168.x.x:3000` in production-like environments
- using one host for the initial page load and another for callbacks
- changing host or port between sign-in initiation and verification

Expected failure mode:

- Better Auth responds with `invalid origin`

## Role Collision Rules

- Independent onboarding must prevent reuse of an identity already linked to the Circle participant experience.
- Family-side accounts must not silently become senior-side identities.

## Implementation Note

The current implementation still contains legacy family-side naming and transitional independent compatibility paths. New work should move toward this target model rather than keeping those compatibility surfaces alive.
