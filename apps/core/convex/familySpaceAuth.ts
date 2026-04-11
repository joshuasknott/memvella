import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import {
  normalizeOptionalText,
} from "./security";
import {
  MEMBER_LABEL,
} from "./terminology";

type DbCtx = MutationCtx | QueryCtx;

type StoredFamilySideMembershipRole = "organiser" | "member";

export type FamilySideMembershipRole = "organiser" | "member";
export type MembershipRole = StoredFamilySideMembershipRole | "independent_senior";
export type MembershipAccessRequirement =
  | FamilySideMembershipRole
  | "independent_senior"
  | "family_side";
export type FamilySideCapability =
  | "manage_circle_members"
  | "manage_invite_codes"
  | "manage_tablet_access"
  | "manage_circle_notifications"
  | "manage_people"
  | "manage_routines"
  | "manage_circle_admin";

function compareMembershipDeterministically(
  left: Doc<"familySpaceMemberships">,
  right: Doc<"familySpaceMemberships">,
) {
  if (left._creationTime !== right._creationTime) {
    return left._creationTime - right._creationTime;
  }

  return String(left._id).localeCompare(String(right._id));
}

export function pickDeterministicMembership(
  memberships: ReadonlyArray<Doc<"familySpaceMemberships">>,
) {
  if (memberships.length === 0) {
    return null;
  }

  return [...memberships].sort(compareMembershipDeterministically)[0];
}

export function normalizeFamilySideMembershipRole(
  role: MembershipRole,
): FamilySideMembershipRole | null {
  switch (role) {
    case "organiser":
      return "organiser";
    case "member":
      return "member";
    default:
      return null;
  }
}

export function isFamilySideRole(role: MembershipRole) {
  return normalizeFamilySideMembershipRole(role) !== null;
}

export function familySideRoleHasCapability(
  role: FamilySideMembershipRole,
  capability: FamilySideCapability,
) {
  switch (capability) {
    case "manage_circle_members":
    case "manage_invite_codes":
    case "manage_tablet_access":
    case "manage_circle_notifications":
    case "manage_people":
    case "manage_routines":
    case "manage_circle_admin":
      return role === "organiser";
  }
}

export function assertFamilySideCapability(
  role: MembershipRole,
  capability: FamilySideCapability,
) {
  const familySideRole = normalizeFamilySideMembershipRole(role);
  if (!familySideRole) {
    throw new Error("This account does not have access to the family-side workspace.");
  }

  if (!familySideRoleHasCapability(familySideRole, capability)) {
    throw new Error("This account does not have access to that Circle setting.");
  }

  return familySideRole;
}

function membershipMatchesRequirement(
  membership: Doc<"familySpaceMemberships">,
  expectedRole: MembershipAccessRequirement | undefined,
) {
  const normalizedFamilySideRole = normalizeFamilySideMembershipRole(
    membership.role,
  );

  if (!expectedRole) {
    return true;
  }

  if (expectedRole === "family_side") {
    return normalizedFamilySideRole !== null;
  }

  if (expectedRole === "organiser" || expectedRole === "member") {
    return normalizedFamilySideRole === expectedRole;
  }

  return membership.role === expectedRole;
}

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
  const circleMemberships = await ctx.db
    .query("circleMemberships")
    .withIndex("by_authIdentityToken", (query) =>
      query.eq("authIdentityToken", authIdentityToken),
    )
    .take(20);

  const mappedCircleLegacyMemberships = (
    await Promise.all(
      circleMemberships
        .map((membership) => membership.legacyFamilySpaceMembershipId)
        .filter(
          (
            membershipId,
          ): membershipId is Id<"familySpaceMemberships"> => membershipId !== null,
        )
        .map((membershipId) => ctx.db.get(membershipId)),
    )
  ).filter(
    (membership): membership is Doc<"familySpaceMemberships"> =>
      membership !== null,
  );

  const preferredCircleMembership = pickDeterministicMembership(
    mappedCircleLegacyMemberships,
  );
  if (preferredCircleMembership) {
    return preferredCircleMembership;
  }

  const legacyMemberships = await listMembershipsByAuthIdentityToken(
    ctx,
    authIdentityToken,
  );
  return pickDeterministicMembership(legacyMemberships);
}

