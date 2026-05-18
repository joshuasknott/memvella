# Environment

Status: canonical
Scope: root
Last reviewed: 2026-04-14
Owners: engineering
Read when: setting up local dev, auth, AI, push, or deployment
Depends on: docs/auth-and-identity.md

## Local Example Files

The local examples live at:

- `apps/core/.env.example`
- `apps/marketing/.env.example`
- `apps/internal/.env.example`

## Variable Contract

| Variable | Required | Scope | Used by | Notes |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | client and server | Better Auth callbacks, passkey origin | Must match the actual browser origin used for auth flows |
| `BETTER_AUTH_URL` | yes | server and Convex | Better Auth base URL | Usually the same value as `NEXT_PUBLIC_SITE_URL` |
| `BETTER_AUTH_TRUSTED_ORIGINS` | optional | server and Convex | Better Auth origin validation | Comma-separated list of extra trusted origins |
| `SITE_URL` | optional | server and Convex | legacy Better Auth fallback | Keep only as fallback while it still exists in code |
| `CONVEX_DEPLOYMENT` | required for normal Convex CLI setup | local dev and deployment tooling | Convex CLI and production detection helpers | Present in `apps/core/.env.example` |
| `NEXT_PUBLIC_CONVEX_URL` | yes | client and server | Convex React client, HTTP client, Better Auth bridge | Convex deployment URL |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | yes | server | `convexBetterAuthNextJs` bridge | Convex site URL |
| `BETTER_AUTH_SECRET` | yes | server and Convex | Better Auth signing and shared auth helpers | Secret value |
| `MEMVELLA_AUTH_PEPPER` | recommended, and required in production if `BETTER_AUTH_SECRET` is absent | server and Convex | hashing and token helpers | Secret value |
| `MEMVELLA_TEST_MODE` | optional | server and Convex | guarded E2E-only test seams | Must be `1` to enable `/api/test/**` helpers and test-only Convex support |
| `NEXT_PUBLIC_MEMVELLA_TEST_MODE` | optional | client | browser-only E2E seams | Enables deterministic browser speech behavior in Playwright |
| `MEMVELLA_TEST_AUTH_TOKEN` | optional | server and Convex | guarded E2E-only test routes and mutations | Shared secret for `/api/test/**` helpers. Defaults to a local-only fallback when unset |
| `GEMINI_API_KEY` | required for AI and live voice features | server and Convex | live voice token route, AI actions, insights pipeline | Needed for voice and AI paths |
| `GEMINI_LIVE_MODEL` | optional | server | live voice token route | Falls back to the default live model when omitted |
| `NEXT_PUBLIC_MEMVELLA_WEB_PUSH_PUBLIC_KEY` | optional | client and Convex | push subscription flow | If absent, organiser push setup is unavailable |
| `MEMVELLA_WEB_PUSH_PRIVATE_KEY` | optional | Convex | push delivery worker | Secret value |
| `MEMVELLA_WEB_PUSH_SUBJECT` | optional | Convex | push delivery worker | Usually a `mailto:` value |
| `CONVEX_URL` | required only for the marketing waitlist server route | server | `apps/marketing` waitlist submission route | Marketing-only variable |
| `MEMVELLA_HQ_ENABLED` | required to enable HQ | server | `apps/internal` | Set to `1` to enable Memvella HQ |
| `MEMVELLA_HQ_ACCESS_KEY` | required when HQ enabled | server | `apps/internal` | Founder access key; secret value |
| `MEMVELLA_HQ_COOKIE_SECRET` | required when HQ enabled | server | `apps/internal` | Signing secret for the HTTP-only HQ session cookie; secret value |
| `MEMVELLA_HQ_READ_TOKEN` | required when HQ enabled | server and Convex | `apps/internal`, `apps/backend-convex/convex/hq.ts` | Shared read-token for HQ read models; secret value and must also be configured in Convex runtime |

## Local Auth Rule

If you are testing auth on a phone, tablet, or another machine, set the site URL variables to the actual host you are using in the browser. If you intentionally need more than one browser origin, add the extras to `BETTER_AUTH_TRUSTED_ORIGINS`.

## Convex Rule

If a variable is read inside Convex functions, configure it for the Convex runtime as well. A value existing only in the Next.js environment is not enough for server-side Convex code.

`MEMVELLA_HQ_READ_TOKEN` is read by Convex HQ read-model queries and must be set in Convex. It must also be set in `apps/internal` so the server-side HQ Convex client can call those read models. The browser must never receive this token.

For `apps/core`, prefer `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_CONVEX_SITE_URL` in `.env.local`. Avoid also defining `CONVEX_SITE_URL` there, because the Convex CLI treats the site URL aliases as the same setting and will skip automatic updates when more than one is present.

## Crypto Secret Rule

Security-sensitive hashing and signing helpers in both Convex and Next.js server code resolve secrets in this order:

1. `MEMVELLA_AUTH_PEPPER`
2. `BETTER_AUTH_SECRET`
3. local development fallback in non-production only

Production behavior is fail-closed:

- if both `MEMVELLA_AUTH_PEPPER` and `BETTER_AUTH_SECRET` are missing, requests that need crypto helpers fail with a server error instead of silently using a weak default
- production detection includes `NODE_ENV=production` and Convex production deployments such as `CONVEX_DEPLOYMENT=prod:...`

## Push Configuration Note

Push notifications are optional but the shipped organiser notifications page expects the public key to exist before browser subscription can be enabled. Without the push keys, the page still loads but reports that push alerts are not configured for the deployment.
