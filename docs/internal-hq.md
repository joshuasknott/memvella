# Memvella HQ

Status: canonical
Scope: apps/internal
Last reviewed: 2026-05-18
Owners: founder, engineering
Read when: touching internal tooling, HQ access, company dashboards, Convex HQ read models, appEvents, or runbooks
Depends on: docs/architecture.md, docs/auth-and-identity.md, docs/data-model.md, docs/env.md

## Framing

Memvella HQ is the internal operating system and founder mission-control centre for Memvella as an elder-tech company.

HQ sits above the current companion product. It includes company health, product, growth, research, operations, trust and safety, voice and AI, observability, QA/dev, automation, and runbooks.

HQ is not a user-facing product surface. Product `Organiser` and `Member` access does not grant HQ access.

## Route Map

- `/`: Mission Control
- `/company`
- `/product`
- `/product/circles`
- `/product/circles/[circleId]`
- `/growth`
- `/research`
- `/operations`
- `/trust-safety`
- `/voice-ai`
- `/observability`
- `/qa`
- `/automation`
- `/runbooks`
- `/runbooks/[slug]`

## Access Model

HQ v1 is founder-only and read-only.

Required app variables:

- `MEMVELLA_HQ_ENABLED=1`
- `MEMVELLA_HQ_ACCESS_KEY`
- `MEMVELLA_HQ_COOKIE_SECRET`
- `MEMVELLA_HQ_READ_TOKEN`
- `NEXT_PUBLIC_CONVEX_URL`

The internal app authenticates the founder with `MEMVELLA_HQ_ACCESS_KEY` and stores an HTTP-only, same-site signed session cookie. The v1 issued role is `founder`.

Future roles are defined in code as `founder`, `operator`, and `viewer`. Future capabilities include company, product, growth, operations, trust and safety, observability, QA, and automation visibility.

HQ access is intentionally separate from Better Auth family-side sessions and Convex senior access sessions.

## Convex Read Model

HQ uses `apps/backend-convex/convex/hq.ts` for read-only read models.

Rules:

- every HQ query requires `MEMVELLA_HQ_READ_TOKEN`
- queries return redacted view models, not raw documents
- reads are bounded with `.take(n)` or pagination
- no HQ mutation changes product state
- the browser never receives `MEMVELLA_HQ_READ_TOKEN`

The internal Next app calls Convex from server-side helpers in `apps/internal/lib/hq-convex.ts`.

## Privacy And Redaction

HQ must not return or display raw sensitive product content:

- memories or stories
- People AI context
- voice transcripts
- assistant responses that may contain sensitive context
- Alert evidence transcripts
- Insight evidence transcripts
- session tokens or hashes
- invite or pairing hashes
- passkey credentials or public keys
- push auth values
- raw request bodies
- IP addresses
- secrets

Circle, senior profile, and review item names are hidden by default with generated labels such as `Circle #abc123`.

Waitlist email is personal data. HQ shows only redacted email strings for recent waitlist sanity checks.

## appEvents

`appEvents` is a minimal first-party observability table for sanitized internal signals.

Stored fields:

- `eventType`
- `sourceApp`
- `sourceRoute`
- `severity`
- `status`
- `messageCode`
- `createdAt`

It does not store arbitrary metadata, emails, names, transcripts, evidence, request bodies, IP addresses, tokens, hashes, or secrets.

The waitlist mutation records sanitized waitlist submission events without storing the email in `appEvents`.

## Static Foundations

Areas without live company systems use repo-backed TypeScript content:

- company priorities
- milestones
- readiness checklist
- risks
- research foundations
- accessibility principles
- growth channels
- automation roadmap
- runbooks

Static content must be honest. Do not represent placeholders as live metrics.

## QA And Production Safety

HQ v1 does not expose production reset, revoke, edit, delete, impersonation, or generation tools.

Test/dev status is visible on `/qa`, but existing test support remains guarded by `MEMVELLA_TEST_MODE=1` and the product test route protections.

## Verification

Before release, verify:

- HQ is inaccessible unless `MEMVELLA_HQ_ENABLED=1`
- founder login requires `MEMVELLA_HQ_ACCESS_KEY`
- the signed session cookie is HTTP-only and same-site
- `MEMVELLA_HQ_READ_TOKEN` is only read server-side
- Convex HQ queries reject missing or wrong tokens
- dashboards do not expose raw sensitive product content
- bounded counts are labelled honestly
- QA/dev actions stay disabled outside test/dev mode
- `pnpm lint`, `pnpm type-check`, `pnpm test`, and `pnpm build` pass or failures are documented
