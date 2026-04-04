# Product

Status: canonical
Scope: root
Last reviewed: 2026-04-04
Owners: product, engineering
Read when: touching onboarding, routing, UX, or documentation
Depends on: docs/terminology.md, docs/architecture.md

## Summary

Memvella is a voice-first digital wellness companion built around three connected experiences:

- a Supporter-facing mobile app for setup, routines, memories, and alerts
- an Assisted Senior tablet experience with paired device access
- an Independent Senior experience with passwordless access and voice-driven creation

The product is intended to reduce friction, preserve dignity, and keep family coordination lightweight.

## Applications

- `apps/core`: the product application and Convex backend
- `apps/marketing`: the marketing and waitlist application

## Core Experiences

### Supporter

- Primary device: phone
- Main jobs: create or manage a Circle, add routines, add memories, review insights, manage alerts, pair assisted devices
- Current auth: Better Auth email and password

### Assisted Senior

- Primary device: tablet
- Main jobs: use a paired device, see a time-anchored dashboard, interact through the assisted voice loop
- Current auth: 6-digit pairing flow that mints a device-bound senior session

### Independent Senior

- Primary device: phone or tablet
- Main jobs: sign in without a password, reopen with passkeys, create memories or routines through voice
- Current auth: email magic link bootstrap plus optional passkey enrollment

## Product Goals

- Keep senior-facing experiences low-friction and cognitively light.
- Keep Supporter workflows fast on mobile.
- Make voice the primary input for senior-side creation and recall.
- Anchor data and permissions around the Circle and senior profile, not around ad hoc client state.

## Non-Goals

- Memvella is not a medical device.
- Memvella should not depend on complex multi-step forms for senior-side creation.
- Memvella should not reintroduce new work on legacy caregiver-era structures when a FamilySpace-based path exists.

## Current Gaps

- There is no documented or implemented onboarding path for joining an existing Circle.
- Independent onboarding is currently email-based, even though product direction is moving toward SMS-only access.
- Better Auth origin handling is fragile when local testing happens on a different host than the configured app origin.
- The marketing waitlist form is not yet wired to a real backend destination.
