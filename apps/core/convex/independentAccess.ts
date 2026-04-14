import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import {
  getIndependentMembershipForSeniorProfile,
  getSeniorProfileByMode,
  requireFamilySideCapability,
  upsertIndependentSeniorProfile,
} from "./circleAuth";
import {
  formatInvalidSessionMessage,
  INDEPENDENT_PROFILE_LABEL,
  MEMBER_LABEL,
  normalizeUserFacingText,
  buildCircleName,
} from "./terminology";
import {
  formatIndependentRecoveryCode,
  generateNumericCode,
  generateOpaqueToken,
  hashIndependentOnboardingToken,
  hashIndependentRecoveryCode,
  INDEPENDENT_ONBOARDING_TTL_MS,
  INDEPENDENT_RECOVERY_CODE_COUNT,
  normalizeOptionalText,
  PASSKEY_CHALLENGE_TTL_MS,
} from "./security";
import {
  issueSeniorAccessSession,
  revokeSeniorSessionsForProfile,
  validateSeniorSession,
} from "./seniorAccessHelpers";

type DbCtx = MutationCtx | QueryCtx;

const INDEPENDENT_ONBOARDING_MAX_HITS = 5;
const INDEPENDENT_ONBOARDING_WINDOW_MS = 10 * 60 * 1000;
const INDEPENDENT_ONBOARDING_BLOCK_MS = 10 * 60 * 1000;
const INDEPENDENT_RECOVERY_MAX_HITS = 5;
const INDEPENDENT_RECOVERY_WINDOW_MS = 10 * 60 * 1000;
const INDEPENDENT_RECOVERY_BLOCK_MS = 20 * 60 * 1000;

type BeginIndependentOnboardingResult =
  | {
      status: "ready";
      onboardingToken: string;
      seniorName: string;
    }
  | {
      status: "rate_limited";
      retryAfterMs: number;
      message: string;
    };

type RedeemIndependentRecoveryCodeResult =
  | {
      status: "ready";
      sessionToken: string;
      seniorName: string;
    }
  | {
      status: "invalid";
      message: string;
    }
  | {
      status: "rate_limited";
      retryAfterMs: number;
      message: string;
    };

export function buildRateLimitMessage(retryAfterMs: number, noun: string) {
  const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  return `Too many ${noun} attempts. Wait ${retryAfterSeconds} seconds before trying again.`;
}

export function normalizeRecoveryCode(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 12 ? digits : null;
}

export function isActiveDoc(document: { consumedAt: number | null; revokedAt: number | null }) {
  return document.consumedAt === null && document.revokedAt === null;
}

export function isActiveOnboardingSession(
  session: Doc<"independentOnboardingSessions">,
  now: number,
) {
  return (
    session.consumedAt === null &&
    session.revokedAt === null &&
    session.expiresAt > now
  );
}

export function evaluateIndependentPasskeyOwnership(args: {
  existingPasskey:
    | Pick<Doc<"independentSeniorPasskeys">, "circleId" | "seniorProfileId">
    | null;
  circleId: Id<"circles"> | null;
  seniorProfileId: Id<"seniorProfiles">;
}) {
  if (!args.existingPasskey) {
    return { status: "create" as const };
  }

  if (
    args.existingPasskey.circleId !== args.circleId ||
    args.existingPasskey.seniorProfileId !== args.seniorProfileId
  ) {
    return {
      status: "collision" as const,
      message: "This device passkey is already linked to another Circle.",
    };
  }

  return { status: "update" as const };
}

export function evaluateIndependentRecoveryRedemptionState(args: {
  normalizedCode: string | null;
  recoveryCode: Pick<Doc<"independentSeniorRecoveryCodes">, "_id"> | null;
  seniorProfile: Pick<Doc<"seniorProfiles">, "seniorMode"> | null;
}) {
  if (!args.normalizedCode) {
    return {
      status: "invalid" as const,
      message: "Enter a valid recovery code.",
    };
  }

  if (!args.recoveryCode) {
    return {
      status: "invalid" as const,
      message: "That recovery code is no longer available.",
    };
  }

  if (!args.seniorProfile || args.seniorProfile.seniorMode !== "independent") {
    return {
      status: "invalid" as const,
      message: `This ${INDEPENDENT_PROFILE_LABEL.toLowerCase()} could not be found.`,
    };
  }

  return { status: "ready" as const };
}

