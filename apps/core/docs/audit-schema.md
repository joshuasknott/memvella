# Memvella Schema Audit

This document provides a detailed breakdown of the existing Convex schema for the Memvella application. It defines the tables, fields, and relationships that power the "Dual-Graph RAG Architecture," separating factual "Truth" from subjective "Memories."

---

## 1. Existing Tables

| Table Name | Description |
| :--- | :--- |
| **`caregiverProfiles`** | Application-level profile data for caregivers, keyed to auth identity. |
| **`kioskDevices`** | Tablet PIN pairing sessions for seniors (Custom Auth). |
| **`familyMembers`** | Part of the *Truth Graph*; contains factual data about relatives/friends. |
| **`routines`** | Part of the *Truth Graph*; contains structured daily schedules. |
| **`memories`** | Part of the *Conversational Graph*; contains subjective stories and media. |
| **`notificationSettings`** | Per-caregiver preferences for summary, urgent, and routine alerts. |
| **`voiceLogs`** | Transcripts and metadata from "Tap-to-Talk" senior kiosk sessions. |

---

## 2. Detailed Field Definitions

### `caregiverProfiles`
Stores metadata for the primary user of the caregiver dashboard.

| Field | Type | Required? | Notes |
| :--- | :--- | :--- | :--- |
| `authUserId` | `v.string()` | **Yes** | Stable identity key from `ctx.auth.getUserIdentity()` |
| `caregiverName` | `v.string()` | **Yes** | Display name of the caregiver. |
| `lovedOneName` | `v.string()` | **Yes** | Name of the person being cared for. |
| `role` | `v.union("caregiver", "senior")` | **Yes** | Internal access level. |

---

### `kioskDevices`
Manages the pairing of physical tablets to a caregiver's account via PIN.

| Field | Type | Required? | Notes |
| :--- | :--- | :--- | :--- |
| `caregiverId` | `v.string()` | **Yes** | TokenIdentifier of the owner caregiver. |
| `pinCode` | `v.string()` | **Yes** | 6-digit alphanumeric pairing code. |
| `isActive` | `v.boolean()` | **Yes** | Pairing status. |
| `seniorName` | `v.string()` | **Yes** | The senior's name as displayed on the tablet. |
| `lastActiveAt` | `v.number()` | *Optional* | Heartbeat timestamp for connectivity monitoring. |

---

### `familyMembers` (Truth Graph)
Factual directory of important people in the senior's life.

| Field | Type | Required? | Notes |
| :--- | :--- | :--- | :--- |
| `caregiverId` | `v.string()` | **Yes** | Link to caregiver. |
| `name` | `v.string()` | **Yes** | Name of the family member. |
| `relationship` | `v.string()` | **Yes** | Relation (e.g., "Son", "Grandchild"). |
| `isLiving` | `v.boolean()` | **Yes** | **Critical Safety Flag.** Prevents AI hallucinations about deceased relatives. |
| `aiContext` | `v.string()` | **Yes** | Contextual notes for the AI (e.g., "Loves gardening"). |
| `photoStorageId` | `v.id("_storage")` | *Optional* | Reference to profile picture file. |

---

### `routines` (Truth Graph)
Structured daily events used as temporal anchors for the AI.

| Field | Type | Required? | Notes |
| :--- | :--- | :--- | :--- |
| `caregiverId` | `v.string()` | **Yes** | Link to caregiver. |
| `routineName` | `v.string()` | **Yes** | Name of the task (e.g., "Morning Tea"). |
| `time` | `v.string()` | **Yes** | Scheduled time (e.g., "10:00 AM"). |
| `frequency` | `v.array(v.string())` | **Yes** | Days or recurrence pattern (e.g., ["Daily"]). |
| `aiInstructions` | `v.string()` | **Yes** | Specific prompts for AI interaction behavior. |

---

### `memories` (Conversational Graph)
Subjective, emotional content like stories and songs.

| Field | Type | Required? | Notes |
| :--- | :--- | :--- | :--- |
| `caregiverId` | `v.string()` | **Yes** | Link to caregiver. |
| `title` | `v.string()` | **Yes** | Memory title. |
| `date` | `v.string()` | **Yes** | Descriptive date string (e.g., "Spring 2019"). |
| `story` | `v.string()` | **Yes** | Narrative text / description. |
| `mediaType` | `v.union("text", "audio", "voice", "media")` | **Yes** | Type classification for UI/AI processing. |
| `storageId` | `v.id("_storage")` | *Optional* | File reference (photo/audio/video). |
| `songLink` | `v.string()` | *Optional* | External song URL (Spotify, etc.). |

---

### `notificationSettings`
Personalized alert preferences.

| Field | Type | Required? | Notes |
| :--- | :--- | :--- | :--- |
| `caregiverId` | `v.string()` | **Yes** | Link to caregiver. |
| `dailySummary` | `v.boolean()` | **Yes** | Boolean toggle for evening wraps. |
| `urgentAlerts` | `v.boolean()` | **Yes** | Boolean toggle for emergency fallbacks. |
| `routineReminders`| `v.boolean()` | **Yes** | Boolean toggle for routine pings. |

---

### `voiceLogs`
Exact records of senior digital interactions.

| Field | Type | Required? | Notes |
| :--- | :--- | :--- | :--- |
| `caregiverId` | `v.string()` | **Yes** | Link to caregiver. |
| `seniorName` | `v.string()` | **Yes** | Context identifier. |
| `transcript` | `v.string()` | **Yes** | Exact captured voice-to-text string. |
| `durationSeconds`| `v.number()` | **Yes** | Session length. |

---

## 3. Relationship Map

The architecture primarily uses an **unbalanced star schema** centered on the `caregiverId` (equivalent to `authUserId` in `caregiverProfiles`).

- **Implicit Join**: All application tables (`familyMembers`, `routines`, `memories`, `notificationSettings`, `voiceLogs`, `kioskDevices`) are shard-filtered by the caregiver's `tokenIdentifier`.
- **Identity Bridge**: `caregiverProfiles` bridges the Better Auth identity (`authUserId`) to application-level naming conventions used in UI components.
- **Storage Links**: `familyMembers` and `memories` optionally link to the Convex internal `_storage` table via `photoStorageId` and `storageId`.

---

## 4. Blockers for Progressive Onboarding

The following fields are currently marked as **Required** (`v.string()`) in the `caregiverProfiles` table. These create hard errors if an onboarding flow attempts to save a partial user record before the full questionnaire is completed:

| Table | Blocker Field | Current Restriction | Impacts |
| :--- | :--- | :--- | :--- |
| `caregiverProfiles` | `caregiverName` | `v.string()` | Cannot create profile from just auth; requires explicit input. |
| `caregiverProfiles` | `lovedOneName` | `v.string()` | Prevents finishing step 1 if this isn't provided. |
| `caregiverProfiles` | `role` | `v.union(...)` | Cannot default to a base state; must be chosen explicitly. |

**Implication for UI development**: Implementing a "Save and Exit" or "Finish Later" feature on the onboarding screen will fail at the database layer unless these fields are converted to `v.optional()` or provided with placeholder defaults during initial creation.
