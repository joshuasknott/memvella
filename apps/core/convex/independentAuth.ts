import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import {
  getMembershipByAuthIdentityToken,
  requireFamilySpaceMembership,
  upsertIndependentSeniorProfile,
} from "./familySpaceAuth";
import {
  getIndependentSeniorCredential,
  resolveIndependentSeniorPhoneNumber,
  upsertIndependentSeniorCredential,
} from "./independentSeniorCredentials";
import {
  PASSKEY_CHALLENGE_TTL_MS,
  createSeniorRecoveryKey,
  normalizeOptionalEmail,
  normalizeOptionalText,
  parseSeniorRecoveryKey,
} from "./security";
import {
  issueSeniorAccessSession,
  revokeSeniorSessionsForProfile,
} from "./seniorAccessHelpers";
import {
  buildCircleName,
  INDEPENDENT_PROFILE_LABEL,
  MEMBER_LABEL,
  normalizeUserFacingText,
} from "./terminology";
import {
  ensureCircleForFamilySpace,
  ensureCircleMembershipForLegacyMembership,
  patchCircleFromFamilySpace,
} from "./circleCompat";
import { isValidE164PhoneNumber } from "../lib/phone-number";

type ChallengePurpose = "passkey_registration" | "passkey_authentication";
type FinalizePhoneNumberSignInResult =
  | {
      status: "ready";
      sessionToken: string;
      recoveryKey: string;
      seniorName: string;
      recoveryPhoneNumber: string;
      hasPasskey: boolean;
    }
  | {
      status: "role_collision";
      message: string;
    };

export function evaluatePasskeyAuthenticationCandidate(args: {
  activeChallenge: Pick<Doc<"seniorAuthChallenges">, "challenge"> | null;
  requestedChallenge: string;
  passkey:
    | Pick<Doc<"independentSeniorPasskeys">, "revokedAt" | "seniorProfileId" | "familySpaceId">
    | null;
  seniorProfileId: Id<"seniorProfiles">;
  familySpaceId: Id<"familySpaces">;
}) {
  if (!args.activeChallenge || args.activeChallenge.challenge !== args.requestedChallenge) {
    return {
      status: "invalid" as const,
      message: "The passkey sign-in challenge is no longer valid.",
    };
  }

  if (!args.passkey || args.passkey.revokedAt !== null) {
    return {
      status: "invalid" as const,
      message: "That passkey is no longer available.",
    };
  }

  if (
    args.passkey.seniorProfileId !== args.seniorProfileId ||
    args.passkey.familySpaceId !== args.familySpaceId
  ) {
    return {
      status: "invalid" as const,
      message: "That passkey is not linked to this Circle.",
    };
  }

  return { status: "ready" as const };
}

async function getActiveChallenge(
  ctx: QueryCtx | MutationCtx,
  seniorProfileId: Id<"seniorProfiles">,
  purpose: ChallengePurpose,
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
      (challenge) =>
        challenge.consumedAt === null && challenge.expiresAt > now,
    ) ?? null
  );
}

