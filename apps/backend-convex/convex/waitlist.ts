import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation } from "./_generated/server";
import { normalizeOptionalEmail, normalizeOptionalText } from "./security";

export const joinWaitlist = mutation({
  args: {
    email: v.string(),
    sourcePath: v.optional(v.string()),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const rateLimit = await ctx.runMutation(
      internal.rateLimits.consumeRateLimit,
      {
        scopeKey: "waitlist-global",
        actionKey: "joinWaitlist",
        maxHits: 10,
        windowMs: 60 * 1000,
        blockDurationMs: 5 * 60 * 1000,
      },
    );

    if (!rateLimit.allowed) {
      return { status: "joined" } as const;
    }

    const email = normalizeOptionalEmail(args.email);
    if (!email) {
      return { status: "joined" } as const;
    }

    const now = Date.now();
    const existingEntry = await ctx.db
      .query("waitlistEntries")
      .withIndex("by_email", (query) => query.eq("email", email))
      .unique();

    if (existingEntry) {
      await ctx.db.patch(existingEntry._id, {
        updatedAt: now,
      });
      return { status: "joined" } as const;
    }

    await ctx.db.insert("waitlistEntries", {
      email,
      sourcePath: normalizeOptionalText(args.sourcePath) ?? "/waitlist",
      referrer: normalizeOptionalText(args.referrer) ?? null,
      userAgent: normalizeOptionalText(args.userAgent) ?? null,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return { status: "joined" } as const;
  },
});
