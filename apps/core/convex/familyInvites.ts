import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import {
  getMembershipByAuthIdentityToken,
  isFamilySideRole,
  normalizeFamilySideMembershipRole,
  requireFamilySideCapability,
  requireFamilySideMembership,
} from "./familySpaceAuth";
import {
  generateNumericCode,
  hashFamilyInviteCode,
  normalizeOptionalEmail,
  normalizeOptionalText,
} from "./security";
import { MEMBER_LABEL, ORGANISER_LABEL } from "./terminology";

const FAMILY_INVITE_TTL_MS = 10 * 60 * 1000;
const MAX_ACTIVE_INVITE_COLLISION_ATTEMPTS = 20;
const INVITE_REDEEM_MAX_HITS = 5;
const INVITE_REDEEM_WINDOW_MS = 10 * 60 * 1000;
const INVITE_REDEEM_BLOCK_MS = 10 * 60 * 1000;
const INVITE_PREVIEW_MAX_HITS = 10;
const INVITE_PREVIEW_WINDOW_MS = 10 * 60 * 1000;
const INVITE_PREVIEW_BLOCK_MS = 10 * 60 * 1000;

type InviteLookupState =
  | { state: "active"; invite: Doc<"familyInvites"> }
  | { state: "invalid_code" }
  | { state: "expired" }
  | { state: "revoked" }
  | { state: "already_used" };

type RedeemMemberInviteCodeResult =
  | {
      status: "invalid_code" | "expired" | "revoked" | "already_used";
      message: string;
    }
  | {
      status: "rate_limited";
      retryAfterMs: number;
      message: string;
    }
  | {
      status: "role_collision" | "circle_conflict";
      message: string;
    }
  | {
      status: "already_joined";
      familySpaceId: Doc<"familyInvites">["familySpaceId"];
      membershipId: Doc<"familySpaceMemberships">["_id"];
      role: Doc<"familySpaceMemberships">["role"];
    }
  | {
      status: "joined";
      familySpaceId: Doc<"familyInvites">["familySpaceId"];
      membershipId: Doc<"familySpaceMemberships">["_id"];
      role: "member";
    };

type PreviewMemberInviteCodeResult =
  | {
      status: "ready";
      circleName: string | null;
    }
  | {
      status: "invalid_code" | "expired" | "revoked" | "already_used";
      message: string;
    }
  | {
      status: "rate_limited";
      retryAfterMs: number;
      message: string;
    };

function isInviteActive(invite: Doc<"familyInvites">, now: number) {
  return (
    invite.revokedAt === null &&
    invite.consumedAt === null &&
    invite.expiresAt > now
  );
}

async function listMemberInvitesForFamilySpace(
  ctx: MutationCtx | QueryCtx,
  familySpaceId: Doc<"familyInvites">["familySpaceId"],
) {
  return await ctx.db
    .query("familyInvites")
    .withIndex("by_familySpaceId_and_role", (query) =>
      query.eq("familySpaceId", familySpaceId).eq("role", "member"),
    )
    .order("desc")
    .take(25);
}

async function revokeActiveMemberInvitesForFamilySpace(
  ctx: MutationCtx,
  familySpaceId: Doc<"familyInvites">["familySpaceId"],
  revokedAt: number,
) {
  const invites = await listMemberInvitesForFamilySpace(ctx, familySpaceId);
  let revokedCount = 0;

  for (const invite of invites) {
    if (!isInviteActive(invite, revokedAt)) {
      continue;
    }

    await ctx.db.patch(invite._id, {
      revokedAt,
    });
    revokedCount += 1;
  }

  return revokedCount;
}

async function getInviteLookupByHash(
  ctx: MutationCtx | QueryCtx,
  inviteCodeHash: string,
): Promise<InviteLookupState> {
  const invites = await ctx.db
    .query("familyInvites")
    .withIndex("by_inviteCodeHash", (query) =>
      query.eq("inviteCodeHash", inviteCodeHash),
    )
    .order("desc")
    .take(10);

  if (invites.length === 0) {
    return { state: "invalid_code" };
  }

  const now = Date.now();
  const activeInvite = invites.find((invite) => isInviteActive(invite, now));
  if (activeInvite) {
    return { state: "active", invite: activeInvite };
  }

  const latestInvite = invites[0];
  if (latestInvite.consumedAt !== null) {
    return { state: "already_used" };
  }

  if (latestInvite.revokedAt !== null) {
    return { state: "revoked" };
  }

  if (latestInvite.expiresAt <= now) {
    return { state: "expired" };
  }

  return { state: "invalid_code" };
}

