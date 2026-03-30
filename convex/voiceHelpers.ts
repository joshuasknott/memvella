import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery } from "./_generated/server";
import { summarizeMemory } from "./memoryHelpers";
import {
  listRoutineSchedulesForFamilySpace,
  resolveFamilySpaceTimeZone,
} from "./routineHelpers";
import { buildTranscriptExcerpt } from "./voiceSafety";

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
  return v.union(v.literal("assisted_device"), v.literal("independent_web"));
}

function channelValidator() {
  return v.union(
    v.literal("assisted_voice_loop"),
    v.literal("independent_voice_loop"),
  );
}

function truncateInsightText(value: string, maxLength = 240) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

export const gatherSeniorContext = internalQuery({
  args: {
    familySpaceId: v.id("familySpaces"),
  },
  handler: async (ctx, args) => {
    const [routines, familyMembers, recentMemories, timeZone, familySpace] =
      await Promise.all([
        listRoutineSchedulesForFamilySpace(ctx, args.familySpaceId),
        ctx.db
          .query("familyMembers")
          .withIndex("by_familySpaceId", (query) =>
            query.eq("familySpaceId", args.familySpaceId),
          )
          .take(50),
        ctx.db
          .query("memoryRecords")
          .withIndex("by_familySpaceId_and_lastEditedAt", (query) =>
            query.eq("familySpaceId", args.familySpaceId),
          )
          .order("desc")
          .take(12),
        resolveFamilySpaceTimeZone(ctx, args.familySpaceId),
        ctx.db.get(args.familySpaceId),
      ]);

    return {
      familySpaceName: familySpace?.displayName ?? "FamilySpace",
      timeZone,
      locale: familySpace?.locale ?? "en-US",
      routines: routines.slice(0, 12).map((routine) => ({
        title: routine.title,
        time: routine.time,
        frequency: routine.frequency,
        aiInstructions: routine.aiInstructions,
        startDate: routine.startDate,
        endDate: routine.endDate,
      })),
      familyMembers: familyMembers.map((member) => ({
        name: member.name,
        relationship: member.relationship,
        isLiving: member.isLiving,
        aiContext:
          typeof member.aiContext === "string" ? member.aiContext : "",
      })),
      recentMemories: recentMemories.map((record) => ({
        title: record.title,
        memoryDate: record.memoryDate,
        summary: summarizeMemory(record),
      })),
    };
  },
});

export const saveVoiceInteraction = internalMutation({
  args: {
    familySpaceId: v.id("familySpaces"),
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
      familySpaceId: args.familySpaceId,
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
    const seniorName = seniorProfile?.displayName ?? "Senior";
    const evidenceTranscript = buildTranscriptExcerpt(args.transcript);

    if (args.distressDetected) {
      await ctx.db.insert("supporterInsights", {
        familySpaceId: args.familySpaceId,
        seniorProfileId: args.seniorProfileId,
        sourceVoiceInteractionId: interactionId,
        sourceType: "safety_guardrail",
        insightType: "distress_flag",
        priority: "high",
        title: `Check in with ${seniorName} soon`,
        summary: truncateInsightText(
          `${seniorName} used language that suggests distress. Review the transcript and reach out quickly.`,
        ),
        suggestedAction:
          "Open this interaction, contact the senior directly, and confirm they are safe.",
        evidenceTranscript,
        status: "queued",
        createdAt: now,
        reviewedAt: null,
        reviewedByMembershipId: null,
      });
    }

    if (args.medicalRejected) {
      await ctx.db.insert("supporterInsights", {
        familySpaceId: args.familySpaceId,
        seniorProfileId: args.seniorProfileId,
        sourceVoiceInteractionId: interactionId,
        sourceType: "safety_guardrail",
        insightType: "medical_boundary",
        priority: "normal",
        title: `Review a medical question from ${seniorName}`,
        summary: truncateInsightText(
          `${seniorName} asked for medical guidance. The voice assistant refused the request and logged it for Supporter review.`,
        ),
        suggestedAction:
          "Follow up directly or route the question to a licensed clinician.",
        evidenceTranscript,
        status: "queued",
        createdAt: now,
        reviewedAt: null,
        reviewedByMembershipId: null,
      });
    }

    await ctx.scheduler.runAfter(
      0,
      internal.insightsEngine.processPendingInsights,
      { familySpaceId: args.familySpaceId },
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
    familySpaceId: v.optional(v.id("familySpaces")),
  },
  handler: async (ctx, args) => {
    const familySpaceId = args.familySpaceId;
    const interactions = familySpaceId
      ? await ctx.db
          .query("voiceInteractions")
          .withIndex(
            "by_familySpaceId_and_aiInsightStatus_and_createdAt",
            (query) =>
              query
                .eq("familySpaceId", familySpaceId)
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
        .map((seniorProfile) => [seniorProfile._id, seniorProfile.displayName]),
    );

    return interactions.map((interaction) => ({
      interactionId: interaction._id,
      familySpaceId: interaction.familySpaceId,
      seniorProfileId: interaction.seniorProfileId,
      seniorName:
        seniorNameById.get(interaction.seniorProfileId) ?? "Independent Senior",
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
      .take(10);
  },
});

export const getFamilySpaceInsightTargets = internalQuery({
  args: {
    familySpaceId: v.id("familySpaces"),
  },
  handler: async (ctx, args): Promise<Array<Id<"voiceInteractions">>> => {
    const interactions = await ctx.db
      .query("voiceInteractions")
      .withIndex("by_familySpaceId_and_aiInsightStatus_and_createdAt", (query) =>
        query
          .eq("familySpaceId", args.familySpaceId)
          .eq("aiInsightStatus", "pending"),
      )
      .take(16);

    return interactions.map((interaction) => interaction._id);
  },
});
