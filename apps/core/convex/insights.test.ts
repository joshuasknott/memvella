import { describe, expect, it } from "vitest";
import type { Id } from "./_generated/dataModel";
import { resolveReviewableInsightTarget } from "./insights";

const membershipId = "membership-1" as Id<"familySpaceMemberships">;
const familySpaceId = "family-1" as Id<"familySpaces">;
const otherFamilySpaceId = "family-2" as Id<"familySpaces">;

describe("resolveReviewableInsightTarget", () => {
  it("reviews a canonical insight in the current Circle", () => {
    const result = resolveReviewableInsightTarget({
      membershipId,
      membershipFamilySpaceId: familySpaceId,
      status: "reviewed",
      now: 123,
      insight: {
        _id: "insight-1" as Id<"insights">,
        familySpaceId,
      },
      alert: null,
    });

    expect(result).toEqual({
      table: "insights",
      id: "insight-1",
      patch: {
        status: "reviewed",
        reviewedAt: 123,
        reviewedByMembershipId: membershipId,
      },
    });
  });

  it("reviews a canonical alert in the current Circle", () => {
    const result = resolveReviewableInsightTarget({
      membershipId,
      membershipFamilySpaceId: familySpaceId,
      status: "dismissed",
      now: 456,
      insight: null,
      alert: {
        _id: "alert-1" as Id<"alerts">,
        familySpaceId,
      },
    });

    expect(result).toEqual({
      table: "alerts",
      id: "alert-1",
      patch: {
        status: "dismissed",
        reviewedAt: 456,
        reviewedByMembershipId: membershipId,
      },
    });
  });

  it("rejects review targets outside the current Circle", () => {
    const result = resolveReviewableInsightTarget({
      membershipId,
      membershipFamilySpaceId: familySpaceId,
      status: "reviewed",
      now: 789,
      insight: {
        _id: "insight-2" as Id<"insights">,
        familySpaceId: otherFamilySpaceId,
      },
      alert: {
        _id: "alert-2" as Id<"alerts">,
        familySpaceId: otherFamilySpaceId,
      },
    });

    expect(result).toBeNull();
  });
});