async function getActiveChallenge(
  ctx: DbCtx,
  seniorProfileId: Id<"seniorProfiles">,
  purpose: "passkey_registration",
) {
  const challenges = await ctx.db
    .query("seniorAuthChallenges")
    .withIndex("by_seniorProfileId_and_purpose", (query) =>
      query.eq("seniorProfileId", seniorProfileId).eq("purpose", purpose),
    )
    .order("desc")
    .take(10);

  const now = Date.now();
  return (
    challenges.find(
      (challenge) => challenge.consumedAt === null && challenge.expiresAt > now,
    ) ?? null
  );
}

async function invalidateRegistrationChallenges(
  ctx: MutationCtx,
  seniorProfileId: Id<"seniorProfiles">,
) {
  const challenges = await ctx.db
    .query("seniorAuthChallenges")
    .withIndex("by_seniorProfileId_and_purpose", (query) =>
      query.eq("seniorProfileId", seniorProfileId).eq("purpose", "passkey_registration"),
    )
    .take(20);

  const consumedAt = Date.now();
  for (const challenge of challenges) {
    if (challenge.consumedAt === null) {
      await ctx.db.patch(challenge._id, { consumedAt });
    }
  }
}

async function getActivePasskeys(
  ctx: DbCtx,
  seniorProfileId: Id<"seniorProfiles">,
) {
  const passkeys = await ctx.db
    .query("independentSeniorPasskeys")
    .withIndex("by_seniorProfileId", (query) =>
      query.eq("seniorProfileId", seniorProfileId),
    )
    .take(20);

  return passkeys.filter((passkey) => passkey.revokedAt === null);
}

async function getActiveRecoveryCodes(
  ctx: DbCtx,
  seniorProfileId: Id<"seniorProfiles">,
) {
  const recoveryCodes = await ctx.db
    .query("independentSeniorRecoveryCodes")
    .withIndex("by_seniorProfileId", (query) =>
      query.eq("seniorProfileId", seniorProfileId),
    )
    .take(50);

  return recoveryCodes.filter((code) => isActiveDoc(code));
}

async function getRecoveryCodeSummary(
  ctx: DbCtx,
  seniorProfileId: Id<"seniorProfiles">,
) {
  const recoveryCodes = await getActiveRecoveryCodes(ctx, seniorProfileId);
  const lastGeneratedAt = recoveryCodes.reduce<number | null>(
    (latest, code) => (latest === null || code.createdAt > latest ? code.createdAt : latest),
    null,
  );

  return {
    activeCount: recoveryCodes.length,
    lastGeneratedAt,
  };
}

async function resolveActiveOnboardingSession(
  ctx: DbCtx,
  onboardingToken: string,
) {
  const tokenHash = await hashIndependentOnboardingToken(onboardingToken);
  const onboardingSession = await ctx.db
    .query("independentOnboardingSessions")
    .withIndex("by_tokenHash", (query) => query.eq("tokenHash", tokenHash))
    .unique();

  if (!onboardingSession || !isActiveOnboardingSession(onboardingSession, Date.now())) {
    return null;
  }

  const [seniorProfile, sourceCircleMembership] = await Promise.all([
    ctx.db.get(onboardingSession.seniorProfileId),
    onboardingSession.sourceCircleMembershipId
      ? ctx.db.get(onboardingSession.sourceCircleMembershipId)
      : Promise.resolve(null),
  ]);

  if (!seniorProfile || seniorProfile.seniorMode !== "independent") {
    return null;
  }

  if (
    sourceCircleMembership &&
    (sourceCircleMembership.seniorProfileId !== seniorProfile._id ||
      sourceCircleMembership.circleId !== seniorProfile.circleId)
  ) {
    return null;
  }

  return {
    onboardingSession,
    seniorProfile,
    sourceCircleMembership,
  };
}

