import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import {
  getOptionalFamilySpaceMembership,
  getMembershipByAuthIdentityToken,
  getSeniorProfileByMode,
  isFamilySideRole,
  normalizeFamilySideMembershipRole,
  requireFamilySideCapability,
  upsertAssistedSeniorProfile,
  upsertIndependentSeniorProfile,
} from "./familySpaceAuth";
import {
  normalizeOptionalEmail,
  normalizeOptionalText,
} from "./security";
import { revokeSeniorSessionsForProfile } from "./seniorAccessHelpers";
import {
  getNextRoutineEventForFamilySpace,
  listTodayTimelineForFamilySpace,
} from "./routineHelpers";
import { assertValidStoredUpload } from "./uploadValidation";
import {
  buildCircleName,
  CIRCLE_LABEL,
  MEMBER_LABEL,
  normalizeUserFacingText,
  ORGANISER_LABEL,
  TABLET_PROFILE_LABEL,
} from "./terminology";
import {
  ensureCircleForFamilySpace,
  ensureCircleMembershipForLegacyMembership,
  patchCircleFromFamilySpace,
} from "./circleCompat";
import {
  listPeopleForFamilySpace,
  mirrorPersonToLegacyFamilyMember,
} from "./peopleCompat";

const organiserProfileRoleValidator = v.optional(
  v.union(
    v.literal("organiser"),
    v.literal("assisted_senior"),
    v.literal("independent_senior"),
  ),
);

async function getPreferredSeniorProfile(
  familySpaceId: Id<"familySpaces">,
  ctx: QueryCtx,
) {
  const assistedSenior = await getSeniorProfileByMode(ctx, familySpaceId, "assisted");
  if (assistedSenior) {
    return assistedSenior;
  }

  return await getSeniorProfileByMode(ctx, familySpaceId, "independent");
}

export const addFamilyMember = mutation({
  args: {
    name: v.string(),
    relationship: v.string(),
    isLiving: v.boolean(),
    aiContext: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySideCapability(ctx, "manage_people");
    if (args.photoStorageId) {
      await assertValidStoredUpload(ctx, {
        storageId: args.photoStorageId,
        kind: "image",
      });
    }

    const now = Date.now();
    const legacyFamilyMemberId = await mirrorPersonToLegacyFamilyMember(ctx, {
      familySpaceId: membership.familySpaceId,
      name: args.name,
      relationship: args.relationship,
      isLiving: args.isLiving,
      aiContext: args.aiContext,
      photoStorageId: args.photoStorageId,
    });

    return await ctx.db.insert("people", {
      familySpaceId: membership.familySpaceId,
      seniorProfileId: membership.seniorProfileId,
      legacyFamilyMemberId: legacyFamilyMemberId ?? null,
      name: args.name,
      relationship: args.relationship,
      isLiving: args.isLiving,
      aiContext: args.aiContext,
      photoStorageId: args.photoStorageId,
      createdByMembershipId: membership._id,
      updatedByMembershipId: membership._id,
      lastEditedAt: now,
    });
  },
});

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
    const seniorMode =
      args.role === "independent_senior" ? "independent" : "assisted";

    if (existingMembership) {
      if (!isFamilySideRole(existingMembership.role)) {
        throw new Error("This account is already linked to a different experience.");
      }

      if (normalizeFamilySideMembershipRole(existingMembership.role) !== "organiser") {
        throw new Error("This account does not have access to that Circle setting.");
      }

      await ctx.db.patch(existingMembership._id, {
        displayName: organiserName,
        authEmail,
        onboardingStep: args.onboardingStep,
        lastSeenAt: Date.now(),
      });
      await ensureCircleMembershipForLegacyMembership(ctx, existingMembership._id);

      if (seniorDisplayName) {
        if (seniorMode === "independent") {
          const independentSenior = await upsertIndependentSeniorProfile(ctx, {
            familySpaceId: existingMembership.familySpaceId,
            displayName: seniorDisplayName,
          });

          await ctx.db.patch(existingMembership._id, {
            seniorProfileId: independentSenior?._id ?? null,
          });
        } else {
          const assistedSenior = await upsertAssistedSeniorProfile(ctx, {
            familySpaceId: existingMembership.familySpaceId,
            displayName: seniorDisplayName,
          });

          await ctx.db.patch(existingMembership._id, {
            seniorProfileId: assistedSenior?._id ?? null,
          });
        }

        await ctx.db.patch(existingMembership.familySpaceId, {
          displayName: buildCircleName(seniorDisplayName),
        });
        await patchCircleFromFamilySpace(ctx, existingMembership.familySpaceId, {
          displayName: buildCircleName(seniorDisplayName),
        });
      }

      return existingMembership._id;
    }

    const familySpaceId = await ctx.db.insert("familySpaces", {
      displayName: seniorDisplayName
        ? buildCircleName(seniorDisplayName)
        : buildCircleName(organiserName),
      timezone: undefined,
      locale: undefined,
    });

    const circle = await ensureCircleForFamilySpace(ctx, familySpaceId);

    let linkedSeniorProfileId: Id<"seniorProfiles"> | null = null;
    if (seniorDisplayName) {
      const seniorProfile =
        seniorMode === "independent"
          ? await upsertIndependentSeniorProfile(ctx, {
              familySpaceId,
              displayName: seniorDisplayName,
            })
          : await upsertAssistedSeniorProfile(ctx, {
              familySpaceId,
              displayName: seniorDisplayName,
            });

      linkedSeniorProfileId = seniorProfile?._id ?? null;
    }

    const legacyMembershipId = await ctx.db.insert("familySpaceMemberships", {
      familySpaceId,
      authIdentityToken,
      authEmail,
      displayName: organiserName,
      role: "organiser",
      seniorProfileId: linkedSeniorProfileId,
      onboardingStep: args.onboardingStep,
      lastSeenAt: Date.now(),
    });

    await ctx.db.insert("circleMemberships", {
      circleId: circle._id,
      legacyFamilySpaceMembershipId: legacyMembershipId,
      authIdentityToken,
      authEmail,
      displayName: organiserName,
      role: "organiser",
      seniorProfileId: linkedSeniorProfileId,
      onboardingStep: args.onboardingStep,
      lastSeenAt: Date.now(),
    });

    return legacyMembershipId;
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
    const seniorMode =
      args.role === "independent_senior" ? "independent" : "assisted";

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
          familySpaceId: membership.familySpaceId,
          displayName: seniorDisplayName,
        });

        await ctx.db.patch(membership._id, {
          seniorProfileId: independentSenior?._id ?? null,
        });
      } else {
        const assistedSenior = await upsertAssistedSeniorProfile(ctx, {
          familySpaceId: membership.familySpaceId,
          displayName: seniorDisplayName,
        });

        await ctx.db.patch(membership._id, {
          seniorProfileId: assistedSenior?._id ?? null,
        });
      }

      await ctx.db.patch(membership.familySpaceId, {
        displayName: buildCircleName(seniorDisplayName),
      });
      await patchCircleFromFamilySpace(ctx, membership.familySpaceId, {
        displayName: buildCircleName(seniorDisplayName),
      });
    }

    return membership._id;
  },
});

