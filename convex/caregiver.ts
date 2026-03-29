import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

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


// =============================================================================
// createCaregiverProfile
// =============================================================================
// Idempotent — returns the existing document ID if a profile already exists
// for this authUserId. Otherwise creates a new profile, inserting only the
// fields that were explicitly provided (no empty-string hacks).
//
// All profile fields are optional to support progressive conversational
// onboarding — a record can be created with just authUserId and fleshed out
// step-by-step via patchCaregiverProfile.
// =============================================================================
export const createCaregiverProfile = mutation({
  args: {
    caregiverName:   v.optional(v.string()),
    lovedOneName:    v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("caregiver"),
      v.literal("assisted_senior"),
      v.literal("independent_senior"),
    )),
    onboarding_step: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const authUserId = await requireCaregiver(ctx);

    // Idempotency check — never create a duplicate profile row
    const existing = await ctx.db
      .query("caregiverProfiles")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUserId))
      .first();

    if (existing) return existing._id;

    // Build the insert payload — only include fields that were supplied.
    // This avoids storing empty strings that would conflict with v.optional.

    // Role-specific logic: independent_senior is the same person as the
    // caregiver, so mirror caregiverName → lovedOneName when not supplied.
    const effectiveLovedOneName =
      args.lovedOneName ??
      (args.role === "independent_senior" ? args.caregiverName : undefined);

    const payload: Omit<Doc<"caregiverProfiles">, "_id" | "_creationTime"> = {
      authUserId,
      ...(args.caregiverName !== undefined   && { caregiverName:   args.caregiverName.trim() }),
      ...(effectiveLovedOneName !== undefined && { lovedOneName:    effectiveLovedOneName.trim() }),
      ...(args.role !== undefined             && { role:            args.role }),
      ...(args.onboarding_step !== undefined  && { onboarding_step: args.onboarding_step }),
    };

    return await ctx.db.insert("caregiverProfiles", payload);
  },
});

// =============================================================================
// patchCaregiverProfile
// =============================================================================
// Protected step-merge mutation for conversational onboarding.
// Only patches fields that are explicitly supplied — any undefined argument
// is silently ignored, making every call safe to call for a single step.
//
// Role-specific logic:
//   independent_senior → lovedOneName mirrors caregiverName when not supplied,
//   because in that context the senior and their "loved one" are the same person.
// =============================================================================
export const patchCaregiverProfile = mutation({
  args: {
    caregiverName:   v.optional(v.string()),
    lovedOneName:    v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("caregiver"),
      v.literal("assisted_senior"),
      v.literal("independent_senior"),
    )),
    onboarding_step: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const authUserId = await requireCaregiver(ctx);

    const profile = await ctx.db
      .query("caregiverProfiles")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUserId))
      .first();

    if (!profile) {
      throw new Error(
        "No caregiverProfile found for this user. Call createCaregiverProfile first."
      );
    }

    // Build the patch object — only include fields that were supplied.
    const patch: Record<string, unknown> = {};

    if (args.caregiverName !== undefined) {
      patch.caregiverName = args.caregiverName.trim();
    }

    // Role-specific logic: when switching to independent_senior, auto-fill
    // lovedOneName from caregiverName if the caller didn't supply one.
    const incomingRole = args.role ?? profile.role;
    const effectiveLovedOneName =
      args.lovedOneName ??
      (incomingRole === "independent_senior"
        ? (args.caregiverName ?? profile.caregiverName)
        : undefined);

    if (effectiveLovedOneName !== undefined) {
      patch.lovedOneName = effectiveLovedOneName.trim();
    }

    if (args.role !== undefined) {
      patch.role = args.role;
    }

    if (args.onboarding_step !== undefined) {
      patch.onboarding_step = args.onboarding_step;
    }

    if (Object.keys(patch).length === 0) {
      // Nothing to do — return the existing ID so the caller isn't confused
      return profile._id;
    }

    await ctx.db.patch(profile._id, patch);
    return profile._id;
  },
});

// =============================================================================
// CAREGIVER QUERIES — Require Better Auth session
// =============================================================================