async function requireIndependentWebSession(
  ctx: DbCtx,
  args: { sessionToken: string; deviceFingerprint: string },
) {
  const validation = await validateSeniorSession(ctx, {
    sessionToken: args.sessionToken,
    deviceFingerprint: args.deviceFingerprint,
    expectedSessionType: "independent_web",
  });

  if (validation.status === "invalid") {
    throw new Error(formatInvalidSessionMessage(validation.reason));
  }

  if (validation.seniorProfile.seniorMode !== "independent") {
    throw new Error(`This ${INDEPENDENT_PROFILE_LABEL} session is not available.`);
  }

  return validation;
}

async function upsertIndependentPasskey(
  ctx: MutationCtx,
  args: {
    circleId: Id<"circles"> | null;
    seniorProfileId: Id<"seniorProfiles">;
    credentialId: string;
    credentialPublicKey: string;
    counter: number;
    deviceType: string;
    backedUp: boolean;
    transports: string[];
  },
) {
  const existingPasskey = await ctx.db
    .query("independentSeniorPasskeys")
    .withIndex("by_credentialId", (query) => query.eq("credentialId", args.credentialId))
    .unique();

  const ownership = evaluateIndependentPasskeyOwnership({
    existingPasskey,
    circleId: args.circleId,
    seniorProfileId: args.seniorProfileId,
  });

  if (ownership.status === "collision") {
    throw new Error(ownership.message);
  }

  if (ownership.status === "update") {
    if (!existingPasskey) {
      throw new Error("This device passkey is no longer available.");
    }

    await ctx.db.patch(existingPasskey._id, {
      circleId: args.circleId,
      seniorProfileId: args.seniorProfileId,
      credentialPublicKey: args.credentialPublicKey,
      counter: args.counter,
      deviceType: args.deviceType,
      backedUp: args.backedUp,
      transports: args.transports,
      revokedAt: null,
    });

    return existingPasskey._id;
  }

  return await ctx.db.insert("independentSeniorPasskeys", {
    circleId: args.circleId,
    seniorProfileId: args.seniorProfileId,
    credentialId: args.credentialId,
    credentialPublicKey: args.credentialPublicKey,
    counter: args.counter,
    deviceType: args.deviceType,
    backedUp: args.backedUp,
    transports: args.transports,
    lastUsedAt: null,
    revokedAt: null,
  });
}

async function revokeSessionsBackedByPasskey(
  ctx: MutationCtx,
  passkey: Doc<"independentSeniorPasskeys">,
  reason: string,
) {
  const sessions = await ctx.db
    .query("seniorAccessSessions")
    .withIndex("by_seniorProfileId", (query) =>
      query.eq("seniorProfileId", passkey.seniorProfileId),
    )
    .take(50);

  const revokedAt = Date.now();
  for (const session of sessions) {
    if (
      session.revokedAt === null &&
      session.sessionType === "independent_web" &&
      session.sourcePasskeyId === passkey._id
    ) {
      await ctx.db.patch(session._id, {
        revokedAt,
        revokedReason: reason,
      });
    }
  }
}

async function revokeActiveRecoveryCodesForProfile(
  ctx: MutationCtx,
  seniorProfileId: Id<"seniorProfiles">,
  revokedAt: number,
) {
  const recoveryCodes = await ctx.db
    .query("independentSeniorRecoveryCodes")
    .withIndex("by_seniorProfileId", (query) =>
      query.eq("seniorProfileId", seniorProfileId),
    )
    .take(50);

  let revokedCount = 0;
  for (const recoveryCode of recoveryCodes) {
    if (!isActiveDoc(recoveryCode)) {
      continue;
    }

    await ctx.db.patch(recoveryCode._id, { revokedAt });
    revokedCount += 1;
  }

  return revokedCount;
}

async function rotateRecoveryCodes(
  ctx: MutationCtx,
  args: {
    circleId: Id<"circles"> | null;
    seniorProfileId: Id<"seniorProfiles">;
    createdByCircleMembershipId: Id<"circleMemberships"> | null;
    createdBySource: "independent" | "organiser";
  },
) {
  const revokedAt = Date.now();
  await revokeActiveRecoveryCodesForProfile(ctx, args.seniorProfileId, revokedAt);

  const createdAt = Date.now();
  const recoveryCodes: string[] = [];

  for (let index = 0; index < INDEPENDENT_RECOVERY_CODE_COUNT; index += 1) {
    const rawCode = generateNumericCode(12);
    await ctx.db.insert("independentSeniorRecoveryCodes", {
      circleId: args.circleId,
      seniorProfileId: args.seniorProfileId,
      codeHash: await hashIndependentRecoveryCode(rawCode),
      codeSuffix: rawCode.slice(-4),
      createdAt,
      createdByCircleMembershipId: args.createdByCircleMembershipId,
      createdBySource: args.createdBySource,
      consumedAt: null,
      revokedAt: null,
    });
    recoveryCodes.push(formatIndependentRecoveryCode(rawCode));
  }

  return {
    codes: recoveryCodes,
    createdAt,
  };
}

