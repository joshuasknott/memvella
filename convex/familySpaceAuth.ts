import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import {
  normalizeOptionalEmail,
  normalizeOptionalText,
} from "./security";

type DbCtx = MutationCtx | QueryCtx;

export type MembershipRole = "supporter" | "independent_senior";

export async function requireAuthIdentityToken(ctx: DbCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated: a valid account session is required.");
  }

  return identity.tokenIdentifier;
}

export async function getMembershipByAuthIdentityToken(
  ctx: DbCtx,
  authIdentityToken: string,
) {
  return await ctx.db
    .query("familySpaceMemberships")
    .withIndex("by_authIdentityToken", (query) =>
      query.eq("authIdentityToken", authIdentityToken),
    )
    .unique();
}

export async function getOptionalFamilySpaceMembership(
  ctx: DbCtx,
  expectedRole?: MembershipRole,
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const membership = await getMembershipByAuthIdentityToken(
    ctx,
    identity.tokenIdentifier,
  );

  if (!membership) {
    return null;
  }

  if (expectedRole && membership.role !== expectedRole) {
    return null;
  }

  const familySpace = await ctx.db.get(membership.familySpaceId);
  if (!familySpace) {
    return null;
  }

  return {
    authIdentityToken: identity.tokenIdentifier,
    membership,
    familySpace,
  };
}

export async function requireFamilySpaceMembership(
  ctx: DbCtx,
  expectedRole?: MembershipRole,
) {
  const authIdentityToken = await requireAuthIdentityToken(ctx);
  const membership = await getMembershipByAuthIdentityToken(ctx, authIdentityToken);

  if (!membership) {
    throw new Error("No FamilySpace membership is linked to this account.");
  }

  if (expectedRole && membership.role !== expectedRole) {
    throw new Error("This account does not have access to this experience.");
  }

  const familySpace = await ctx.db.get(membership.familySpaceId);
  if (!familySpace) {
    throw new Error("The linked FamilySpace could not be found.");
  }

  return { authIdentityToken, membership, familySpace };
}

export async function getSeniorProfileByMode(
  ctx: DbCtx,
  familySpaceId: Id<"familySpaces">,
  seniorMode: Doc<"seniorProfiles">["seniorMode"],
) {
  return await ctx.db
    .query("seniorProfiles")
    .withIndex("by_familySpaceId_and_seniorMode", (query) =>
      query.eq("familySpaceId", familySpaceId).eq("seniorMode", seniorMode),
    )
    .unique();
}

export async function getSeniorProfileById(
  ctx: DbCtx,
  seniorProfileId: Id<"seniorProfiles">,
) {
  return await ctx.db.get(seniorProfileId);
}

export async function getIndependentMembershipForSeniorProfile(
  ctx: DbCtx,
  familySpaceId: Id<"familySpaces">,
  seniorProfileId: Id<"seniorProfiles">,
) {
  return await ctx.db
    .query("familySpaceMemberships")
    .withIndex("by_familySpaceId_and_role_and_seniorProfileId", (query) =>
      query
        .eq("familySpaceId", familySpaceId)
        .eq("role", "independent_senior")
        .eq("seniorProfileId", seniorProfileId),
    )
    .unique();
}

export async function upsertAssistedSeniorProfile(
  ctx: MutationCtx,
  args: {
    familySpaceId: Id<"familySpaces">;
    displayName: string;
    recoveryEmail?: string;
  },
) {
  const assistedSenior = await getSeniorProfileByMode(
    ctx,
    args.familySpaceId,
    "assisted",
  );
  const displayName = normalizeOptionalText(args.displayName) ?? "Assisted Senior";
  const recoveryEmail = normalizeOptionalEmail(args.recoveryEmail) ?? null;

  if (!assistedSenior) {
    const seniorProfileId = await ctx.db.insert("seniorProfiles", {
      familySpaceId: args.familySpaceId,
      displayName,
      seniorMode: "assisted",
      accessStatus: "active",
      recoveryEmail,
      timezone: null,
      locale: null,
      lastSessionAt: undefined,
    });

    return await ctx.db.get(seniorProfileId);
  }

  await ctx.db.patch(assistedSenior._id, {
    displayName,
    recoveryEmail,
    accessStatus: "active",
  });

  return await ctx.db.get(assistedSenior._id);
}

export async function upsertIndependentSeniorProfile(
  ctx: MutationCtx,
  args: {
    familySpaceId: Id<"familySpaces">;
    displayName: string;
    recoveryEmail?: string;
  },
) {
  const independentSenior = await getSeniorProfileByMode(
    ctx,
    args.familySpaceId,
    "independent",
  );
  const displayName =
    normalizeOptionalText(args.displayName) ?? "Independent Senior";
  const recoveryEmail = normalizeOptionalEmail(args.recoveryEmail) ?? null;

  if (!independentSenior) {
    const seniorProfileId = await ctx.db.insert("seniorProfiles", {
      familySpaceId: args.familySpaceId,
      displayName,
      seniorMode: "independent",
      accessStatus: "active",
      recoveryEmail,
      timezone: null,
      locale: null,
      lastSessionAt: undefined,
    });

    return await ctx.db.get(seniorProfileId);
  }

  await ctx.db.patch(independentSenior._id, {
    displayName,
    recoveryEmail,
    accessStatus: "active",
  });

  return await ctx.db.get(independentSenior._id);
}
