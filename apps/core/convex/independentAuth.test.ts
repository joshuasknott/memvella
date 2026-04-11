import { describe, expect, it } from "vitest";
import type { Id } from "./_generated/dataModel";
import { evaluatePasskeyAuthenticationCandidate } from "./independentAuth";

const familySpaceId = "family-1" as Id<"familySpaces">;
const seniorProfileId = "senior-1" as Id<"seniorProfiles">;

describe("evaluatePasskeyAuthenticationCandidate", () => {
  it("rejects missing or mismatched authentication challenges", () => {
    expect(
      evaluatePasskeyAuthenticationCandidate({
        activeChallenge: null,
        requestedChallenge: "challenge-1",
        passkey: null,
        seniorProfileId,
        familySpaceId,
      }),
    ).toEqual({
      status: "invalid",
      message: "The passkey sign-in challenge is no longer valid.",
    });
  });

  it("rejects missing or revoked passkeys", () => {
    expect(
      evaluatePasskeyAuthenticationCandidate({
        activeChallenge: { challenge: "challenge-1" },
        requestedChallenge: "challenge-1",
        passkey: null,
        seniorProfileId,
        familySpaceId,
      }),
    ).toEqual({
      status: "invalid",
      message: "That passkey is no longer available.",
    });
    expect(
      evaluatePasskeyAuthenticationCandidate({
        activeChallenge: { challenge: "challenge-1" },
        requestedChallenge: "challenge-1",
        passkey: {
          revokedAt: 123,
          seniorProfileId,
          familySpaceId,
        },
        seniorProfileId,
        familySpaceId,
      }),
    ).toEqual({
      status: "invalid",
      message: "That passkey is no longer available.",
    });
  });

  it("rejects passkeys linked to another Circle", () => {
    expect(
      evaluatePasskeyAuthenticationCandidate({
        activeChallenge: { challenge: "challenge-1" },
        requestedChallenge: "challenge-1",
        passkey: {
          revokedAt: null,
          seniorProfileId: "senior-2" as Id<"seniorProfiles">,
          familySpaceId,
        },
        seniorProfileId,
        familySpaceId,
      }),
    ).toEqual({
      status: "invalid",
      message: "That passkey is not linked to this Circle.",
    });
  });

  it("accepts valid passkey authentication inputs", () => {
    expect(
      evaluatePasskeyAuthenticationCandidate({
        activeChallenge: { challenge: "challenge-1" },
        requestedChallenge: "challenge-1",
        passkey: {
          revokedAt: null,
          seniorProfileId,
          familySpaceId,
        },
        seniorProfileId,
        familySpaceId,
      }),
    ).toEqual({ status: "ready" });
  });
});
