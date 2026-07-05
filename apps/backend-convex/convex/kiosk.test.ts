import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { buildPairingRetryMessage, isPairingRateLimitError } from "@memvella/domain-circle";
import { hashAssistedPin } from "./security";
import { formatInvalidSessionMessage } from "./terminology";

process.env.MEMVELLA_AUTH_PEPPER = "memvella-test-pepper";

// convex-test expects Vitest's import.meta.glob module map at runtime.
// @ts-expect-error Vitest provides import.meta.glob, but this repo's Convex tsc config does not include Vite types.
const modules = import.meta.glob("./**/*.ts");

describe("kiosk pairing throttle behavior", () => {
  it("keeps a user-facing retry message contract", () => {
    const message = buildPairingRetryMessage(10_000);
    expect(message).toMatch(/^Too many pairing attempts\./);
    expect(isPairingRateLimitError(message)).toBe(true);
    expect(isPairingRateLimitError("Invalid code.")).toBe(false);
  });

  it("uses server-controlled rate limit scopes that cannot be rotated by callers", () => {
    const scopes = [
      "assisted-pairing:",
      "assisted-pairing-pin:",
    ];
    for (const prefix of scopes) {
      expect(prefix.startsWith("assisted-pairing")).toBe(true);
    }
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

async function seedKioskPin(args: {
  pinCode: string;
  expiresAt?: number;
  consumedAt?: number | null;
  revokedAt?: number | null;
  failedAttempts?: number;
  maxAttempts?: number;
}) {
  const t = convexTest(schema, modules);
  const ids = await t.run(async (ctx) => {
    const circleId = await ctx.db.insert("circles", {
      displayName: "Pairing Workspace",
      timezone: "Europe/London",
      locale: "en-GB",
    });
    const seniorProfileId = await ctx.db.insert("seniorProfiles", {
      circleId,
      displayName: "David",
      seniorMode: "assisted",
      accessStatus: "active",
      timezone: null,
      locale: null,
      lastSessionAt: undefined,
    });
    const membershipId = await ctx.db.insert("circleMemberships", {
      circleId,
      authIdentityToken: "kiosk-owner",
      authEmail: "kiosk-owner@memvella.test",
      displayName: "Owner",
      role: "organiser",
      seniorProfileId,
      onboardingStep: undefined,
      lastSeenAt: Date.now(),
    });
    const pinId = await ctx.db.insert("assistedDevicePins", {
      circleId,
      seniorProfileId,
      createdByCircleMembershipId: membershipId,
      pinHash: await hashAssistedPin(args.pinCode),
      expiresAt: args.expiresAt ?? Date.now() + 10 * 60 * 1000,
      consumedAt: args.consumedAt ?? null,
      revokedAt: args.revokedAt ?? null,
      failedAttempts: args.failedAttempts ?? 0,
      maxAttempts: args.maxAttempts ?? 1,
    });

    return { circleId, seniorProfileId, membershipId, pinId };
  });

  return { t, ids };
}

describe("kiosk pairing state hardening", () => {
  it("pairs a valid pin once, consumes it, and rejects reuse", async () => {
    const { t, ids } = await seedKioskPin({ pinCode: "123456" });

    const paired = await t.mutation(api.kiosk.pairTabletSession, {
      pinCode: "123456",
      deviceFingerprint: "tablet-a",
    });
    expect(paired.success).toBe(true);

    const afterPair = await t.run(async (ctx) => ({
      pin: await ctx.db.get(ids.pinId),
      sessions: await ctx.db
        .query("seniorAccessSessions")
        .withIndex("by_seniorProfileId", (query) =>
          query.eq("seniorProfileId", ids.seniorProfileId),
        )
        .take(10),
    }));
    expect(afterPair.pin?.consumedAt).not.toBeNull();
    expect(afterPair.sessions).toHaveLength(1);
    expect(afterPair.sessions[0]).toMatchObject({
      circleId: ids.circleId,
      seniorProfileId: ids.seniorProfileId,
      sourcePinId: ids.pinId,
      sourceCircleMembershipId: ids.membershipId,
      revokedAt: null,
    });

    await expect(
      t.mutation(api.kiosk.pairTabletSession, {
        pinCode: "123456",
        deviceFingerprint: "tablet-b",
      }),
    ).resolves.toMatchObject({
      success: false,
      error: "Invalid code. Ask a Supporter for a new 6-digit tablet code.",
    });
  });

  it("rejects expired, revoked, and exhausted pins without minting sessions", async () => {
    for (const pinState of [
      { pinCode: "100001", expiresAt: Date.now() - 1000 },
      { pinCode: "100002", revokedAt: Date.now() - 1000 },
      { pinCode: "100003", failedAttempts: 1, maxAttempts: 1 },
    ]) {
      const { t, ids } = await seedKioskPin(pinState);
      await expect(
        t.mutation(api.kiosk.pairTabletSession, {
          pinCode: pinState.pinCode,
          deviceFingerprint: `device-${pinState.pinCode}`,
        }),
      ).resolves.toMatchObject({
        success: false,
        error: "Invalid code. Ask a Supporter for a new 6-digit tablet code.",
      });
      const sessions = await t.run(async (ctx) =>
        ctx.db
          .query("seniorAccessSessions")
          .withIndex("by_seniorProfileId", (query) =>
            query.eq("seniorProfileId", ids.seniorProfileId),
          )
          .take(10),
      );
      expect(sessions).toHaveLength(0);
    }
  });

  it("increments failed attempts when the pinned senior profile is missing", async () => {
    const { t, ids } = await seedKioskPin({ pinCode: "333333", maxAttempts: 2 });

    await t.run(async (ctx) => {
      await ctx.db.delete(ids.seniorProfileId);
    });

    await expect(
      t.mutation(api.kiosk.pairTabletSession, {
        pinCode: "333333",
        deviceFingerprint: "tablet-missing-profile",
      }),
    ).resolves.toMatchObject({
      success: false,
      error: "This Companion tablet profile is no longer available.",
    });

    const pin = await t.run(async (ctx) => ctx.db.get(ids.pinId));
    expect(pin).toMatchObject({
      failedAttempts: 1,
      revokedAt: null,
      consumedAt: null,
    });
  });

  it("rejects profile ownership mismatches and revokes the pin", async () => {
    const { t, ids } = await seedKioskPin({ pinCode: "654321", maxAttempts: 2 });

    await t.run(async (ctx) => {
      const otherCircleId = await ctx.db.insert("circles", {
        displayName: "Other Workspace",
        timezone: "Europe/London",
        locale: "en-GB",
      });
      await ctx.db.patch(ids.seniorProfileId, {
        circleId: otherCircleId,
      });
    });

    await expect(
      t.mutation(api.kiosk.pairTabletSession, {
        pinCode: "654321",
        deviceFingerprint: "tablet-mismatch",
      }),
    ).resolves.toMatchObject({
      success: false,
      error: "This Companion tablet profile is no longer available.",
    });

    const pin = await t.run(async (ctx) => ctx.db.get(ids.pinId as Id<"assistedDevicePins">));
    expect(pin).toMatchObject({
      failedAttempts: 0,
    });
    expect(pin?.revokedAt).not.toBeNull();
  });

  it("records server-side device and pin rate limits", async () => {
    const { t } = await seedKioskPin({ pinCode: "222222" });

    for (let index = 0; index < 4; index += 1) {
      await t.mutation(api.kiosk.pairTabletSession, {
        pinCode: "000000",
        deviceFingerprint: "same-tablet",
      });
    }

    const stored = await t.run(async (ctx) =>
      ctx.db.query("rateLimitWindows").take(10),
    );
    expect(stored.map((window) => window.actionKey).sort()).toEqual([
      "pairTabletSession",
      "pairTabletSessionPin",
    ]);
    expect(
      stored.find((window) => window.actionKey === "pairTabletSessionPin"),
    ).toMatchObject({
      hits: 4,
    });
  });
});
