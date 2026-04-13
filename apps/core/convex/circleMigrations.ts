import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalMutation, query } from "./_generated/server";
import { normalizeFamilySideMembershipRole } from "./familySpaceAuth";
import { ensureCircleMembershipForLegacyMembership } from "./circleCompat";
import { shouldWriteLegacyInviteForCanonicalInviteGeneration } from "./familyInvites";

const DEFAULT_BATCH_SIZE = 50;
const MAX_BATCH_SIZE = 200;

function clampBatchSize(limit: number | undefined) {
  return Math.min(Math.max(limit ?? DEFAULT_BATCH_SIZE, 1), MAX_BATCH_SIZE);
}

export const backfillCirclesFromFamilySpaces = internalMutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = clampBatchSize(args.limit);

    const legacyFamilySpaces = await ctx.db
      .query("familySpaces")
      .order("asc")
      .take(limit * 2);

    let processedCount = 0;

    for (const familySpace of legacyFamilySpaces) {
      const existingCircle = await ctx.db
        .query("circles")
        .withIndex("by_legacyFamilySpaceId", (query) =>
          query.eq("legacyFamilySpaceId", familySpace._id),
        )
        .unique();

      if (existingCircle) {
        continue;
      }

      await ctx.db.insert("circles", {
        legacyFamilySpaceId: familySpace._id,
        displayName: familySpace.displayName,
        timezone: familySpace.timezone,
        locale: familySpace.locale,
      });
      processedCount += 1;

      if (processedCount >= limit) {
        break;
      }
    }

    return {
      processedCount,
      hasMore: processedCount === limit,
    };
  },
});

export const backfillCircleMembershipsFromFamilySpaceMemberships = internalMutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = clampBatchSize(args.limit);

    const legacyMemberships = await ctx.db
      .query("familySpaceMemberships")
      .order("asc")
      .take(limit * 2);

    let processedCount = 0;

    for (const membership of legacyMemberships) {
      const existingCircleMembership = await ctx.db
        .query("circleMemberships")
        .withIndex("by_legacyFamilySpaceMembershipId", (query) =>
          query.eq("legacyFamilySpaceMembershipId", membership._id),
        )
        .unique();

      if (existingCircleMembership) {
        continue;
      }

      const mappedRole = normalizeFamilySideMembershipRole(membership.role);
      const role =
        mappedRole ??
        (membership.role === "independent_senior"
          ? "independent_senior"
          : null);

      if (!role) {
        continue;
      }

      const circle = await ctx.db
        .query("circles")
        .withIndex("by_legacyFamilySpaceId", (query) =>
          query.eq("legacyFamilySpaceId", membership.familySpaceId),
        )
        .unique();

      if (!circle) {
        continue;
      }

      await ctx.db.insert("circleMemberships", {
        circleId: circle._id,
        legacyFamilySpaceMembershipId: membership._id,
        authIdentityToken: membership.authIdentityToken,
        authEmail: membership.authEmail,
        displayName: membership.displayName,
        role,
        seniorProfileId: membership.seniorProfileId,
        onboardingStep: membership.onboardingStep,
        lastSeenAt: membership.lastSeenAt,
      });
      processedCount += 1;

      if (processedCount >= limit) {
        break;
      }
    }

    return {
      processedCount,
      hasMore: processedCount === limit,
    };
  },
});

export const repairCircleMembershipLegacyLinks = internalMutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = clampBatchSize(args.limit);

    const legacyMemberships = await ctx.db
      .query("familySpaceMemberships")
      .order("asc")
      .take(limit * 3);

    let repairedCount = 0;

    for (const legacyMembership of legacyMemberships) {
      const circleMembership = await ctx.db
        .query("circleMemberships")
        .withIndex("by_authIdentityToken", (query) =>
          query.eq("authIdentityToken", legacyMembership.authIdentityToken),
        )
        .unique();

      if (!circleMembership) {
        await ensureCircleMembershipForLegacyMembership(ctx, legacyMembership._id);
        repairedCount += 1;
      } else if (circleMembership.legacyFamilySpaceMembershipId === null) {
        await ctx.db.patch(circleMembership._id, {
          legacyFamilySpaceMembershipId: legacyMembership._id,
        });
        repairedCount += 1;
      }

      if (repairedCount >= limit) {
        break;
      }
    }

    return {
      repairedCount,
      hasMore: repairedCount === limit,
    };
  },
});

