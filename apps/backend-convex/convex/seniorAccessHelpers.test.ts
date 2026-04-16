import { describe, expect, it } from "vitest";
import type { Id } from "./_generated/dataModel";
import {
  evaluateSeniorSessionRecord,
  getInvalidSessionRevocationReason,
  revokeInvalidSeniorSessionIfNeeded,
} from "./seniorAccessHelpers";

const sessionId = "session-1" as Id<"seniorAccessSessions">;

function makeSession() {
  return {
    _id: sessionId,
    sessionType: "independent_web" as const,
    revokedAt: null,
    expiresAt: 2_000,
    idleExpiresAt: 1_500,
    deviceFingerprintHash: "hash-device-a",
  };
}

describe("evaluateSeniorSessionRecord", () => {
  it("flags missing sessions as not_found", () => {
    expect(
      evaluateSeniorSessionRecord({
        session: null,
        now: 1_000,
        deviceFingerprintHash: "hash-device-a",
      }),
    ).toEqual({ status: "invalid", reason: "not_found", sessionId: null });
  });

  it("flags wrong experience sessions", () => {
    const result = evaluateSeniorSessionRecord({
      session: makeSession(),
      expectedSessionType: "assisted_device",
      now: 1_000,
      deviceFingerprintHash: "hash-device-a",
    });

    expect(result.status).toBe("invalid");
    if (result.status === "invalid") {
      expect(result.reason).toBe("wrong_experience");
    }
  });

  it("flags device mismatch sessions", () => {
    const result = evaluateSeniorSessionRecord({
      session: makeSession(),
      expectedSessionType: "independent_web",
      now: 1_000,
      deviceFingerprintHash: "hash-device-b",
    });

    expect(result.status).toBe("invalid");
    if (result.status === "invalid") {
      expect(result.reason).toBe("device_mismatch");
      expect(result.sessionId).toBe(sessionId);
    }
  });

  it("flags expired and idle timeout sessions", () => {
    const expired = evaluateSeniorSessionRecord({
      session: makeSession(),
      now: 2_500,
      deviceFingerprintHash: "hash-device-a",
    });
    const idleTimeout = evaluateSeniorSessionRecord({
      session: makeSession(),
      now: 1_600,
      deviceFingerprintHash: "hash-device-a",
    });

    expect(expired.status).toBe("invalid");
    if (expired.status === "invalid") {
      expect(expired.reason).toBe("expired");
    }
    expect(idleTimeout.status).toBe("invalid");
    if (idleTimeout.status === "invalid") {
      expect(idleTimeout.reason).toBe("idle_timeout");
    }
  });

  it("returns active when all checks pass", () => {
    expect(
      evaluateSeniorSessionRecord({
        session: makeSession(),
        expectedSessionType: "independent_web",
        now: 1_000,
        deviceFingerprintHash: "hash-device-a",
      }),
    ).toEqual({ status: "active" });
  });
});

describe("getInvalidSessionRevocationReason", () => {
  it("maps revocation reasons for invalid sessions", () => {
    expect(getInvalidSessionRevocationReason("device_mismatch", sessionId)).toBe(
      "session_device_mismatch",
    );
    expect(getInvalidSessionRevocationReason("expired", sessionId)).toBe(
      "session_expired",
    );
    expect(getInvalidSessionRevocationReason("idle_timeout", sessionId)).toBe(
      "session_idle_timeout",
    );
    expect(getInvalidSessionRevocationReason("wrong_experience", sessionId)).toBe(
      null,
    );
    expect(getInvalidSessionRevocationReason("revoked", sessionId)).toBe(null);
    expect(getInvalidSessionRevocationReason("not_found", null)).toBe(null);
  });
});

describe("revokeInvalidSeniorSessionIfNeeded", () => {
  it("patches unresolved invalid sessions with deterministic reason", async () => {
    const patchCalls: Array<{ id: Id<"seniorAccessSessions">; payload: Record<string, unknown> }> = [];
    const ctx = {
      db: {
        get: async () => ({ _id: sessionId, revokedAt: null }),
        patch: async (
          id: Id<"seniorAccessSessions">,
          payload: Record<string, unknown>,
        ) => {
          patchCalls.push({ id, payload });
        },
      },
    };

    await revokeInvalidSeniorSessionIfNeeded(ctx as never, {
      reason: "device_mismatch",
      sessionId,
    });

    expect(patchCalls).toHaveLength(1);
    expect(patchCalls[0]?.id).toBe(sessionId);
    expect(patchCalls[0]?.payload.revokedReason).toBe("session_device_mismatch");
    expect(typeof patchCalls[0]?.payload.revokedAt).toBe("number");
  });

  it("does not patch when reason should not auto-revoke", async () => {
    const patchCalls: unknown[] = [];
    const ctx = {
      db: {
        get: async () => ({ _id: sessionId, revokedAt: null }),
        patch: async () => {
          patchCalls.push(true);
        },
      },
    };

    await revokeInvalidSeniorSessionIfNeeded(ctx as never, {
      reason: "wrong_experience",
      sessionId,
    });

    expect(patchCalls).toHaveLength(0);
  });
});
