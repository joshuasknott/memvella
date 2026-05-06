import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { mutation, type MutationCtx } from "./_generated/server";
import { buildPairingRetryMessage } from "./pairingRateLimit";
import {
  getSeniorProfileByMode,
  requireFamilySideCapability,
  upsertAssistedSeniorProfile,
} from "./circleAuth";
import {
  generateNumericCode,
  hashAssistedPin,
  hashDeviceFingerprint,
  normalizeOptionalText,
} from "./security";
import {
  issueSeniorAccessSession,
  revokeSeniorSessionsForProfile,
} from "./seniorAccessHelpers";
import {
  MEMBER_LABEL,
  normalizeUserFacingText,
  TABLET_PROFILE_LABEL,
} from "./terminology";

type PairTabletSessionResult =
  | {
      success: true;
      seniorName: string;
      sessionToken: string;
      expiresAt: number;
      idleExpiresAt: number;
    }
  | {
      success: false;
      error: string;
    };

async function getActivePinByHash(
  ctx: MutationCtx,
  pinHash: string,
) {
  const candidatePins = await ctx.db
    .query("assistedDevicePins")
    .withIndex("by_pinHash", (query) => query.eq("pinHash", pinHash))
    .order("desc")
    .take(10);

  const now = Date.now();
  return (
    candidatePins.find(
      (pin) =>
        pin.revokedAt === null &&
        pin.consumedAt === null &&
        pin.failedAttempts < pin.maxAttempts &&
        now < pin.expiresAt,
    ) ?? null
  );
}

async function revokeOutstandingPins(
  ctx: MutationCtx,
  seniorProfileId: Id<"seniorProfiles">,
  reasonTimestamp: number,
) {
  const existingPins = await ctx.db
    .query("assistedDevicePins")
    .withIndex("by_seniorProfileId", (query) =>
      query.eq("seniorProfileId", seniorProfileId),
    )
    .take(50);

  for (const pin of existingPins) {
    if (pin.revokedAt === null && pin.consumedAt === null) {
      await ctx.db.patch(pin._id, {
        revokedAt: reasonTimestamp,
      });
    }
  }
}

export const pairTabletSession = mutation({
  args: {
    pinCode: v.string(),
    deviceFingerprint: v.string(),
  },
  handler: async (ctx, args): Promise<PairTabletSessionResult> => {
    const globalRateLimit = await ctx.runMutation(
      internal.rateLimits.consumeRateLimit,
      {
        scopeKey: "assisted-pairing-global",
        actionKey: "pairTabletSessionGlobal",
        maxHits: 30,
        windowMs: 10 * 60 * 1000,
        blockDurationMs: 20 * 60 * 1000,
      },
    );

    if (!globalRateLimit.allowed) {
      return {
        success: false as const,
        error: buildPairingRetryMessage(globalRateLimit.retryAfterMs),
      };
    }

    const deviceScopeKey = await hashDeviceFingerprint(args.deviceFingerprint);
    const deviceRateLimit = await ctx.runMutation(
      internal.rateLimits.consumeRateLimit,
      {
        scopeKey: `assisted-pairing:${deviceScopeKey}`,
        actionKey: "pairTabletSession",
        maxHits: 5,
        windowMs: 10 * 60 * 1000,
        blockDurationMs: 20 * 60 * 1000,
      },
    );

    if (!deviceRateLimit.allowed) {
      return {
        success: false as const,
        error: buildPairingRetryMessage(deviceRateLimit.retryAfterMs),
      };
    }

    const pinHash = await hashAssistedPin(args.pinCode);
    const pinRateLimit = await ctx.runMutation(
      internal.rateLimits.consumeRateLimit,
      {
        scopeKey: `assisted-pairing-pin:${pinHash}`,
        actionKey: "pairTabletSessionPin",
        maxHits: 3,
        windowMs: 10 * 60 * 1000,
        blockDurationMs: 20 * 60 * 1000,
      },
    );

    if (!pinRateLimit.allowed) {
      return {
        success: false as const,
        error: buildPairingRetryMessage(pinRateLimit.retryAfterMs),
      };
    }

    const activePin = await getActivePinByHash(ctx, pinHash);

    if (!activePin) {
      return {
        success: false as const,
        error: "Invalid code. Ask your Organiser for a new 6-digit code.",
      };
    }

    const seniorProfile = await ctx.db.get(activePin.seniorProfileId);
    if (!seniorProfile) {
      return {
        success: false as const,
        error: `This ${TABLET_PROFILE_LABEL} is no longer available.`,
      };
    }

    if (
      seniorProfile.circleId !== activePin.circleId ||
      seniorProfile.seniorMode !== "assisted"
    ) {
      await ctx.db.patch(activePin._id, {
        revokedAt: Date.now(),
      });

      return {
        success: false as const,
        error: `This ${TABLET_PROFILE_LABEL} is no longer available.`,
      };
    }

    const now = Date.now();
    await ctx.db.patch(activePin._id, {
      consumedAt: now,
    });

    await revokeSeniorSessionsForProfile(ctx, {
      seniorProfileId: seniorProfile._id,
      sessionType: "assisted_device",
      reason: "replaced_by_new_pairing",
    });

    const session = await issueSeniorAccessSession(ctx, {
      circleId: activePin.circleId,
      seniorProfileId: seniorProfile._id,
      sessionType: "assisted_device",
      deviceFingerprint: args.deviceFingerprint,
      sourcePinId: activePin._id,
      sourceCircleMembershipId: activePin.createdByCircleMembershipId,
      sourcePasskeyId: null,
    });

    return {
      success: true as const,
      seniorName: normalizeUserFacingText(seniorProfile.displayName) ?? MEMBER_LABEL,
      sessionToken: session.sessionToken,
      expiresAt: session.expiresAt,
      idleExpiresAt: session.idleExpiresAt,
    };
  },
});

