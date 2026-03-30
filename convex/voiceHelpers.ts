import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const gatherSeniorContext = internalQuery({
  args: {
    familySpaceId: v.id("familySpaces"),
  },
  handler: async (ctx, args) => {
    const [routines, familyMembers] = await Promise.all([
      ctx.db
        .query("routines")
        .withIndex("by_familySpaceId", (q) =>
          q.eq("familySpaceId", args.familySpaceId),
        )
        .take(50),
      ctx.db
        .query("familyMembers")
        .withIndex("by_familySpaceId", (q) =>
          q.eq("familySpaceId", args.familySpaceId),
        )
        .take(100),
    ]);

    return { routines, familyMembers };
  },
});

export const logVoiceSession = internalMutation({
  args: {
    familySpaceId: v.id("familySpaces"),
    seniorName: v.string(),
    transcript: v.string(),
    durationSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("voiceLogs", {
      familySpaceId: args.familySpaceId,
      seniorName: args.seniorName,
      transcript: args.transcript,
      durationSeconds: args.durationSeconds,
    });
  },
});
