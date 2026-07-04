# Product

Status: canonical
Scope: root
Last reviewed: 2026-07-04
Owners: product, engineering
Read when: touching onboarding, routing, UX, permissions, or documentation
Depends on: docs/terminology.md, docs/architecture.md

## Summary

Memvella is a voice-first digital wellness companion built around three shipped experiences:

- an account and Workspace setup experience for the person starting support
- a Supporter invite experience for trusted people helping in that Workspace
- a companion tablet experience connected by a Supporter for the senior

The product is designed for home and family-led senior support: a Workspace holds routines, memories, People context, companion tablet access, and review workflows without turning Memvella into a medical product.

## Applications

- `apps/core`: the product application frontend
- `apps/backend-convex`: the Convex backend
- `apps/marketing`: the marketing and waitlist application

## Shipped Experience Model

### Workspace

`Workspace` is the shipped support-side area.

- A Workspace contains authenticated `circleMemberships` with internal role `organiser` or `member`.
- Product copy should refer to signed-in participants as Supporters.
- The person who creates the Workspace has owner capabilities for invite codes, companion tablet pairing, notifications, People, and routines.
- Supporters use the same `/circle` shell, but owner-only actions are capability-gated.
- Family-side routes may still use `/circle` internally, but visible copy should use `Workspace`.

### Workspace Owner

- Primary device: phone
- Main jobs: create a Workspace, manage account details, invite Supporters, connect companion tablets, manage notification settings, manage People, manage routines, manage memories, and review the combined alerts and insights queue
- Permission level: administrative
- Current owner-only surfaces: invite codes, companion tablet pairing, push notification settings, People creation, and routine management

### Supporter

- Primary device: phone
- Main jobs: join an existing Workspace with an invite code, contribute memories, review updates, and stay informed without taking over admin controls
- Permission level: lightweight but actionable
- Current Supporter access: the shared `/circle` shell, memory CRUD, routines visibility, People visibility, Supporter visibility, and account settings
- Current restrictions: no invite management, no pairing, no notification admin, no Workspace admin, no People mutation, and no owner-only capability surfaces

### Companion Tablet

- Primary device: tablet
- Main jobs: open a paired dashboard, use live voice, see memory rotation, and receive soft routine check-ins
- Permission level: senior-facing, low-friction surface only

## Shipped Product Surfaces

### Root Entry

- `/` is the role-selection entry point.
- It offers sign-up, login, and a quiet companion tablet connection link.

### Workspace Home

- `/circle` is the shared family-side home.
- It currently shows `Current Status`, quick actions, a Supporter insights card, and `Today's Updates` based on routine timeline data.
- It is the closest thing to a current status feed, but it is not a general activity history surface.

### Routines

- `/circle/routines` is the shipped routines view.
- Workspace owner capability gates routine creation and mutation.
- `/circle/add-routine` is the current add flow.

### Memories

- `/circle/memories` is the shared memory library.
- `/circle/add-memory` branches into `text`, `media`, `audio`, and `voice` creation flows.
- `/circle/memories/[memoryId]` and `/circle/memories/[memoryId]/edit` are the detail and edit flows.
- Workspace owners and Supporters both use the memory surface.

### Insights And Alerts

- `/circle/insights` is the shipped owner review queue.
- It combines queued `insights` and queued `alerts` into one owner-facing list.
- Reviewed items also appear there in a recent history section.

### Settings

- `/circle/settings` is the family-side settings hub.
- Shipped subroutes are:
- `/circle/settings/account`
- `/circle/settings/members`
- `/circle/settings/invite`
- `/circle/settings/notifications`
- `/circle/settings/pairing`

### People

- `People` are senior-grounding people the senior knows, not signed-in Supporters.
- `/circle/people` is the shipped People directory.
- `/circle/people/[personId]` and `/circle/people/[personId]/edit` are the detail and edit flows.
- `/circle/add-person` is the add flow.
- Workspace owners can create, edit, and delete People.
- Supporters can view People context but cannot create, edit, or delete People.

### Account Recovery

- `/organiser/verify-email` completes or resends account email verification.
- `/organiser/forgot-password` requests a password-reset email without revealing whether an account exists.
- `/organiser/reset-password` accepts a valid reset token and revokes existing account sessions after the password changes.

### Companion Tablet

- `/assisted/login` handles 6-digit pairing code entry.
- `/assisted` is the paired tablet dashboard with time, greeting, next routine, memory gallery, and live voice.

## Current Scope Notes

- `/circle` is the current Workspace status surface.
- Alerts and insights are reviewed together inside `/circle/insights`.
- Browser verification scope is documented in `docs/testing.md`.

## Product Rules

- New visible copy must treat `Workspace` as the shared support area.
- New visible copy must use `Supporter` for signed-in trusted people who help.
- New visible copy must separate Supporters from senior-grounding `People`.
- New work must not reintroduce retired `admin` or `FamilySpace` concepts.

## Product Goals

- Keep senior-facing experiences low-friction and cognitively light.
- Keep family-side workflows fast on mobile.
- Make voice the primary input for senior-side interaction, capture, and recall.
- Keep permissions anchored in explicit role boundaries.
- Keep senior-facing data anchored on the senior profile rather than on UI shells.

## Non-Goals

- Memvella is not a medical device.
- Memvella does not make diagnostic, treatment, or clinical claims.
- Memvella should not depend on complex multi-step senior-side forms.
- Memvella should not preserve retired route or schema concepts once a clean replacement exists.
