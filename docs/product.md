# Product

Status: canonical
Scope: root
Last reviewed: 2026-04-14
Owners: product, engineering
Read when: touching onboarding, routing, UX, permissions, or documentation
Depends on: docs/terminology.md, docs/architecture.md

## Summary

Memvella is a voice-first digital wellness companion built around four shipped experiences:

- an `Organiser` experience for the person managing a Circle
- a `Member` experience for additional Circle participants helping inside that same Circle
- a `Tablet User` experience for an assisted senior using a paired device
- an `Independent User` experience for a senior managing their own profile directly

The product is designed to reduce friction, preserve dignity, and keep family-side coordination lightweight without turning Memvella into a medical product.

## Applications

- `apps/core`: the product application and Convex backend
- `apps/marketing`: the marketing and waitlist application

## Shipped Experience Model

### Circle

`Circle` is the shipped family-side workspace.

- A Circle contains authenticated `circleMemberships` with role `organiser` or `member`.
- A Circle can have multiple Organisers.
- Organisers and Members use the same `/circle` shell, but organiser-only actions are capability-gated.
- Family-side routes and copy should use `Circle`, not `FamilySpace`, `supporter`, or `admin` terminology.

### Organiser

- Primary device: phone
- Main jobs: create a Circle, manage account details, invite members, pair tablets, manage notification settings, add people, manage routines, manage memories, and review the combined alerts and insights queue
- Permission level: administrative
- Current organiser-only surfaces: invite codes, tablet pairing, push notification settings, people creation, routine management, and independent recovery help from account settings when relevant

### Member

- Primary device: phone
- Main jobs: join an existing Circle with an invite code, contribute memories, review Circle updates, and stay informed without taking over admin controls
- Permission level: lightweight but actionable
- Current member access: the shared `/circle` shell, memory CRUD, routines visibility, Circle members visibility, and account settings
- Current restrictions: no invite management, no pairing, no notification admin, no Circle admin, and no organiser-only capability surfaces

### Tablet User

- Primary device: tablet
- Main jobs: open a paired dashboard, use live voice, see memory rotation, and receive soft routine check-ins
- Permission level: senior-facing, low-friction surface only

### Independent User

- Primary device: phone or tablet
- Main jobs: complete passkey-first onboarding, use live voice, save memories and routines through conversation, manage trusted devices, and recover with recovery codes
- Permission level: standalone senior experience

## Shipped Product Surfaces

### Root Entry

- `/` is the role-selection entry point.
- It offers `Start a New Circle`, `Join a Circle`, `Connect a Tablet`, and `Set Up My Own Profile`.

### Circle Home

- `/circle` is the shared family-side home.
- It currently shows `Current Status`, quick actions, an organiser insights card, and `Today's Updates` based on routine timeline data.
- It is the closest thing to a current status feed, but it is not a general activity history surface.

### Routines

- `/circle/routines` is the shipped routines view.
- Organiser capability gates routine creation and mutation.
- `/circle/add-routine` is the current add flow.

### Memories

- `/circle/memories` is the shared memory library.
- `/circle/add-memory` branches into `text`, `media`, `audio`, and `voice` creation flows.
- `/circle/memories/[memoryId]` and `/circle/memories/[memoryId]/edit` are the detail and edit flows.
- Organisers and Members both use the memory surface.

### Insights And Alerts

- `/circle/insights` is the shipped organiser review queue.
- It combines queued `insights` and queued `alerts` into one organiser-facing list.
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

- `People` are senior-grounding people, not Circle participants.
- The shipped People UI is currently limited to `/circle/add-person`.
- There is not yet a dedicated People index, edit flow, or delete flow in the family-side UI.

### Tablet User

- `/assisted/login` handles 6-digit pairing code entry.
- `/assisted` is the paired tablet dashboard with time, greeting, next routine, memory gallery, and live voice.

### Independent User

- `/onboarding/independent` is the passkey-first setup flow.
- `/independent` is the independent home surface.
- `/independent/security` manages trusted devices and recovery codes.
- `/independent/recover` handles recovery-code sign-in and passkey reset.

## Explicit Deferred Work

- There is no dedicated `Activity` route or activity feed surface yet.
- There is no separate `Alerts` page yet.
- The People surface is still limited.
- End-to-end browser coverage now exists for the first deterministic organiser/member/routine/voice smoke flows; see `docs/testing.md` for scope and remaining gaps.

## Product Rules

- New work must treat `Circle` as the family-side workspace.
- New work must keep `Organiser` and `Member` as the only family-side roles.
- New work must keep independent users standalone until an explicit transition flow is intentionally built.
- New work must separate Circle participants from senior-grounding `People`.
- New work must not reintroduce retired `supporter`, `admin`, or `FamilySpace` concepts.

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
