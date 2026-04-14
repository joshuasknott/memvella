# Core Design

Status: canonical
Scope: apps/core
Last reviewed: 2026-04-14
Owners: product, engineering
Read when: touching product UI, layouts, or interaction design in `apps/core`
Depends on: docs/product.md, docs/terminology.md

## Core Principle

The product app should feel calm, legible, and operationally clear. Family-side surfaces can be denser than senior surfaces, but every experience should still feel deliberate and low-friction.

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

## Circle Experience

Target user:

- phone-first
- high context, low patience
- wants speed, clear status, and reversible actions

Current shell facts:

- `/circle` uses a fixed top header and fixed bottom navigation
- top-level nav items are `Home`, `Routines`, `Memories`, and `Settings`
- `Insights` is reached from the home screen, not from the bottom nav
- `People` is currently reached through the `Add Person` action, not through a dedicated tab or directory
- there is no shipped `Activity` or `Alerts` tab

Rules:

- Mobile layouts should feel app-like rather than stretched desktop pages.
- Put setup context before credential entry during onboarding.
- Dense cards and lists are acceptable if hierarchy is clear.
- Destructive actions must be explicit and easy to back out of.
- Do not imply a full People management surface where only add-person exists.
- Do not imply separate alerts and insights destinations when the current UI uses one combined organiser queue.

## Root Onboarding Entry Screen

The root welcome screen is the highest-priority terminology and hierarchy checkpoint in `apps/core`.

Required structure:

- Heading: `Welcome to Memvella.`
- Subheading: `How would you like to begin?`
- Primary action group using solid purple buttons:
- `Start a New Circle`
- `Join a Circle`
- Visual separation between primary and secondary actions through spacing or a subtle divider
- Secondary action group using lighter treatment:
- `Connect a Tablet`
- `Set Up My Own Profile`

Do not reintroduce `Admin`, `Connection Code`, or `Personal Profile` labels on this screen.

## Tablet User Experience

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

## Independent User Experience

Target user:

- phone or tablet
- should be autonomous without being overloaded
- should be able to create through conversation instead of complex forms

Rules:

- Keep the experience passwordless.
- Use a device passkey as the primary auth method.
- Copy should work for face, fingerprint, or device screen lock without Apple-only wording.
- Offer recovery codes clearly after passkey setup and inside security or recovery flows.
- Voice should remain the preferred creation path for memories and routines.
- AI-extracted actions must present explicit confirmation and rejection states.

## Shipping Checklist

- Is the screen usable within `100dvh` on mobile?
- Are important senior touch targets at least `72px`?
- Are primary and secondary actions visually distinct?
- Does the copy follow `docs/terminology.md`?
- If auth copy changed, was `docs/auth-and-identity.md` updated too?