async function generateUniqueActiveInviteCode(ctx: MutationCtx) {
  for (
    let attempt = 0;
    attempt < MAX_ACTIVE_INVITE_COLLISION_ATTEMPTS;
    attempt += 1
  ) {
    const inviteCode = generateNumericCode();
    const inviteCodeHash = await hashFamilyInviteCode(inviteCode);
    const lookup = await getInviteLookupByHash(ctx, inviteCodeHash);

    if (lookup.state !== "active") {
      return { inviteCode, inviteCodeHash };
    }
  }

  throw new Error("Unable to generate a unique invite code. Please try again.");
}

function buildRateLimitMessage(retryAfterMs: number) {
  const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  return `Too many invite attempts. Wait ${retryAfterSeconds} seconds before trying another code.`;
}

function getFamilyRoleLabel(role: Doc<"familySpaceMemberships">["role"]) {
  const normalizedRole = normalizeFamilySideMembershipRole(role);

  switch (normalizedRole) {
    case "organiser":
      return ORGANISER_LABEL;
    case "member":
      return MEMBER_LABEL;
    default:
      return role;
  }
}

export const listCircleMembers = query({
  args: {},
  handler: async (ctx) => {
    const { membership } = await requireFamilySideMembership(ctx);
    const memberships = await ctx.db
      .query("familySpaceMemberships")
      .withIndex("by_familySpaceId", (query) =>
        query.eq("familySpaceId", membership.familySpaceId),
      )
      .take(50);

    return memberships
      .filter((candidate) => candidate.role !== "independent_senior")
      .sort((left, right) => {
        const leftRank =
          normalizeFamilySideMembershipRole(left.role) === "member" ? 1 : 0;
        const rightRank =
          normalizeFamilySideMembershipRole(right.role) === "member" ? 1 : 0;
        return leftRank - rightRank || left._creationTime - right._creationTime;
      })
      .flatMap((candidate) => {
        const role = normalizeFamilySideMembershipRole(candidate.role);
        if (!role) {
          return [];
        }

        return [
          {
            id: candidate._id,
            displayName: candidate.displayName,
            role,
            roleLabel: getFamilyRoleLabel(candidate.role),
            authEmail: candidate.authEmail,
            joinedAt: candidate._creationTime,
            isCurrentAccount: candidate._id === membership._id,
          },
        ];
      });
  },
});

export const listActiveMemberInvites = query({
  args: {},
  handler: async (ctx) => {
    const { membership } = await requireFamilySideCapability(
      ctx,
      "manage_invite_codes",
    );
    const now = Date.now();
    const invites = await listMemberInvitesForFamilySpace(ctx, membership.familySpaceId);

    return invites
      .filter((invite) => isInviteActive(invite, now))
      .map((invite) => ({
        id: invite._id,
        role: invite.role,
        expiresAt: invite.expiresAt,
      }));
  },
});

export const revokeActiveMemberInvites = mutation({
  args: {},
  handler: async (ctx) => {
    const { membership } = await requireFamilySideCapability(
      ctx,
      "manage_invite_codes",
    );
    return {
      revokedCount: await revokeActiveMemberInvitesForFamilySpace(
        ctx,
        membership.familySpaceId,
        Date.now(),
      ),
    };
  },
});

export const generateMemberInviteCode = mutation({
  args: {},
  handler: async (ctx) => {
    const { membership } = await requireFamilySideCapability(
      ctx,
      "manage_invite_codes",
    );
    const now = Date.now();

    await revokeActiveMemberInvitesForFamilySpace(
      ctx,
      membership.familySpaceId,
      now,
    );

    const { inviteCode, inviteCodeHash } = await generateUniqueActiveInviteCode(ctx);
    const expiresAt = now + FAMILY_INVITE_TTL_MS;

    await ctx.db.insert("familyInvites", {
      familySpaceId: membership.familySpaceId,
      createdByMembershipId: membership._id,
      role: "member",
      inviteCodeHash,
      expiresAt,
      consumedAt: null,
      revokedAt: null,
      redeemedByAuthIdentityToken: null,
      redeemedByMembershipId: null,
    });

    return {
      inviteCode,
      role: "member" as const,
      expiresAt,
    };
  },
});

