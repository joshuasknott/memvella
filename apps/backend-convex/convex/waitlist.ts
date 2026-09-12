import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation } from "./_generated/server";
import { insertSanitizedAppEvent } from "./appEvents";
import { normalizeOptionalEmail, normalizeOptionalText } from "./security";

function normalizeWaitlistEmail(value: string) {
  const email = normalizeOptionalEmail(value);
  if (!email || email.length > 254) {
    return null;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null;
  }

  return email;
}

export const joinWaitlist = mutation({
  args: {
    email: v.string(),
    sourcePath: v.optional(v.string()),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  returns: v.union(
    v.object({ status: v.literal("joined") }),
    v.object({ status: v.literal("invalid") }),
    v.object({ status: v.literal("rate_limited"), retryAfterMs: v.number() }),
  ),
  handler: async (ctx, args) => {
    const email = normalizeWaitlistEmail(args.email);
    if (!email) return { status: "invalid" as const };
    const rateLimit: { allowed: boolean; remainingHits: number; retryAfterMs: number } = await ctx.runMutation(
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
      return { status: "rate_limited" as const, retryAfterMs: rateLimit.retryAfterMs };
    }

    const now = Date.now();
    const existingEntry = await ctx.db
      .query("waitlistEntries")
      .withIndex("by_email", (query) => query.eq("email", email))
      .unique();

    if (existingEntry) {
      await ctx.db.patch(existingEntry._id, {
        status: "active",
        updatedAt: now,
      });
      await insertSanitizedAppEvent(ctx, {
        eventType: "waitlist_submission",
        sourceApp: "marketing",
        sourceRoute: args.sourcePath,
        severity: "info",
        status: "processed",
        messageCode: "waitlist.rejoined",
      });
      return { status: "joined" } as const;
    }

    await ctx.db.insert("waitlistEntries", {
      email,
      sourcePath: normalizeOptionalText(args.sourcePath)?.split(/[?#]/, 1)[0].slice(0, 120) || "/waitlist",
      referrer: normalizeOptionalText(args.referrer)?.split(/[?#]/, 1)[0].slice(0, 500) ?? null,
      userAgent: normalizeOptionalText(args.userAgent)?.slice(0, 300) ?? null,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    await insertSanitizedAppEvent(ctx, {
      eventType: "waitlist_submission",
      sourceApp: "marketing",
      sourceRoute: args.sourcePath,
      severity: "info",
      status: "received",
      messageCode: "waitlist.joined",
    });

    return { status: "joined" } as const;
  },
});
