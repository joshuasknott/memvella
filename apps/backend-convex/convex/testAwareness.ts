import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ensureTestSupportAccess } from "./testSupport";

const testSupportAuthValidator = {
  authToken: v.string(),
} as const;

export const healthcheck = query({
  args: {
    ...testSupportAuthValidator,
  },
  handler: async (_ctx, args) => {
    ensureTestSupportAccess(args.authToken);

    return {
      ready: true,
      timestamp: Date.now(),
    };
  },
});

export const seedAwarenessReviewFixture = mutation({
  args: {
    ...testSupportAuthValidator,
    authEmail: v.string(),
  },
  handler: async (ctx, args) => {
    ensureTestSupportAccess(args.authToken);

    const memberships = await ctx.db.query("circleMemberships").take(128);
    const membership = memberships.find(
      (item) => item.authEmail === args.authEmail && item.role === "organiser",
    );
    if (!membership || !membership.seniorProfileId) {
      throw new Error("No organiser Workspace fixture found for that email.");
    }

    const now = Date.now();
    const insightId = await ctx.db.insert("insights", {
      circleId: membership.circleId,
      seniorProfileId: membership.seniorProfileId,
      sourceVoiceInteractionId: null,
      sourceType: "ai_pipeline",
      insightType: "connection_prompt",
      priority: "normal",
      title: "Ask about the garden photos",
      summary: "Recent memories mention the garden and Friday visits.",
      suggestedAction: "Prompt a Supporter to add a fresh garden photo.",
      evidenceTranscript: "Anna brought garden photos on Friday.",
      status: "queued",
      createdAt: now,
      reviewedAt: null,
      reviewedByCircleMembershipId: null,
    });
    const alertId = await ctx.db.insert("alerts", {
      circleId: membership.circleId,
      seniorProfileId: membership.seniorProfileId,
      sourceVoiceInteractionId: null,
      sourceType: "safety_guardrail",
      alertType: "distress_flag",
      priority: "high",
      title: "Check the evening routine",
      summary: "The companion detected uncertainty around the evening routine.",
      suggestedAction: "Review the routine with the Workspace.",
      evidenceTranscript: "I am not sure what happens tonight.",
      status: "queued",
      createdAt: now + 1,
      reviewedAt: null,
      reviewedByCircleMembershipId: null,
    });

    return { alertId, insightId };
  },
});