export const getTodayTimeline = query({
  args: {},
  handler: async (ctx) => {
    const familyContext = await getOptionalFamilySpaceMembership(
      ctx,
      "family_side",
    );
    if (!familyContext) {
      return [];
    }

    return await listTodayTimelineForFamilySpace(
      ctx,
      familyContext.membership.familySpaceId,
    );
  },
});

export const getOrganiserDashboardSummary = query({
  args: {},
  handler: async (ctx) => {
    const familyContext = await getOptionalFamilySpaceMembership(
      ctx,
      "family_side",
    );
    if (!familyContext) {
      return { totalFamilyMembers: 0, totalRoutines: 0, statusSummary: "" };
    }

    const [members, routines, nextRoutine] = await Promise.all([
      listPeopleForFamilySpace(ctx, familyContext.membership.familySpaceId, 200),
      ctx.db
        .query("routineSchedules")
        .withIndex("by_familySpaceId", (query) =>
          query.eq("familySpaceId", familyContext.membership.familySpaceId),
        )
        .take(200),
      getNextRoutineEventForFamilySpace(
        ctx,
        familyContext.membership.familySpaceId,
      ),
    ]);

    return {
      totalFamilyMembers: members.length,
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
      membership.familySpaceId,
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
    const { membership } = await requireFamilySideCapability(
      ctx,
      "manage_tablet_access",
    );
    const session = await ctx.db.get(args.sessionId);

    if (
      !session ||
      session.familySpaceId !== membership.familySpaceId ||
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
      membership.familySpaceId,
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
    const familyContext = await getOptionalFamilySpaceMembership(
      ctx,
      "family_side",
    );
    if (!familyContext) {
      return null;
    }

    const seniorProfile =
      familyContext.membership.seniorProfileId !== null
        ? await ctx.db.get(familyContext.membership.seniorProfileId)
        : await getPreferredSeniorProfile(
            familyContext.membership.familySpaceId,
            ctx,
          );

    return {
      _id: familyContext.membership._id,
      familySpaceId: familyContext.membership.familySpaceId,
      organiserName:
        normalizeUserFacingText(familyContext.membership.displayName) ??
        ORGANISER_LABEL,
      seniorDisplayName:
        normalizeUserFacingText(seniorProfile?.displayName) ?? MEMBER_LABEL,
      role:
        normalizeFamilySideMembershipRole(familyContext.membership.role) ??
        "organiser",
      onboardingStep: familyContext.membership.onboardingStep,
      seniorProfileId: seniorProfile?._id ?? null,
      seniorMode: seniorProfile?.seniorMode ?? null,
      authEmail: familyContext.membership.authEmail,
    };
  },
});