export const beginIndependentOnboarding = mutation({
  args: {
    displayName: v.string(),
    throttleScopeKey: v.string(),
  },
  handler: async (ctx, args): Promise<BeginIndependentOnboardingResult> => {
    const rateLimit = await ctx.runMutation(internal.rateLimits.consumeRateLimit, {
      scopeKey: args.throttleScopeKey,
      actionKey: "beginIndependentOnboarding",
      maxHits: INDEPENDENT_ONBOARDING_MAX_HITS,
      windowMs: INDEPENDENT_ONBOARDING_WINDOW_MS,
      blockDurationMs: INDEPENDENT_ONBOARDING_BLOCK_MS,
    });

    if (!rateLimit.allowed) {
      return {
        status: "rate_limited",
        retryAfterMs: rateLimit.retryAfterMs,
        message: buildRateLimitMessage(rateLimit.retryAfterMs, "setup"),
      };
    }

    const displayName = normalizeOptionalText(args.displayName);
    if (!displayName) {
      throw new Error("Please tell Memvella what to call you.");
    }

    const circleId = await ctx.db.insert("circles", {
      displayName: buildCircleName(displayName),
      timezone: undefined,
      locale: undefined,
    });

    const seniorProfile = await upsertIndependentSeniorProfile(ctx, {
      circleId,
      displayName,
    });

    if (!seniorProfile) {
      throw new Error(`Unable to create the ${INDEPENDENT_PROFILE_LABEL}.`);
    }

    const onboardingToken = generateOpaqueToken();
    await ctx.db.insert("independentOnboardingSessions", {
      seniorProfileId: seniorProfile._id,
      sourceCircleMembershipId: null,
      tokenHash: await hashIndependentOnboardingToken(onboardingToken),
      expiresAt: Date.now() + INDEPENDENT_ONBOARDING_TTL_MS,
      consumedAt: null,
      revokedAt: null,
    });

    return {
      status: "ready",
      onboardingToken,
      seniorName: displayName,
    };
  },
});

export const getIndependentOnboardingPasskeyContext = query({
  args: {
    onboardingToken: v.string(),
  },
  handler: async (ctx, args) => {
    const onboardingContext = await resolveActiveOnboardingSession(
      ctx,
      args.onboardingToken,
    );
    if (!onboardingContext) {
      return null;
    }

    return {
      seniorProfileId: onboardingContext.seniorProfile._id,
      seniorName:
        normalizeUserFacingText(onboardingContext.seniorProfile.displayName) ??
        MEMBER_LABEL,
      passkeys: await getActivePasskeys(ctx, onboardingContext.seniorProfile._id),
      activeRegistrationChallenge: await getActiveChallenge(
        ctx,
        onboardingContext.seniorProfile._id,
        "passkey_registration",
      ),
    };
  },
});

