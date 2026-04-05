# Product

Status: canonical
Scope: root
Last reviewed: 2026-04-04
Owners: product, engineering
Read when: touching onboarding, routing, UX, or documentation
Depends on: docs/terminology.md, docs/architecture.md

## Summary

Memvella is a voice-first digital wellness companion built around four connected roles and experiences:

- an Organiser-facing mobile app for setup, routines, memories, alerts, and invitations
- a Member experience for family and friends who join an existing Circle
- a Tablet User experience for assisted seniors using a linked device
- an Independent User experience for seniors managing their own profile directly

The product is intended to reduce friction, preserve dignity, and keep family coordination lightweight.

## Applications

- `apps/core`: the product application and Convex backend
- `apps/marketing`: the marketing and waitlist application

## Core Experiences

### Organiser

- Primary device: phone
- Main jobs: create or manage a Circle, add routines, add memories, review insights, manage alerts, pair assisted devices
- Current auth: Better Auth email and password

### Member

- Primary device: phone
- Main jobs: join an existing Circle, help with routines and memories, stay connected
- Current auth: Better Auth email and password, followed by a 6-digit Circle invite code

### Tablet User

- Primary device: tablet
- Main jobs: use a paired device, see a time-anchored dashboard, interact through the assisted voice loop
- Current auth: 6-digit pairing flow that mints a device-bound senior session

### Independent User

- Primary device: phone or tablet
- Main jobs: sign in without a password, reopen with passkeys, create memories or routines through voice
- Current auth: SMS code bootstrap plus optional passkey enrollment on the same device

## Product Goals

- Keep senior-facing experiences low-friction and cognitively light.
- Keep Organiser and Member workflows fast on mobile.
- Make voice the primary input for senior-side creation and recall.
- Anchor data and permissions around the Circle and senior profile, not around ad hoc client state.

## Non-Goals

- Memvella is not a medical device.
- Memvella should not depend on complex multi-step forms for senior-side creation.
- Memvella should not reintroduce new work on legacy caregiver-era structures when a FamilySpace-based path exists.

## Current Gaps

- Legacy `supporter` names still exist in some backend modules, tables, and compatibility paths.
- The family-side product surface is now shared through the Circle workspace, but some organiser-era naming remains in implementation details.
- Legacy compatibility tables still exist in the backend while FamilySpace-based data continues to replace them.
