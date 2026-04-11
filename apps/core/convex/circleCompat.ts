import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

type DbCtx = MutationCtx | QueryCtx;

function mapLegacyMembershipRoleToCircleRole(
  role: Doc<"familySpaceMemberships">["role"],
): Doc<"circleMemberships">["role"] | null {
  switch (role) {
    case "organiser":
      return "organiser";
    case "member":
      return "member";
    case "independent_senior":
      return "independent_senior";
    default:
      return null;
  }
}

export async function getCircleByLegacyFamilySpaceId(
  ctx: DbCtx,
  familySpaceId: Id<"familySpaces">,
) {
  return await ctx.db
    .query("circles")
    .withIndex("by_legacyFamilySpaceId", (query) =>
      query.eq("legacyFamilySpaceId", familySpaceId),
    )
    .unique();
}

export async function ensureCircleForFamilySpace(
  ctx: MutationCtx,
  familySpaceId: Id<"familySpaces">,
) {
  const existing = await getCircleByLegacyFamilySpaceId(ctx, familySpaceId);
  if (existing) {
    return existing;
  }

  const familySpace = await ctx.db.get(familySpaceId);
  if (!familySpace) {
    throw new Error("Circle migration error: source family space was not found.");
  }

  const circleId = await ctx.db.insert("circles", {
    legacyFamilySpaceId: familySpaceId,
    displayName: familySpace.displayName,
    timezone: familySpace.timezone,
    locale: familySpace.locale,
  });

  const circle = await ctx.db.get(circleId);
  if (!circle) {
    throw new Error("Circle migration error: failed to create circle row.");
  }

  return circle;
}

export async function patchCircleFromFamilySpace(
  ctx: MutationCtx,
  familySpaceId: Id<"familySpaces">,
  patch: {
    displayName?: string;
    timezone?: string;
    locale?: string;
  },
) {
  const circlePatch: {
    displayName?: string;
    timezone?: string;
    locale?: string;
  } = {};

  if (patch.displayName !== undefined) {
    circlePatch.displayName = patch.displayName;
  }
  if (patch.timezone !== undefined) {
    circlePatch.timezone = patch.timezone;
  }
  if (patch.locale !== undefined) {
    circlePatch.locale = patch.locale;
  }

  if (Object.keys(circlePatch).length === 0) {
    return;
  }

  const circle = await ensureCircleForFamilySpace(ctx, familySpaceId);
  await ctx.db.patch(circle._id, circlePatch);
}

export async function getCircleMembershipByLegacyFamilySpaceMembershipId(
  ctx: DbCtx,
  legacyFamilySpaceMembershipId: Id<"familySpaceMemberships">,
) {
  return await ctx.db
    .query("circleMemberships")
    .withIndex("by_legacyFamilySpaceMembershipId", (query) =>
      query.eq("legacyFamilySpaceMembershipId", legacyFamilySpaceMembershipId),
    )
    .unique();
}

export async function ensureCircleMembershipForLegacyMembership(
  ctx: MutationCtx,
  legacyFamilySpaceMembershipId: Id<"familySpaceMemberships">,
) {
  const existing = await getCircleMembershipByLegacyFamilySpaceMembershipId(
    ctx,
    legacyFamilySpaceMembershipId,
  );
  if (existing) {
    return existing;
  }

  const legacyMembership = await ctx.db.get(legacyFamilySpaceMembershipId);
  if (!legacyMembership) {
    return null;
  }

  const role = mapLegacyMembershipRoleToCircleRole(legacyMembership.role);
  if (!role) {
    return null;
  }

  const circle = await ensureCircleForFamilySpace(ctx, legacyMembership.familySpaceId);
  const circleMembershipId = await ctx.db.insert("circleMemberships", {
    circleId: circle._id,
    legacyFamilySpaceMembershipId: legacyMembership._id,
    authIdentityToken: legacyMembership.authIdentityToken,
    authEmail: legacyMembership.authEmail,
    displayName: legacyMembership.displayName,
    role,
    seniorProfileId: legacyMembership.seniorProfileId,
    onboardingStep: legacyMembership.onboardingStep,
    lastSeenAt: legacyMembership.lastSeenAt,
  });

  return await ctx.db.get(circleMembershipId);
}

export async function getCircleInviteByLegacyFamilyInviteId(
  ctx: DbCtx,
  legacyFamilyInviteId: Id<"familyInvites">,
) {
  return await ctx.db
    .query("circleInviteCodes")
    .withIndex("by_legacyFamilyInviteId", (query) =>
      query.eq("legacyFamilyInviteId", legacyFamilyInviteId),
    )
    .unique();
}

export async function ensureCircleInviteForLegacyInvite(
  ctx: MutationCtx,
  legacyFamilyInviteId: Id<"familyInvites">,
) {
  const existing = await getCircleInviteByLegacyFamilyInviteId(
    ctx,
    legacyFamilyInviteId,
  );
  if (existing) {
    return existing;
  }

  const legacyInvite = await ctx.db.get(legacyFamilyInviteId);
  if (!legacyInvite) {
    return null;
  }

  const createdByCircleMembership = await ensureCircleMembershipForLegacyMembership(
    ctx,
    legacyInvite.createdByMembershipId,
  );
  if (!createdByCircleMembership) {
    return null;
  }

  const circle = await ensureCircleForFamilySpace(ctx, legacyInvite.familySpaceId);
  const redeemedByCircleMembership =
    legacyInvite.redeemedByMembershipId !== null
      ? await ensureCircleMembershipForLegacyMembership(
          ctx,
          legacyInvite.redeemedByMembershipId,
        )
      : null;

  const circleInviteId = await ctx.db.insert("circleInviteCodes", {
    circleId: circle._id,
    legacyFamilyInviteId: legacyInvite._id,
    createdByCircleMembershipId: createdByCircleMembership._id,
    role: legacyInvite.role,
    inviteCodeHash: legacyInvite.inviteCodeHash,
    expiresAt: legacyInvite.expiresAt,
    consumedAt: legacyInvite.consumedAt,
    revokedAt: legacyInvite.revokedAt,
    redeemedByAuthIdentityToken: legacyInvite.redeemedByAuthIdentityToken,
    redeemedByCircleMembershipId: redeemedByCircleMembership?._id ?? null,
  });

  return await ctx.db.get(circleInviteId);
}
