import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

// =============================================================================
// VOICE HELPERS — Internal functions for the conversational engine
// =============================================================================
// These live in a separate file from the voice action because Convex requires
// that `"use node"` files contain ONLY actions. Queries and mutations must
// stay in the default Convex runtime.
// =============================================================================

// =============================================================================
// Context Gatherer (internalQuery)
// =============================================================================
// Fetches all the data the AI needs to construct a safe, grounded response.
// This is internal — never exposed to clients.
// =============================================================================
export const gatherSeniorContext = internalQuery({
  args: {
    caregiverId: v.string(),
  },
  handler: async (ctx, args) => {
    const [routines, familyMembers] = await Promise.all([
      ctx.db
        .query("routines")
        .withIndex("by_caregiverId", (q) => q.eq("caregiverId", args.caregiverId))
        .take(50),
      ctx.db
        .query("familyMembers")
        .withIndex("by_caregiverId", (q) => q.eq("caregiverId", args.caregiverId))
        .take(100),
    ]);

    return { routines, familyMembers };
  },
});

// =============================================================================
// Audit Trail — Internal Voice Log Mutation
// =============================================================================
// The kiosk has no Better Auth session, so the public saveVoiceSessionLog
// (which requires auth) cannot be used. This internal mutation writes directly
// to voiceLogs using the caregiverId from the action's args.
// =============================================================================
export const logVoiceSession = internalMutation({
  args: {
    caregiverId: v.string(),
    seniorName: v.string(),
    transcript: v.string(),
    durationSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("voiceLogs", {
      caregiverId: args.caregiverId,
      seniorName: args.seniorName,
      transcript: args.transcript,
      durationSeconds: args.durationSeconds,
    });
  },
});
