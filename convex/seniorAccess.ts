import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import {
  SENIOR_IDLE_TIMEOUT_MS,
  type SeniorSessionType,
} from "./security";
import {
  buildSeniorDashboard,
  validateSeniorSession,
} from "./seniorAccessHelpers";

export const getSeniorDashboard = query({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
  },
  handler: async (ctx, args) => {
    const validation = await validateSeniorSession(ctx, args);
    if (validation.status === "invalid") {
      return validation;
    }

    const dashboard = await buildSeniorDashboard(
      ctx,
      validation.familySpace._id,
    );

    return {
      status: "active" as const,
      sessionType: validation.session.sessionType,
      seniorName: validation.seniorProfile.displayName,
      seniorMode: validation.seniorProfile.seniorMode,
      nextEvent: dashboard.nextEvent,
      gallery: dashboard.gallery,
      expiresAt: validation.session.expiresAt,
      idleExpiresAt: validation.session.idleExpiresAt,
    };
  },
});

export const resolveSeniorSession = internalQuery({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
  },
  handler: async (ctx, args) => {
    const validation = await validateSeniorSession(ctx, args);
    if (validation.status === "invalid") {
      throw new Error(`Invalid senior session: ${validation.reason}`);
    }

    return {
      familySpaceId: validation.familySpace._id,
      seniorName: validation.seniorProfile.displayName,
      seniorMode: validation.seniorProfile.seniorMode,
      sessionType: validation.session.sessionType,
    };
  },
});

export const keepSessionAlive = mutation({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
  },
  handler: async (ctx, args) => {
    const validation = await validateSeniorSession(ctx, args);
    if (validation.status === "invalid") {
      return validation;
    }

    const now = Date.now();
    const sessionType = validation.session.sessionType as SeniorSessionType;
    const idleExpiresAt = Math.min(
      validation.session.expiresAt,
      now + SENIOR_IDLE_TIMEOUT_MS[sessionType],
    );

    await ctx.db.patch(validation.session._id, {
      lastValidatedAt: now,
      idleExpiresAt,
    });

    await ctx.db.patch(validation.seniorProfile._id, {
      lastSessionAt: now,
      accessStatus: "active",
    });

    return {
      status: "active" as const,
      idleExpiresAt,
      expiresAt: validation.session.expiresAt,
    };
  },
});

export const endSession = mutation({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const validation = await validateSeniorSession(ctx, args);
    if (validation.status === "invalid") {
      return validation;
    }

    await ctx.db.patch(validation.session._id, {
      revokedAt: Date.now(),
      revokedReason: args.reason ?? "signed_out",
    });

    return { status: "ended" as const };
  },
});
