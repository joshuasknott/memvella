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
import {
  formatInvalidSessionMessage,
  MEMBER_LABEL,
  normalizeUserFacingText,
} from "./terminology";

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
      validation.seniorProfile._id,
    );

    return {
      status: "active" as const,
      sessionType: validation.session.sessionType,
      seniorName:
        normalizeUserFacingText(validation.seniorProfile.displayName) ??
        MEMBER_LABEL,
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
    expectedSessionType: v.optional(
      v.union(v.literal("assisted_device"), v.literal("independent_web")),
    ),
  },
  handler: async (ctx, args) => {
    const validation = await validateSeniorSession(ctx, {
      sessionToken: args.sessionToken,
      deviceFingerprint: args.deviceFingerprint,
      expectedSessionType: args.expectedSessionType,
    });
    if (validation.status === "invalid") {
      throw new Error(formatInvalidSessionMessage(validation.reason));
    }

    return {
      circleId: validation.circle?._id ?? null,
      seniorProfileId: validation.seniorProfile._id,
      seniorName:
        normalizeUserFacingText(validation.seniorProfile.displayName) ??
        MEMBER_LABEL,
      seniorMode: validation.seniorProfile.seniorMode,
      sessionType: validation.session.sessionType,
      sessionId: validation.session._id,
      sourceCircleMembershipId: validation.session.sourceCircleMembershipId,
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
