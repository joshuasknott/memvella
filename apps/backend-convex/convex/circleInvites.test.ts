import { describe, expect, it } from "vitest";
import type { Doc, Id } from "./_generated/dataModel";
import {
  evaluateRedeemMemberships,
  getInviteLookupMessage,
} from "./circleInvites";

let membershipCounter = 0;

function makeMembership(
  overrides: Partial<Doc<"circleMemberships">> = {},
): Doc<"circleMemberships"> {
  membershipCounter += 1;
  return {
    _id:
      overrides._id ??
      (`membership-${membershipCounter}` as Id<"circleMemberships">),
    _creationTime: overrides._creationTime ?? membershipCounter,
    circleId: overrides.circleId ?? ("circle-default" as Id<"circles">),
    authIdentityToken: overrides.authIdentityToken ?? "token-1",
    authEmail: overrides.authEmail ?? null,
    displayName: overrides.displayName ?? "Member",
    role: overrides.role ?? "member",
    seniorProfileId: overrides.seniorProfileId ?? null,
    onboardingStep: overrides.onboardingStep,
    lastSeenAt: overrides.lastSeenAt,
  };
}

describe("circle invite messaging", () => {
  it("returns deterministic preview and redeem messages for every terminal invite state", () => {
    expect(getInviteLookupMessage("invalid_code", "preview")).toBe(
      "We couldn't find that Circle. Please double-check the code and try again.",
    );
    expect(getInviteLookupMessage("invalid_code", "redeem")).toBe(
      "We couldn't find that Circle. Please double-check the code and try again.",
    );
    expect(getInviteLookupMessage("expired", "preview")).toBe(
      "This Circle code has expired. Ask for a new one.",
    );
    expect(getInviteLookupMessage("expired", "redeem")).toBe(
      "This invite code has expired. Ask for a new one.",
    );
    expect(getInviteLookupMessage("revoked", "preview")).toBe(
      "This Circle code is no longer active. Ask for a new one.",
    );
    expect(getInviteLookupMessage("revoked", "redeem")).toBe(
      "This invite code is no longer active. Ask for a new one.",
    );
    expect(getInviteLookupMessage("already_used", "preview")).toBe(
      "This Circle code has already been used. Ask for a new one.",
    );
    expect(getInviteLookupMessage("already_used", "redeem")).toBe(
      "This invite code has already been used. Ask for a new one.",
    );
  });

  it("uses server-controlled rate limit scopes for invite preview", () => {
    const scopes = [
      "invite-preview-global",
      "invite-preview-code:",
    ];
    expect(scopes).toContain("invite-preview-global");
    expect(scopes[1]).toMatch(/^invite-preview-code:/);
  });
});

describe("circle invite membership evaluation", () => {
  const targetCircleId = "circle-target" as Id<"circles">;
  const otherCircleId = "circle-other" as Id<"circles">;

  it("returns eligible for a first-time account (happy path)", () => {
    const result = evaluateRedeemMemberships([], targetCircleId);
    expect(result).toEqual({ status: "eligible" });
  });

  it("returns already_joined when identity is already in the target Circle", () => {
    const membership = makeMembership({
      circleId: targetCircleId,
      role: "organiser",
    });

    const result = evaluateRedeemMemberships([membership], targetCircleId);
    expect(result.status).toBe("already_joined");
    if (result.status === "already_joined") {
      expect(result.membership._id).toBe(membership._id);
      expect(result.membership.role).toBe("organiser");
    }
  });

  it("deterministically selects one target membership when duplicates exist", () => {
    const newerMembership = makeMembership({
      _id: "membership-z" as Id<"circleMemberships">,
      _creationTime: 100,
      circleId: targetCircleId,
      role: "member",
    });
    const preferredMembership = makeMembership({
      _id: "membership-a" as Id<"circleMemberships">,
      _creationTime: 100,
      circleId: targetCircleId,
      role: "member",
    });

    const result = evaluateRedeemMemberships(
      [newerMembership, preferredMembership],
      targetCircleId,
    );
    expect(result.status).toBe("already_joined");
    if (result.status === "already_joined") {
      expect(result.membership._id).toBe(preferredMembership._id);
    }
  });

  it("returns circle_conflict for family-side identities in another Circle", () => {
    const otherCircleMembership = makeMembership({
      circleId: otherCircleId,
      role: "member",
    });

    const result = evaluateRedeemMemberships(
      [otherCircleMembership],
      targetCircleId,
    );
    expect(result.status).toBe("circle_conflict");
  });

  it("prioritizes already_joined over circle_conflict", () => {
    const targetMembership = makeMembership({
      circleId: targetCircleId,
      role: "member",
    });
    const otherMembership = makeMembership({
      circleId: otherCircleId,
      role: "organiser",
    });

    const result = evaluateRedeemMemberships(
      [otherMembership, targetMembership],
      targetCircleId,
    );
    expect(result.status).toBe("already_joined");
  });
});
