# Memvella Mutation & Argument Audit

This document audits all Convex mutations responsible for writing data to user profiles, family directories, and associated application state. 

---

## 1. Profile & Identity Mutations

These mutations manage the core identity mapping between Better Auth and the Memvella application layer.

| Mutation Name | File Path | Arguments (Convex Validators) | Table Affected |
| :--- | :--- | :--- | :--- |
| **`createCaregiverProfile`** | `convex/caregiver.ts` | `lovedOneName: v.string()` | `caregiverProfiles` |
| **`updateNotificationSettings`** | `convex/caregiver.ts` | `dailySummary: v.boolean()`, `urgentAlerts: v.boolean()`, `routineReminders: v.boolean()` | `notificationSettings` |

---

## 2. Family & Content Mutations

These mutations power the "Truth Graph" (factual safety data) and the "Conversational Graph" (subjective memories).

| Mutation Name | File Path | Arguments (Convex Validators) | Table Affected |
| :--- | :--- | :--- | :--- |
| **`addFamilyMember`** | `convex/caregiver.ts` | `name: v.string()`, `relationship: v.string()`, `isLiving: v.boolean()`, `aiContext: v.string()`, `photoStorageId?: v.id("_storage")` | `familyMembers` |
| **`addRoutine`** | `convex/caregiver.ts` | `routineName: v.string()`, `time: v.string()`, `frequency: v.array(v.string())`, `aiInstructions: v.string()` | `routines` |
| **`addMemoryText`** | `convex/memories.ts` | `title: v.string()`, `date: v.string()`, `story: v.string()`, `photoStorageId?: v.id("_storage")` | `memories` |
| **`addMemoryAudio`** | `convex/memories.ts` | `title: v.string()`, `date: v.string()`, `story: v.string()`, `songLink?: v.string()`, `mediaStorageId?: v.id("_storage")` | `memories` |
| **`addMemoryVoice`** | `convex/memories.ts` | `title: v.string()`, `date: v.string()`, `transcript: v.string()` | `memories` |
| **`addMemoryMedia`** | `convex/memories.ts` | `title: v.string()`, `date: v.string()`, `story: v.string()`, `mediaStorageId: v.id("_storage")` | `memories` |

---

## 3. Session & Logging Mutations

| Mutation Name | File Path | Arguments (Convex Validators) | Table Affected |
| :--- | :--- | :--- | :--- |
| **`saveVoiceSessionLog`** | `convex/caregiver.ts` | `seniorName: v.string()`, `transcript: v.string()`, `durationSeconds: v.number()` | `voiceLogs` |
| **`logVoiceSession`** (Internal) | `convex/voiceHelpers.ts` | `caregiverId: v.string()`, `seniorName: v.string()`, `transcript: v.string()`, `durationSeconds: v.number()` | `voiceLogs` |
| **`generateKioskPin`** | `convex/kiosk.ts` | `seniorName: v.string()` | `kioskDevices` |
| **`pairTabletSession`** | `convex/kiosk.ts` | `pinCode: v.string()` | `kioskDevices` (patch) |

---

## 4. Profile Creation Enforcement Audit

### Analysis of `createCaregiverProfile`
The current implementation of `createCaregiverProfile` acts as the primary profile initialization logic. However, it enforces a **fragmented creation lifecycle** rather than a "complete-in-one-step" profile:

1.  **Required Arguments**: It only accepts `lovedOneName`.
2.  **Hardcoded Defaults**: It explicitly sets `caregiverName: ""` (empty string) in the database.
3.  **Schema Conflict**: While the schema (`convex/schema.ts`) marks `caregiverName` as a required `v.string()`, this mutation bypasses the functional requirement by providing an empty string placeholder.
4.  **Missing Update Path**: There is currently **no mutation** in the audited files that allows a user to update or set their `caregiverName` after the profile shell is created.

> [!IMPORTANT]
> **Enforcement Blocker**: Any onboarding flow attempting to collect both the caregiver's name and the loved one's name in a single submission will currently fail to persist the caregiver's name, as the mutation is not equipped to handle it. 
