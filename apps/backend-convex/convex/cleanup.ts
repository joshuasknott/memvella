import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

const EXPIRED_UPLOAD_INTENTS_BATCH = 200;
const STALE_RATE_LIMIT_BATCH = 200;

export const purgeExpiredUploadIntents = internalMutation({
  args: {
    now: v.number(),
  },
  handler: async (ctx, args) => {
    let scanned = 0;
    let deleted = 0;
    let cursor: string | null = null;

    while (deleted < EXPIRED_UPLOAD_INTENTS_BATCH) {
      const page = await ctx.db.query("uploadIntents").paginate({ cursor, numItems: 100 });
      scanned += page.page.length;

      for (const intent of page.page) {
        if (intent.expiresAt < args.now) {
          await ctx.db.delete(intent._id);
          deleted += 1;
          if (deleted >= EXPIRED_UPLOAD_INTENTS_BATCH) {
            break;
          }
        }
      }

      if (page.isDone) {
        break;
      }
      cursor = page.continueCursor;
    }

    return { scanned, deleted };
  },
});

export const purgeStaleRateLimitWindows = internalMutation({
  args: {
    now: v.number(),
  },
  handler: async (ctx, args) => {
    let scanned = 0;
    let deleted = 0;
    let cursor: string | null = null;

    const staleThreshold = args.now - 60 * 60 * 1000;

    while (deleted < STALE_RATE_LIMIT_BATCH) {
      const page = await ctx.db.query("rateLimitWindows").paginate({ cursor, numItems: 100 });
      scanned += page.page.length;

      for (const window of page.page) {
        const isBlockedButExpired =
          window.blockedUntil !== null && window.blockedUntil < staleThreshold;
        const isOld = window.updatedAt < staleThreshold;

        if (isOld || isBlockedButExpired) {
          await ctx.db.delete(window._id);
          deleted += 1;
          if (deleted >= STALE_RATE_LIMIT_BATCH) {
            break;
          }
        }
      }

      if (page.isDone) {
        break;
      }
      cursor = page.continueCursor;
    }

    return { scanned, deleted };
  },
});

export const runCleanupSweep = internalAction({
  args: {},
  handler: async (ctx): Promise<{ intents: { scanned: number; deleted: number }; rateLimits: { scanned: number; deleted: number } }> => {
    const now = Date.now();
    const intents: { scanned: number; deleted: number } = await ctx.runMutation(
      internal.cleanup.purgeExpiredUploadIntents,
      { now },
    );
    const rateLimits: { scanned: number; deleted: number } = await ctx.runMutation(
      internal.cleanup.purgeStaleRateLimitWindows,
      { now },
    );
    return { intents, rateLimits };
  },
});
