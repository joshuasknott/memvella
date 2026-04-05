import { describe, expect, it } from "vitest";
import {
  familySideRoleHasCapability,
  isOrganiserLikeRole,
} from "./familySpaceAuth";

describe("family-side capabilities", () => {
  it("treats organiser and legacy supporter as organiser-like roles", () => {
    expect(isOrganiserLikeRole("organiser")).toBe(true);
    expect(isOrganiserLikeRole("supporter")).toBe(true);
    expect(isOrganiserLikeRole("member")).toBe(false);
  });

  it("reserves invite and tablet management for organiser roles", () => {
    expect(familySideRoleHasCapability("organiser", "manage_invite_codes")).toBe(
      true,
    );
    expect(familySideRoleHasCapability("supporter", "manage_tablet_access")).toBe(
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
