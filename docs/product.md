# Product

Status: canonical
Last reviewed: 2026-09-04

Memvella is a simple family app and voice-first companion tablet. Family and trusted Supporters share familiar memories and gentle routines for one older person.

## Everyday experience

- **Today** (`/circle`): today's routines, recent memories, and companion tablet access. Show an owner review notice only when there are queued updates.
- **Memories** (`/circle/memories`): a visual, searchable library. Add a story, photo, video, recording, or dictated memory through one editor at `/circle/add-memory`. Existing format-specific URLs use that same editor. Details, editing, and deletion remain available.
- **Routines** (`/circle/routines`): one clear schedule list. Owners add a name, time, repeat days, and optional helpful detail. Supporters can read routines.
- **Settings** (`/circle/settings`): companion tablet, familiar people, Supporters, account details, notifications, and review history. Invitations belong under Supporters.
- **Companion tablet** (`/assisted`): time and date, the next routine, one memory at a time, and a large Tap to talk control. No family navigation or account management. Photo/video memories stay fully in frame.

## Getting started

`/` offers Get started, Log in, an invite-code link, and a quiet tablet connection link.

Account creation at `/onboarding/organiser` is one form. Email verification, sign-in, and password recovery keep their existing security boundaries. Invitees preview a code at `/onboarding/member`, then create or sign into an account. Owners generate a tablet code in Settings; the tablet enters it at `/assisted/login`.

## Roles and personal content

The shared area remains a Workspace in permission and account copy; ordinary screens use direct language rather than repeatedly teaching that term. Internally it remains a `circle`.

- The owner manages routines, familiar people, invitations, tablet access, and notifications.
- Supporters contribute and edit memories, view routines and familiar people, and see account details.
- Familiar people are people the senior knows. Adding someone here does not give them account access.
- Existing personal content, memberships, and backend authorization remain intact.
- Generated example images are marketing/QA material; real accounts show their own content or empty states.

## Simplicity boundaries

- No internal HQ app or unused testing scaffold.
- No format-selection screen before adding a memory.
- No duplicate routine statistics or timeline on the routine list.
- No always-visible empty insights queue or technical transcript labels on Today.
- No duplicate tablet controls in Account.
- No automatic carousel movement on the senior screen.
- Due reminders stay visible on the tablet. Voice starts only when the person taps to talk, so an unavailable voice service cannot interrupt browsing.
- No new schema or data migration is required for this UI overhaul.

## Product limits

Memvella is a digital wellness companion, not a medical device. Do not make diagnostic, treatment, or clinical claims. Real email, live voice, push delivery, and production deployment require their configured services and separate live verification.
