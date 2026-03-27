import { mutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// Auth helper — derives the stable caregiver identity from the JWT token.
// Per Convex guidelines, NEVER accept a userId as an argument; always derive
// it server-side from ctx.auth.getUserIdentity().
// =============================================================================
async function requireCaregiver(ctx: { auth: { getUserIdentity: () => Promise<{ tokenIdentifier: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated: A valid caregiver session is required.");
  }
  return identity.tokenIdentifier;
}

// =============================================================================
// addFamilyMember
// =============================================================================
// Writes to the Safety Directory (familyMembers table).
//
// ⚠️  THE PRIME DIRECTIVE — TEMPORAL SAFETY
// isLiving is a hard-required boolean. When false, the AI layer MUST treat
// this person as deceased and never phrase responses as if they are alive.
// This field is the primary guardrail against "The Hallucination of Grief".
// =============================================================================
export const addFamilyMember = mutation({
  args: {
    name: v.string(),
    relationship: v.string(),
    isLiving: v.boolean(),           // ⚠️ TEMPORAL SAFETY FLAG — REQUIRED, NEVER OPTIONAL
    aiContext: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const caregiverId = await requireCaregiver(ctx);

    return await ctx.db.insert("familyMembers", {
      caregiverId,
      name: args.name,
      relationship: args.relationship,
      isLiving: args.isLiving,       // ⚠️ TEMPORAL SAFETY FLAG — persisted exactly as provided
      aiContext: args.aiContext,
      photoStorageId: args.photoStorageId,
    });
  },
});

// =============================================================================
// addRoutine
// =============================================================================
// Writes to the Truth Graph (routines table).
// Routines are factual, scheduled anchors — the AI uses these to avoid
// hallucinating schedule information.
// =============================================================================
export const addRoutine = mutation({
  args: {
    routineName: v.string(),
    time: v.string(),                // e.g. "10:00 AM"
    frequency: v.array(v.string()), // e.g. ["Daily"] or ["Mon", "Wed", "Fri"]
    aiInstructions: v.string(),
  },
  handler: async (ctx, args) => {
    const caregiverId = await requireCaregiver(ctx);

    return await ctx.db.insert("routines", {
      caregiverId,
      routineName: args.routineName,
      time: args.time,
      frequency: args.frequency,
      aiInstructions: args.aiInstructions,
    });
  },
});

// =============================================================================
// updateNotificationSettings
// =============================================================================
// Upsert: if a settings document already exists for this caregiver, patch it.
// Otherwise, create it fresh. This ensures the settings page always works
// regardless of whether the caregiver has saved settings before.
// =============================================================================
export const updateNotificationSettings = mutation({
  args: {
    dailySummary: v.boolean(),
    urgentAlerts: v.boolean(),
    routineReminders: v.boolean(),
  },
  handler: async (ctx, args) => {
    const caregiverId = await requireCaregiver(ctx);

    // Check for an existing settings document
    const existing = await ctx.db
      .query("notificationSettings")
      .withIndex("by_caregiverId", (q) => q.eq("caregiverId", caregiverId))
      .unique();

    if (existing) {
      // Update in-place
      await ctx.db.patch(existing._id, {
        dailySummary: args.dailySummary,
        urgentAlerts: args.urgentAlerts,
        routineReminders: args.routineReminders,
      });
      return existing._id;
    } else {
      // Create fresh
      return await ctx.db.insert("notificationSettings", {
        caregiverId,
        dailySummary: args.dailySummary,
        urgentAlerts: args.urgentAlerts,
        routineReminders: args.routineReminders,
      });
    }
  },
});

// =============================================================================
// saveVoiceSessionLog
// =============================================================================
// Called when the senior ends a Tap-to-Talk session. Stores the exact
// transcript and duration for caregiver review and AI context enrichment.
// =============================================================================
export const saveVoiceSessionLog = mutation({
  args: {
    seniorName: v.string(),
    transcript: v.string(),
    durationSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const caregiverId = await requireCaregiver(ctx);

    return await ctx.db.insert("voiceLogs", {
      caregiverId,
      seniorName: args.seniorName,
      transcript: args.transcript,
      durationSeconds: args.durationSeconds,
    });
  },
});
