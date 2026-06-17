# Auth And Identity

Status: canonical
Scope: root
Last reviewed: 2026-04-14
Owners: engineering
Read when: touching auth, onboarding, senior sessions, recovery, or role permissions
Depends on: docs/product.md, docs/architecture.md, docs/env.md

## Overview

Memvella uses two auth families:

- Better Auth for supporter account sessions
- Convex-managed senior access sessions for paired tablet access

Memvella HQ in `apps/internal` uses a separate founder-only access gate. Product Supporter sessions do not grant HQ access, and HQ does not impersonate product users.

## Current Flows

| Experience | Entry route | Auth bootstrap | Recovery path | Lands in |
| --- | --- | --- | --- | --- |
| Account / Workspace owner | `/onboarding/organiser` | Better Auth email/password sign-up, email verification, then Workspace bootstrap | `/organiser/forgot-password` and `/organiser/reset-password` | `/circle` |
| Supporter | `/onboarding/member` | invite preview, then Better Auth email/password sign-up plus verification or sign-in, then invite redeem | `/organiser/forgot-password` and `/organiser/reset-password` | `/circle` |
| Companion tablet | `/assisted/login` | 6-digit tablet code | re-pair or Workspace owner revocation/re-pair | `/assisted` |

## Supporter Account Auth

This path is for the signed-in people who create or help in a Workspace.

- Sign-up route: `/onboarding/organiser`
- Sign-in route: `/organiser/signin`
- Verification status and resend route: `/organiser/verify-email`
- Password recovery request route: `/organiser/forgot-password`
- Password reset route: `/organiser/reset-password`
- Supporter join route: `/onboarding/member`
- Better Auth client calls: `authClient.signUp.email` and `authClient.signIn.email`
- Better Auth routes are served through `apps/core/app/api/auth/[...all]/route.ts`

Rules:

- Internal roles are `organiser` and `member` only. User-facing copy maps these to Workspace owner and Supporter.
- Better Auth identities are mapped through `identity.tokenIdentifier`.
- Workspace authorization is anchored on `circleMemberships`.
- A new Workspace owner account creates a new Workspace when no membership already exists for that auth identity.
- The current Workspace owner bootstrap path defaults new senior profiles to `assisted` mode.
- Workspace bootstrap creates or updates the linked assisted senior profile.
- A Workspace may contain multiple signed-in Supporters, with owner capabilities controlled by internal role.
- Outside test mode, account sign-up does not create a usable session until the account email is verified.
- Verification and password-reset emails are delivered through Resend using the Convex runtime configuration.
- A successful password reset revokes the account's existing sessions.

## Supporter Join Flow

The shipped Supporter flow is:

1. the future Supporter enters a 6-digit invite code at `/onboarding/member`
2. `/api/member-invite/preview` previews the target Workspace before any account step
3. the person either creates and verifies an account or signs in with an existing verified Better Auth account
4. `api.circleInvites.redeemMemberInviteCode` redeems the invite into that authenticated session
5. the resulting membership role is `member`

Additional current behavior:

- The pending invite preview is kept in session storage during the auth step.
- Invite preview is intentionally available before authentication and is protected by server-side request-scoped and code-scoped rate limits.
- If a signed-in account cannot redeem the invite, the UI offers sign-out and retry with a different account.
- If verification happens in another browser or after the invite expires, the Supporter must enter a fresh invite code.

## Assisted Tablet Access

- Pairing UI: `apps/core/app/assisted/login/page.tsx`
- Pairing API route: `apps/core/app/api/assisted/pairing/route.ts`
- Workspace owner pairing settings: `/circle/settings/pairing`

Rules:

- The Workspace owner generates a 6-digit tablet code.
- The companion tablet submits that code plus its device fingerprint.
- Convex validates the pairing and mints an `assisted_device` senior access session bound to the device fingerprint.
- Workspace owners can revoke individual tablet sessions or all tablet access.
- Revocation and re-pairing are explicit.

## Identity Model

- `circleMemberships` are the internal Workspace authorization records.
- `seniorProfiles` are the canonical senior identity records.
- `seniorProfiles.seniorMode` is `assisted`.
- `seniorAccessSessions` store assisted tablet sessions.

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

### Expected Failure Mode For Bad Origin Config

Examples of risky setups:

- `BETTER_AUTH_URL=http://localhost:3000` while testing from a phone on another host
- using one host for the initial page load and another for callbacks
- changing host or port between sign-in initiation and verification

Expected failure mode:

- Better Auth responds with `invalid origin`
