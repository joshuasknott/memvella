import { describe, expect, it } from "vitest";
import type { Doc, Id } from "./_generated/dataModel";
import {
  assertFamilySideCapability,
  familySideRoleHasCapability,
  isFamilySideRole,
  pickDeterministicCircleMembership,
  pickDeterministicMembership,
  normalizeFamilySideMembershipRole,
} from "./circleAuth";

function makeMembership(
  id: string,
  creationTime: number,
): Doc<"circleMemberships"> {
  return {
    _id: id as Id<"circleMemberships">,
    _creationTime: creationTime,
    circleId: "circle-1" as Id<"circles">,
    authIdentityToken: "token",
    authEmail: null,
    displayName: id,
    role: "member",
    seniorProfileId: null,
    onboardingStep: undefined,
    lastSeenAt: undefined,
  };
}

function makeCircleMembership(
  id: string,
  creationTime: number,
): Doc<"circleMemberships"> {
  return {
    _id: id as Id<"circleMemberships">,
    _creationTime: creationTime,
    circleId: "circle-1" as Id<"circles">,
    authIdentityToken: "token",
    authEmail: null,
    displayName: id,
    role: "member",
    seniorProfileId: null,
    onboardingStep: undefined,
    lastSeenAt: undefined,
  };
}

describe("family-side capabilities", () => {
  it("normalizes family-side roles", () => {
    expect(normalizeFamilySideMembershipRole("organiser")).toBe("organiser");
    expect(normalizeFamilySideMembershipRole("member")).toBe("member");
  });

  it("recognizes organiser/member as family-side accounts", () => {
    expect(isFamilySideRole("organiser")).toBe(true);
    expect(isFamilySideRole("member")).toBe(true);
  });

  it("reserves invite and tablet management for organiser roles", () => {
    expect(familySideRoleHasCapability("organiser", "manage_invite_codes")).toBe(
      true,
    );
    expect(familySideRoleHasCapability("member", "manage_invite_codes")).toBe(
      false,
    );
    expect(
      familySideRoleHasCapability("member", "manage_circle_notifications"),
    ).toBe(false);
    expect(familySideRoleHasCapability("organiser", "manage_people")).toBe(true);
    expect(familySideRoleHasCapability("member", "manage_people")).toBe(false);
    expect(familySideRoleHasCapability("organiser", "manage_routines")).toBe(
      true,
    );
    expect(familySideRoleHasCapability("member", "manage_routines")).toBe(
      false,
    );
    expect(
      familySideRoleHasCapability("organiser", "manage_circle_admin"),
    ).toBe(true);
    expect(familySideRoleHasCapability("member", "manage_circle_admin")).toBe(
      false,
    );
  });

  it("throws deterministic denial errors for capability checks", () => {
    expect(() => assertFamilySideCapability("member", "manage_routines")).toThrow(
      "This account does not have access to that Circle setting.",
    );
    expect(assertFamilySideCapability("organiser", "manage_routines")).toBe(
      "organiser",
    );
  });

  it("denies members access to organiser-only actions (insights, AI onboarding)", () => {
    expect(familySideRoleHasCapability("member", "manage_circle_admin")).toBe(false);
    expect(familySideRoleHasCapability("organiser", "manage_circle_admin")).toBe(true);
    expect(() => assertFamilySideCapability("member", "manage_circle_admin")).toThrow();
    expect(assertFamilySideCapability("organiser", "manage_circle_admin")).toBe(
      "organiser",
    );
  });

  it("deterministically picks one membership when duplicates exist", () => {
    const result = pickDeterministicMembership([
      makeMembership("membership-z", 10),
      makeMembership("membership-a", 10),
    ]);

    expect(result?._id).toBe("membership-a");
  });

  it("deterministically picks one circle membership when duplicates exist", () => {
    const result = pickDeterministicCircleMembership([
      makeCircleMembership("circle-membership-z", 10),
      makeCircleMembership("circle-membership-a", 10),
    ]);

    expect(result?._id).toBe("circle-membership-a");
  });
});