export const generateKioskPin = mutation({
  args: {
    seniorName: v.string(),
  },
  handler: async (ctx, args) => {
    const { membership, circle, circleMembership } = await requireFamilySideCapability(
      ctx,
      "manage_tablet_access",
    );
    if (!circle || !circleMembership) {
      throw new Error("The linked Circle could not be found.");
    }

    const organiserSeniorName =
      normalizeOptionalText(args.seniorName) ?? MEMBER_LABEL;

    const assistedSenior =
      (await getSeniorProfileByMode(
        ctx,
        membership.circleId,
        "assisted",
      )) ??
      (await upsertAssistedSeniorProfile(ctx, {
        circleId: membership.circleId,
        displayName: organiserSeniorName,
      }));

    if (!assistedSenior) {
      throw new Error(`Unable to prepare the ${TABLET_PROFILE_LABEL}.`);
    }

    const now = Date.now();
    await revokeOutstandingPins(ctx, assistedSenior._id, now);
    await revokeSeniorSessionsForProfile(ctx, {
      seniorProfileId: assistedSenior._id,
      sessionType: "assisted_device",
      reason: "organiser_requested_new_pairing",
    });

    let pinCode = generateNumericCode();
    let pinHash = await hashAssistedPin(pinCode);

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const existingPin = await getActivePinByHash(ctx, pinHash);
      if (!existingPin) {
        break;
      }

      pinCode = generateNumericCode();
      pinHash = await hashAssistedPin(pinCode);
    }

    await ctx.db.insert("assistedDevicePins", {
      circleId: circle._id,
      seniorProfileId: assistedSenior._id,
      createdByCircleMembershipId: circleMembership._id,
      pinHash,
      expiresAt: now + 10 * 60 * 1000,
      consumedAt: null,
      revokedAt: null,
      failedAttempts: 0,
      maxAttempts: 1,
    });

    return {
      pinCode,
      seniorName: normalizeUserFacingText(assistedSenior.displayName) ?? MEMBER_LABEL,
      expiresAt: now + 10 * 60 * 1000,
    };
  },
});

export const deactivateKioskDevice = mutation({
  args: {},
  handler: async (ctx) => {
    const { membership } = await requireFamilySideCapability(
      ctx,
      "manage_tablet_access",
    );
    const assistedSenior = await getSeniorProfileByMode(
      ctx,
      membership.circleId,
      "assisted",
    );

    if (!assistedSenior) {
      return { deactivated: false as const };
    }

    const now = Date.now();
    await revokeOutstandingPins(ctx, assistedSenior._id, now);
    await revokeSeniorSessionsForProfile(ctx, {
      seniorProfileId: assistedSenior._id,
      sessionType: "assisted_device",
      reason: "organiser_revoked_device_access",
    });

    return { deactivated: true as const };
  },
});
