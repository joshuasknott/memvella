import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import {
  query,
  mutation,
  internalMutation,
  type QueryCtx,
} from "./_generated/server";
import {
  getOptionalFamilySpaceMembership,
  requireFamilySpaceMembership,
} from "./familySpaceAuth";
import { MEMBER_LABEL, normalizeUserFacingText } from "./terminology";
import {
  listCanonicalAlertsForFamilySpace,
  listCanonicalInsightsForFamilySpace,
} from "./insightsCompat";

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

type CanonicalAwarenessRecord = Doc<"insights"> | Doc<"alerts">;

export function resolveReviewableInsightTarget(args: {
  membershipId: Id<"familySpaceMemberships">;
  membershipFamilySpaceId: Id<"familySpaces">;
  status: "reviewed" | "dismissed";
  now: number;
  insight: Pick<Doc<"insights">, "_id" | "familySpaceId"> | null;
  alert: Pick<Doc<"alerts">, "_id" | "familySpaceId"> | null;
}) {
  const patch = {
    status: args.status,
    reviewedAt: args.now,
    reviewedByMembershipId: args.membershipId,
  };

  if (args.insight && args.insight.familySpaceId === args.membershipFamilySpaceId) {
    return {
      table: "insights" as const,
      id: args.insight._id,
      patch,
    };
  }

  if (args.alert && args.alert.familySpaceId === args.membershipFamilySpaceId) {
    return {
      table: "alerts" as const,
      id: args.alert._id,
      patch,
    };
  }

  return null;
}

function resolveInsightType(insight: CanonicalAwarenessRecord) {
  if ("insightType" in insight) {
    return insight.insightType;
  }

  return insight.alertType;
}

async function enrichInsights(
  ctx: QueryCtx,
  insights: CanonicalAwarenessRecord[],
) {
  const seniorProfiles = await Promise.all(
    insights.map((insight) => ctx.db.get(insight.seniorProfileId)),
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

  return insights.map((insight) => ({
    id: insight._id,
    title: insight.title,
    summary: insight.summary,
    suggestedAction: insight.suggestedAction,
    evidenceTranscript: insight.evidenceTranscript,
    priority: insight.priority,
    status: insight.status,
    sourceType: insight.sourceType,
    insightType: resolveInsightType(insight),
    createdAt: insight.createdAt,
    reviewedAt: insight.reviewedAt,
    seniorName: seniorNameById.get(insight.seniorProfileId) ?? MEMBER_LABEL,
  }));
}

export const listOrganiserInsights = query({
  args: {},
  handler: async (ctx) => {
    const familyContext = await getOptionalFamilySpaceMembership(
      ctx,
      "family_side",
    );
    if (!familyContext) {
      return {
        queued: [] as Awaited<ReturnType<typeof enrichInsights>>,
        reviewed: [] as Awaited<ReturnType<typeof enrichInsights>>,
      };
    }

    const { membership } = familyContext;
    const [queuedInsights, queuedAlerts, reviewedInsights, reviewedAlerts] =
      await Promise.all([
        listCanonicalInsightsForFamilySpace(
          ctx,
          membership.familySpaceId,
          "queued",
          30,
        ),
        listCanonicalAlertsForFamilySpace(
          ctx,
          membership.familySpaceId,
          "queued",
          30,
        ),
        listCanonicalInsightsForFamilySpace(
          ctx,
          membership.familySpaceId,
          "reviewed",
          20,
        ),
        listCanonicalAlertsForFamilySpace(
          ctx,
          membership.familySpaceId,
          "reviewed",
          20,
        ),
      ]);

    const queued = [...queuedInsights, ...queuedAlerts]
      .sort((left, right) => right.createdAt - left.createdAt)
      .slice(0, 30);
    const reviewed = [...reviewedInsights, ...reviewedAlerts]
      .sort((left, right) => right.createdAt - left.createdAt)
      .slice(0, 20);

    return {
      queued: await enrichInsights(ctx, queued),
      reviewed: await enrichInsights(ctx, reviewed),
    };
  },
});

export const getQueuedOrganiserInsightCount = query({
  args: {},
  handler: async (ctx) => {
    const familyContext = await getOptionalFamilySpaceMembership(
      ctx,
      "family_side",
    );
    if (!familyContext) {
      return 0;
    }

    const { membership } = familyContext;
    const [queuedInsights, queuedAlerts] = await Promise.all([
      listCanonicalInsightsForFamilySpace(
        ctx,
        membership.familySpaceId,
        "queued",
        100,
      ),
      listCanonicalAlertsForFamilySpace(
        ctx,
        membership.familySpaceId,
        "queued",
        100,
      ),
    ]);

    return queuedInsights.length + queuedAlerts.length;
  },
});

export const reviewOrganiserInsight = mutation({
  args: {
    insightId: v.union(v.id("insights"), v.id("alerts")),
    status: v.union(v.literal("reviewed"), v.literal("dismissed")),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "family_side");
    const now = Date.now();

    const canonicalInsight = await ctx.db.get(
      args.insightId as Id<"insights">,
    );
    const canonicalAlert = await ctx.db.get(args.insightId as Id<"alerts">);
    const reviewTarget = resolveReviewableInsightTarget({
      membershipId: membership._id,
      membershipFamilySpaceId: membership.familySpaceId,
      status: args.status,
      now,
      insight: canonicalInsight,
      alert: canonicalAlert,
    });

    if (reviewTarget) {
      await ctx.db.patch(reviewTarget.id, reviewTarget.patch);
      return reviewTarget.id;
    }

    throw new Error("This insight is not available in your Circle.");
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
      await ctx.db.insert("insights", {
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
        legacySupporterInsightId: null,
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
