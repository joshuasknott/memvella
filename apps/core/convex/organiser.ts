import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import {
  getOptionalCircleMembership,
  getMembershipByAuthIdentityToken,
  getSeniorProfileByMode,
  isFamilySideRole,
  normalizeFamilySideMembershipRole,
  requireFamilySideCapability,
  upsertAssistedSeniorProfile,
  upsertIndependentSeniorProfile,
} from "./circleAuth";
import {
  normalizeOptionalEmail,
  normalizeOptionalText,
} from "./security";
import { revokeSeniorSessionsForProfile } from "./seniorAccessHelpers";
import {
  getNextRoutineEventForCircle,
  listTodayTimelineForCircle,
} from "./routineHelpers";
import {
  buildCircleName,
  CIRCLE_LABEL,
  MEMBER_LABEL,
  normalizeUserFacingText,
  ORGANISER_LABEL,
  TABLET_PROFILE_LABEL,
} from "./terminology";
import { listPeopleForCircle } from "./people";

const organiserProfileRoleValidator = v.optional(
  v.union(v.literal("organiser"), v.literal("assisted_senior"), v.literal("independent")),
);

async function getPreferredSeniorProfile(
  circleId: Id<"circles">,
  ctx: QueryCtx,
) {
  const assistedSenior = await getSeniorProfileByMode(ctx, circleId, "assisted");
  if (assistedSenior) {
    return assistedSenior;
  }

  return await getSeniorProfileByMode(ctx, circleId, "independent");
}

export const createOrganiserProfile = mutation({
  args: {
    organiserName: v.optional(v.string()),
    seniorDisplayName: v.optional(v.string()),
    role: organiserProfileRoleValidator,
    onboardingStep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated: a valid organiser session is required.");
    }

    const authIdentityToken = identity.tokenIdentifier;
    const authEmail = normalizeOptionalEmail(identity.email) ?? null;

    const existingMembership = await getMembershipByAuthIdentityToken(
      ctx,
      authIdentityToken,
    );

    const organiserName = normalizeOptionalText(args.organiserName) ?? ORGANISER_LABEL;
    const seniorDisplayName = normalizeOptionalText(args.seniorDisplayName);
    const seniorMode = args.role === "independent" ? "independent" : "assisted";

    if (existingMembership) {
      if (!isFamilySideRole(existingMembership.role)) {
        throw new Error("This account is already linked to a different experience.");
      }

      if (normalizeFamilySideMembershipRole(existingMembership.role) !== "organiser") {
        throw new Error("This account does not have access to that Circle setting.");
      }

      const circle = await ctx.db.get(existingMembership.circleId);
      if (!circle) {
        throw new Error("The linked Circle could not be found.");
      }

      await ctx.db.patch(existingMembership._id, {
        displayName: organiserName,
        authEmail,
        onboardingStep: args.onboardingStep,
        lastSeenAt: Date.now(),
      });

      if (seniorDisplayName) {
        if (seniorMode === "independent") {
          const independentSenior = await upsertIndependentSeniorProfile(ctx, {
            circleId: existingMembership.circleId,
            displayName: seniorDisplayName,
          });

          await ctx.db.patch(existingMembership._id, {
            seniorProfileId: independentSenior?._id ?? null,
          });
        } else {
          const assistedSenior = await upsertAssistedSeniorProfile(ctx, {
            circleId: existingMembership.circleId,
            displayName: seniorDisplayName,
          });

          await ctx.db.patch(existingMembership._id, {
            seniorProfileId: assistedSenior?._id ?? null,
          });
        }

        await ctx.db.patch(circle._id, {
          displayName: buildCircleName(seniorDisplayName),
        });
      }

      return existingMembership._id;
    }

    const circleId = await ctx.db.insert("circles", {
      displayName: seniorDisplayName
        ? buildCircleName(seniorDisplayName)
        : buildCircleName(organiserName),
      timezone: undefined,
      locale: undefined,
    });

    let linkedSeniorProfileId: Id<"seniorProfiles"> | null = null;
    if (seniorDisplayName) {
      const seniorProfile =
        seniorMode === "independent"
          ? await upsertIndependentSeniorProfile(ctx, {
              circleId,
              displayName: seniorDisplayName,
            })
          : await upsertAssistedSeniorProfile(ctx, {
              circleId,
              displayName: seniorDisplayName,
            });

      linkedSeniorProfileId = seniorProfile?._id ?? null;
    }

    const membershipId = await ctx.db.insert("circleMemberships", {
      circleId,
      authIdentityToken,
      authEmail,
      displayName: organiserName,
      role: "organiser",
      seniorProfileId: linkedSeniorProfileId,
      onboardingStep: args.onboardingStep,
      lastSeenAt: Date.now(),
    });

    return membershipId;
  },
});