export const storeOnboardingPasskeyRegistrationChallenge = mutation({
  args: {
    onboardingToken: v.string(),
    challenge: v.string(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const onboardingContext = await resolveActiveOnboardingSession(
      ctx,
      args.onboardingToken,
    );
    if (!onboardingContext) {
      throw new Error("This setup request is no longer active.");
    }

    await invalidateRegistrationChallenges(ctx, onboardingContext.seniorProfile._id);

    return await ctx.db.insert("seniorAuthChallenges", {
      seniorProfileId: onboardingContext.seniorProfile._id,
      purpose: "passkey_registration",
      challenge: args.challenge,
      expiresAt: args.expiresAt ?? Date.now() + PASSKEY_CHALLENGE_TTL_MS,
      consumedAt: null,
    });
  },
});

export const completeOnboardingPasskeyRegistration = mutation({
  args: {
    onboardingToken: v.string(),
    challenge: v.string(),
    credentialId: v.string(),
    credentialPublicKey: v.string(),
    counter: v.number(),
    deviceType: v.string(),
    backedUp: v.boolean(),
    transports: v.array(v.string()),
    deviceFingerprint: v.string(),
  },
  handler: async (ctx, args) => {
    const onboardingContext = await resolveActiveOnboardingSession(
      ctx,
      args.onboardingToken,
    );
    if (!onboardingContext) {
      throw new Error("This setup request is no longer active.");
    }

    const activeChallenge = await getActiveChallenge(
      ctx,
      onboardingContext.seniorProfile._id,
      "passkey_registration",
    );
    if (!activeChallenge || activeChallenge.challenge !== args.challenge) {
      throw new Error("The passkey setup request expired. Please try again.");
    }

    await ctx.db.patch(activeChallenge._id, {
      consumedAt: Date.now(),
    });

    const passkeyId = await upsertIndependentPasskey(ctx, {
      circleId: onboardingContext.seniorProfile.circleId,
      seniorProfileId: onboardingContext.seniorProfile._id,
      credentialId: args.credentialId,
      credentialPublicKey: args.credentialPublicKey,
      counter: args.counter,
      deviceType: args.deviceType,
      backedUp: args.backedUp,
      transports: args.transports,
    });

    await ctx.db.patch(onboardingContext.onboardingSession._id, {
      consumedAt: Date.now(),
    });

    if (onboardingContext.sourceCircleMembership) {
      await ctx.db.patch(onboardingContext.sourceCircleMembership._id, {
        onboardingStep: 2,
        lastSeenAt: Date.now(),
      });
    }

    const session = await issueSeniorAccessSession(ctx, {
      circleId: onboardingContext.seniorProfile.circleId,
      seniorProfileId: onboardingContext.seniorProfile._id,
      sessionType: "independent_web",
      deviceFingerprint: args.deviceFingerprint,
      sourceCircleMembershipId: onboardingContext.sourceCircleMembership?._id ?? null,
      sourcePasskeyId: passkeyId,
      sourcePinId: null,
    });

    return {
      sessionToken: session.sessionToken,
      seniorName:
        normalizeUserFacingText(onboardingContext.seniorProfile.displayName) ??
        MEMBER_LABEL,
    };
  },
});

export const getIndependentPasskeyRegistrationContext = query({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
  },
  handler: async (ctx, args) => {
    const validation = await requireIndependentWebSession(ctx, args);

    return {
      seniorProfileId: validation.seniorProfile._id,
      seniorName:
        normalizeUserFacingText(validation.seniorProfile.displayName) ?? MEMBER_LABEL,
      passkeys: await getActivePasskeys(ctx, validation.seniorProfile._id),
      activeRegistrationChallenge: await getActiveChallenge(
        ctx,
        validation.seniorProfile._id,
        "passkey_registration",
      ),
      currentPasskeyId: validation.session.sourcePasskeyId,
    };
  },
});

export const storeSessionPasskeyRegistrationChallenge = mutation({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
    challenge: v.string(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const validation = await requireIndependentWebSession(ctx, args);
    await invalidateRegistrationChallenges(ctx, validation.seniorProfile._id);

    return await ctx.db.insert("seniorAuthChallenges", {
      seniorProfileId: validation.seniorProfile._id,
      purpose: "passkey_registration",
      challenge: args.challenge,
      expiresAt: args.expiresAt ?? Date.now() + PASSKEY_CHALLENGE_TTL_MS,
      consumedAt: null,
    });
  },
});

export const completeSessionPasskeyRegistration = mutation({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
    challenge: v.string(),
    credentialId: v.string(),
    credentialPublicKey: v.string(),
    counter: v.number(),
    deviceType: v.string(),
    backedUp: v.boolean(),
    transports: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const validation = await requireIndependentWebSession(ctx, args);
    const activeChallenge = await getActiveChallenge(
      ctx,
      validation.seniorProfile._id,
      "passkey_registration",
    );

    if (!activeChallenge || activeChallenge.challenge !== args.challenge) {
      throw new Error("The passkey setup request expired. Please try again.");
    }

    await ctx.db.patch(activeChallenge._id, {
      consumedAt: Date.now(),
    });

    const passkeyId = await upsertIndependentPasskey(ctx, {
      circleId: validation.seniorProfile.circleId,
      seniorProfileId: validation.seniorProfile._id,
      credentialId: args.credentialId,
      credentialPublicKey: args.credentialPublicKey,
      counter: args.counter,
      deviceType: args.deviceType,
      backedUp: args.backedUp,
      transports: args.transports,
    });

    return { passkeyId };
  },
});

