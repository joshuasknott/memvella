import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import {
  getMembershipByAuthIdentityToken,
  getSeniorProfileByMode,
  requireFamilySpaceMembership,
  upsertAssistedSeniorProfile,
  upsertIndependentSeniorProfile,
} from "./familySpaceAuth";
import {
  normalizeOptionalEmail,
  normalizeOptionalText,
} from "./security";
import {
  formatTimeLabel,
  getNextRoutineEventForFamilySpace,
  listTodayTimelineForFamilySpace,
  normalizeDaysOfWeek,
  parseTimeInputToMinutes,
  replaceRoutineOccurrences,
} from "./routineHelpers";

const legacyRoleValidator = v.optional(
  v.union(
    v.literal("supporter"),
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
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");

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
      "supporter",
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

    await replaceRoutineOccurrences(ctx, schedule);
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
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");

    const existing = await ctx.db
      .query("notificationSettings")
      .withIndex("by_familySpaceId", (query) =>
        query.eq("familySpaceId", membership.familySpaceId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        dailySummary: args.dailySummary,
        urgentAlerts: args.urgentAlerts,
        routineReminders: args.routineReminders,
      });
      return existing._id;
    }

    return await ctx.db.insert("notificationSettings", {
      familySpaceId: membership.familySpaceId,
      dailySummary: args.dailySummary,
      urgentAlerts: args.urgentAlerts,
      routineReminders: args.routineReminders,
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
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");

    return await ctx.db.insert("voiceLogs", {
      familySpaceId: membership.familySpaceId,
      seniorName: args.seniorName,
      transcript: args.transcript,
      durationSeconds: args.durationSeconds,
    });
  },
});

export const createSupporterProfile = mutation({
  args: {
    supporterName: v.optional(v.string()),
    seniorDisplayName: v.optional(v.string()),
    role: legacyRoleValidator,
    onboardingStep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated: a valid Supporter session is required.");
    }

    const authIdentityToken = identity.tokenIdentifier;
    const authEmail = normalizeOptionalEmail(identity.email) ?? null;

    const existingMembership = await getMembershipByAuthIdentityToken(
      ctx,
      authIdentityToken,
    );

    const supporterName = normalizeOptionalText(args.supporterName) ?? "Supporter";
    const seniorDisplayName = normalizeOptionalText(args.seniorDisplayName);
    const seniorMode =
      args.role === "independent_senior" ? "independent" : "assisted";

    if (existingMembership) {
      if (existingMembership.role !== "supporter") {
        throw new Error("This account is already linked to a different experience.");
      }

      await ctx.db.patch(existingMembership._id, {
        displayName: supporterName,
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
          displayName: `${seniorDisplayName} FamilySpace`,
        });
      }

      return existingMembership._id;
    }

    const familySpaceId = await ctx.db.insert("familySpaces", {
      displayName: seniorDisplayName
        ? `${seniorDisplayName} FamilySpace`
        : `${supporterName} FamilySpace`,
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
      displayName: supporterName,
      role: "supporter",
      seniorProfileId: linkedSeniorProfileId,
      onboardingStep: args.onboardingStep,
      lastSeenAt: Date.now(),
    });
  },
});

export const patchSupporterProfile = mutation({
  args: {
    supporterName: v.optional(v.string()),
    seniorDisplayName: v.optional(v.string()),
    role: legacyRoleValidator,
    onboardingStep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
    const supporterName = normalizeOptionalText(args.supporterName);
    const seniorDisplayName = normalizeOptionalText(args.seniorDisplayName);
    const seniorMode =
      args.role === "independent_senior" ? "independent" : "assisted";

    if (supporterName || args.onboardingStep !== undefined) {
      await ctx.db.patch(membership._id, {
        ...(supporterName ? { displayName: supporterName } : {}),
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
        displayName: `${seniorDisplayName} FamilySpace`,
      });
    }

    return membership._id;
  },
});

