# Core Design

Status: canonical
Scope: apps/core
Last reviewed: 2026-04-04
Owners: product, engineering
Read when: touching product UI, layouts, or interaction design in `apps/core`
Depends on: docs/product.md, docs/terminology.md

## Core Principle

The product app should feel calm, legible, and operationally clear. Supporter surfaces may be denser than senior surfaces, but every experience should still feel deliberate and low-friction.

## Shared Rules

- Keep senior-facing interactions visually simple.
- Use solid, high-contrast interactive controls. Reserve gradients for non-interactive branding.
- Prefer `min-h-[100dvh]` over viewport assumptions that can hide important actions on mobile.
- Default to large touch targets. Senior-critical controls should be at least `72px` high and wide.
- Copy rules come from `docs/terminology.md`, not from ad hoc component wording.

## Visual Tokens

- Background: soft off-white and muted surface layers
- Primary action: deep purple
- Secondary action: strong blue when a distinct secondary control is needed
- Typography: highly legible sans-serif with generous line height

## Supporter Experience

Target user:

- phone-first
- high context, low patience
- wants speed, clear status, and reversible actions

Rules:

- Mobile layouts should feel app-like rather than stretched desktop pages.
- Put setup context before credential entry during onboarding.
- Dense cards and lists are acceptable if hierarchy is clear.
- Destructive actions must be explicit and easy to back out of.

## Assisted Senior Experience

Target user:

- tablet-first
- low tolerance for clutter or hidden state
- should never have to manage an account or type freely

Rules:

- Keep one primary action visible at a time.
- Avoid hidden navigation and avoid choice-heavy screens.
- Keep time, date, and name visible enough to act as orientation anchors.
- The main voice action must have distinct idle, listening, processing, and speaking states.
- Do not rely on native keyboard entry except for the constrained pairing flow.

## Independent Senior Experience

Target user:

- phone or tablet
- should be autonomous without being overloaded
- should be able to create through conversation instead of complex forms

Rules:

- Keep the experience passwordless.
- Current implementation uses an email magic link bootstrap plus optional passkey enrollment.
- Product direction is moving toward SMS-only access, so auth-related UI changes must also update `docs/auth-and-identity.md`.
- Voice should remain the preferred creation path for memories and routines.
- AI-extracted actions must present explicit confirmation and rejection states.

## Shipping Checklist

- Is the screen usable within `100dvh` on mobile?
- Are important senior touch targets at least `72px`?
- Are primary and secondary actions visually distinct?
- Does the copy follow `docs/terminology.md`?
- If auth copy changed, was `docs/auth-and-identity.md` updated too?
