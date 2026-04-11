import { describe, expect, it } from "vitest";
import {
  familySideRoleHasCapability,
  isFamilySideRole,
  normalizeFamilySideMembershipRole,
} from "./familySpaceAuth";

describe("family-side capabilities", () => {
  it("normalizes legacy supporter rows to organiser", () => {
    expect(normalizeFamilySideMembershipRole("organiser")).toBe("organiser");
    expect(normalizeFamilySideMembershipRole("supporter")).toBe("organiser");
    expect(normalizeFamilySideMembershipRole("member")).toBe("member");
    expect(normalizeFamilySideMembershipRole("independent_senior")).toBe(null);
  });

  it("still recognizes legacy supporter rows as family-side accounts during migration", () => {
    expect(isFamilySideRole("organiser")).toBe(true);
    expect(isFamilySideRole("supporter")).toBe(true);
    expect(isFamilySideRole("member")).toBe(true);
    expect(isFamilySideRole("independent_senior")).toBe(false);
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
  });
});
