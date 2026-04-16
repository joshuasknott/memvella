import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getSeniorProfileByMode, requireFamilySideCapability } from "./circleAuth";
import { revokeSeniorSessionsForProfile } from "./seniorAccessHelpers";
import { TABLET_PROFILE_LABEL } from "./terminology";

export const listAssistedDeviceSessions = query({
  args: {},
  handler: async (ctx) => {
    const { membership } = await requireFamilySideCapability(
      ctx,
      "manage_tablet_access",
    );
    const assistedSenior = await getSeniorProfileByMode(
      ctx,
      membership.circleId,
      "assisted",
    );

    if (!assistedSenior) {
      return [] as Array<{
        id: Id<"seniorAccessSessions">;
        issuedAt: number;
        lastValidatedAt: number;
        expiresAt: number;
        idleExpiresAt: number;
      }>;
    }

    const now = Date.now();
    const sessions = await ctx.db
      .query("seniorAccessSessions")
      .withIndex("by_seniorProfileId_and_sessionType", (query) =>
        query
          .eq("seniorProfileId", assistedSenior._id)
          .eq("sessionType", "assisted_device"),
      )
      .take(50);

    return sessions
      .filter(
        (session) =>
          session.revokedAt === null &&
          session.expiresAt > now &&
          session.idleExpiresAt > now,
      )
      .sort((left, right) => right.lastValidatedAt - left.lastValidatedAt)
      .map((session) => ({
        id: session._id,
        issuedAt: session.issuedAt,
        lastValidatedAt: session.lastValidatedAt,
        expiresAt: session.expiresAt,
        idleExpiresAt: session.idleExpiresAt,
      }));
  },
});

export const revokeAssistedDeviceSession = mutation({
  args: {
    sessionId: v.id("seniorAccessSessions"),
  },
  handler: async (ctx, args) => {
    const { circleMembership, circle } = await requireFamilySideCapability(
      ctx,
      "manage_tablet_access",
    );
    const session = await ctx.db.get(args.sessionId);
    const membershipCircleId = circleMembership?.circleId ?? circle?._id ?? null;

    if (
      !session ||
      session.circleId !== membershipCircleId ||
      session.sessionType !== "assisted_device"
    ) {
      throw new Error(`This ${TABLET_PROFILE_LABEL} session is not available.`);
    }

    if (session.revokedAt !== null) {
      return { revoked: false as const };
    }

    await ctx.db.patch(session._id, {
      revokedAt: Date.now(),
      revokedReason: "organiser_revoked_device_session",
    });

    return { revoked: true as const };
  },
});

export const revokeAllAssistedDeviceSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const { membership } = await requireFamilySideCapability(
      ctx,
      "manage_tablet_access",
    );
    const assistedSenior = await getSeniorProfileByMode(
      ctx,
      membership.circleId,
      "assisted",
    );

    if (!assistedSenior) {
      return { revokedCount: 0 };
    }

    const sessions = await ctx.db
      .query("seniorAccessSessions")
      .withIndex("by_seniorProfileId_and_sessionType", (query) =>
        query
          .eq("seniorProfileId", assistedSenior._id)
          .eq("sessionType", "assisted_device"),
      )
      .take(50);

    const activeSessions = sessions.filter((session) => session.revokedAt === null);
    await revokeSeniorSessionsForProfile(ctx, {
      seniorProfileId: assistedSenior._id,
      sessionType: "assisted_device",
      reason: "organiser_revoked_all_device_sessions",
    });

    return { revokedCount: activeSessions.length };
  },
});
