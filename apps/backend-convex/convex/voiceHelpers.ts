import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery } from "./_generated/server";
import { summarizeMemory } from "./memoryHelpers";
import {
  listRoutineSchedulesForSenior,
  resolveCircleRuntimeDetails,
} from "./routineHelpers";
import { buildTranscriptExcerpt } from "./voiceSafety";
import { MEMBER_LABEL, normalizeUserFacingText } from "./terminology";
import { listPeopleForSeniorProfile } from "./people";

async function resolveSeniorCircleContext(
  ctx: Parameters<typeof resolveCircleRuntimeDetails>[0],
  seniorProfileId: Id<"seniorProfiles">,
) {
  const seniorProfile = await ctx.db.get(seniorProfileId);
  if (!seniorProfile) {
    throw new Error("This senior profile is no longer available.");
  }

  const circleDetails = await resolveCircleRuntimeDetails(ctx, seniorProfile.circleId);

  return {
    seniorProfile,
    circleDetails,
  };
}

function voiceIntentValidator() {
  return v.union(
    v.literal("conversation"),
    v.literal("memory_draft"),
    v.literal("routine_draft"),
    v.literal("medical_rejection"),
    v.literal("unknown"),
  );
}

function draftConfirmationStatusValidator() {
  return v.union(
    v.literal("not_applicable"),
    v.literal("pending"),
    v.literal("confirmed"),
    v.literal("rejected"),
  );
}

function sessionTypeValidator() {
  return v.literal("assisted_device");
}

function channelValidator() {
  return v.literal("assisted_voice_loop");
}

function truncateInsightText(value: string, maxLength = 240) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

