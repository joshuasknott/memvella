import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

type LegacySupporterInsight = Doc<"supporterInsights">;
type CanonicalInsight = Doc<"insights">;
type CanonicalAlert = Doc<"alerts">;

export function shouldMirrorCanonicalInsightsToLegacy() {
  return false;
}

function isAlertInsightType(
  insightType: LegacySupporterInsight["insightType"],
) {
  return insightType === "distress_flag" || insightType === "medical_boundary";
}

function toCanonicalStatus(status: LegacySupporterInsight["status"]) {
  switch (status) {
    case "reviewed":
      return "reviewed" as const;
    case "dismissed":
      return "dismissed" as const;
    default:
      return "queued" as const;
  }
}

function toCanonicalPriority(priority: LegacySupporterInsight["priority"]) {
  return priority === "high" ? "high" : "normal";
}

function toCanonicalSourceType(sourceType: LegacySupporterInsight["sourceType"]) {
  return sourceType;
}

function toAlertType(insightType: LegacySupporterInsight["insightType"]) {
  switch (insightType) {
    case "distress_flag":
      return "distress_flag" as const;
    case "medical_boundary":
      return "medical_boundary" as const;
    default:
      return "escalation" as const;
  }
}

function toInsightType(
  insightType: LegacySupporterInsight["insightType"],
): CanonicalInsight["insightType"] {
  switch (insightType) {
    case "memory_theme":
    case "routine_follow_up":
    case "connection_prompt":
    case "wellness_pattern":
      return insightType;
    default:
      return "wellness_pattern";
  }
}

export async function mirrorLegacySupporterInsightToCanonical(
  ctx: MutationCtx,
  legacyInsightId: Id<"supporterInsights">,
) {
  const legacyInsight = await ctx.db.get(legacyInsightId);
  if (!legacyInsight) {
    return null;
  }

  if (isAlertInsightType(legacyInsight.insightType)) {
    const existingAlert = await ctx.db
      .query("alerts")
      .withIndex("by_legacySupporterInsightId", (query) =>
        query.eq("legacySupporterInsightId", legacyInsightId),
      )
      .unique();
    if (existingAlert) {
      return existingAlert;
    }

    const alertId = await ctx.db.insert("alerts", {
      familySpaceId: legacyInsight.familySpaceId,
      seniorProfileId: legacyInsight.seniorProfileId,
      sourceVoiceInteractionId: legacyInsight.sourceVoiceInteractionId,
      sourceType: toCanonicalSourceType(legacyInsight.sourceType),
      alertType: toAlertType(legacyInsight.insightType),
      priority: toCanonicalPriority(legacyInsight.priority),
      title: legacyInsight.title,
      summary: legacyInsight.summary,
      suggestedAction: legacyInsight.suggestedAction,
      evidenceTranscript: legacyInsight.evidenceTranscript,
      status: toCanonicalStatus(legacyInsight.status),
      createdAt: legacyInsight.createdAt,
      reviewedAt: legacyInsight.reviewedAt,
      reviewedByMembershipId: legacyInsight.reviewedByMembershipId,
      legacySupporterInsightId: legacyInsight._id,
    });

    return await ctx.db.get(alertId);
  }

  const existingInsight = await ctx.db
    .query("insights")
    .withIndex("by_legacySupporterInsightId", (query) =>
      query.eq("legacySupporterInsightId", legacyInsightId),
    )
    .unique();
  if (existingInsight) {
    return existingInsight;
  }

  const insightId = await ctx.db.insert("insights", {
    familySpaceId: legacyInsight.familySpaceId,
    seniorProfileId: legacyInsight.seniorProfileId,
    sourceVoiceInteractionId: legacyInsight.sourceVoiceInteractionId,
    sourceType: toCanonicalSourceType(legacyInsight.sourceType),
    insightType: toInsightType(legacyInsight.insightType),
    priority: toCanonicalPriority(legacyInsight.priority),
    title: legacyInsight.title,
    summary: legacyInsight.summary,
    suggestedAction: legacyInsight.suggestedAction,
    evidenceTranscript: legacyInsight.evidenceTranscript,
    status: toCanonicalStatus(legacyInsight.status),
    createdAt: legacyInsight.createdAt,
    reviewedAt: legacyInsight.reviewedAt,
    reviewedByMembershipId: legacyInsight.reviewedByMembershipId,
    legacySupporterInsightId: legacyInsight._id,
  });

  return await ctx.db.get(insightId);
}

