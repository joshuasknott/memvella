import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const consumeRateLimit = internalMutation({
  args: {
    scopeKey: v.string(),
    actionKey: v.string(),
    maxHits: v.number(),
    windowMs: v.number(),
    blockDurationMs: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("rateLimitWindows")
      .withIndex("by_scopeKey_and_actionKey", (query) =>
        query.eq("scopeKey", args.scopeKey).eq("actionKey", args.actionKey),
      )
      .unique();

    if (!existing) {
      await ctx.db.insert("rateLimitWindows", {
        scopeKey: args.scopeKey,
        actionKey: args.actionKey,
        windowStart: now,
        hits: 1,
        blockedUntil: null,
        updatedAt: now,
      });

      return {
        allowed: true as const,
        remainingHits: Math.max(args.maxHits - 1, 0),
        retryAfterMs: 0,
      };
    }

    if (existing.blockedUntil !== null && existing.blockedUntil > now) {
      return {
        allowed: false as const,
        remainingHits: 0,
        retryAfterMs: existing.blockedUntil - now,
      };
    }

    const windowExpired = now - existing.windowStart >= args.windowMs;
    if (windowExpired) {
      await ctx.db.patch(existing._id, {
        windowStart: now,
        hits: 1,
        blockedUntil: null,
        updatedAt: now,
      });

      return {
        allowed: true as const,
        remainingHits: Math.max(args.maxHits - 1, 0),
        retryAfterMs: 0,
      };
    }

    const nextHits = existing.hits + 1;
    if (nextHits > args.maxHits) {
      const blockedUntil = now + args.blockDurationMs;
      await ctx.db.patch(existing._id, {
        hits: nextHits,
        blockedUntil,
        updatedAt: now,
      });

      return {
        allowed: false as const,
        remainingHits: 0,
        retryAfterMs: blockedUntil - now,
      };
    }

    await ctx.db.patch(existing._id, {
      hits: nextHits,
      blockedUntil: null,
      updatedAt: now,
    });

    return {
      allowed: true as const,
      remainingHits: Math.max(args.maxHits - nextHits, 0),
      retryAfterMs: 0,
    };
  },
});