export const getIndependentAuthenticationCredential = query({
  args: {
    credentialId: v.string(),
  },
  handler: async (ctx, args) => {
    const passkey = await ctx.db
      .query("independentSeniorPasskeys")
      .withIndex("by_credentialId", (query) => query.eq("credentialId", args.credentialId))
      .unique();

    if (!passkey || passkey.revokedAt !== null) {
      return null;
    }

    return {
      credentialId: passkey.credentialId,
      credentialPublicKey: passkey.credentialPublicKey,
      counter: passkey.counter,
      transports: passkey.transports,
    };
  },
});

export const completeDiscoverablePasskeyAuthentication = mutation({
  args: {
    credentialId: v.string(),
    nextCounter: v.number(),
    deviceFingerprint: v.string(),
  },
  handler: async (ctx, args) => {
    const passkey = await ctx.db
      .query("independentSeniorPasskeys")
      .withIndex("by_credentialId", (query) => query.eq("credentialId", args.credentialId))
      .unique();

    if (!passkey || passkey.revokedAt !== null) {
      throw new Error("That passkey is no longer available.");
    }

    const seniorProfile = await ctx.db.get(passkey.seniorProfileId);
    if (!seniorProfile || seniorProfile.seniorMode !== "independent") {
      throw new Error(`This ${INDEPENDENT_PROFILE_LABEL} could not be found.`);
    }

    const membership = await getIndependentMembershipForSeniorProfile(
      ctx,
      passkey.circleId,
      passkey.seniorProfileId,
    );

    await ctx.db.patch(passkey._id, {
      counter: args.nextCounter,
      lastUsedAt: Date.now(),
    });

    await revokeSeniorSessionsForProfile(ctx, {
      seniorProfileId: passkey.seniorProfileId,
      sessionType: "independent_web",
      reason: "passkey_sign_in_replaced_previous_session",
    });

    const session = await issueSeniorAccessSession(ctx, {
      circleId: passkey.circleId,
      seniorProfileId: passkey.seniorProfileId,
      sessionType: "independent_web",
      deviceFingerprint: args.deviceFingerprint,
      sourcePinId: null,
      sourceCircleMembershipId: membership?._id ?? null,
      sourcePasskeyId: passkey._id,
    });

    return {
      sessionToken: session.sessionToken,
      seniorName: normalizeUserFacingText(seniorProfile.displayName) ?? MEMBER_LABEL,
    };
  },
});