function truncatePromptField(value: string | null | undefined, maxLength: number) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) {
    return null;
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

export const gatherSeniorContext = internalQuery({
  args: {
    seniorProfileId: v.id("seniorProfiles"),
    recentInteractionLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const recentInteractionLimit = Math.min(
      Math.max(args.recentInteractionLimit ?? 5, 3),
      5,
    );
    const [{ seniorProfile, circleDetails }, routines, recentMemories, recentVoiceInteractions] =
      await Promise.all([
        resolveSeniorCircleContext(ctx, args.seniorProfileId),
        listRoutineSchedulesForSenior(ctx, args.seniorProfileId, 6),
        ctx.db
          .query("memoryRecords")
          .withIndex("by_seniorProfileId_and_lastEditedAt", (query) =>
            query.eq("seniorProfileId", args.seniorProfileId),
          )
          .order("desc")
          .take(4),
        ctx.db
          .query("voiceInteractions")
          .withIndex("by_seniorProfileId_and_createdAt", (query) =>
            query.eq("seniorProfileId", args.seniorProfileId),
          )
          .order("desc")
          .take(recentInteractionLimit),
      ]);

    if (seniorProfile.seniorMode !== "assisted") {
      throw new Error("The assisted voice context is not linked to this Workspace.");
    }

    const people = await listPeopleForSeniorProfile(ctx, seniorProfile._id, 8);

    return {
      circleName: circleDetails.circleName,
      timeZone: circleDetails.timeZone,
      locale: circleDetails.locale,
      routines: routines.map((routine) => ({
        title: routine.title,
        time: routine.time,
        frequency: routine.frequency,
        aiInstructions: truncatePromptField(routine.aiInstructions, 72),
        startDate: routine.startDate,
        endDate: routine.endDate,
      })),
      people: people.map((person) => ({
        name: person.name,
        relationship: person.relationship,
        isLiving: person.isLiving,
        aiContext: truncatePromptField(person.aiContext, 96) ?? "",
      })),
      recentMemories: recentMemories.map((record) => ({
        title: record.title,
        memoryDate: record.memoryDate,
        summary:
          truncatePromptField(summarizeMemory(record), 96) ??
          "No details added yet.",
      })),
      recentVoiceInteractions: recentVoiceInteractions.map((interaction) => ({
        transcript:
          truncatePromptField(
            buildTranscriptExcerpt(interaction.transcript, 140),
            140,
          ) ?? "No transcript available.",
        assistantResponse: truncatePromptField(interaction.assistantResponse, 140),
        intentType: interaction.intentType,
        distressDetected: interaction.distressDetected,
        createdAt: interaction.createdAt,
      })),
    };
  },
});

export const getSeniorLocaleContext = internalQuery({
  args: {
    seniorProfileId: v.id("seniorProfiles"),
  },
  handler: async (ctx, args) => {
    const { circleDetails } = await resolveSeniorCircleContext(
      ctx,
      args.seniorProfileId,
    );

    return {
      circleName: circleDetails.circleName,
      timeZone: circleDetails.timeZone,
      locale: circleDetails.locale,
    };
  },
});

export const saveVoiceInteraction = internalMutation({
  args: {
    circleId: v.union(v.id("circles"), v.null()),
    seniorProfileId: v.id("seniorProfiles"),
    sessionType: sessionTypeValidator(),
    channel: channelValidator(),
    transcript: v.string(),
    assistantResponse: v.union(v.string(), v.null()),
    medicalRejected: v.boolean(),
    medicalMarkers: v.array(v.string()),
    distressDetected: v.boolean(),
    distressMarkers: v.array(v.string()),
    intentType: voiceIntentValidator(),
    draftTitle: v.union(v.string(), v.null()),
    draftDescription: v.union(v.string(), v.null()),
    draftDate: v.union(v.string(), v.null()),
    draftTimeLabel: v.union(v.string(), v.null()),
    draftTimeMinutes: v.union(v.number(), v.null()),
    draftDaysOfWeek: v.array(v.number()),
    draftConfirmationStatus: draftConfirmationStatusValidator(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const interactionId = await ctx.db.insert("voiceInteractions", {
      circleId: args.circleId,
      seniorProfileId: args.seniorProfileId,
      sessionType: args.sessionType,
      channel: args.channel,
      transcript: args.transcript,
      assistantResponse: args.assistantResponse,
      medicalRejected: args.medicalRejected,
      medicalMarkers: args.medicalMarkers,
      distressDetected: args.distressDetected,
      distressMarkers: args.distressMarkers,
      intentType: args.intentType,
      draftTitle: args.draftTitle,
      draftDescription: args.draftDescription,
      draftDate: args.draftDate,
      draftTimeLabel: args.draftTimeLabel,
      draftTimeMinutes: args.draftTimeMinutes,
      draftDaysOfWeek: args.draftDaysOfWeek,
      draftConfirmationStatus: args.draftConfirmationStatus,
      savedMemoryRecordId: null,
      savedRoutineScheduleId: null,
      aiInsightStatus: "pending",
      aiProcessedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    const seniorProfile = await ctx.db.get(args.seniorProfileId);
    const seniorName =
      normalizeUserFacingText(seniorProfile?.displayName) ?? MEMBER_LABEL;
    const evidenceTranscript = buildTranscriptExcerpt(args.transcript);

    if (args.distressDetected) {
      const alertId = await ctx.db.insert("alerts", {
        circleId: args.circleId,
        seniorProfileId: args.seniorProfileId,
        sourceVoiceInteractionId: interactionId,
        sourceType: "safety_guardrail",
        alertType: "distress_flag",
        priority: "high",
        title: `Check in with ${seniorName} soon`,
        summary: truncateInsightText(
          `${seniorName} used language that suggests distress. Review the transcript and reach out quickly.`,
        ),
        suggestedAction:
          "Open this interaction, contact them directly, and confirm they are safe.",
        evidenceTranscript,
        status: "queued",
        createdAt: now,
        reviewedAt: null,
        reviewedByCircleMembershipId: null,
      });
      await ctx.scheduler.runAfter(
        0,
        internal.notificationsWorker.dispatchUrgentAlertNotification,
        { alertId },
      );
    }

    if (args.medicalRejected) {
      await ctx.db.insert("alerts", {
        circleId: args.circleId,
        seniorProfileId: args.seniorProfileId,
        sourceVoiceInteractionId: interactionId,
        sourceType: "safety_guardrail",
        alertType: "medical_boundary",
        priority: "normal",
        title: `Review a medical question from ${seniorName}`,
        summary: truncateInsightText(
          `${seniorName} asked for medical guidance. The voice assistant refused the request and logged it for Workspace review.`,
        ),
        suggestedAction:
          "Follow up directly or route the question to a licensed clinician.",
        evidenceTranscript,
        status: "queued",
        createdAt: now,
        reviewedAt: null,
        reviewedByCircleMembershipId: null,
      });
    }

    await ctx.scheduler.runAfter(
      0,
      internal.insightsEngine.processPendingInsights,
      args.circleId ? { circleId: args.circleId } : {},
    );

    return interactionId;
  },
});

export const markVoiceDraftOutcome = internalMutation({
  args: {
    interactionId: v.id("voiceInteractions"),
    draftConfirmationStatus: v.union(
      v.literal("confirmed"),
      v.literal("rejected"),
    ),
    savedMemoryRecordId: v.optional(v.id("memoryRecords")),
    savedRoutineScheduleId: v.optional(v.id("routineSchedules")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.interactionId, {
      draftConfirmationStatus: args.draftConfirmationStatus,
      savedMemoryRecordId: args.savedMemoryRecordId ?? null,
      savedRoutineScheduleId: args.savedRoutineScheduleId ?? null,
      updatedAt: Date.now(),
    });

    return args.interactionId;
  },
});

export const listPendingVoiceInteractionsForInsights = internalQuery({
  args: {
    circleId: v.optional(v.id("circles")),
  },
  handler: async (ctx, args) => {
    const circleId = args.circleId;
    const interactions = circleId
      ? await ctx.db
          .query("voiceInteractions")
          .withIndex(
            "by_circleId_and_aiInsightStatus_and_createdAt",
            (query) =>
              query
                .eq("circleId", circleId)
                .eq("aiInsightStatus", "pending"),
          )
          .take(16)
      : await ctx.db
          .query("voiceInteractions")
          .withIndex("by_aiInsightStatus_and_createdAt", (query) =>
            query.eq("aiInsightStatus", "pending"),
          )
          .take(24);

    const seniorProfiles = await Promise.all(
      interactions.map((interaction) => ctx.db.get(interaction.seniorProfileId)),
    );
    const seniorNameById = new Map(
      seniorProfiles
      .filter(
        (seniorProfile): seniorProfile is NonNullable<typeof seniorProfile> =>
          seniorProfile !== null,
      )
        .map((seniorProfile) => [
          seniorProfile._id,
          normalizeUserFacingText(seniorProfile.displayName) ?? MEMBER_LABEL,
        ]),
    );

    return interactions.map((interaction) => ({
      interactionId: interaction._id,
      circleId: interaction.circleId,
      seniorProfileId: interaction.seniorProfileId,
      seniorName:
        seniorNameById.get(interaction.seniorProfileId) ?? MEMBER_LABEL,
      sessionType: interaction.sessionType,
      channel: interaction.channel,
      transcript: interaction.transcript,
      assistantResponse: interaction.assistantResponse,
      medicalRejected: interaction.medicalRejected,
      distressDetected: interaction.distressDetected,
      intentType: interaction.intentType,
      draftConfirmationStatus: interaction.draftConfirmationStatus,
      createdAt: interaction.createdAt,
    }));
  },
});

export const getVoiceInteractionById = internalQuery({
  args: {
    interactionId: v.id("voiceInteractions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.interactionId);
  },
});

export const markVoiceInteractionsAiProcessed = internalMutation({
  args: {
    interactionIds: v.array(v.id("voiceInteractions")),
  },
  handler: async (ctx, args) => {
    const processedAt = Date.now();
    for (const interactionId of args.interactionIds) {
      await ctx.db.patch(interactionId, {
        aiInsightStatus: "processed",
        aiProcessedAt: processedAt,
        updatedAt: processedAt,
      });
    }

    return args.interactionIds;
  },
});

export const getRecentVoiceInteractionsForSenior = internalQuery({
  args: {
    seniorProfileId: v.id("seniorProfiles"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("voiceInteractions")
      .withIndex("by_seniorProfileId_and_createdAt", (query) =>
        query.eq("seniorProfileId", args.seniorProfileId),
      )
      .order("desc")
      .take(5);
  },
});

export const getCircleInsightTargets = internalQuery({
  args: {
    circleId: v.id("circles"),
  },
  handler: async (ctx, args): Promise<Array<Id<"voiceInteractions">>> => {
    const interactions = await ctx.db
      .query("voiceInteractions")
      .withIndex("by_circleId_and_aiInsightStatus_and_createdAt", (query) =>
        query
          .eq("circleId", args.circleId)
          .eq("aiInsightStatus", "pending"),
      )
      .take(16);

    return interactions.map((interaction) => interaction._id);
  },
});