export async function mirrorCanonicalInsightToLegacy(
  ctx: MutationCtx,
  canonicalInsightId: Id<"insights">,
) {
  if (!shouldMirrorCanonicalInsightsToLegacy()) {
    return null;
  }

  const canonicalInsight = await ctx.db.get(canonicalInsightId);
  if (!canonicalInsight) {
    return null;
  }

  if (canonicalInsight.legacySupporterInsightId) {
    const existingLegacy = await ctx.db.get(canonicalInsight.legacySupporterInsightId);
    if (existingLegacy) {
      return existingLegacy;
    }
  }

  const legacyId = await ctx.db.insert("supporterInsights", {
    familySpaceId: canonicalInsight.familySpaceId,
    seniorProfileId: canonicalInsight.seniorProfileId,
    sourceVoiceInteractionId: canonicalInsight.sourceVoiceInteractionId,
    sourceType: canonicalInsight.sourceType,
    insightType: canonicalInsight.insightType,
    priority: canonicalInsight.priority,
    title: canonicalInsight.title,
    summary: canonicalInsight.summary,
    suggestedAction: canonicalInsight.suggestedAction,
    evidenceTranscript: canonicalInsight.evidenceTranscript,
    status: canonicalInsight.status,
    createdAt: canonicalInsight.createdAt,
    reviewedAt: canonicalInsight.reviewedAt,
    reviewedByMembershipId: canonicalInsight.reviewedByMembershipId,
  });

  await ctx.db.patch(canonicalInsight._id, {
    legacySupporterInsightId: legacyId,
  });

  return await ctx.db.get(legacyId);
}

export async function mirrorCanonicalAlertToLegacy(
  ctx: MutationCtx,
  canonicalAlertId: Id<"alerts">,
) {
  if (!shouldMirrorCanonicalInsightsToLegacy()) {
    return null;
  }

  const canonicalAlert = await ctx.db.get(canonicalAlertId);
  if (!canonicalAlert) {
    return null;
  }

  if (canonicalAlert.legacySupporterInsightId) {
    const existingLegacy = await ctx.db.get(canonicalAlert.legacySupporterInsightId);
    if (existingLegacy) {
      return existingLegacy;
    }
  }

  const insightType =
    canonicalAlert.alertType === "distress_flag"
      ? "distress_flag"
      : canonicalAlert.alertType === "medical_boundary"
        ? "medical_boundary"
        : "medical_boundary";

  const legacyId = await ctx.db.insert("supporterInsights", {
    familySpaceId: canonicalAlert.familySpaceId,
    seniorProfileId: canonicalAlert.seniorProfileId,
    sourceVoiceInteractionId: canonicalAlert.sourceVoiceInteractionId,
    sourceType: canonicalAlert.sourceType,
    insightType,
    priority: canonicalAlert.priority,
    title: canonicalAlert.title,
    summary: canonicalAlert.summary,
    suggestedAction: canonicalAlert.suggestedAction,
    evidenceTranscript: canonicalAlert.evidenceTranscript,
    status: canonicalAlert.status,
    createdAt: canonicalAlert.createdAt,
    reviewedAt: canonicalAlert.reviewedAt,
    reviewedByMembershipId: canonicalAlert.reviewedByMembershipId,
  });

  await ctx.db.patch(canonicalAlert._id, {
    legacySupporterInsightId: legacyId,
  });

  return await ctx.db.get(legacyId);
}

export async function listCanonicalInsightsForFamilySpace(
  ctx: QueryCtx,
  familySpaceId: Id<"familySpaces">,
  status: CanonicalInsight["status"],
  limit: number,
) {
  return await ctx.db
    .query("insights")
    .withIndex("by_familySpaceId_and_status_and_createdAt", (query) =>
      query.eq("familySpaceId", familySpaceId).eq("status", status),
    )
    .order("desc")
    .take(limit);
}

export async function listCanonicalAlertsForFamilySpace(
  ctx: QueryCtx,
  familySpaceId: Id<"familySpaces">,
  status: CanonicalAlert["status"],
  limit: number,
) {
  return await ctx.db
    .query("alerts")
    .withIndex("by_familySpaceId_and_status_and_createdAt", (query) =>
      query.eq("familySpaceId", familySpaceId).eq("status", status),
    )
    .order("desc")
    .take(limit);
}
