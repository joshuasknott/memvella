import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import {
  getOptionalFamilySpaceMembership,
  getMembershipByAuthIdentityToken,
  getSeniorProfileByMode,
  isFamilySideRole,
  requireFamilySideCapability,
  requireFamilySpaceMembership,
  upsertAssistedSeniorProfile,
  upsertIndependentSeniorProfile,
} from "./familySpaceAuth";
import {
  normalizeOptionalEmail,
  normalizeOptionalText,
} from "./security";
import { revokeSeniorSessionsForProfile } from "./seniorAccessHelpers";
import {
  formatTimeLabel,
  getNextRoutineEventForFamilySpace,
  listTodayTimelineForFamilySpace,
  normalizeDaysOfWeek,
  parseTimeInputToMinutes,
  replaceRoutineOccurrences,
} from "./routineHelpers";
import { scheduleRoutineRetreatCheckIns } from "./routineRetreatScheduler";
import { assertValidStoredUpload } from "./uploadValidation";
import {
  buildCircleName,
  CIRCLE_LABEL,
  MEMBER_LABEL,
  normalizeUserFacingText,
  ORGANISER_LABEL,
  TABLET_PROFILE_LABEL,
} from "./terminology";

const DEFAULT_DAILY_SUMMARY_TIME_MINUTES = 19 * 60;

const legacyRoleValidator = v.optional(
  v.union(
    v.literal("supporter"),
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

function legacyFrequencyToDaysOfWeek(frequency: string[]) {
  if (frequency.includes("Daily")) {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  if (frequency.includes("Weekends")) {
    return [0, 6];
  }

  if (frequency.includes("Weekly")) {
    return [1];
  }

  const dayNameToIndex = new Map([
    ["Sun", 0],
    ["Mon", 1],
    ["Tue", 2],
    ["Wed", 3],
    ["Thu", 4],
    ["Fri", 5],
    ["Sat", 6],
  ]);

  return normalizeDaysOfWeek(
    frequency
      .map((value) => dayNameToIndex.get(value))
      .filter((value): value is number => value !== undefined),
  );
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
    const { membership } = await requireFamilySpaceMembership(ctx, "family_side");
    if (args.photoStorageId) {
      await assertValidStoredUpload(ctx, {
        storageId: args.photoStorageId,
        kind: "image",
      });
    }

    return await ctx.db.insert("familyMembers", {
      familySpaceId: membership.familySpaceId,
      name: args.name,
      relationship: args.relationship,
      isLiving: args.isLiving,
      aiContext: args.aiContext,
      photoStorageId: args.photoStorageId,
    });
  },
});

export const addRoutine = mutation({
  args: {
    routineName: v.string(),
    time: v.string(),
    frequency: v.array(v.string()),
    aiInstructions: v.string(),
  },
  handler: async (ctx, args) => {
    const { membership, familySpace } = await requireFamilySpaceMembership(
      ctx,
      "family_side",
    );

    const title = normalizeOptionalText(args.routineName);
    if (!title) {
      throw new Error("A routine title is required.");
    }

    const daysOfWeek =
      legacyFrequencyToDaysOfWeek(args.frequency).length > 0
        ? legacyFrequencyToDaysOfWeek(args.frequency)
        : [0, 1, 2, 3, 4, 5, 6];
    const startTimeMinutes = parseTimeInputToMinutes(args.time);
    const routineScheduleId = await ctx.db.insert("routineSchedules", {
      familySpaceId: membership.familySpaceId,
      title,
      aiInstructions: normalizeOptionalText(args.aiInstructions) ?? null,
      daysOfWeek,
      startTimeMinutes,
      timeLabel: formatTimeLabel(startTimeMinutes),
      durationMinutes: null,
      timezone: familySpace.timezone ?? "UTC",
      status: "active",
      createdByMembershipId: membership._id,
      updatedByMembershipId: membership._id,
      lastEditedAt: Date.now(),
    });

    const schedule = await ctx.db.get(routineScheduleId);
    if (!schedule) {
      throw new Error("Unable to save this routine.");
    }

    const createdOccurrences = await replaceRoutineOccurrences(ctx, schedule);
    await scheduleRoutineRetreatCheckIns(ctx, createdOccurrences);
    return routineScheduleId;
  },
});

export const updateNotificationSettings = mutation({
  args: {
    dailySummary: v.boolean(),
    urgentAlerts: v.boolean(),
    routineReminders: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "family_side");

    const existing = await ctx.db
      .query("notificationSettings")
      .withIndex("by_familySpaceId", (query) =>
        query.eq("familySpaceId", membership.familySpaceId),
      )
      .unique();
    const updatedAt = Date.now();
    const payload = {
      dailySummary: args.dailySummary,
      urgentAlerts: args.urgentAlerts,
      routineReminders: args.routineReminders,
      dailySummaryTimeMinutes:
        existing?.dailySummaryTimeMinutes ?? DEFAULT_DAILY_SUMMARY_TIME_MINUTES,
      updatedByMembershipId: membership._id,
      updatedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("notificationSettings", {
      familySpaceId: membership.familySpaceId,
      ...payload,
    });
  },
});

export const saveVoiceSessionLog = mutation({
  args: {
    seniorName: v.string(),
    transcript: v.string(),
    durationSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "family_side");

    return await ctx.db.insert("voiceLogs", {
      familySpaceId: membership.familySpaceId,
      seniorName: args.seniorName,
      transcript: args.transcript,
      durationSeconds: args.durationSeconds,
    });
  },
});