export const patchOrganiserProfile = mutation({
  args: {
    organiserName: v.optional(v.string()),
    seniorDisplayName: v.optional(v.string()),
    role: organiserProfileRoleValidator,
    onboardingStep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySideCapability(
      ctx,
      "manage_circle_admin",
    );
    const organiserName = normalizeOptionalText(args.organiserName);
    const seniorDisplayName = normalizeOptionalText(args.seniorDisplayName);
    const seniorMode = args.role === "independent" ? "independent" : "assisted";

    if (organiserName || args.onboardingStep !== undefined) {
      await ctx.db.patch(membership._id, {
        ...(organiserName ? { displayName: organiserName } : {}),
        ...(args.onboardingStep !== undefined
          ? { onboardingStep: args.onboardingStep }
          : {}),
        lastSeenAt: Date.now(),
      });
    }

    if (seniorDisplayName) {
      if (seniorMode === "independent") {
        const independentSenior = await upsertIndependentSeniorProfile(ctx, {
          circleId: membership.circleId,
          displayName: seniorDisplayName,
        });

        await ctx.db.patch(membership._id, {
          seniorProfileId: independentSenior?._id ?? null,
        });
      } else {
        const assistedSenior = await upsertAssistedSeniorProfile(ctx, {
          circleId: membership.circleId,
          displayName: seniorDisplayName,
        });

        await ctx.db.patch(membership._id, {
          seniorProfileId: assistedSenior?._id ?? null,
        });
      }

      await ctx.db.patch(membership.circleId, {
        displayName: buildCircleName(seniorDisplayName),
      });
    }

    return membership._id;
  },
});

export const getTodayTimeline = query({
  args: {},
  handler: async (ctx) => {
    const circleContext = await getOptionalCircleMembership(
      ctx,
      "family_side",
    );
    if (!circleContext) {
      return [];
    }

    const circleId = circleContext.circleMembership?.circleId ?? circleContext.circle?._id;
    if (!circleId) {
      return [];
    }

    return await listTodayTimelineForCircle(
      ctx,
      circleId,
    );
  },
});

export const getOrganiserDashboardSummary = query({
  args: {},
  handler: async (ctx) => {
    const circleContext = await getOptionalCircleMembership(
      ctx,
      "family_side",
    );
    if (!circleContext) {
      return { totalPeople: 0, totalRoutines: 0, statusSummary: "" };
    }

    const circleId = circleContext.circleMembership?.circleId ?? circleContext.circle?._id;
    if (!circleId) {
      return { totalPeople: 0, totalRoutines: 0, statusSummary: "" };
    }

    const seniorProfile =
      (circleContext.membership.seniorProfileId
        ? await ctx.db.get(circleContext.membership.seniorProfileId)
        : null) ??
      (await getSeniorProfileByMode(ctx, circleContext.membership.circleId, "assisted")) ??
      (await getSeniorProfileByMode(ctx, circleContext.membership.circleId, "independent"));
    if (!seniorProfile) {
      return {
        totalPeople: 0,
        totalRoutines: 0,
        statusSummary: `Your ${CIRCLE_LABEL} is ready for today.`,
      };
    }

    const [members, routines, nextRoutine] = await Promise.all([
      listPeopleForCircle(ctx, circleContext.membership.circleId, 200),
      ctx.db
        .query("routineSchedules")
        .withIndex("by_seniorProfileId", (query) =>
          query.eq("seniorProfileId", seniorProfile._id),
        )
        .take(200),
      getNextRoutineEventForCircle(
        ctx,
        circleId,
      ),
    ]);

    return {
      totalPeople: members.length,
      totalRoutines: routines.length,
      statusSummary: nextRoutine
        ? `${nextRoutine.title} is next at ${nextRoutine.time}.`
        : `Your ${CIRCLE_LABEL} is ready for today.`,
    };
  },
});

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

export const getOrganiserProfile = query({
  args: {},
  handler: async (ctx) => {
    const circleContext = await getOptionalCircleMembership(
      ctx,
      "family_side",
    );
    if (!circleContext) {
      return null;
    }

    const seniorProfile =
      circleContext.membership.seniorProfileId !== null
        ? await ctx.db.get(circleContext.membership.seniorProfileId)
        : await getPreferredSeniorProfile(
            circleContext.membership.circleId,
            ctx,
          );

    return {
      _id: circleContext.membership._id,
      circleId: circleContext.membership.circleId,
      organiserName:
        normalizeUserFacingText(circleContext.membership.displayName) ??
        ORGANISER_LABEL,
      seniorDisplayName:
        normalizeUserFacingText(seniorProfile?.displayName) ?? MEMBER_LABEL,
      role:
        normalizeFamilySideMembershipRole(circleContext.membership.role) ??
        "organiser",
      onboardingStep: circleContext.membership.onboardingStep,
      seniorProfileId: seniorProfile?._id ?? null,
      seniorMode: seniorProfile?.seniorMode ?? null,
      authEmail: circleContext.membership.authEmail,
    };
  },
});
