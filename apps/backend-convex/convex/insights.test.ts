import { describe, expect, it } from "vitest";
import type { Id } from "./_generated/dataModel";
import { resolveReviewableInsightTarget } from "./insights";

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
});
