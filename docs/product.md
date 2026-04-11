# Product

Status: canonical
Scope: root
Last reviewed: 2026-04-11
Owners: product, engineering
Read when: touching onboarding, routing, UX, permissions, or documentation
Depends on: docs/terminology.md, docs/architecture.md

## Summary

Memvella is a voice-first digital wellness companion built around four launch-critical experiences:

- an `Organiser` experience for the person managing a Circle
- a `Member` experience for additional Circle participants helping to share the load
- a `Tablet User` experience for an assisted senior using a linked device
- an `Independent User` experience for a senior managing their own profile directly

The product must reduce friction, preserve dignity, and make it easier for families to stay coordinated without turning Memvella into a medical product.

## Applications

- `apps/core`: the product application and Convex backend
- `apps/marketing`: the marketing and waitlist application

## Experience Model

### Circle

`Circle` is the shared family-side workspace.

- A Circle contains one or more human participants.
- Each participant has a role of either `organiser` or `member`.
- A Circle can have multiple Organisers.
- Organisers and Members see the same core workspace, but permissions differ.

### Organiser

- Primary device: phone
- Main jobs: create or manage a Circle, manage settings, invite participants, pair assisted devices, manage people, manage routines, manage memories, review alerts, review insights, and keep the Circle coordinated
- Permission level: administrative

### Member

- Primary device: phone
- Main jobs: join an existing Circle, add and edit memories, stay informed, and help reduce the Organiser's burden without taking over administrative control
- Permission level: lightweight but actionable
- Expected permissions: full memory CRUD, view people, view routines, view activity, view insights
- Expected restrictions: no pairing, no invite management, no Circle admin, no urgent alert ownership

### Tablet User

- Primary device: tablet
- Main jobs: interact with Memvella through a low-friction dashboard and voice loop, see passive memory rotation, and receive routine prompts or upcoming reminders
- Permission level: senior-facing, zero-friction surface only

### Independent User

- Primary device: phone or tablet
- Main jobs: manage their own profile directly, use live voice as a trusted companion, and build up routines and memories without requiring a Circle
- Permission level: standalone senior experience

## Core Product Surfaces

### Circle Home

- `Current Status` is the quick-check surface for the Circle.
- It should summarize what matters now, without requiring the user to read a long feed.

### Activity

- The Circle should have an activity feed so participants stay in the loop.
- The feed should include meaningful actions, not every raw conversation.

### Alerts

- Alerts are urgent and actionable.
- They are organiser-directed by default.
- They should represent situations that need attention, not general product telemetry.

### Insights

- Insights are non-urgent summaries, trends, and useful follow-up context.
- They support peace of mind and ongoing awareness.

### Memories

- Memories are a shared family-side contribution surface.
- Members and Organisers should both be able to add, edit, and delete memories.

### People

- `People` are senior-grounding people used for memory context and companion grounding.
- These are not the same thing as Circle participants.

### Routines

- Routines should be complete, accessible, and lightweight.
- Organisers manage routines.
- Members can view routines but do not manage them.
- Routine history and completion tracking are part of the product, not optional extras.

## Product Rules

- New work must treat `Circle` as the family-side workspace.
- New work must keep `Organiser` and `Member` as the only family-side roles.
- New work must keep independent users standalone until an explicit transition into assisted or Circle-linked mode happens.
- New work must separate Circle participants from senior-grounding `People`.
- New work must distinguish `Alerts`, `Insights`, and `Activity` instead of collapsing them into one surface.

## Product Goals

- Keep senior-facing experiences low-friction and cognitively light.
- Keep Organiser and Member workflows fast on mobile.
- Make voice the primary input for senior-side interaction, capture, and recall.
- Anchor permissions in clear role boundaries.
- Anchor senior-facing data around the senior profile, not around accidental UI structure.
- Make Circle participants meaningfully useful without giving every participant administrative control.

## Non-Goals

- Memvella is not a medical device.
- Memvella should not make diagnostic, treatment, or clinical claims.
- Memvella should not depend on complex multi-step senior-side forms.
- Memvella should not preserve legacy route or schema concepts once a clean replacement exists.

## Implementation Note

The current codebase is still migrating toward this contract. Legacy names and legacy data paths may still exist in implementation, but they are not the target state and should be removed rather than extended.
