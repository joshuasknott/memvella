import { describe, expect, it } from "vitest";
import type { Doc, Id } from "./_generated/dataModel";
import {
  evaluateRedeemMemberships,
  getInviteLookupMessage,
  shouldWriteLegacyInviteForCanonicalInviteGeneration,
} from "./familyInvites";
import { shouldMirrorCanonicalPeopleToLegacy } from "./peopleCompat";
import { shouldMirrorCanonicalInsightsToLegacy } from "./insightsCompat";

let membershipCounter = 0;

function makeMembership(
  overrides: Partial<Doc<"familySpaceMemberships">> = {},
): Doc<"familySpaceMemberships"> {
  membershipCounter += 1;
  return {
    _id:
      overrides._id ??
      (`membership-${membershipCounter}` as Id<"familySpaceMemberships">),
    _creationTime: overrides._creationTime ?? membershipCounter,
    familySpaceId:
      overrides.familySpaceId ?? (`family-default` as Id<"familySpaces">),
    authIdentityToken: overrides.authIdentityToken ?? "token-1",
    authEmail: overrides.authEmail ?? null,
    displayName: overrides.displayName ?? "Member",
    role: overrides.role ?? "member",
    seniorProfileId: overrides.seniorProfileId ?? null,
    onboardingStep: overrides.onboardingStep,
    lastSeenAt: overrides.lastSeenAt,
  };
}

describe("family invite messaging", () => {
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

  it("keeps canonical-first compatibility gates disabled", () => {
    expect(shouldMirrorCanonicalPeopleToLegacy()).toBe(false);
    expect(shouldMirrorCanonicalInsightsToLegacy()).toBe(false);
    expect(shouldWriteLegacyInviteForCanonicalInviteGeneration()).toBe(false);
  });
});

describe("family invite membership evaluation", () => {
  const targetFamilySpaceId = "family-target" as Id<"familySpaces">;
  const otherFamilySpaceId = "family-other" as Id<"familySpaces">;

  it("returns eligible for a first-time account (happy path)", () => {
    const result = evaluateRedeemMemberships([], targetFamilySpaceId);
    expect(result).toEqual({ status: "eligible" });
  });

  it("returns already_joined when identity is already in the target Circle", () => {
    const membership = makeMembership({
      familySpaceId: targetFamilySpaceId,
      role: "organiser",
    });

    const result = evaluateRedeemMemberships([membership], targetFamilySpaceId);
    expect(result.status).toBe("already_joined");
    if (result.status === "already_joined") {
      expect(result.membership._id).toBe(membership._id);
      expect(result.membership.role).toBe("organiser");
    }
  });

  it("deterministically selects one target membership when duplicates exist", () => {
    const newerMembership = makeMembership({
      _id: "membership-z" as Id<"familySpaceMemberships">,
      _creationTime: 100,
      familySpaceId: targetFamilySpaceId,
      role: "member",
    });
    const preferredMembership = makeMembership({
      _id: "membership-a" as Id<"familySpaceMemberships">,
      _creationTime: 100,
      familySpaceId: targetFamilySpaceId,
      role: "member",
    });

    const result = evaluateRedeemMemberships(
      [newerMembership, preferredMembership],
      targetFamilySpaceId,
    );
    expect(result.status).toBe("already_joined");
    if (result.status === "already_joined") {
      expect(result.membership._id).toBe(preferredMembership._id);
    }
  });

  it("returns role_collision for independent identities", () => {
    const independentMembership = makeMembership({
      familySpaceId: otherFamilySpaceId,
      role: "independent_senior",
    });

    const result = evaluateRedeemMemberships(
      [independentMembership],
      targetFamilySpaceId,
    );
    expect(result.status).toBe("role_collision");
  });

  it("returns circle_conflict for family-side identities in another Circle", () => {
    const otherCircleMembership = makeMembership({
      familySpaceId: otherFamilySpaceId,
      role: "member",
    });

    const result = evaluateRedeemMemberships(
      [otherCircleMembership],
      targetFamilySpaceId,
    );
    expect(result.status).toBe("circle_conflict");
  });

  it("prioritizes already_joined over other collision states", () => {
    const targetMembership = makeMembership({
      familySpaceId: targetFamilySpaceId,
      role: "member",
    });
    const independentMembership = makeMembership({
      familySpaceId: otherFamilySpaceId,
      role: "independent_senior",
    });

    const result = evaluateRedeemMemberships(
      [independentMembership, targetMembership],
      targetFamilySpaceId,
    );
    expect(result.status).toBe("already_joined");
  });
});