async function invalidateChallenges(
  ctx: MutationCtx,
  seniorProfileId: Id<"seniorProfiles">,
  purpose: ChallengePurpose,
) {
  const challenges = await ctx.db
    .query("seniorAuthChallenges")
    .withIndex("by_seniorProfileId_and_purpose", (query) =>
      query.eq("seniorProfileId", seniorProfileId).eq("purpose", purpose),
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
  ctx: QueryCtx | MutationCtx,
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

async function resolveIndependentRecoveryProfile(
  ctx: QueryCtx | MutationCtx,
  recoveryKey: string,
) {
  const seniorProfileId = await parseSeniorRecoveryKey(recoveryKey);
  if (!seniorProfileId) {
    return null;
  }

  const seniorProfile = await ctx.db.get(seniorProfileId);
  if (!seniorProfile || seniorProfile.seniorMode !== "independent") {
    return null;
  }

  return seniorProfile;
}

export const finalizePhoneNumberSignIn = mutation({
  args: {
    displayName: v.optional(v.string()),
    deviceFingerprint: v.string(),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args): Promise<FinalizePhoneNumberSignInResult> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated: a valid sign-in link is required.");
    }

    const existingMembership = await getMembershipByAuthIdentityToken(
      ctx,
      identity.tokenIdentifier,
    );
    const normalizedDisplayName =
      normalizeOptionalText(args.displayName) ??
      normalizeOptionalText(identity.name) ??
      MEMBER_LABEL;
    const normalizedEmail = normalizeOptionalEmail(identity.email) ?? null;
    const normalizedPhoneNumber = args.phoneNumber.trim();

    if (!isValidE164PhoneNumber(normalizedPhoneNumber)) {
      throw new Error("A valid phone number is required.");
    }

    let membershipId: Id<"familySpaceMemberships">;
    let familySpaceId: Id<"familySpaces">;
    let seniorProfileId: Id<"seniorProfiles">;

    if (existingMembership) {
      if (existingMembership.role !== "independent_senior") {
        return {
          status: "role_collision",
          message:
            "This email is already linked to a Circle account. Please use a different email for the independent device.",
        };
      }

      familySpaceId = existingMembership.familySpaceId;
      const ensuredSeniorProfile = await upsertIndependentSeniorProfile(ctx, {
        familySpaceId,
        displayName: normalizedDisplayName,
      });

      if (!ensuredSeniorProfile) {
        throw new Error(`Unable to prepare the ${INDEPENDENT_PROFILE_LABEL}.`);
      }

      seniorProfileId = ensuredSeniorProfile._id;
      membershipId = existingMembership._id;

      await ctx.db.patch(existingMembership._id, {
        displayName: normalizedDisplayName,
        authEmail: normalizedEmail,
        seniorProfileId,
        lastSeenAt: Date.now(),
      });

      await ctx.db.patch(familySpaceId, {
        displayName: buildCircleName(normalizedDisplayName),
      });
      await patchCircleFromFamilySpace(ctx, familySpaceId, {
        displayName: buildCircleName(normalizedDisplayName),
      });
    } else {
      familySpaceId = await ctx.db.insert("familySpaces", {
        displayName: buildCircleName(normalizedDisplayName),
        timezone: undefined,
        locale: undefined,
      });
      await ensureCircleForFamilySpace(ctx, familySpaceId);

      const seniorProfile = await upsertIndependentSeniorProfile(ctx, {
        familySpaceId,
        displayName: normalizedDisplayName,
      });

      if (!seniorProfile) {
        throw new Error(`Unable to create the ${INDEPENDENT_PROFILE_LABEL}.`);
      }

      seniorProfileId = seniorProfile._id;
      membershipId = await ctx.db.insert("familySpaceMemberships", {
        familySpaceId,
        authIdentityToken: identity.tokenIdentifier,
        authEmail: normalizedEmail,
        displayName: normalizedDisplayName,
        role: "independent_senior",
        seniorProfileId,
        onboardingStep: 3,
        lastSeenAt: Date.now(),
      });
    }

    await ensureCircleMembershipForLegacyMembership(ctx, membershipId);

    await upsertIndependentSeniorCredential(ctx, {
      familySpaceId,
      seniorProfileId,
      phoneNumber: normalizedPhoneNumber,
    });

    await revokeSeniorSessionsForProfile(ctx, {
      seniorProfileId,
      sessionType: "independent_web",
      reason: "independent_senior_signed_in_again",
    });

    const session = await issueSeniorAccessSession(ctx, {
      familySpaceId,
      seniorProfileId,
      sessionType: "independent_web",
      deviceFingerprint: args.deviceFingerprint,
      sourcePinId: null,
      sourceMembershipId: membershipId,
      sourcePasskeyId: null,
    });

    const activePasskeys = await getActivePasskeys(ctx, seniorProfileId);

    return {
      status: "ready",
      sessionToken: session.sessionToken,
      recoveryKey: await createSeniorRecoveryKey(seniorProfileId),
      seniorName: normalizedDisplayName,
      recoveryPhoneNumber: normalizedPhoneNumber,
      hasPasskey: activePasskeys.length > 0,
    };
  },
});

