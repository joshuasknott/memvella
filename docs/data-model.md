# Data Model

Status: canonical
Scope: root
Last reviewed: 2026-04-11
Owners: engineering
Read when: touching schema, queries, mutations, migrations, onboarding, or role boundaries
Depends on: docs/architecture.md, docs/auth-and-identity.md

## Canonical Model

New work should be built on the `circle` model, not the retired `familySpace` model.

Primary entities:

- `circles`: top-level shared workspace for family-side coordination
- `circleMemberships`: authenticated human participants in a Circle, with role `organiser` or `member`
- `seniorProfiles`: canonical senior identity records for both assisted and independent experiences

## Canonical Table Families

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

### Awareness, Alerts, And Operations

- `activityEvents`
- `insights`
- `alerts`
- `notificationSettings`
- `pushSubscriptions`
- `notificationDeliveries`
- `rateLimitWindows`
- `voiceInteractions`
- `waitlistEntries`

## Entity Boundaries

### Circle Participants Versus People

- `circleMemberships` represent actual human participants in a Circle.
- `people` represent senior-grounding people used for memories and companion grounding.
- A `Person` is not automatically a Circle participant.
- A Circle participant is not automatically a `Person` in the senior's grounding data.

### Circle-Scoped Data

These tables should anchor on `circleId`:

- circles
- circle memberships
- invite codes
- Circle settings
- push subscriptions
- notification deliveries
- Circle activity visibility

### Senior-Scoped Data

These tables should anchor on `seniorProfileId`:

- people
- memory records and assets
- routine schedules and occurrences
- voice interactions
- insights
- alerts

Rules:

- Senior-facing data belongs to the senior profile first.
- Circle-facing visibility is derived from the senior's Circle relationship when one exists.
- Independent seniors remain valid without a Circle.

## Senior Mode Rules

- A `seniorProfile` may be assisted and linked to a Circle.
- A `seniorProfile` may be independent and exist without a Circle.
- An Independent User may later transition into assisted or Circle-linked mode.
- That transition must support either data migration or a clean start.

## Locale And Time Rules

- Circle-linked family-side experiences should use Circle-level default timezone and locale.
- Independent senior profiles should carry whatever effective timezone and locale they need until linked to a Circle.
- Do not introduce multiple competing locale layers unless there is a clear product need.

## Retired Surfaces

These are legacy and should be migrated away from rather than extended:

- `familySpaces`
- `familySpaceMemberships`
- `supporterProfiles`
- `familyMembers`
- `supporterInsights`
- legacy `memories`
- legacy `routines`
- `voiceLogs`
- any `supporter` or `admin` compatibility field that only exists for old naming

Rules:

- Do not add net-new product features to retired tables or fields.
- Use them only when explicitly doing migration or compatibility work.
- Remove them once canonical data has been migrated.

## Authoring Rules

- Prefer canonical tables when writing new queries or mutations.
- Prefer explicit indexes over broad scans.
- Document any breaking schema change before implementing it.
- Use a widen-migrate-narrow rollout when existing data must move.
- If removing a compatibility surface, pair the code change with a migration plan.

## Implementation Note

The current schema still contains legacy names and compatibility surfaces. This document defines the target model that future migrations should converge on.
