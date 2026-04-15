# Core Design

Status: canonical
Scope: apps/core
Last reviewed: 2026-04-15
Owners: product, engineering
Read when: touching product UI, layouts, or interaction design in `apps/core`
Depends on: docs/product.md, docs/terminology.md, packages/ui/src/globals.css

## Core Principle

The product app should feel calm, legible, and operationally clear. Family-side surfaces can be denser than senior surfaces, but every experience should still feel deliberate and low-friction.

## Shared Rules

- Keep senior-facing interactions visually simple.
- Use solid, high-contrast interactive controls. Reserve gradients for non-interactive branding.
- Prefer `min-h-[100dvh]` over viewport assumptions that can hide important actions on mobile.
- Default to large touch targets. Senior-critical controls should be at least `72px` high and wide.
- Copy rules come from `docs/terminology.md`, not from ad hoc component wording.

## Design System

All visual tokens are centralized in `packages/ui/src/globals.css` via Tailwind CSS v4 `@theme`.
Do **not** re-introduce a `tailwind.config.ts` — the CSS-first approach is canonical.

### Source of Truth

| Layer | Location |
|-------|----------|
| Design tokens | `packages/ui/src/globals.css` |
| Components | `packages/ui/src/components/` |
| Barrel export | `@memvella/ui` |
| App overrides | `apps/core/app/globals.css` (imports shared theme) |

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-senior-primary` | `#185C60` | Senior pathway actions, "Mem" wordmark |
| `--color-senior-accent` | `#D4A574` | Warm accent for senior surfaces |
| `--color-family-primary` | `#2D3250` | Organiser/family actions, "vella" wordmark |
| `--color-family-accent` | `#1D4ED8` | Blue accent for family-side CTAs |
| `--color-canvas` | `#FAF9F6` | Page background (off-white) |
| `--color-surface-*` | various | Layered surface hierarchy |
| `--color-status-alert` | `#B91C1C` | Destructive actions |
| `--color-status-success` | `#15803D` | Confirmations |

### Typography

| Role | Font Family | CSS Variable | Usage |
|------|-------------|-------------|-------|
| Headline | Atkinson Hyperlegible | `--font-headline` | Headings, large text, senior-facing copy |
| Body | Figtree | `--font-body` | Body text, form labels, UI chrome |

Fonts are loaded via `next/font/google` in each app's `layout.tsx` and injected as CSS variables on `<html>`.

### Components

All shared UI components live in `@memvella/ui`. Import from the package, not from local paths.

```tsx
import { Button, PrimaryButton, TextInput, BrandLogo } from "@memvella/ui";
```

| Component | Variants | Notes |
|-----------|----------|-------|
| `Button` | default, secondary, ghost, destructive, senior, family, familyAccent, highContrast | CVA-based; supports `asChild` via Radix Slot |
| `PrimaryButton` | — | Legacy wrapper: `Button variant="default" size="senior"` with `href` support |
| `SecondaryButton` | — | Legacy wrapper: `Button variant="secondary" size="senior"` with `href` support |
| `HighContrastButton` | — | Legacy wrapper: `Button variant="highContrast" size="senior"` with `href` support |
| `Input` / `TextInput` | — | Accessible text input; `TextInput` is a migration alias |
| `BrandLogo` | `mono`, `animated` | Wordmark SVG; adapts to theme tokens via CSS custom properties |

> **Do not** create new components in `apps/core/components/ui/`. All shared primitives belong in `packages/ui/`.
> App-specific composites (e.g. `FormCard`, `ToastProvider`) may remain local until promoted.

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
