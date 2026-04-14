# Data Model

Status: canonical
Scope: root
Last reviewed: 2026-04-14
Owners: engineering
Read when: touching schema, queries, mutations, migrations, onboarding, or role boundaries
Depends on: docs/architecture.md, docs/auth-and-identity.md

## Canonical Model

New work should be built on the `circle` model, not the retired `familySpace` model.

Primary entities:

- `circles`: top-level shared workspace for family-side coordination
- `circleMemberships`: authenticated human participants in a Circle, with role `organiser` or `member`
- `seniorProfiles`: canonical senior identity records for both assisted and independent experiences

## Current Table Families

### Identity And Access

- `circles`
- `circleMemberships`
- `circleInviteCodes`
- `seniorProfiles`
- `assistedDevicePins`
- `independentOnboardingSessions`
- `seniorAccessSessions`
- `independentSeniorPasskeys`
- `independentSeniorRecoveryCodes`
- `seniorAuthChallenges`

### Senior Grounding And Memories

- `people`
- `memoryRecords`
- `memoryAssets`

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

Current omission:

- there is no shipped `activityEvents` table yet

## Key Invariants

### Circles And Memberships

- `circleMemberships.role` is `organiser` or `member` only.
- `circleMemberships` are keyed to Better Auth identities through `authIdentityToken`.
- `circleMemberships.seniorProfileId` can point at the senior profile most relevant to that participant.

### Senior Profiles

- `seniorProfiles.seniorMode` is `assisted` or `independent`.
- `seniorProfiles.circleId` may be `null` for standalone independent seniors.
- `seniorProfiles.accessStatus` tracks whether access is pending, active, recovery-required, or revoked.

### Invite And Session Records

- `circleInviteCodes.role` is always `member`.
- `seniorAccessSessions.sessionType` is `assisted_device` or `independent_web`.
- `assistedDevicePins` and `circleInviteCodes` both store hashes rather than plaintext secrets.

### Memory Records

- `memoryRecords.recordType` is `text`, `media`, `audio`, or `voice`.
- `memoryAssets.assetType` is `image`, `video`, or `audio`.
- Memory content belongs to the senior profile first and records the creating or updating Circle membership when relevant.

### Routine Records

- `routineSchedules` hold the durable schedule definition.
- `routineOccurrences` hold dated scheduled instances.
- `routineCheckIns` hold assisted live routine prompt state and outcomes.

### Awareness And Notifications

- `insights` and `alerts` are separate tables.
- Both tables use `status` of `queued`, `reviewed`, or `dismissed`.
- `notificationSettings` are Circle-scoped.
- `notificationDeliveries.notificationType` is `routine_reminder`, `urgent_alert`, or `daily_summary`.

## Entity Boundaries

### Circle Participants Versus People

- `circleMemberships` represent actual authenticated participants in a Circle.
- `people` represent senior-grounding people used for memories and companion grounding.
- A `Person` is not automatically a Circle participant.
- A Circle participant is not automatically a `Person` in the senior's grounding data.

### Circle-Scoped Data

These tables anchor on `circleId`:

- `circles`
- `circleMemberships`
- `circleInviteCodes`
- `notificationSettings`
- `pushSubscriptions`
- `notificationDeliveries`

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
- Circle-facing visibility is derived from the senior's Circle relationship when one exists.
- Independent seniors remain valid without a Circle.

## Locale And Time Rules

- Circle-linked family-side experiences use Circle-level timezone and locale defaults where available.
- Independent senior profiles can carry their own timezone and locale until linked to a Circle.
- Do not introduce competing locale layers without a concrete product need.

## Remaining Legacy Surfaces

These still exist in the schema and should not receive net-new product work:

- legacy `routines`
- legacy `memories`

Current facts about those legacy tables:

- they remain transitional compatibility tables in `apps/core/convex/schema.ts`
- they still use `familySpaceId` index naming
- the active product surfaces use `routineSchedules`, `routineOccurrences`, `routineCheckIns`, `memoryRecords`, and `memoryAssets` instead

## Authoring Rules

- Prefer canonical tables when writing new queries or mutations.
- Prefer explicit indexes over broad scans.
- Document any breaking schema change before implementing it.
- Use a widen-migrate-narrow rollout when existing data must move.
- If removing a remaining compatibility surface, pair the code change with an update to `docs/legacy-removal.md`.