export const redeemIndependentRecoveryCode = mutation({
  args: {
    recoveryCode: v.string(),
    deviceFingerprint: v.string(),
    throttleScopeKey: v.string(),
  },
  handler: async (ctx, args): Promise<RedeemIndependentRecoveryCodeResult> => {
    const rateLimit = await ctx.runMutation(internal.rateLimits.consumeRateLimit, {
      scopeKey: args.throttleScopeKey,
      actionKey: "redeemIndependentRecoveryCode",
      maxHits: INDEPENDENT_RECOVERY_MAX_HITS,
      windowMs: INDEPENDENT_RECOVERY_WINDOW_MS,
      blockDurationMs: INDEPENDENT_RECOVERY_BLOCK_MS,
    });

    if (!rateLimit.allowed) {
      return {
        status: "rate_limited",
        retryAfterMs: rateLimit.retryAfterMs,
        message: buildRateLimitMessage(rateLimit.retryAfterMs, "recovery"),
      };
    }

    const normalizedCode = normalizeRecoveryCode(args.recoveryCode);
    if (!normalizedCode) {
      const invalidState = evaluateIndependentRecoveryRedemptionState({
        normalizedCode,
        recoveryCode: null,
        seniorProfile: null,
      });
      if (invalidState.status === "invalid") {
        return invalidState;
      }

      throw new Error("Enter a valid recovery code.");
    }

    const recoveryCodeHash = await hashIndependentRecoveryCode(normalizedCode);
    const matchingCodes = await ctx.db
      .query("independentSeniorRecoveryCodes")
      .withIndex("by_codeHash", (query) => query.eq("codeHash", recoveryCodeHash))
      .take(10);
    const recoveryCode = matchingCodes.find((code) => isActiveDoc(code));
    if (!recoveryCode) {
      const invalidState = evaluateIndependentRecoveryRedemptionState({
        normalizedCode,
        recoveryCode: null,
        seniorProfile: null,
      });
      if (invalidState.status === "invalid") {
        return invalidState;
      }

      throw new Error("That recovery code is no longer available.");
    }

    const seniorProfile = await ctx.db.get(recoveryCode.seniorProfileId);
    const redemptionState = evaluateIndependentRecoveryRedemptionState({
      normalizedCode,
      recoveryCode,
      seniorProfile,
    });
    if (redemptionState.status === "invalid") {
      return redemptionState;
    }

    if (!seniorProfile || seniorProfile.seniorMode !== "independent") {
      throw new Error(`This ${INDEPENDENT_PROFILE_LABEL.toLowerCase()} could not be found.`);
    }

    const membership = await getIndependentMembershipForSeniorProfile(
      ctx,
      seniorProfile.circleId,
      seniorProfile._id,
    );

    await ctx.db.patch(recoveryCode._id, {
      consumedAt: Date.now(),
    });

    await revokeSeniorSessionsForProfile(ctx, {
      seniorProfileId: seniorProfile._id,
      sessionType: "independent_web",
      reason: "recovery_code_sign_in_replaced_previous_session",
    });

    const session = await issueSeniorAccessSession(ctx, {
      circleId: seniorProfile.circleId,
      seniorProfileId: seniorProfile._id,
      sessionType: "independent_web",
      deviceFingerprint: args.deviceFingerprint,
      sourcePinId: null,
      sourceCircleMembershipId: membership?._id ?? null,
      sourcePasskeyId: null,
    });

    return {
      status: "ready",
      sessionToken: session.sessionToken,
      seniorName: normalizeUserFacingText(seniorProfile.displayName) ?? MEMBER_LABEL,
    };
  },
});

export const getIndependentSecurityOverview = query({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
  },
  handler: async (ctx, args) => {
    const validation = await requireIndependentWebSession(ctx, args);
    const passkeys = await getActivePasskeys(ctx, validation.seniorProfile._id);
    const recoveryCodes = await getRecoveryCodeSummary(ctx, validation.seniorProfile._id);

    return {
      seniorName:
        normalizeUserFacingText(validation.seniorProfile.displayName) ?? MEMBER_LABEL,
      trustedDevices: [...passkeys]
        .sort((left, right) => {
          const leftLastUsedAt = left.lastUsedAt ?? left._creationTime;
          const rightLastUsedAt = right.lastUsedAt ?? right._creationTime;
          return rightLastUsedAt - leftLastUsedAt;
        })
        .map((passkey) => ({
          id: passkey._id,
          deviceType: passkey.deviceType,
          backedUp: passkey.backedUp,
          lastUsedAt: passkey.lastUsedAt,
          createdAt: passkey._creationTime,
          codeSuffix: null as string | null,
          isCurrentDevice: passkey._id === validation.session.sourcePasskeyId,
        })),
      recoveryCodes,
    };
  },
});

export const rotateIndependentRecoveryCodes = mutation({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
  },
  handler: async (ctx, args) => {
    const validation = await requireIndependentWebSession(ctx, args);

    return await rotateRecoveryCodes(ctx, {
      circleId: validation.seniorProfile.circleId,
      seniorProfileId: validation.seniorProfile._id,
      createdByCircleMembershipId: validation.session.sourceCircleMembershipId ?? null,
      createdBySource: "independent",
    });
  },
});

