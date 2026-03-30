import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import {
  query,
  mutation,
  internalMutation,
  type QueryCtx,
} from "./_generated/server";
import { requireFamilySpaceMembership } from "./familySpaceAuth";

function aiInsightTypeValidator() {
  return v.union(
    v.literal("memory_theme"),
    v.literal("routine_follow_up"),
    v.literal("connection_prompt"),
    v.literal("wellness_pattern"),
  );
}

function priorityValidator() {
  return v.union(v.literal("high"), v.literal("normal"));
}

function truncateValue(value: string, maxLength = 280) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

async function enrichInsights<
  T extends Doc<"supporterInsights">,
>(ctx: QueryCtx, insights: T[]) {
  const seniorProfiles = await Promise.all(
    insights.map((insight) => ctx.db.get(insight.seniorProfileId)),
  );
  const seniorNameById = new Map(
    seniorProfiles
      .filter(
        (seniorProfile): seniorProfile is NonNullable<typeof seniorProfile> =>
          seniorProfile !== null,
      )
      .map((seniorProfile) => [seniorProfile._id, seniorProfile.displayName]),
  );

  return insights.map((insight) => ({
    id: insight._id,
    title: insight.title,
    summary: insight.summary,
    suggestedAction: insight.suggestedAction,
    evidenceTranscript: insight.evidenceTranscript,
    priority: insight.priority,
    status: insight.status,
    sourceType: insight.sourceType,
    insightType: insight.insightType,
    createdAt: insight.createdAt,
    reviewedAt: insight.reviewedAt,
    seniorName: seniorNameById.get(insight.seniorProfileId) ?? "Senior",
  }));
}

export const listSupporterInsights = query({
  args: {},
  handler: async (ctx) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
    const [queued, reviewed] = await Promise.all([
      ctx.db
        .query("supporterInsights")
        .withIndex("by_familySpaceId_and_status_and_createdAt", (query) =>
          query.eq("familySpaceId", membership.familySpaceId).eq("status", "queued"),
        )
        .order("desc")
        .take(30),
      ctx.db
        .query("supporterInsights")
        .withIndex("by_familySpaceId_and_status_and_createdAt", (query) =>
          query
            .eq("familySpaceId", membership.familySpaceId)
            .eq("status", "reviewed"),
        )
        .order("desc")
        .take(20),
    ]);

    return {
      queued: await enrichInsights(ctx, queued),
      reviewed: await enrichInsights(ctx, reviewed),
    };
  },
});

export const getQueuedSupporterInsightCount = query({
  args: {},
  handler: async (ctx) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
    const queued = await ctx.db
      .query("supporterInsights")
      .withIndex("by_familySpaceId_and_status_and_createdAt", (query) =>
        query.eq("familySpaceId", membership.familySpaceId).eq("status", "queued"),
      )
      .take(100);

    return queued.length;
  },
});

export const reviewSupporterInsight = mutation({
  args: {
    insightId: v.id("supporterInsights"),
    status: v.union(v.literal("reviewed"), v.literal("dismissed")),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
    const insight = await ctx.db.get(args.insightId);

    if (!insight || insight.familySpaceId !== membership.familySpaceId) {
      throw new Error("This insight is not available in your FamilySpace.");
    }

    await ctx.db.patch(insight._id, {
      status: args.status,
      reviewedAt: Date.now(),
      reviewedByMembershipId: membership._id,
    });

    return insight._id;
  },
});

export const storeAiInsightsBatch = internalMutation({
  args: {
    familySpaceId: v.id("familySpaces"),
    processedInteractionIds: v.array(v.id("voiceInteractions")),
    insights: v.array(
      v.object({
        seniorProfileId: v.id("seniorProfiles"),
        sourceVoiceInteractionId: v.union(v.id("voiceInteractions"), v.null()),
        insightType: aiInsightTypeValidator(),
        priority: priorityValidator(),
        title: v.string(),
        summary: v.string(),
        suggestedAction: v.string(),
        evidenceTranscript: v.union(v.string(), v.null()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const createdAt = Date.now();

    for (const insight of args.insights) {
      await ctx.db.insert("supporterInsights", {
        familySpaceId: args.familySpaceId,
        seniorProfileId: insight.seniorProfileId,
        sourceVoiceInteractionId: insight.sourceVoiceInteractionId,
        sourceType: "ai_pipeline",
        insightType: insight.insightType,
        priority: insight.priority,
        title: truncateValue(insight.title, 120),
        summary: truncateValue(insight.summary, 280),
        suggestedAction: truncateValue(insight.suggestedAction, 220),
        evidenceTranscript: insight.evidenceTranscript
          ? truncateValue(insight.evidenceTranscript, 220)
          : null,
        status: "queued",
        createdAt,
        reviewedAt: null,
        reviewedByMembershipId: null,
      });
    }

    for (const interactionId of args.processedInteractionIds) {
      await ctx.db.patch(interactionId, {
        aiInsightStatus: "processed",
        aiProcessedAt: createdAt,
        updatedAt: createdAt,
      });
    }

    return {
      createdInsightCount: args.insights.length,
      processedInteractionCount: args.processedInteractionIds.length,
    };
  },
});
