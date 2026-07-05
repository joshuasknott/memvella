# Environment

Status: canonical
Scope: root
Last reviewed: 2026-07-04
Owners: engineering
Read when: setting up local dev, auth, AI, push, or deployment
Depends on: docs/auth-and-identity.md

## Local Example Files

The local examples live at:

- `apps/core/.env.example`
- `apps/backend-convex/.env.example`
- `apps/marketing/.env.example`
- `apps/internal/.env.example`

## Variable Contract

| Variable | Required | Scope | Used by | Notes |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | client and server | Better Auth callbacks | Must match the actual browser origin used for auth flows |
| `BETTER_AUTH_URL` | yes | server and Convex | Better Auth base URL | Usually the same value as `NEXT_PUBLIC_SITE_URL` |
| `BETTER_AUTH_TRUSTED_ORIGINS` | optional | server and Convex | Better Auth origin validation | Comma-separated list of extra trusted origins |
| `SITE_URL` | optional | server and Convex | legacy Better Auth fallback | Keep only as fallback while it still exists in code |
| `CONVEX_DEPLOYMENT` | required for normal Convex CLI setup | local dev and deployment tooling | Convex CLI and production detection helpers | Present in `apps/core/.env.example` and `apps/backend-convex/.env.example` |
| `NEXT_PUBLIC_CONVEX_URL` | yes | client and server | Convex React client, HTTP client, Better Auth bridge | Convex deployment URL |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | yes | server | `convexBetterAuthNextJs` bridge | Convex site URL |
| `BETTER_AUTH_SECRET` | yes | server and Convex | Better Auth signing and shared auth helpers | Secret value |
| `MEMVELLA_AUTH_PEPPER` | recommended, and required in production if `BETTER_AUTH_SECRET` is absent | server and Convex | hashing and token helpers | Secret value |
| `RESEND_API_KEY` | yes for production account auth | Convex | account verification and password-reset email delivery | Secret Resend API key; configure it in the Convex runtime |
| `MEMVELLA_AUTH_EMAIL_FROM` | yes for production account auth | Convex | account verification and password-reset email delivery | Verified sender, for example `Memvella <accounts@example.com>` |
| `MEMVELLA_TEST_MODE` | optional | server and Convex | guarded E2E-only test seams | Must be `1` to enable `/api/test/**` helpers and test-only Convex support. The Playwright dev-server helper sets this on the Convex dev deployment before E2E runs, and the Playwright teardown removes the temporary value after the run |
| `NEXT_PUBLIC_MEMVELLA_TEST_MODE` | optional | client | browser-only E2E seams | Enables deterministic browser speech behavior in Playwright |
| `MEMVELLA_TEST_AUTH_TOKEN` | optional | server and Convex | guarded E2E-only test routes and mutations | Shared secret for `/api/test/**` helpers when test mode is enabled outside the local Playwright helper |
| `GEMINI_API_KEY` | required for AI and live voice features | server and Convex | live voice token route, AI actions, insights pipeline | Needed for voice and AI paths |
| `GEMINI_LIVE_MODEL` | optional | server | live voice token route | Falls back to the default live model when omitted |
| `NEXT_PUBLIC_MEMVELLA_WEB_PUSH_PUBLIC_KEY` | optional | client and Convex | push subscription flow | If absent, organiser push setup is unavailable |
| `MEMVELLA_WEB_PUSH_PRIVATE_KEY` | optional | Convex | push delivery worker | Secret value |
| `MEMVELLA_WEB_PUSH_SUBJECT` | optional | Convex | push delivery worker | Usually a `mailto:` value |
| `CONVEX_URL` | required only for the marketing waitlist server route | server | `apps/marketing` waitlist submission route | Marketing-only variable |
| `MEMVELLA_HQ_ENABLED` | required to enable HQ | server | `apps/internal` | Set to `1` to enable Memvella HQ |
| `MEMVELLA_HQ_ACCESS_KEY` | required when HQ enabled | server | `apps/internal` | HQ access key; secret value |
| `MEMVELLA_HQ_COOKIE_SECRET` | required when HQ enabled | server | `apps/internal` | Signing secret for the HTTP-only HQ session cookie; secret value |
| `MEMVELLA_ENV` | optional | server | `apps/internal` | Overrides HQ environment detection; valid values are `local`, `development`, `staging`, and `production` |

## Local Auth Rule

If you are testing auth on a phone, tablet, or another machine, set the site URL variables to the actual host you are using in the browser. If you intentionally need more than one browser origin, add the extras to `BETTER_AUTH_TRUSTED_ORIGINS`.

## Convex Rule

If a variable is read inside Convex functions, configure it for the Convex runtime as well. A value existing only in the Next.js environment is not enough for server-side Convex code.

The Convex backend declares its runtime environment contract in `apps/backend-convex/convex/convex.config.ts`. The local `apps/backend-convex/.env.example` mirrors the variables that may need to be configured through the Convex CLI or dashboard for the active deployment.

Run `pnpm check:env` from the repo root after changing this contract, any `.env.example` file, or `apps/backend-convex/convex/convex.config.ts`.

Email/password sign-up is fail-closed outside test mode: production sign-up requires email verification, and verification or password-recovery delivery fails clearly when `RESEND_API_KEY` or `MEMVELLA_AUTH_EMAIL_FROM` is missing. Test mode suppresses external email delivery and bypasses verification so deterministic browser tests remain local.

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

Push notifications are optional but the shipped Workspace notification settings page expects the public key to exist before browser subscription can be enabled. Without the push keys, the page still loads but reports that push alerts are not configured for the deployment.