export async function listMembershipsByAuthIdentityToken(
  ctx: DbCtx,
  authIdentityToken: string,
  limit = 20,
) {
  const memberships = await ctx.db
    .query("familySpaceMemberships")
    .withIndex("by_authIdentityToken", (query) =>
      query.eq("authIdentityToken", authIdentityToken),
    )
    .take(limit);

  return [...memberships].sort(compareMembershipDeterministically);
}

export async function getOptionalFamilySpaceMembership(
  ctx: DbCtx,
  expectedRole?: MembershipAccessRequirement,
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

  if (!membershipMatchesRequirement(membership, expectedRole)) {
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
  expectedRole?: MembershipAccessRequirement,
) {
  const authIdentityToken = await requireAuthIdentityToken(ctx);
  const membership = await getMembershipByAuthIdentityToken(ctx, authIdentityToken);

  if (!membership) {
    throw new Error("No Circle membership is linked to this account.");
  }

  if (!membershipMatchesRequirement(membership, expectedRole)) {
    throw new Error("This account does not have access to this experience.");
  }

  const familySpace = await ctx.db.get(membership.familySpaceId);
  if (!familySpace) {
    throw new Error("The linked Circle could not be found.");
  }

  return { authIdentityToken, membership, familySpace };
}

export async function getOptionalFamilySideMembership(ctx: DbCtx) {
  return await getOptionalFamilySpaceMembership(ctx, "family_side");
}

export async function requireFamilySideMembership(ctx: DbCtx) {
  return await requireFamilySpaceMembership(ctx, "family_side");
}

export async function requireFamilySideCapability(
  ctx: DbCtx,
  capability: FamilySideCapability,
) {
  const familyContext = await requireFamilySideMembership(ctx);
  const familySideRole = assertFamilySideCapability(
    familyContext.membership.role,
    capability,
  );

  return {
    ...familyContext,
    familySideRole,
  };
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
  },
) {
  const assistedSenior = await getSeniorProfileByMode(
    ctx,
    args.familySpaceId,
    "assisted",
  );
  const displayName = normalizeOptionalText(args.displayName) ?? MEMBER_LABEL;

  if (!assistedSenior) {
    const seniorProfileId = await ctx.db.insert("seniorProfiles", {
      familySpaceId: args.familySpaceId,
      displayName,
      seniorMode: "assisted",
      accessStatus: "active",
      timezone: null,
      locale: null,
      lastSessionAt: undefined,
    });

    return await ctx.db.get(seniorProfileId);
  }

  await ctx.db.patch(assistedSenior._id, {
    displayName,
    accessStatus: "active",
  });

  return await ctx.db.get(assistedSenior._id);
}

export async function upsertIndependentSeniorProfile(
  ctx: MutationCtx,
  args: {
    familySpaceId: Id<"familySpaces">;
    displayName: string;
  },
) {
  const independentSenior = await getSeniorProfileByMode(
    ctx,
    args.familySpaceId,
    "independent",
  );
  const displayName = normalizeOptionalText(args.displayName) ?? MEMBER_LABEL;

  if (!independentSenior) {
    const seniorProfileId = await ctx.db.insert("seniorProfiles", {
      familySpaceId: args.familySpaceId,
      displayName,
      seniorMode: "independent",
      accessStatus: "active",
      timezone: null,
      locale: null,
      lastSessionAt: undefined,
    });

    return await ctx.db.get(seniorProfileId);
  }

  await ctx.db.patch(independentSenior._id, {
    displayName,
    accessStatus: "active",
  });

  return await ctx.db.get(independentSenior._id);
}