export const previewMemberInviteCode = mutation({
  args: {
    inviteCode: v.string(),
    previewScopeKey: v.string(),
  },
  handler: async (ctx, args): Promise<PreviewMemberInviteCodeResult> => {
    const normalizedInviteCode = args.inviteCode.trim();
    if (!/^\d{6}$/.test(normalizedInviteCode)) {
      return {
        status: "invalid_code",
        message: "Enter a valid 6-digit Circle code.",
      };
    }

    const rateLimit = await ctx.runMutation(internal.rateLimits.consumeRateLimit, {
      scopeKey: args.previewScopeKey,
      actionKey: "previewMemberInviteCode",
      maxHits: INVITE_PREVIEW_MAX_HITS,
      windowMs: INVITE_PREVIEW_WINDOW_MS,
      blockDurationMs: INVITE_PREVIEW_BLOCK_MS,
    });

    if (!rateLimit.allowed) {
      return {
        status: "rate_limited",
        retryAfterMs: rateLimit.retryAfterMs,
        message: buildRateLimitMessage(rateLimit.retryAfterMs),
      };
    }

    const inviteCodeHash = await hashFamilyInviteCode(normalizedInviteCode);
    const lookup = await getInviteLookupByHash(ctx, inviteCodeHash);
    if (lookup.state !== "active") {
      const messages = {
        invalid_code: "We couldn't find that Circle. Please double-check the code and try again.",
        expired: "This Circle code has expired. Ask for a new one.",
        revoked: "This Circle code is no longer active. Ask for a new one.",
        already_used: "This Circle code has already been used. Ask for a new one.",
      } satisfies Record<Exclude<InviteLookupState["state"], "active">, string>;

      return {
        status: lookup.state,
        message: messages[lookup.state],
      };
    }

    const familySpace = await ctx.db.get(lookup.invite.familySpaceId);

    return {
      status: "ready",
      circleName: familySpace?.displayName ?? null,
    };
  },
});

export const redeemMemberInviteCode = mutation({
  args: {
    inviteCode: v.string(),
  },
  handler: async (ctx, args): Promise<RedeemMemberInviteCodeResult> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated: a valid account session is required.");
    }

    const normalizedInviteCode = args.inviteCode.trim();
    if (!/^\d{6}$/.test(normalizedInviteCode)) {
      return {
        status: "invalid_code" as const,
        message: "Enter a valid 6-digit invite code.",
      };
    }

    const inviteCodeHash = await hashFamilyInviteCode(normalizedInviteCode);
    const identityRateLimit = await ctx.runMutation(
      internal.rateLimits.consumeRateLimit,
      {
        scopeKey: `family-invite:${identity.tokenIdentifier}`,
        actionKey: "redeemMemberInviteCode",
        maxHits: INVITE_REDEEM_MAX_HITS,
        windowMs: INVITE_REDEEM_WINDOW_MS,
        blockDurationMs: INVITE_REDEEM_BLOCK_MS,
      },
    );

    if (!identityRateLimit.allowed) {
      return {
        status: "rate_limited" as const,
        retryAfterMs: identityRateLimit.retryAfterMs,
        message: buildRateLimitMessage(identityRateLimit.retryAfterMs),
      };
    }

    const lookup = await getInviteLookupByHash(ctx, inviteCodeHash);
    if (lookup.state !== "active") {
      const messages = {
        invalid_code: "We couldn't find that Circle. Please double-check the code and try again.",
        expired: "This invite code has expired. Ask for a new one.",
        revoked: "This invite code is no longer active. Ask for a new one.",
        already_used: "This invite code has already been used. Ask for a new one.",
      } satisfies Record<Exclude<InviteLookupState["state"], "active">, string>;

      return {
        status: lookup.state,
        message: messages[lookup.state],
      };
    }

    const existingMembership = await getMembershipByAuthIdentityToken(
      ctx,
      identity.tokenIdentifier,
    );

    if (existingMembership) {
      if (existingMembership.role === "independent_senior") {
        return {
          status: "role_collision" as const,
          message:
            "This account is already linked to an independent profile. Use a different email to join a Circle.",
        };
      }

      if (existingMembership.familySpaceId === lookup.invite.familySpaceId) {
        const familySideRole = normalizeFamilySideMembershipRole(
          existingMembership.role,
        );
        return {
          status: "already_joined" as const,
          familySpaceId: existingMembership.familySpaceId,
          membershipId: existingMembership._id,
          role: familySideRole ?? "member",
        };
      }

      if (isFamilySideRole(existingMembership.role)) {
        return {
          status: "circle_conflict" as const,
          message:
            "This account is already linked to a different Circle. Use a different email to join this one.",
        };
      }
    }

    const displayName = normalizeOptionalText(identity.name) ?? MEMBER_LABEL;
    const authEmail = normalizeOptionalEmail(identity.email) ?? null;
    const consumedAt = Date.now();

    const membershipId = await ctx.db.insert("familySpaceMemberships", {
      familySpaceId: lookup.invite.familySpaceId,
      authIdentityToken: identity.tokenIdentifier,
      authEmail,
      displayName,
      role: "member",
      seniorProfileId: null,
      onboardingStep: undefined,
      lastSeenAt: consumedAt,
    });

    await ctx.db.patch(lookup.invite._id, {
      consumedAt,
      redeemedByAuthIdentityToken: identity.tokenIdentifier,
      redeemedByMembershipId: membershipId,
    });

    return {
      status: "joined" as const,
      familySpaceId: lookup.invite.familySpaceId,
      membershipId,
      role: "member" as const,
    };
  },
});
