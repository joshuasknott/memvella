import { describe, expect, it } from "vitest";

function getSeniorSessionStorageKey(experience: "assisted" | "independent") {
  return `memvella_${experience}_senior_session`;
}

function getSeniorRecoveryHintStorageKey(
  experience: "assisted" | "independent",
) {
  return `memvella_${experience}_senior_recovery_hint`;
}

describe("senior session key isolation", () => {
  it("uses distinct keys for session and recovery hint", () => {
    expect(getSeniorSessionStorageKey("assisted")).toBe(
      "memvella_assisted_senior_session",
    );
    expect(getSeniorRecoveryHintStorageKey("assisted")).toBe(
      "memvella_assisted_senior_recovery_hint",
    );
    expect(getSeniorSessionStorageKey("assisted")).not.toBe(
      getSeniorRecoveryHintStorageKey("assisted"),
    );
  });

  it("uses distinct keys per experience type", () => {
    expect(getSeniorSessionStorageKey("assisted")).not.toBe(
      getSeniorSessionStorageKey("independent"),
    );
    expect(getSeniorRecoveryHintStorageKey("assisted")).not.toBe(
      getSeniorRecoveryHintStorageKey("independent"),
    );
  });
});