export const backfillCircleInviteCodesFromFamilyInvites = internalMutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = clampBatchSize(args.limit);

    const legacyInvites = await ctx.db
      .query("familyInvites")
      .order("asc")
      .take(limit * 2);

    let processedCount = 0;

    for (const invite of legacyInvites) {
      const existingCircleInvite = await ctx.db
        .query("circleInviteCodes")
        .withIndex("by_legacyFamilyInviteId", (query) =>
          query.eq("legacyFamilyInviteId", invite._id),
        )
        .unique();

      if (existingCircleInvite) {
        continue;
      }

      const circle = await ctx.db
        .query("circles")
        .withIndex("by_legacyFamilySpaceId", (query) =>
          query.eq("legacyFamilySpaceId", invite.familySpaceId),
        )
        .unique();

      if (!circle) {
        continue;
      }

      const createdByCircleMembership = await ctx.db
        .query("circleMemberships")
        .withIndex("by_legacyFamilySpaceMembershipId", (query) =>
          query.eq("legacyFamilySpaceMembershipId", invite.createdByMembershipId),
        )
        .unique();

      if (!createdByCircleMembership) {
        continue;
      }

      const redeemedByCircleMembership =
        invite.redeemedByMembershipId !== null
          ? await ctx.db
              .query("circleMemberships")
              .withIndex("by_legacyFamilySpaceMembershipId", (query) =>
                query.eq("legacyFamilySpaceMembershipId", invite.redeemedByMembershipId),
              )
              .unique()
          : null;

      await ctx.db.insert("circleInviteCodes", {
        circleId: circle._id,
        legacyFamilyInviteId: invite._id,
        createdByCircleMembershipId: createdByCircleMembership._id,
        role: invite.role,
        inviteCodeHash: invite.inviteCodeHash,
        expiresAt: invite.expiresAt,
        consumedAt: invite.consumedAt,
        revokedAt: invite.revokedAt,
        redeemedByAuthIdentityToken: invite.redeemedByAuthIdentityToken,
        redeemedByCircleMembershipId: redeemedByCircleMembership?._id ?? null,
      });
      processedCount += 1;

      if (processedCount >= limit) {
        break;
      }
    }

    return {
      processedCount,
      hasMore: processedCount === limit,
    };
  },
});

export const verifyCircleTableBackfill = query({
  args: {},
  handler: async (ctx) => {
    const missingCircleFamilySpaceIds: Id<"familySpaces">[] = [];
    const missingCircleMembershipIds: Id<"familySpaceMemberships">[] = [];
    const missingCircleInviteIds: Id<"familyInvites">[] = [];
    const missingCircleFamilySpaceIdsSet = new Set<string>();
    const missingCircleMembershipIdsSet = new Set<string>();
    const missingCircleInviteIdsSet = new Set<string>();
    let missingCircleCount = 0;
    let missingCircleMembershipCount = 0;
    let missingCircleInviteCount = 0;

    for await (const familySpace of ctx.db.query("familySpaces")) {
      const circle = await ctx.db
        .query("circles")
        .withIndex("by_legacyFamilySpaceId", (query) =>
          query.eq("legacyFamilySpaceId", familySpace._id),
        )
        .unique();
      if (!circle) {
        missingCircleCount += 1;
        if (
          missingCircleFamilySpaceIds.length < 10 &&
          !missingCircleFamilySpaceIdsSet.has(familySpace._id)
        ) {
          missingCircleFamilySpaceIdsSet.add(familySpace._id);
          missingCircleFamilySpaceIds.push(familySpace._id);
        }
      }
    }

    for await (const membership of ctx.db.query("familySpaceMemberships")) {
      const circleMembership = await ctx.db
        .query("circleMemberships")
        .withIndex("by_legacyFamilySpaceMembershipId", (query) =>
          query.eq("legacyFamilySpaceMembershipId", membership._id),
        )
        .unique();
      if (!circleMembership) {
        missingCircleMembershipCount += 1;
        if (
          missingCircleMembershipIds.length < 10 &&
          !missingCircleMembershipIdsSet.has(membership._id)
        ) {
          missingCircleMembershipIdsSet.add(membership._id);
          missingCircleMembershipIds.push(membership._id);
        }
      }
    }

    for await (const invite of ctx.db.query("familyInvites")) {
      const circleInvite = await ctx.db
        .query("circleInviteCodes")
        .withIndex("by_legacyFamilyInviteId", (query) =>
          query.eq("legacyFamilyInviteId", invite._id),
        )
        .unique();
      if (!circleInvite) {
        missingCircleInviteCount += 1;
        if (
          missingCircleInviteIds.length < 10 &&
          !missingCircleInviteIdsSet.has(invite._id)
        ) {
          missingCircleInviteIdsSet.add(invite._id);
          missingCircleInviteIds.push(invite._id);
        }
      }
    }

    return {
      complete:
        missingCircleCount === 0 &&
        missingCircleMembershipCount === 0 &&
        missingCircleInviteCount === 0,
      missingCircleCount,
      missingCircleFamilySpaceIds,
      missingCircleMembershipCount,
      missingCircleMembershipIds,
      missingCircleInviteCount,
      missingCircleInviteIds,
    };
  },
});

export const verifyNoCanonicalToLegacyBackfillDependencies = query({
  args: {},
  handler: async (ctx) => {
    let canonicalInviteCodesCount = 0;
    let legacyInviteCodesCount = 0;
    let missingLegacyInviteLinks = 0;
    const sampleCircleInviteIdsMissingLegacyLink: Id<"circleInviteCodes">[] = [];

    for await (const circleInvite of ctx.db.query("circleInviteCodes")) {
      canonicalInviteCodesCount += 1;
      if (circleInvite.legacyFamilyInviteId === null) {
        missingLegacyInviteLinks += 1;
        if (sampleCircleInviteIdsMissingLegacyLink.length < 10) {
          sampleCircleInviteIdsMissingLegacyLink.push(circleInvite._id);
        }
      }
    }

    for await (const legacyInvite of ctx.db.query("familyInvites")) {
      void legacyInvite;
      legacyInviteCodesCount += 1;
    }

    return {
      canonicalFirstGates: {
        inviteGenerationWritesLegacy: shouldWriteLegacyInviteForCanonicalInviteGeneration(),
      },
      canonicalInviteCodesCount,
      legacyInviteCodesCount,
      missingLegacyInviteLinks,
      sampleCircleInviteIdsMissingLegacyLink,
      note:
        "canonical invite generation no longer depends on legacy backfill links.",
    };
  },
});
