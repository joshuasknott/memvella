import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { normalizeOptionalText } from "./security";
import { MEMBER_LABEL } from "./terminology";

type DbCtx = MutationCtx | QueryCtx;

export type FamilySideMembershipRole = "organiser" | "member";
export type MembershipRole = FamilySideMembershipRole;
export type MembershipAccessRequirement = FamilySideMembershipRole | "family_side";
export type FamilySideCapability =
  | "manage_circle_members"
  | "manage_invite_codes"
  | "manage_tablet_access"
  | "manage_circle_notifications"
  | "manage_people"
  | "manage_routines"
  | "manage_circle_admin";

export type CircleAuthContext = {
  authIdentityToken: string;
  membership: Doc<"circleMemberships">;
  circleMembership: Doc<"circleMemberships">;
  circle: Doc<"circles">;
};

function compareCircleMembershipDeterministically(
  left: Doc<"circleMemberships">,
  right: Doc<"circleMemberships">,
) {
  if (left._creationTime !== right._creationTime) {
    return left._creationTime - right._creationTime;
  }

  return String(left._id).localeCompare(String(right._id));
}

export function pickDeterministicCircleMembership(
  memberships: ReadonlyArray<Doc<"circleMemberships">>,
) {
  if (memberships.length === 0) {
    return null;
  }

  return [...memberships].sort(compareCircleMembershipDeterministically)[0];
}

export function pickDeterministicMembership(
  memberships: ReadonlyArray<Doc<"circleMemberships">>,
) {
  return pickDeterministicCircleMembership(memberships);
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
    throw new Error("This account does not have access to that Workspace setting.");
  }

  return familySideRole;
}

function membershipMatchesRequirement(
  membership: Doc<"circleMemberships">,
  expectedRole: MembershipAccessRequirement | undefined,
) {
  if (!expectedRole) {
    return true;
  }

  if (expectedRole === "family_side") {
    return true;
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

export async function listCircleMembershipsByAuthIdentityToken(
  ctx: DbCtx,
  authIdentityToken: string,
  limit = 20,
) {
  const memberships = await ctx.db
    .query("circleMemberships")
    .withIndex("by_authIdentityToken", (query) =>
      query.eq("authIdentityToken", authIdentityToken),
    )
    .take(limit);

  return [...memberships].sort(compareCircleMembershipDeterministically);
}

export async function getCircleMembershipByAuthIdentityToken(
  ctx: DbCtx,
  authIdentityToken: string,
) {
  const memberships = await listCircleMembershipsByAuthIdentityToken(
    ctx,
    authIdentityToken,
  );
  return pickDeterministicCircleMembership(memberships);
}

export async function listMembershipsByAuthIdentityToken(
  ctx: DbCtx,
  authIdentityToken: string,
  limit = 20,
) {
  return await listCircleMembershipsByAuthIdentityToken(
    ctx,
    authIdentityToken,
    limit,
  );
}

export async function getMembershipByAuthIdentityToken(
  ctx: DbCtx,
  authIdentityToken: string,
) {
  return await getCircleMembershipByAuthIdentityToken(ctx, authIdentityToken);
}

async function resolveCircleAuthContext(
  ctx: DbCtx,
  authIdentityToken: string,
  membership: Doc<"circleMemberships">,
): Promise<CircleAuthContext | null> {
  const circle = await ctx.db.get(membership.circleId);
  if (!circle) {
    return null;
  }

  return {
    authIdentityToken,
    membership,
    circleMembership: membership,
    circle,
  };
}

export async function getOptionalCircleMembership(
  ctx: DbCtx,
  expectedRole?: MembershipAccessRequirement,
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const membership = await getCircleMembershipByAuthIdentityToken(
    ctx,
    identity.tokenIdentifier,
  );

  if (!membership) {
    return null;
  }

  if (!membershipMatchesRequirement(membership, expectedRole)) {
    return null;
  }

  return await resolveCircleAuthContext(
    ctx,
    identity.tokenIdentifier,
    membership,
  );
}

export async function requireCircleMembership(
  ctx: DbCtx,
  expectedRole?: MembershipAccessRequirement,
) {
  const authIdentityToken = await requireAuthIdentityToken(ctx);
  const membership = await getCircleMembershipByAuthIdentityToken(
    ctx,
    authIdentityToken,
  );

  if (!membership) {
    throw new Error("No Workspace membership is linked to this account.");
  }

  if (!membershipMatchesRequirement(membership, expectedRole)) {
    throw new Error("This account does not have access to this experience.");
  }

  const circleContext = await resolveCircleAuthContext(
    ctx,
    authIdentityToken,
    membership,
  );
  if (!circleContext) {
    throw new Error("The linked Workspace could not be found.");
  }

  return circleContext;
}

export async function getOptionalFamilySideMembership(ctx: DbCtx) {
  return await getOptionalCircleMembership(ctx, "family_side");
}

export async function requireFamilySideMembership(ctx: DbCtx) {
  return await requireCircleMembership(ctx, "family_side");
}

export async function getOptionalFamilySideCircleMembership(ctx: DbCtx) {
  return await getOptionalCircleMembership(ctx, "family_side");
}

export async function requireFamilySideCircleMembership(ctx: DbCtx) {
  return await requireCircleMembership(ctx, "family_side");
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

export async function requireCircleCapability(
  ctx: DbCtx,
  capability: FamilySideCapability,
) {
  return await requireFamilySideCapability(ctx, capability);
}

export async function getSeniorProfileByMode(
  ctx: DbCtx,
  circleId: Id<"circles">,
  seniorMode: Doc<"seniorProfiles">["seniorMode"],
) {
  return await ctx.db
    .query("seniorProfiles")
    .withIndex("by_circleId_and_seniorMode", (query) =>
      query.eq("circleId", circleId).eq("seniorMode", seniorMode),
    )
    .unique();
}

export async function getSeniorProfileById(
  ctx: DbCtx,
  seniorProfileId: Id<"seniorProfiles">,
) {
  return await ctx.db.get(seniorProfileId);
}

export async function upsertAssistedSeniorProfile(
  ctx: MutationCtx,
  args: {
    circleId: Id<"circles">;
    displayName: string;
  },
) {
  const circle = await ctx.db.get(args.circleId);
  if (!circle) {
    throw new Error("The linked Workspace could not be found.");
  }

  const assistedSenior = await getSeniorProfileByMode(ctx, args.circleId, "assisted");
  const displayName = normalizeOptionalText(args.displayName) ?? MEMBER_LABEL;

  if (!assistedSenior) {
    const seniorProfileId = await ctx.db.insert("seniorProfiles", {
      circleId: circle._id,
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
