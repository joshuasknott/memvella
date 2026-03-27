import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// =============================================================================
// MEMVELLA — Convex Schema
// =============================================================================
// Auth tables (users, sessions, accounts, verifications) are managed by the
// @convex-dev/better-auth component. Only application-specific tables live here.
// =============================================================================

export default defineSchema({
  // ---------------------------------------------------------------------------
  // Caregiver Profiles (app-level user data)
  // ---------------------------------------------------------------------------
  // Better Auth manages its own `users` table internally. This table stores
  // application-specific profile data keyed to the auth identity.
  caregiverProfiles: defineTable({
    // The tokenIdentifier from ctx.auth.getUserIdentity() — stable identity key
    authUserId: v.string(),
    caregiverName: v.string(),
    lovedOneName: v.string(),
    role: v.union(v.literal("caregiver"), v.literal("senior")),
  })
    .index("by_authUserId", ["authUserId"]),

  // ---------------------------------------------------------------------------
  // Kiosk Devices — Tablet PIN Pairing (Custom Auth)
  // ---------------------------------------------------------------------------
  // Seniors do NOT log in via Better Auth. Instead, a caregiver generates a
  // 6-digit PIN. The senior enters this PIN on the tablet to "pair" it.
  // This is a lookup-based session, not an OAuth flow.
  kioskDevices: defineTable({
    caregiverId: v.string(),       // tokenIdentifier of the caregiver
    pinCode: v.string(),            // 6-digit alphanumeric code
    isActive: v.boolean(),          // true = currently paired and active
    seniorName: v.string(),         // display name for the tablet UI
    lastActiveAt: v.optional(v.number()), // heartbeat timestamp
  })
    .index("by_caregiverId", ["caregiverId"])
    .index("by_pinCode", ["pinCode"]),

  // ---------------------------------------------------------------------------
  // SAFETY DIRECTORY — Family Members
  // ---------------------------------------------------------------------------
  // The Dual-Graph RAG Architecture separates Truth from Memories.
  // This table is part of the "Truth Graph" — factual, verified data.
  //
  // ⚠️  CRITICAL: `isLiving` is the TEMPORAL SAFETY FLAG.
  // The AI must NEVER imply a deceased relative is alive.
  // This flag gates all generative output referencing family members.
  // ---------------------------------------------------------------------------
  familyMembers: defineTable({
    caregiverId: v.string(),        // tokenIdentifier of the caregiver
    name: v.string(),
    relationship: v.string(),       // "Son", "Daughter", "Grandchild", "Friend", etc.
    isLiving: v.boolean(),          // TEMPORAL SAFETY FLAG — true = alive, false = deceased
    aiContext: v.string(),          // free-text notes for the AI ("David loves gardening…")
    photoStorageId: v.optional(v.id("_storage")),
  })
    .index("by_caregiverId", ["caregiverId"]),

  // ---------------------------------------------------------------------------
  // TRUTH GRAPH — Routines
  // ---------------------------------------------------------------------------
  // Structured, factual daily routines. The AI uses these as ground-truth
  // anchors to avoid hallucinating schedule information.
  routines: defineTable({
    caregiverId: v.string(),
    routineName: v.string(),        // e.g. "Morning Tea"
    time: v.string(),               // e.g. "10:00 AM"
    frequency: v.array(v.string()), // e.g. ["Daily"] or ["Monday", "Wednesday", "Friday"]
    aiInstructions: v.string(),     // specific handling directions for the AI
  })
    .index("by_caregiverId", ["caregiverId"]),

  // ---------------------------------------------------------------------------
  // CONVERSATIONAL GRAPH — Memories
  // ---------------------------------------------------------------------------
  // Stories, songs, voice recordings, and media. These are subjective,
  // emotional content — separated from the Truth Graph to prevent the AI
  // from treating a remembered story as a verifiable fact.
  memories: defineTable({
    caregiverId: v.string(),
    title: v.string(),
    date: v.string(),               // free-text date, e.g. "Spring 2019"
    story: v.string(),              // the narrative / context
    mediaType: v.union(
      v.literal("text"),
      v.literal("audio"),
      v.literal("voice"),
      v.literal("media"),
    ),
    storageId: v.optional(v.id("_storage")),   // photo, audio, or video file
    songLink: v.optional(v.string()),           // Spotify / Apple Music URL
  })
    .index("by_caregiverId", ["caregiverId"])
    .index("by_caregiverId_and_mediaType", ["caregiverId", "mediaType"]),

  // ---------------------------------------------------------------------------
  // Notification Settings
  // ---------------------------------------------------------------------------
  // Per-caregiver boolean toggles for push/email notification preferences.
  notificationSettings: defineTable({
    caregiverId: v.string(),
    dailySummary: v.boolean(),      // evening wrap-up alerts
    urgentAlerts: v.boolean(),      // emergency fallback alerts
    routineReminders: v.boolean(),  // ping alerts for completed/missed routines
  })
    .index("by_caregiverId", ["caregiverId"]),

  // ---------------------------------------------------------------------------
  // Voice Logs — Tap-to-Talk Sessions
  // ---------------------------------------------------------------------------
  // Stores exact transcripts and duration of the Senior's voice sessions
  // with Memvella. Used for caregiver review and AI context enrichment.
  voiceLogs: defineTable({
    caregiverId: v.string(),
    seniorName: v.string(),
    transcript: v.string(),
    durationSeconds: v.number(),
  })
    .index("by_caregiverId", ["caregiverId"]),
});
