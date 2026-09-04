# Data Model

Status: canonical
Scope: root
Last reviewed: 2026-04-14
Owners: engineering
Read when: touching schema, queries, mutations, migrations, onboarding, or role boundaries
Depends on: docs/architecture.md, docs/auth-and-identity.md

## Canonical Model

New work should be built on the internal `circle` model, not the retired `familySpace` model. User-facing product copy calls a circle a Workspace.

Primary entities:

- `circles`: top-level shared Workspace for supporter coordination
- `circleMemberships`: authenticated human participants in a Workspace, with internal role `organiser` or `member`
- `seniorProfiles`: canonical senior identity records for Workspace-linked companion tablet experiences

## Current Table Families

### Identity And Access

- `circles`
- `circleMemberships`
- `circleInviteCodes`
- `seniorProfiles`
- `assistedDevicePins`
- `seniorAccessSessions`

### Senior Grounding And Memories

- `people`
- `memoryRecords`
- `memoryAssets`
- `uploadIntents`

### Routines And Scheduling

- `routineSchedules`
- `routineOccurrences`
- `routineCheckIns`

### Awareness And Operations

- `insights`
- `alerts`
- `notificationSettings`
- `pushSubscriptions`
- `notificationDeliveries`
- `rateLimitWindows`
- `voiceInteractions`
- `waitlistEntries`
- `appEvents`

Current omission:

- there is no shipped `activityEvents` table yet
- `appEvents` stores sanitized internal observability signals only and is not a user activity feed

## Key Invariants

### Workspaces And Memberships

- `circleMemberships.role` is `organiser` or `member` only.
- `circleMemberships` are keyed to Better Auth identities through `authIdentityToken`.
- `circleMemberships.seniorProfileId` can point at the senior profile most relevant to that participant.

### Senior Profiles

- `seniorProfiles.seniorMode` is `assisted`.
- `seniorProfiles.circleId` points to the Workspace that manages the senior profile.
- `seniorProfiles.accessStatus` tracks whether access is pending, active, recovery-required, or revoked.

### Invite And Session Records

- `circleInviteCodes.role` is always `member`.
- `seniorAccessSessions.sessionType` is `assisted_device`.
- `assistedDevicePins` and `circleInviteCodes` both store hashes rather than plaintext secrets.

### Memory Records

- `memoryRecords.recordType` is `text`, `media`, `audio`, or `voice`.
- `memoryAssets.assetType` is `image`, `video`, or `audio`.
- Memory content belongs to the senior profile first and records the creating or updating Workspace membership when relevant.

### Routine Records

- `routineSchedules` hold the durable schedule definition.
- `routineOccurrences` hold dated scheduled instances.
- `routineCheckIns` hold assisted live routine prompt state and outcomes.

### Awareness And Notifications

- `insights` and `alerts` are separate tables.
- Both tables use `status` of `queued`, `reviewed`, or `dismissed`.
- `notificationSettings` are Workspace-scoped.
- `notificationDeliveries.notificationType` is `routine_reminder`, `urgent_alert`, or `daily_summary`.

## Entity Boundaries

### Supporters Versus People

- `circleMemberships` represent actual authenticated Supporters in a Workspace.
- `people` represent people the senior knows, used for memories and companion grounding.
- A `Person` is not automatically a Supporter.
- A Supporter is not automatically a `Person` in the senior's grounding data.

### Workspace-Scoped Data

These tables anchor on `circleId`:

- `circles`
- `circleMemberships`
- `circleInviteCodes`
- `notificationSettings`
- `pushSubscriptions`
- `notificationDeliveries`

### Internal Observability Data

`appEvents` stores sanitized first-party operational signals for service observability.

Allowed fields:

- `eventType`
- `sourceApp`
- `sourceRoute`
- `severity`
- `status`
- `messageCode`
- `createdAt`

Rules:

- Do not store emails, names, IP addresses, request bodies, transcripts, evidence, tokens, hashes, secrets, or arbitrary metadata.
- Use `appEvents` for sanitized internal signals such as waitlist submission metadata, not for product user content.
- Do not treat `appEvents` as a replacement for a future product `activityEvents` table.

### Senior-Scoped Data

These tables anchor on `seniorProfileId`:

- `people`
- `memoryRecords`
- `memoryAssets`
- `routineSchedules`
- `routineOccurrences`
- `routineCheckIns`
- `voiceInteractions`
- `insights`
- `alerts`

Rules:

- Senior-facing data belongs to the senior profile first.
- Workspace-facing visibility is derived from the senior's Workspace relationship when one exists.
- Senior profiles are Workspace-linked in the simplified family-led care product.

## Locale And Time Rules

- Workspace-linked experiences use Workspace-level timezone and locale defaults where available.
- Do not introduce competing locale layers without a concrete product need.

## Remaining Legacy Surfaces

These still exist and should not receive net-new product work:

(None remaining. All legacy compatibility tables have been removed.)

## Authoring Rules

- Prefer canonical tables when writing new queries or mutations.
- Prefer explicit indexes over broad scans.
- Document any breaking schema change before implementing it.
- Use a widen-migrate-narrow rollout when existing data must move.
- If removing a remaining compatibility surface, pair the code change with an update to `docs/legacy-removal.md`.