export const getCurrentIndependentSeniorPasskeyContext = query({
  args: {},
  handler: async (ctx) => {
    const { membership } = await requireFamilySpaceMembership(
      ctx,
      "independent_senior",
    );

    if (membership.seniorProfileId === null) {
      return null;
    }

    const seniorProfile = await ctx.db.get(membership.seniorProfileId);
    if (!seniorProfile || seniorProfile.seniorMode !== "independent") {
      return null;
    }

    const credential = await getIndependentSeniorCredential(ctx, seniorProfile._id);

    return {
      seniorProfileId: seniorProfile._id,
      seniorName: normalizeUserFacingText(seniorProfile.displayName) ?? MEMBER_LABEL,
      recoveryPhoneNumber:
        credential?.phoneNumber ??
        (await resolveIndependentSeniorPhoneNumber(ctx, seniorProfile)),
      passkeys: await getActivePasskeys(ctx, seniorProfile._id),
      activeRegistrationChallenge: await getActiveChallenge(
        ctx,
        seniorProfile._id,
        "passkey_registration",
      ),
    };
  },
});

export const storeCurrentIndependentSeniorPasskeyRegistrationChallenge = mutation({
  args: {
    challenge: v.string(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(
      ctx,
      "independent_senior",
    );

    if (membership.seniorProfileId === null) {
      throw new Error(`This account is not linked to an ${INDEPENDENT_PROFILE_LABEL}.`);
    }

    await invalidateChallenges(
      ctx,
      membership.seniorProfileId,
      "passkey_registration",
    );

    return await ctx.db.insert("seniorAuthChallenges", {
      seniorProfileId: membership.seniorProfileId,
      purpose: "passkey_registration",
      challenge: args.challenge,
      expiresAt: args.expiresAt ?? Date.now() + PASSKEY_CHALLENGE_TTL_MS,
      consumedAt: null,
    });
  },
});

export const saveCurrentIndependentSeniorPasskey = mutation({
  args: {
    challenge: v.string(),
    credentialId: v.string(),
    credentialPublicKey: v.string(),
    counter: v.number(),
    deviceType: v.string(),
    backedUp: v.boolean(),
    transports: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(
      ctx,
      "independent_senior",
    );

    if (membership.seniorProfileId === null) {
      throw new Error(`This account is not linked to an ${INDEPENDENT_PROFILE_LABEL}.`);
    }

    const activeChallenge = await getActiveChallenge(
      ctx,
      membership.seniorProfileId,
      "passkey_registration",
    );

    if (!activeChallenge || activeChallenge.challenge !== args.challenge) {
      throw new Error("The passkey registration challenge is no longer valid.");
    }

    await ctx.db.patch(activeChallenge._id, {
      consumedAt: Date.now(),
    });

    const existingPasskey = await ctx.db
      .query("independentSeniorPasskeys")
      .withIndex("by_credentialId", (query) =>
        query.eq("credentialId", args.credentialId),
      )
      .unique();

    if (existingPasskey) {
      if (
        existingPasskey.familySpaceId !== membership.familySpaceId ||
        existingPasskey.seniorProfileId !== membership.seniorProfileId
      ) {
        throw new Error("This Face ID / Touch ID passkey is already linked to another Circle.");
      }

      await ctx.db.patch(existingPasskey._id, {
        familySpaceId: membership.familySpaceId,
        seniorProfileId: membership.seniorProfileId,
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
      familySpaceId: membership.familySpaceId,
      seniorProfileId: membership.seniorProfileId,
      credentialId: args.credentialId,
      credentialPublicKey: args.credentialPublicKey,
      counter: args.counter,
      deviceType: args.deviceType,
      backedUp: args.backedUp,
      transports: args.transports,
      lastUsedAt: null,
      revokedAt: null,
    });
  },
});

export const getIndependentSeniorRecoveryProfile = query({
  args: {
    recoveryKey: v.string(),
  },
  handler: async (ctx, args) => {
    const seniorProfile = await resolveIndependentRecoveryProfile(
      ctx,
      args.recoveryKey,
    );
    if (!seniorProfile) {
      return null;
    }

    const passkeys = await getActivePasskeys(ctx, seniorProfile._id);
    const recoveryPhoneNumber = await resolveIndependentSeniorPhoneNumber(
      ctx,
      seniorProfile,
    );

    return {
      seniorName: normalizeUserFacingText(seniorProfile.displayName) ?? MEMBER_LABEL,
      recoveryPhoneNumber,
      hasPasskey: passkeys.length > 0,
    };
  },
});

export const storePasskeyAuthenticationChallenge = mutation({
  args: {
    recoveryKey: v.string(),
    challenge: v.string(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const seniorProfile = await resolveIndependentRecoveryProfile(
      ctx,
      args.recoveryKey,
    );
    if (!seniorProfile) {
      throw new Error(`This ${INDEPENDENT_PROFILE_LABEL} could not be found.`);
    }

    await invalidateChallenges(
      ctx,
      seniorProfile._id,
      "passkey_authentication",
    );

    return await ctx.db.insert("seniorAuthChallenges", {
      seniorProfileId: seniorProfile._id,
      purpose: "passkey_authentication",
      challenge: args.challenge,
      expiresAt: args.expiresAt ?? Date.now() + PASSKEY_CHALLENGE_TTL_MS,
      consumedAt: null,
    });
  },
});

export const getPasskeyAuthenticationMaterial = query({
  args: {
    recoveryKey: v.string(),
  },
  handler: async (ctx, args) => {
    const seniorProfile = await resolveIndependentRecoveryProfile(
      ctx,
      args.recoveryKey,
    );
    if (!seniorProfile) {
      return null;
    }

    return {
      passkeys: await getActivePasskeys(ctx, seniorProfile._id),
      activeAuthenticationChallenge: await getActiveChallenge(
        ctx,
        seniorProfile._id,
        "passkey_authentication",
      ),
    };
  },
});

export const completePasskeyAuthentication = mutation({
  args: {
    recoveryKey: v.string(),
    challenge: v.string(),
    credentialId: v.string(),
    nextCounter: v.number(),
    deviceFingerprint: v.string(),
  },
  handler: async (ctx, args) => {
    const seniorProfile = await resolveIndependentRecoveryProfile(
      ctx,
      args.recoveryKey,
    );
    if (!seniorProfile) {
      throw new Error(`This ${INDEPENDENT_PROFILE_LABEL} could not be found.`);
    }

    const activeChallenge = await getActiveChallenge(
      ctx,
      seniorProfile._id,
      "passkey_authentication",
    );
    if (!activeChallenge || activeChallenge.challenge !== args.challenge) {
      throw new Error("The passkey sign-in challenge is no longer valid.");
    }

    const passkey = await ctx.db
      .query("independentSeniorPasskeys")
      .withIndex("by_credentialId", (query) =>
        query.eq("credentialId", args.credentialId),
      )
      .unique();

    const candidateState = evaluatePasskeyAuthenticationCandidate({
      activeChallenge,
      requestedChallenge: args.challenge,
      passkey,
      seniorProfileId: seniorProfile._id,
      familySpaceId: seniorProfile.familySpaceId,
    });
    if (candidateState.status === "invalid") {
      throw new Error(candidateState.message);
    }

    if (!passkey) {
      throw new Error("That passkey is no longer available.");
    }

    await ctx.db.patch(activeChallenge._id, {
      consumedAt: Date.now(),
    });
    await ctx.db.patch(passkey._id, {
      counter: args.nextCounter,
      lastUsedAt: Date.now(),
    });

    await revokeSeniorSessionsForProfile(ctx, {
      seniorProfileId: seniorProfile._id,
      sessionType: "independent_web",
      reason: "passkey_sign_in_replaced_previous_session",
    });

    const session = await issueSeniorAccessSession(ctx, {
      familySpaceId: seniorProfile.familySpaceId,
      seniorProfileId: seniorProfile._id,
      sessionType: "independent_web",
      deviceFingerprint: args.deviceFingerprint,
      sourcePinId: null,
      sourceMembershipId: null,
      sourcePasskeyId: passkey._id,
    });

    return {
      sessionToken: session.sessionToken,
      recoveryKey: await createSeniorRecoveryKey(seniorProfile._id),
      seniorName: normalizeUserFacingText(seniorProfile.displayName) ?? MEMBER_LABEL,
    };
  },
});
