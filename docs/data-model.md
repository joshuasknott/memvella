# Data Model

Status: canonical
Scope: root
Last reviewed: 2026-04-06
Owners: engineering
Read when: touching schema, queries, mutations, migrations, or onboarding
Depends on: docs/architecture.md, docs/auth-and-identity.md

## Canonical Model

New work should be built on the FamilySpace-based model.

Primary entities:

- `familySpaces`: top-level shared space for routines, memories, alerts, and voice context
- `familySpaceMemberships`: auth-linked participants and roles, including `organiser`, `member`, and `independent_senior`
- `seniorProfiles`: mode-neutral senior identity, mode, locale, and access state

## Canonical Tables

### Identity And Access

- `familySpaces`
- `familySpaceMemberships`
- `seniorProfiles`
- `assistedDevicePins`
- `independentSeniorCredentials`
- `independentOnboardingSessions`
- `seniorAccessSessions`
- `independentSeniorPasskeys`
- `independentSeniorRecoveryCodes`
- `seniorAuthChallenges`

### Routines And Scheduling

- `routineSchedules`
- `routineOccurrences`
- `routineRetreatCheckIns`

### Memories And Assets

- `memoryRecords`
- `memoryAssets`

### Notifications, AI, And Operational State

- `notificationSettings`
- `pushSubscriptions`
- `notificationDeliveries`
- `rateLimitWindows`
- `voiceInteractions`
- `supporterInsights`
- `waitlistEntries`

## Legacy Compatibility Surfaces

These are still present in the schema and must be treated as transitional:

- `familySpaces.primarySupporterAuthUserId`
- `supporterProfiles`
- `assistedDevices`
- `familyMembers`
- `routines`
- `memories`
- `voiceLogs`

Rules:

- Do not add net-new product features to these compatibility tables.
- Use them only when explicitly doing migration or compatibility work.
- If a feature still reads legacy tables, document that dependency before changing the schema contract.

## Relationship Rules

- `familySpaceId` is the top-level partition key for most product data.
- `familySpaceMemberships` connects authenticated users to a Circle and role.
- `seniorProfiles` model the actual Tablet User or Independent User identity inside the Circle.
- `independentOnboardingSessions` store short-lived setup state before the first Independent User passkey is created.
- `independentSeniorCredentials` now remain a transitional compatibility surface for older phone-based independent rows.
- `independentSeniorPasskeys` store trusted device passkeys for independent sign-in.
- `independentSeniorRecoveryCodes` store hashed one-time recovery codes for independent recovery.
- Senior access sessions are device-bound and separate from Better Auth sessions.

## Authoring Rules

- Prefer canonical tables when writing new queries or mutations.
- Prefer explicit indexes over broad scans.
- Document any breaking schema change before implementing it.
- If removing a compatibility surface, pair the code change with a migration plan.
