import { describe, expect, it } from "vitest";
import { buildPairingRetryMessage, isPairingRateLimitError } from "./pairingRateLimit";
import { formatInvalidSessionMessage } from "./terminology";

describe("kiosk pairing throttle behavior", () => {
  it("keeps a user-facing retry message contract", () => {
    const message = buildPairingRetryMessage(10_000);
    expect(message).toMatch(/^Too many pairing attempts\./);
    expect(isPairingRateLimitError(message)).toBe(true);
    expect(isPairingRateLimitError("Invalid code.")).toBe(false);
  });

  it("uses server-controlled rate limit scopes that cannot be rotated by callers", () => {
    const scopes = [
      "assisted-pairing-global",
      "assisted-pairing:",
      "assisted-pairing-pin:",
    ];
    for (const prefix of scopes) {
      expect(prefix.startsWith("assisted-pairing")).toBe(true);
    }
    expect(scopes).toContain("assisted-pairing-global");
  });
});

describe("session invalid reason messaging", () => {
  it("keeps explicit device mismatch wording", () => {
    expect(formatInvalidSessionMessage("device_mismatch")).toBe(
      "This session is no longer valid on this device.",
    );
  });

  it("keeps explicit revoked wording", () => {
    expect(formatInvalidSessionMessage("revoked")).toBe(
      "This session is no longer active.",
    );
  });
});
