# Environment

Status: canonical
Scope: root
Last reviewed: 2026-04-11
Owners: engineering
Read when: setting up local dev, auth, AI, or deployment
Depends on: docs/auth-and-identity.md

## Local Example File

The local examples live at:

- `apps/core/.env.example`
- `apps/marketing/.env.example`

## Variable Contract

| Variable | Required | Scope | Used by | Notes |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | client and server | Better Auth callbacks, passkey origin | Must match the actual browser origin you use for auth flows |
| `BETTER_AUTH_URL` | yes | server | Better Auth base URL | Usually the same value as `NEXT_PUBLIC_SITE_URL` |
| `BETTER_AUTH_TRUSTED_ORIGINS` | optional | server | Better Auth origin validation | Comma-separated list of extra trusted origins for staging or multi-origin setups |
| `SITE_URL` | no | server | legacy fallback in auth helpers | Prefer `BETTER_AUTH_URL` instead |
| `NEXT_PUBLIC_CONVEX_URL` | yes | client and server | Convex React client and HTTP client | Convex deployment URL |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | yes | server | Better Auth and Convex Next.js bridge | Convex site URL |
| `BETTER_AUTH_SECRET` | yes | server and Convex | Better Auth signing and shared auth helpers | Secret value |
| `MEMVELLA_AUTH_PEPPER` | recommended in general, required in production when `BETTER_AUTH_SECRET` is not present | server and Convex | extra hashing/pepper helpers | Secret value |
| `GEMINI_API_KEY` | required for AI features | server and Convex | live voice and AI actions | Needed for voice and insights paths |
| `GEMINI_LIVE_MODEL` | optional | server | live voice token route | Falls back to the default model when omitted |
| `NEXT_PUBLIC_MEMVELLA_WEB_PUSH_PUBLIC_KEY` | optional | client and Convex | push notification subscription flow | Needed for browser push |
| `MEMVELLA_WEB_PUSH_PRIVATE_KEY` | optional | Convex | push delivery worker | Secret value |
| `MEMVELLA_WEB_PUSH_SUBJECT` | optional | Convex | push delivery worker | Usually a `mailto:` value |
| `CONVEX_URL` | yes for marketing waitlist writes | server | marketing waitlist API route | `apps/marketing` server route uses this to submit waitlist entries |

## Local Auth Rule

If you are testing auth on a phone, tablet, or another machine, set the site URL variables to the actual host you are using in the browser. If you intentionally need more than one browser origin, add the extras to `BETTER_AUTH_TRUSTED_ORIGINS`.

## Convex Rule

If a variable is read inside Convex functions, configure it for the Convex runtime as well. A value existing only in the Next.js environment is not enough for server-side Convex code.

For `apps/core`, prefer `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_CONVEX_SITE_URL` in `.env.local`. Avoid also defining `CONVEX_SITE_URL` there, because the Convex CLI treats the site URL aliases as the same setting and will skip automatic updates when more than one is present.

## Crypto Secret Rule

Security-sensitive hashing and signing helpers in both Convex and Next.js server code resolve secrets in this order:

1. `MEMVELLA_AUTH_PEPPER`
2. `BETTER_AUTH_SECRET`
3. local development fallback (non-production only)

Production behavior is fail-closed:

- if both `MEMVELLA_AUTH_PEPPER` and `BETTER_AUTH_SECRET` are missing, requests that need crypto helpers fail with a server error instead of silently using a weak default.
- production detection includes `NODE_ENV=production` and Convex production deployments (for example `CONVEX_DEPLOYMENT=prod:...`).
