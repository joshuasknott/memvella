import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import { familySideRoleHasCapability } from "./circleAuth";
import type { Id } from "./_generated/dataModel";
import { resolveReviewableInsightTarget } from "./insights";
import schema from "./schema";

// convex-test expects Vitest's import.meta.glob module map at runtime.
// @ts-expect-error Vitest provides import.meta.glob, but this repo's Convex tsc config does not include Vite types.
const modules = import.meta.glob("./**/*.ts");

const membershipId = "membership-1" as Id<"circleMemberships">;
const circleId = "circle-1" as Id<"circles">;
const otherCircleId = "circle-2" as Id<"circles">;

describe("resolveReviewableInsightTarget", () => {
  it("reviews a canonical insight in the current Circle", () => {
    const result = resolveReviewableInsightTarget({
      membershipId,
      membershipCircleId: circleId,
      status: "reviewed",
      now: 123,
      insight: {
        _id: "insight-1" as Id<"insights">,
        circleId,
      },
      alert: null,
    });

    expect(result).toEqual({
      table: "insights",
      id: "insight-1",
      patch: {
        status: "reviewed",
        reviewedAt: 123,
        reviewedByCircleMembershipId: membershipId,
      },
    });
  });

  it("reviews a canonical alert in the current Circle", () => {
    const result = resolveReviewableInsightTarget({
      membershipId,
      membershipCircleId: circleId,
      status: "dismissed",
      now: 456,
      insight: null,
      alert: {
        _id: "alert-1" as Id<"alerts">,
        circleId,
      },
    });

    expect(result).toEqual({
      table: "alerts",
      id: "alert-1",
      patch: {
        status: "dismissed",
        reviewedAt: 456,
        reviewedByCircleMembershipId: membershipId,
      },
    });
  });

  it("rejects review targets outside the current Circle", () => {
    const result = resolveReviewableInsightTarget({
      membershipId,
      membershipCircleId: circleId,
      status: "reviewed",
      now: 789,
      insight: {
        _id: "insight-2" as Id<"insights">,
        circleId: otherCircleId,
      },
      alert: {
        _id: "alert-2" as Id<"alerts">,
        circleId: otherCircleId,
      },
    });

    expect(result).toBeNull();
  });

  it("denies members from organiser insight capabilities", () => {
    expect(familySideRoleHasCapability("member", "manage_circle_admin")).toBe(false);
    expect(familySideRoleHasCapability("organiser", "manage_circle_admin")).toBe(true);
  });
});

async function seedInsightWorkspace(args: {
  circleName: string;
  token: string;
  role?: "organiser" | "member";
}) {
  const t = convexTest(schema, modules);
  const ids = await t.run(async (ctx) => {
    const circleId = await ctx.db.insert("circles", {
      displayName: args.circleName,
      timezone: "Europe/London",
      locale: "en-GB",
    });
    const seniorProfileId = await ctx.db.insert("seniorProfiles", {
      circleId,
      displayName: args.circleName,
      seniorMode: "assisted",
      accessStatus: "active",
      timezone: null,
      locale: null,
      lastSessionAt: undefined,
    });
    const membershipId = await ctx.db.insert("circleMemberships", {
      circleId,
      authIdentityToken: args.token,
      authEmail: `${args.token}@memvella.test`,
      displayName: args.circleName,
      role: args.role ?? "organiser",
      seniorProfileId,
      onboardingStep: undefined,
      lastSeenAt: Date.now(),
    });
    const insightId = await ctx.db.insert("insights", {
      circleId,
      seniorProfileId,
      sourceVoiceInteractionId: null,
      sourceType: "ai_pipeline",
      insightType: "memory_theme",
      priority: "normal",
      title: `${args.circleName} insight`,
      summary: "Review this insight.",
      suggestedAction: "Call later.",
      evidenceTranscript: "safe excerpt",
      status: "queued",
      createdAt: Date.now(),
      reviewedAt: null,
      reviewedByCircleMembershipId: null,
    });
    const alertId = await ctx.db.insert("alerts", {
      circleId,
      seniorProfileId,
      sourceVoiceInteractionId: null,
      sourceType: "safety_guardrail",
      alertType: "distress_flag",
      priority: "high",
      title: `${args.circleName} alert`,
      summary: "Review this alert.",
      suggestedAction: "Check in.",
      evidenceTranscript: "safe alert excerpt",
      status: "queued",
      createdAt: Date.now() + 1,
      reviewedAt: null,
      reviewedByCircleMembershipId: null,
    });

    return { circleId, seniorProfileId, membershipId, insightId, alertId };
  });

  return {
    t,
    ids,
    actor: t.withIdentity({ tokenIdentifier: args.token }),
  };
}

describe("organiser insights isolation", () => {
  it("lists and reviews only items scoped to the organiser Workspace", async () => {
    const primary = await seedInsightWorkspace({
      circleName: "Primary",
      token: "primary-owner",
    });

    const otherIds = await primary.t.run(async (ctx) => {
      const circleId = await ctx.db.insert("circles", {
        displayName: "Other",
        timezone: "Europe/London",
        locale: "en-GB",
      });
      const seniorProfileId = await ctx.db.insert("seniorProfiles", {
        circleId,
        displayName: "Other",
        seniorMode: "assisted",
        accessStatus: "active",
        timezone: null,
        locale: null,
        lastSessionAt: undefined,
      });
      const insightId = await ctx.db.insert("insights", {
        circleId,
        seniorProfileId,
        sourceVoiceInteractionId: null,
        sourceType: "ai_pipeline",
        insightType: "wellness_pattern",
        priority: "normal",
        title: "Other insight",
        summary: "Wrong Workspace.",
        suggestedAction: "Do not show.",
        evidenceTranscript: "hidden",
        status: "queued",
        createdAt: Date.now() + 2,
        reviewedAt: null,
        reviewedByCircleMembershipId: null,
      });
      return { insightId };
    });

    const listed = await primary.actor.query(api.insights.listOrganiserInsights);
    expect(listed.queued.map((item) => item.id).sort()).toEqual(
      [primary.ids.insightId, primary.ids.alertId].sort(),
    );

    await primary.actor.mutation(api.insights.reviewOrganiserInsight, {
      insightId: primary.ids.insightId,
      status: "reviewed",
    });
    await expect(
      primary.actor.mutation(api.insights.reviewOrganiserInsight, {
        insightId: otherIds.insightId,
        status: "dismissed",
      }),
    ).rejects.toThrow("This insight is not available in your Workspace.");

    const stored = await primary.t.run(async (ctx) => ({
      primary: await ctx.db.get(primary.ids.insightId),
      other: await ctx.db.get(otherIds.insightId),
    }));
    expect(stored.primary).toMatchObject({
      status: "reviewed",
      reviewedByCircleMembershipId: primary.ids.membershipId,
    });
    expect(stored.other).toMatchObject({
      status: "queued",
      reviewedAt: null,
      reviewedByCircleMembershipId: null,
    });
  });

  it("hides organiser review queues from Supporters", async () => {
    const workspace = await seedInsightWorkspace({
      circleName: "Supporter Workspace",
      token: "supporter-token",
      role: "member",
    });

    await expect(workspace.actor.query(api.insights.listOrganiserInsights)).resolves.toEqual({
      queued: [],
      reviewed: [],
    });
    await expect(
      workspace.actor.mutation(api.insights.reviewOrganiserInsight, {
        insightId: workspace.ids.insightId,
        status: "reviewed",
      }),
    ).rejects.toThrow("This account does not have access to this experience.");
  });
});
