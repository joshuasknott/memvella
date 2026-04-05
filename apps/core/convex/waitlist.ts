import { v } from "convex/values";
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
    const email = normalizeOptionalEmail(args.email);
    if (!email) {
      throw new Error("A valid email address is required.");
    }

    const now = Date.now();
    const existingEntry = await ctx.db
      .query("waitlistEntries")
      .withIndex("by_email", (query) => query.eq("email", email))
      .unique();
    const payload = {
      sourcePath: normalizeOptionalText(args.sourcePath) ?? "/waitlist",
      referrer: normalizeOptionalText(args.referrer) ?? null,
      userAgent: normalizeOptionalText(args.userAgent) ?? null,
      status: "active" as const,
      updatedAt: now,
    };

    if (existingEntry) {
      await ctx.db.patch(existingEntry._id, payload);
      return {
        status: existingEntry.status === "active" ? "already_joined" : "rejoined",
      } as const;
    }

    await ctx.db.insert("waitlistEntries", {
      email,
      ...payload,
      createdAt: now,
    });
    return { status: "joined" } as const;
  },
});
