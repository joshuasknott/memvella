import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

const DEFAULT_BATCH_SIZE = 50;
const MAX_BATCH_SIZE = 200;

export const backfillLegacySupporterMembershipRoles = internalMutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(
      Math.max(args.limit ?? DEFAULT_BATCH_SIZE, 1),
      MAX_BATCH_SIZE,
    );

    const legacyMemberships = await ctx.db
      .query("familySpaceMemberships")
      .withIndex("by_role", (query) => query.eq("role", "supporter"))
      .take(limit);

    for (const membership of legacyMemberships) {
      await ctx.db.patch(membership._id, {
        role: "organiser",
      });
    }

    return {
      processedCount: legacyMemberships.length,
      hasMore: legacyMemberships.length === limit,
    };
  },
});
