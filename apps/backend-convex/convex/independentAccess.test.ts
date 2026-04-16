import { describe, expect, it } from "vitest";
import type { Doc, Id } from "./_generated/dataModel";
import {
  buildRateLimitMessage,
  evaluateIndependentPasskeyOwnership,
  evaluateIndependentRecoveryRedemptionState,
  isActiveDoc,
  isActiveOnboardingSession,
  normalizeRecoveryCode,
} from "./independentAccess";

const circleId = "circle-1" as Id<"circles">;
const sourceCircleMembershipId = "circle-membership-1" as Id<"circleMemberships">;
const seniorProfileId = "senior-1" as Id<"seniorProfiles">;

function makeOnboardingSession(
  overrides: Partial<Doc<"independentOnboardingSessions">> = {},
): Doc<"independentOnboardingSessions"> {
  return {
    _id: (overrides._id ?? "onboarding-1") as Id<"independentOnboardingSessions">,
    _creationTime: overrides._creationTime ?? 1,
    seniorProfileId,
    sourceCircleMembershipId,
    tokenHash: overrides.tokenHash ?? "token-hash",
    expiresAt: overrides.expiresAt ?? 1_000,
    consumedAt: overrides.consumedAt ?? null,
    revokedAt: overrides.revokedAt ?? null,
  };
}

describe("independent recovery helpers", () => {
  it("normalizes recovery code input and rate-limit messaging deterministically", () => {
    expect(normalizeRecoveryCode("1234-5678-9012")).toBe("123456789012");
    expect(normalizeRecoveryCode("bad-code")).toBeNull();
    expect(buildRateLimitMessage(2_500, "recovery")).toBe(
      "Too many recovery attempts. Wait 3 seconds before trying again.",
    );
  });

  it("tracks active recovery and onboarding documents deterministically", () => {
    expect(isActiveDoc({ consumedAt: null, revokedAt: null })).toBe(true);
    expect(isActiveDoc({ consumedAt: 10, revokedAt: null })).toBe(false);
    expect(isActiveOnboardingSession(makeOnboardingSession(), 500)).toBe(true);
    expect(
      isActiveOnboardingSession(makeOnboardingSession({ revokedAt: 10 }), 500),
    ).toBe(false);
    expect(
      isActiveOnboardingSession(makeOnboardingSession({ expiresAt: 100 }), 500),
    ).toBe(false);
  });

  it("rejects passkeys linked to another Circle", () => {
    expect(
      evaluateIndependentPasskeyOwnership({
        existingPasskey: {
          circleId: "circle-2" as Id<"circles">,
          seniorProfileId,
        },
        circleId,
        seniorProfileId,
      }),
    ).toEqual({
      status: "collision",
      message: "This device passkey is already linked to another Circle.",
    });
  });

  it("allows passkey updates for the same Circle identity", () => {
    expect(
      evaluateIndependentPasskeyOwnership({
        existingPasskey: {
          circleId,
          seniorProfileId,
        },
        circleId,
        seniorProfileId,
      }),
    ).toEqual({ status: "update" });
    expect(
      evaluateIndependentPasskeyOwnership({
        existingPasskey: null,
        circleId,
        seniorProfileId,
      }),
    ).toEqual({ status: "create" });
  });

  it("returns the expected recovery redemption states", () => {
    expect(
      evaluateIndependentRecoveryRedemptionState({
        normalizedCode: null,
        recoveryCode: null,
        seniorProfile: null,
      }),
    ).toEqual({
      status: "invalid",
      message: "Enter a valid recovery code.",
    });
    expect(
      evaluateIndependentRecoveryRedemptionState({
        normalizedCode: "123456789012",
        recoveryCode: null,
        seniorProfile: null,
      }),
    ).toEqual({
      status: "invalid",
      message: "That recovery code is no longer available.",
    });
    expect(
      evaluateIndependentRecoveryRedemptionState({
        normalizedCode: "123456789012",
        recoveryCode: { _id: "code-1" as Id<"independentSeniorRecoveryCodes"> },
        seniorProfile: { seniorMode: "assisted" },
      }),
    ).toEqual({
      status: "invalid",
      message: "This independent profile could not be found.",
    });
    expect(
      evaluateIndependentRecoveryRedemptionState({
        normalizedCode: "123456789012",
        recoveryCode: { _id: "code-1" as Id<"independentSeniorRecoveryCodes"> },
        seniorProfile: { seniorMode: "independent" },
      }),
    ).toEqual({ status: "ready" });
  });
});