export const getFamilyDirectory = query({
  args: {},
  handler: async (ctx) => {
    const membership = await requireFamilySpaceMembership(ctx, "supporter").catch(
      () => null,
    );
    if (!membership) {
      return [];
    }

    const members = await ctx.db
      .query("familyMembers")
      .withIndex("by_familySpaceId", (query) =>
        query.eq("familySpaceId", membership.membership.familySpaceId),
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
    const membership = await requireFamilySpaceMembership(ctx, "supporter").catch(
      () => null,
    );
    if (!membership) {
      return [];
    }

    return await listTodayTimelineForFamilySpace(
      ctx,
      membership.membership.familySpaceId,
    );
  },
});

export const getSupporterDashboardSummary = query({
  args: {},
  handler: async (ctx) => {
    const supporterContext = await requireFamilySpaceMembership(ctx, "supporter").catch(
      () => null,
    );
    if (!supporterContext) {
      return { totalFamilyMembers: 0, totalRoutines: 0, statusSummary: "" };
    }

    const [members, routines, nextRoutine] = await Promise.all([
      ctx.db
        .query("familyMembers")
        .withIndex("by_familySpaceId", (query) =>
          query.eq("familySpaceId", supporterContext.membership.familySpaceId),
        )
        .take(200),
      ctx.db
        .query("routineSchedules")
        .withIndex("by_familySpaceId", (query) =>
          query.eq("familySpaceId", supporterContext.membership.familySpaceId),
        )
        .take(200),
      getNextRoutineEventForFamilySpace(
        ctx,
        supporterContext.membership.familySpaceId,
      ),
    ]);

    return {
      totalFamilyMembers: members.length,
      totalRoutines: routines.length,
      statusSummary: nextRoutine
        ? `${nextRoutine.title} is next at ${nextRoutine.time}.`
        : "Your FamilySpace is ready for today.",
    };
  },
});

export const getNotificationSettings = query({
  args: {},
  handler: async (ctx) => {
    const supporterContext = await requireFamilySpaceMembership(ctx, "supporter").catch(
      () => null,
    );
    if (!supporterContext) {
      return {
        dailySummary: false,
        urgentAlerts: false,
        routineReminders: false,
      };
    }

    const settings = await ctx.db
      .query("notificationSettings")
      .withIndex("by_familySpaceId", (query) =>
        query.eq("familySpaceId", supporterContext.membership.familySpaceId),
      )
      .unique();

    return (
      settings ?? {
        dailySummary: false,
        urgentAlerts: false,
        routineReminders: false,
      }
    );
  },
});

export const getSupporterProfile = query({
  args: {},
  handler: async (ctx) => {
    const supporterContext = await requireFamilySpaceMembership(ctx, "supporter").catch(
      () => null,
    );
    if (!supporterContext) {
      return null;
    }

    const seniorProfile =
      supporterContext.membership.seniorProfileId !== null
        ? await ctx.db.get(supporterContext.membership.seniorProfileId)
        : await getPreferredSeniorProfile(
            supporterContext.membership.familySpaceId,
            ctx,
          );

    return {
      _id: supporterContext.membership._id,
      familySpaceId: supporterContext.membership.familySpaceId,
      supporterName: supporterContext.membership.displayName,
      seniorDisplayName: seniorProfile?.displayName,
      role: "supporter" as const,
      onboardingStep: supporterContext.membership.onboardingStep,
      seniorProfileId: seniorProfile?._id ?? null,
      seniorMode: seniorProfile?.seniorMode ?? null,
      authEmail: supporterContext.membership.authEmail,
    };
  },
});

export const getFamilySpaceId = query({
  args: {},
  handler: async (ctx): Promise<Id<"familySpaces"> | null> => {
    const supporterContext = await requireFamilySpaceMembership(ctx, "supporter").catch(
      () => null,
    );

    return supporterContext?.membership.familySpaceId ?? null;
  },
});