export const revokeIndependentTrustedDevice = mutation({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
    passkeyId: v.id("independentSeniorPasskeys"),
  },
  handler: async (ctx, args) => {
    const validation = await requireIndependentWebSession(ctx, args);
    const passkey = await ctx.db.get(args.passkeyId);
    if (
      !passkey ||
      passkey.seniorProfileId !== validation.seniorProfile._id ||
      passkey.circleId !== validation.seniorProfile.circleId
    ) {
      throw new Error("That trusted device could not be found.");
    }

    await ctx.db.patch(passkey._id, {
      revokedAt: Date.now(),
    });
    await revokeSessionsBackedByPasskey(
      ctx,
      passkey,
      "independent_trusted_device_revoked",
    );

    return { revoked: true as const };
  },
});

export const getOrganiserIndependentRecoveryOverview = query({
  args: {},
  handler: async (ctx) => {
    const { membership } = await requireFamilySideCapability(ctx, "manage_circle_members");
    const seniorProfile = await getSeniorProfileByMode(
      ctx,
      membership.circleId,
      "independent",
    );
    if (!seniorProfile) {
      return null;
    }

    const passkeys = await getActivePasskeys(ctx, seniorProfile._id);
    const recoveryCodes = await getRecoveryCodeSummary(ctx, seniorProfile._id);

    return {
      seniorName: normalizeUserFacingText(seniorProfile.displayName) ?? MEMBER_LABEL,
      trustedDevices: [...passkeys]
        .sort((left, right) => {
          const leftLastUsedAt = left.lastUsedAt ?? left._creationTime;
          const rightLastUsedAt = right.lastUsedAt ?? right._creationTime;
          return rightLastUsedAt - leftLastUsedAt;
        })
        .map((passkey) => ({
          id: passkey._id,
          deviceType: passkey.deviceType,
          backedUp: passkey.backedUp,
          lastUsedAt: passkey.lastUsedAt,
          createdAt: passkey._creationTime,
        })),
      recoveryCodes,
    };
  },
});

export const revokeIndependentTrustedDeviceForOrganiser = mutation({
  args: {
    passkeyId: v.id("independentSeniorPasskeys"),
  },
  handler: async (ctx, args) => {
    const { circleMembership } = await requireFamilySideCapability(
      ctx,
      "manage_circle_members",
    );
    const passkey = await ctx.db.get(args.passkeyId);
    if (!passkey || passkey.circleId !== (circleMembership?.circleId ?? null)) {
      throw new Error("That trusted device could not be found.");
    }

    await ctx.db.patch(passkey._id, {
      revokedAt: Date.now(),
    });
    await revokeSessionsBackedByPasskey(
      ctx,
      passkey,
      "organiser_revoked_independent_trusted_device",
    );

    return { revoked: true as const };
  },
});

export const revokeAllIndependentTrustedDevicesForOrganiser = mutation({
  args: {},
  handler: async (ctx) => {
    const { membership } = await requireFamilySideCapability(ctx, "manage_circle_members");
    const seniorProfile = await getSeniorProfileByMode(
      ctx,
      membership.circleId,
      "independent",
    );
    if (!seniorProfile) {
      return { revokedCount: 0 };
    }

    const passkeys = await getActivePasskeys(ctx, seniorProfile._id);
    const revokedAt = Date.now();
    for (const passkey of passkeys) {
      await ctx.db.patch(passkey._id, { revokedAt });
      await revokeSessionsBackedByPasskey(
        ctx,
        { ...passkey, revokedAt },
        "organiser_revoked_all_independent_trusted_devices",
      );
    }

    return { revokedCount: passkeys.length };
  },
});

export const rotateIndependentRecoveryCodesForOrganiser = mutation({
  args: {},
  handler: async (ctx) => {
    const { membership, circleMembership } = await requireFamilySideCapability(
      ctx,
      "manage_circle_members",
    );
    const seniorProfile = await getSeniorProfileByMode(
      ctx,
      membership.circleId,
      "independent",
    );
    if (!seniorProfile) {
      throw new Error(`No ${INDEPENDENT_PROFILE_LABEL.toLowerCase()} is linked to this Circle.`);
    }

    return await rotateRecoveryCodes(ctx, {
      circleId: circleMembership?.circleId ?? null,
      seniorProfileId: seniorProfile._id,
      createdByCircleMembershipId: circleMembership?._id ?? null,
      createdBySource: "organiser",
    });
  },
});
