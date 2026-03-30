import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import {
  getMembershipByAuthIdentityToken,
  requireFamilySpaceMembership,
  upsertIndependentSeniorProfile,
} from "./familySpaceAuth";
import { PASSKEY_CHALLENGE_TTL_MS, normalizeOptionalEmail, normalizeOptionalText } from "./security";
import {
  issueSeniorAccessSession,
  revokeSeniorSessionsForProfile,
} from "./seniorAccessHelpers";

type ChallengePurpose = "passkey_registration" | "passkey_authentication";
type FinalizeMagicLinkSignInResult =
  | {
      status: "ready";
      sessionToken: string;
      seniorProfileId: Id<"seniorProfiles">;
      seniorName: string;
      hasPasskey: boolean;
    }
  | {
      status: "role_collision";
      message: string;
    };

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

export const finalizeMagicLinkSignIn = mutation({
  args: {
    displayName: v.optional(v.string()),
    deviceFingerprint: v.string(),
  },
  handler: async (ctx, args): Promise<FinalizeMagicLinkSignInResult> => {
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
      "Independent Senior";
    const normalizedEmail = normalizeOptionalEmail(identity.email) ?? null;

    let membershipId: Id<"familySpaceMemberships">;
    let familySpaceId: Id<"familySpaces">;
    let seniorProfileId: Id<"seniorProfiles">;

    if (existingMembership) {
      if (existingMembership.role !== "independent_senior") {
        return {
          status: "role_collision",
          message:
            "This email is already registered as a Supporter. Please use a different email for the Independent Senior device.",
        };
      }

      familySpaceId = existingMembership.familySpaceId;
      const seniorProfile =
        existingMembership.seniorProfileId !== null
          ? await ctx.db.get(existingMembership.seniorProfileId)
          : null;
      const ensuredSeniorProfile =
        seniorProfile ??
        (await upsertIndependentSeniorProfile(ctx, {
          familySpaceId,
          displayName: normalizedDisplayName,
          recoveryEmail: normalizedEmail ?? undefined,
        }));

      if (!ensuredSeniorProfile) {
        throw new Error("Unable to prepare the Independent Senior profile.");
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
        displayName: `${normalizedDisplayName} FamilySpace`,
      });
    } else {
      familySpaceId = await ctx.db.insert("familySpaces", {
        displayName: `${normalizedDisplayName} FamilySpace`,
        timezone: undefined,
        locale: undefined,
      });

      const seniorProfile = await upsertIndependentSeniorProfile(ctx, {
        familySpaceId,
        displayName: normalizedDisplayName,
        recoveryEmail: normalizedEmail ?? undefined,
      });

      if (!seniorProfile) {
        throw new Error("Unable to create the Independent Senior profile.");
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
      seniorProfileId,
      seniorName: normalizedDisplayName,
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

    return {
      seniorProfileId: seniorProfile._id,
      seniorName: seniorProfile.displayName,
      recoveryEmail: seniorProfile.recoveryEmail,
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
      throw new Error("This account is not linked to an Independent Senior profile.");
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
      throw new Error("This account is not linked to an Independent Senior profile.");
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
    seniorProfileId: v.id("seniorProfiles"),
  },
  handler: async (ctx, args) => {
    const seniorProfile = await ctx.db.get(args.seniorProfileId);
    if (!seniorProfile || seniorProfile.seniorMode !== "independent") {
      return null;
    }

    const passkeys = await getActivePasskeys(ctx, seniorProfile._id);
    return {
      seniorProfileId: seniorProfile._id,
      seniorName: seniorProfile.displayName,
      recoveryEmail: seniorProfile.recoveryEmail,
      hasPasskey: passkeys.length > 0,
    };
  },
});

export const storePasskeyAuthenticationChallenge = mutation({
  args: {
    seniorProfileId: v.id("seniorProfiles"),
    challenge: v.string(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const seniorProfile = await ctx.db.get(args.seniorProfileId);
    if (!seniorProfile || seniorProfile.seniorMode !== "independent") {
      throw new Error("This Independent Senior profile could not be found.");
    }

    await invalidateChallenges(
      ctx,
      args.seniorProfileId,
      "passkey_authentication",
    );

    return await ctx.db.insert("seniorAuthChallenges", {
      seniorProfileId: args.seniorProfileId,
      purpose: "passkey_authentication",
      challenge: args.challenge,
      expiresAt: args.expiresAt ?? Date.now() + PASSKEY_CHALLENGE_TTL_MS,
      consumedAt: null,
    });
  },
});

export const getPasskeyAuthenticationMaterial = query({
  args: {
    seniorProfileId: v.id("seniorProfiles"),
  },
  handler: async (ctx, args) => {
    const seniorProfile = await ctx.db.get(args.seniorProfileId);
    if (!seniorProfile || seniorProfile.seniorMode !== "independent") {
      return null;
    }

    return {
      seniorProfile,
      passkeys: await getActivePasskeys(ctx, args.seniorProfileId),
      activeAuthenticationChallenge: await getActiveChallenge(
        ctx,
        args.seniorProfileId,
        "passkey_authentication",
      ),
    };
  },
});

export const completePasskeyAuthentication = mutation({
  args: {
    seniorProfileId: v.id("seniorProfiles"),
    challenge: v.string(),
    credentialId: v.string(),
    nextCounter: v.number(),
    deviceFingerprint: v.string(),
  },
  handler: async (ctx, args) => {
    const seniorProfile = await ctx.db.get(args.seniorProfileId);
    if (!seniorProfile || seniorProfile.seniorMode !== "independent") {
      throw new Error("This Independent Senior profile could not be found.");
    }

    const activeChallenge = await getActiveChallenge(
      ctx,
      args.seniorProfileId,
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

    if (!passkey || passkey.revokedAt !== null) {
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
      seniorProfileId: seniorProfile._id,
      seniorName: seniorProfile.displayName,
    };
  },
});
