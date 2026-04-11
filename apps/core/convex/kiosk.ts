import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { mutation, type MutationCtx } from "./_generated/server";
import { buildPairingRetryMessage } from "../lib/pairing-rate-limit";
import {
  getSeniorProfileByMode,
  requireFamilySideCapability,
  upsertAssistedSeniorProfile,
} from "./familySpaceAuth";
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
    networkScopeKey: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<PairTabletSessionResult> => {
    const networkRateLimit = await ctx.runMutation(
      internal.rateLimits.consumeRateLimit,
      {
        scopeKey:
          normalizeOptionalText(args.networkScopeKey) ??
          `assisted-pairing-network:${await hashDeviceFingerprint(args.deviceFingerprint)}`,
        actionKey: "pairTabletSessionNetwork",
        maxHits: 5,
        windowMs: 10 * 60 * 1000,
        blockDurationMs: 20 * 60 * 1000,
      },
    );

    if (!networkRateLimit.allowed) {
      return {
        success: false as const,
        error: buildPairingRetryMessage(networkRateLimit.retryAfterMs),
      };
    }

    const deviceScopeKey = await hashDeviceFingerprint(args.deviceFingerprint);
    const rateLimit = await ctx.runMutation(
      internal.rateLimits.consumeRateLimit,
      {
        scopeKey: `assisted-pairing:${deviceScopeKey}`,
        actionKey: "pairTabletSession",
        maxHits: 5,
        windowMs: 10 * 60 * 1000,
        blockDurationMs: 20 * 60 * 1000,
      },
    );

    if (!rateLimit.allowed) {
      return {
        success: false as const,
        error: buildPairingRetryMessage(rateLimit.retryAfterMs),
      };
    }

    const pinHash = await hashAssistedPin(args.pinCode);
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
      seniorProfile.familySpaceId !== activePin.familySpaceId ||
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
      familySpaceId: activePin.familySpaceId,
      seniorProfileId: seniorProfile._id,
      sessionType: "assisted_device",
      deviceFingerprint: args.deviceFingerprint,
      sourcePinId: activePin._id,
      sourceMembershipId: activePin.createdByMembershipId,
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
    const { membership } = await requireFamilySideCapability(
      ctx,
      "manage_tablet_access",
    );
    const organiserSeniorName =
      normalizeOptionalText(args.seniorName) ?? MEMBER_LABEL;

    const assistedSenior =
      (await getSeniorProfileByMode(
        ctx,
        membership.familySpaceId,
        "assisted",
      )) ??
      (await upsertAssistedSeniorProfile(ctx, {
        familySpaceId: membership.familySpaceId,
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
      familySpaceId: membership.familySpaceId,
      seniorProfileId: assistedSenior._id,
      createdByMembershipId: membership._id,
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
      membership.familySpaceId,
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