export const createOrganiserProfile = mutation({
  args: {
    organiserName: v.optional(v.string()),
    seniorDisplayName: v.optional(v.string()),
    role: legacyRoleValidator,
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

      await ctx.db.patch(existingMembership._id, {
        displayName: organiserName,
        authEmail,
        onboardingStep: args.onboardingStep,
        lastSeenAt: Date.now(),
      });

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

    return await ctx.db.insert("familySpaceMemberships", {
      familySpaceId,
      authIdentityToken,
      authEmail,
      displayName: organiserName,
      role: "organiser",
      seniorProfileId: linkedSeniorProfileId,
      onboardingStep: args.onboardingStep,
      lastSeenAt: Date.now(),
    });
  },
});

export const patchOrganiserProfile = mutation({
  args: {
    organiserName: v.optional(v.string()),
    seniorDisplayName: v.optional(v.string()),
    role: legacyRoleValidator,
    onboardingStep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "family_side");
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
    }

    return membership._id;
  },
});

export const getFamilyDirectory = query({
  args: {},
  handler: async (ctx) => {
    const familyContext = await getOptionalFamilySpaceMembership(
      ctx,
      "family_side",
    );
    if (!familyContext) {
      return [];
    }

    const members = await ctx.db
      .query("familyMembers")
      .withIndex("by_familySpaceId", (query) =>
        query.eq("familySpaceId", familyContext.membership.familySpaceId),
      )
      .take(100);

    return await Promise.all(
      members.map(async (member) => ({
        id: member._id,
        name: member.name,
        relationship: member.relationship,
        isLiving: member.isLiving,
        aiContext: member.aiContext,
        photoUrl: member.photoStorageId
          ? await ctx.storage.getUrl(member.photoStorageId)
          : null,
      })),
    );
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
      ctx.db
        .query("familyMembers")
        .withIndex("by_familySpaceId", (query) =>
          query.eq("familySpaceId", familyContext.membership.familySpaceId),
        )
        .take(200),
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

export const getNotificationSettings = query({
  args: {},
  handler: async (ctx) => {
    const familyContext = await getOptionalFamilySpaceMembership(
      ctx,
      "family_side",
    );
    if (!familyContext) {
      return {
        dailySummary: false,
        urgentAlerts: false,
        routineReminders: false,
      };
    }

    const settings = await ctx.db
      .query("notificationSettings")
      .withIndex("by_familySpaceId", (query) =>
        query.eq("familySpaceId", familyContext.membership.familySpaceId),
      )
      .unique();

    return (
      settings ?? {
        dailySummary: true,
        urgentAlerts: true,
        routineReminders: false,
        dailySummaryTimeMinutes: DEFAULT_DAILY_SUMMARY_TIME_MINUTES,
      }
    );
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
      role: familyContext.membership.role,
      onboardingStep: familyContext.membership.onboardingStep,
      seniorProfileId: seniorProfile?._id ?? null,
      seniorMode: seniorProfile?.seniorMode ?? null,
      authEmail: familyContext.membership.authEmail,
    };
  },
});

export const getFamilySpaceId = query({
  args: {},
  handler: async (ctx): Promise<Id<"familySpaces"> | null> => {
    const familyContext = await getOptionalFamilySpaceMembership(
      ctx,
      "family_side",
    );

    return familyContext?.membership.familySpaceId ?? null;
  },
});
