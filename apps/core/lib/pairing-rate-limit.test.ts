import { describe, expect, it } from "vitest";
import {
  buildPairingRetryMessage,
  getPairingFailureStatus,
  isPairingRateLimitError,
} from "./pairing-rate-limit";

describe("pairing rate-limit helpers", () => {
  it("classifies retry messages as HTTP 429", () => {
    const message = buildPairingRetryMessage(5_000);
    expect(isPairingRateLimitError(message)).toBe(true);
    expect(getPairingFailureStatus(message)).toBe(429);
  });

  it("classifies non-rate-limit messages as HTTP 400", () => {
    expect(isPairingRateLimitError("Invalid code")).toBe(false);
    expect(getPairingFailureStatus("Invalid code")).toBe(400);
  });
});