// -----------------------------------------------------------------------------
// getFamilyDirectory
// -----------------------------------------------------------------------------
// Returns all family members for the authenticated caregiver.
// Resolves photoStorageId → photoUrl via ctx.storage.getUrl().
// Always includes the isLiving temporal safety flag so the UI can reflect it.
// Returns [] if no members exist — never crashes a frontend .map().
// -----------------------------------------------------------------------------
export const getFamilyDirectory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const caregiverId = identity.tokenIdentifier;

    const members = await ctx.db
      .query("familyMembers")
      .withIndex("by_caregiverId", (q) => q.eq("caregiverId", caregiverId))
      .take(100);

    return Promise.all(
      members.map(async (member) => ({
        id: member._id,
        name: member.name,
        relationship: member.relationship,
        isLiving: member.isLiving,   // ⚠️ TEMPORAL SAFETY FLAG — always returned
        aiContext: member.aiContext,
        photoUrl: member.photoStorageId
          ? await ctx.storage.getUrl(member.photoStorageId)
          : null,
      }))
    );
  },
});

// -----------------------------------------------------------------------------
// getTodayTimeline
// -----------------------------------------------------------------------------
// Returns all routines for the authenticated caregiver, mapped to the shape
// the Dashboard timeline component expects.
// Frontend is responsible for filtering to the current day based on frequency.
// Returns [] if no routines exist.
// -----------------------------------------------------------------------------
export const getTodayTimeline = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const caregiverId = identity.tokenIdentifier;

    const routines = await ctx.db
      .query("routines")
      .withIndex("by_caregiverId", (q) => q.eq("caregiverId", caregiverId))
      .take(50);

    return routines.map((routine) => ({
      id: routine._id,
      time: routine.time,
      title: routine.routineName,
      type: routine.frequency[0] ?? "Daily",  // first frequency label as icon hint
      frequency: routine.frequency,
    }));
  },
});

// -----------------------------------------------------------------------------
// getCaregiverDashboardSummary
// -----------------------------------------------------------------------------
// Returns a lightweight aggregation object for the Dashboard status card.
// statusSummary is static until the LLM integration is wired in Phase 4.
// -----------------------------------------------------------------------------
export const getCaregiverDashboardSummary = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { totalFamilyMembers: 0, totalRoutines: 0, statusSummary: "" };
    }
    const caregiverId = identity.tokenIdentifier;

    const [members, routines] = await Promise.all([
      ctx.db
        .query("familyMembers")
        .withIndex("by_caregiverId", (q) => q.eq("caregiverId", caregiverId))
        .take(200),
      ctx.db
        .query("routines")
        .withIndex("by_caregiverId", (q) => q.eq("caregiverId", caregiverId))
        .take(200),
    ]);

    return {
      totalFamilyMembers: members.length,
      totalRoutines: routines.length,
      // Static placeholder — will be replaced by LLM summary in a future phase
      statusSummary: "Your loved one is doing well today.",
    };
  },
});

// -----------------------------------------------------------------------------
// getNotificationSettings
// -----------------------------------------------------------------------------
// Returns the caregiver's notification toggle preferences.
// Returns sensible defaults (all false) if no document has been saved yet.
// -----------------------------------------------------------------------------
export const getNotificationSettings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { dailySummary: false, urgentAlerts: false, routineReminders: false };
    }
    const caregiverId = identity.tokenIdentifier;

    const settings = await ctx.db
      .query("notificationSettings")
      .withIndex("by_caregiverId", (q) => q.eq("caregiverId", caregiverId))
      .unique();

    return settings ?? {
      dailySummary: false,
      urgentAlerts: false,
      routineReminders: false,
    };
  },
});

// -----------------------------------------------------------------------------
// getCaregiverProfile
// -----------------------------------------------------------------------------
// Returns the caregiver's profile record (lovedOneName, etc.), or null if it
// hasn't been created yet (e.g. first-load before the dashboard flush runs).
// -----------------------------------------------------------------------------
export const getCaregiverProfile = query({
  args: {},
  handler: async (ctx) => {
    const caregiverId = await requireCaregiver(ctx);

    return await ctx.db
      .query("caregiverProfiles")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", caregiverId))
      .first();
  },
});
