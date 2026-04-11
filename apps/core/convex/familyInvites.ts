import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import {
  isFamilySideRole,
  listMembershipsByAuthIdentityToken,
  normalizeFamilySideMembershipRole,
  pickDeterministicMembership,
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
import {
  ensureCircleForFamilySpace,
  ensureCircleMembershipForLegacyMembership,
} from "./circleCompat";

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
  | { state: "expired"; invite: Doc<"familyInvites"> | null }
  | { state: "revoked"; invite: Doc<"familyInvites"> | null }
  | { state: "already_used"; invite: Doc<"familyInvites"> | null };

type InviteTerminalLookupState = Exclude<InviteLookupState["state"], "active">;

type RedeemMembershipEvaluation =
  | { status: "eligible" }
  | {
      status: "already_joined";
      membership: Doc<"familySpaceMemberships">;
    }
  | {
      status: "role_collision";
      message: string;
    }
  | {
      status: "circle_conflict";
      message: string;
    };

const ROLE_COLLISION_MESSAGE =
  "This account is already linked to an independent profile. Use a different email to join a Circle.";
const CIRCLE_CONFLICT_MESSAGE =
  "This account is already linked to a different Circle. Use a different email to join this one.";

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
      role: "organiser" | "member";
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

function isCircleInviteActive(invite: Doc<"circleInviteCodes">, now: number) {
  return (
    invite.revokedAt === null &&
    invite.consumedAt === null &&
    invite.expiresAt > now
  );
}

async function getCircleByFamilySpaceId(
  ctx: MutationCtx | QueryCtx,
  familySpaceId: Id<"familySpaces">,
) {
  return await ctx.db
    .query("circles")
    .withIndex("by_legacyFamilySpaceId", (query) =>
      query.eq("legacyFamilySpaceId", familySpaceId),
    )
    .unique();
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

async function mirrorLegacyInviteToCircle(
  ctx: MutationCtx,
  legacyInviteId: Id<"familyInvites">,
) {
  const existingCircleInvite = await ctx.db
    .query("circleInviteCodes")
    .withIndex("by_legacyFamilyInviteId", (query) =>
      query.eq("legacyFamilyInviteId", legacyInviteId),
    )
    .unique();

  if (existingCircleInvite) {
    return existingCircleInvite;
  }

  const legacyInvite = await ctx.db.get(legacyInviteId);
  if (!legacyInvite) {
    return null;
  }

  const circle = await ensureCircleForFamilySpace(ctx, legacyInvite.familySpaceId);
  const createdByCircleMembership = await ensureCircleMembershipForLegacyMembership(
    ctx,
    legacyInvite.createdByMembershipId,
  );
  if (!createdByCircleMembership) {
    return null;
  }

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

async function ensureLegacyInviteForCircleInvite(
  ctx: MutationCtx,
  circleInvite: Doc<"circleInviteCodes">,
) {
  if (circleInvite.legacyFamilyInviteId) {
    const legacyInvite = await ctx.db.get(circleInvite.legacyFamilyInviteId);
    if (legacyInvite) {
      return legacyInvite;
    }
  }

  const circle = await ctx.db.get(circleInvite.circleId);
  if (!circle?.legacyFamilySpaceId) {
    return null;
  }

  const createdByCircleMembership = await ctx.db.get(
    circleInvite.createdByCircleMembershipId,
  );
  const createdByLegacyMembershipId =
    createdByCircleMembership?.legacyFamilySpaceMembershipId ?? null;
  if (!createdByLegacyMembershipId) {
    return null;
  }

  const redeemedByLegacyMembershipId =
    circleInvite.redeemedByCircleMembershipId !== null
      ? ((await ctx.db.get(circleInvite.redeemedByCircleMembershipId))
          ?.legacyFamilySpaceMembershipId ?? null)
      : null;

  const legacyInviteId = await ctx.db.insert("familyInvites", {
    familySpaceId: circle.legacyFamilySpaceId,
    createdByMembershipId: createdByLegacyMembershipId,
    role: circleInvite.role,
    inviteCodeHash: circleInvite.inviteCodeHash,
    expiresAt: circleInvite.expiresAt,
    consumedAt: circleInvite.consumedAt,
    revokedAt: circleInvite.revokedAt,
    redeemedByAuthIdentityToken: circleInvite.redeemedByAuthIdentityToken,
    redeemedByMembershipId: redeemedByLegacyMembershipId,
  });

  await ctx.db.patch(circleInvite._id, {
    legacyFamilyInviteId: legacyInviteId,
  });

  return await ctx.db.get(legacyInviteId);
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
  ctx: MutationCtx,
  inviteCodeHash: string,
): Promise<InviteLookupState> {
  const circleInvites = await ctx.db
    .query("circleInviteCodes")
    .withIndex("by_inviteCodeHash", (query) =>
      query.eq("inviteCodeHash", inviteCodeHash),
    )
    .order("desc")
    .take(10);

  if (circleInvites.length > 0) {
    const now = Date.now();
    const activeCircleInvite = circleInvites.find((invite) =>
      isCircleInviteActive(invite, now),
    );
    if (activeCircleInvite) {
      const mirroredLegacyInvite = await ensureLegacyInviteForCircleInvite(
        ctx,
        activeCircleInvite,
      );
      if (mirroredLegacyInvite) {
        return { state: "active", invite: mirroredLegacyInvite };
      }
    }

    const latestCircleInvite = circleInvites[0];
    if (latestCircleInvite.consumedAt !== null) {
      const legacyInvite = await ensureLegacyInviteForCircleInvite(
        ctx,
        latestCircleInvite,
      );
      return { state: "already_used", invite: legacyInvite };
    }

    if (latestCircleInvite.revokedAt !== null) {
      const legacyInvite = await ensureLegacyInviteForCircleInvite(
        ctx,
        latestCircleInvite,
      );
      return { state: "revoked", invite: legacyInvite };
    }

    if (latestCircleInvite.expiresAt <= now) {
      const legacyInvite = await ensureLegacyInviteForCircleInvite(
        ctx,
        latestCircleInvite,
      );
      return { state: "expired", invite: legacyInvite };
    }
  }

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
    return { state: "already_used", invite: latestInvite };
  }

  if (latestInvite.revokedAt !== null) {
    return { state: "revoked", invite: latestInvite };
  }

  if (latestInvite.expiresAt <= now) {
    return { state: "expired", invite: latestInvite };
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

export function getInviteLookupMessage(
  state: InviteTerminalLookupState,
  context: "preview" | "redeem",
) {
  const previewMessages = {
    invalid_code:
      "We couldn't find that Circle. Please double-check the code and try again.",
    expired: "This Circle code has expired. Ask for a new one.",
    revoked: "This Circle code is no longer active. Ask for a new one.",
    already_used: "This Circle code has already been used. Ask for a new one.",
  } satisfies Record<InviteTerminalLookupState, string>;

  const redeemMessages = {
    invalid_code:
      "We couldn't find that Circle. Please double-check the code and try again.",
    expired: "This invite code has expired. Ask for a new one.",
    revoked: "This invite code is no longer active. Ask for a new one.",
    already_used: "This invite code has already been used. Ask for a new one.",
  } satisfies Record<InviteTerminalLookupState, string>;

  return context === "preview" ? previewMessages[state] : redeemMessages[state];
}

function getFamilySideRoleForResult(role: Doc<"familySpaceMemberships">["role"]) {
  return normalizeFamilySideMembershipRole(role) ?? "member";
}

function buildAlreadyJoinedResult(
  membership: Doc<"familySpaceMemberships">,
): RedeemMemberInviteCodeResult {
  return {
    status: "already_joined",
    familySpaceId: membership.familySpaceId,
    membershipId: membership._id,
    role: getFamilySideRoleForResult(membership.role),
  };
}

export function evaluateRedeemMemberships(
  memberships: ReadonlyArray<Doc<"familySpaceMemberships">>,
  targetFamilySpaceId: Id<"familySpaces">,
): RedeemMembershipEvaluation {
  const familySideMemberships = memberships.filter((membership) =>
    isFamilySideRole(membership.role),
  );
  const targetMembership = pickDeterministicMembership(
    familySideMemberships.filter(
      (membership) => membership.familySpaceId === targetFamilySpaceId,
    ),
  );
  if (targetMembership) {
    return {
      status: "already_joined",
      membership: targetMembership,
    };
  }

  if (memberships.some((membership) => membership.role === "independent_senior")) {
    return {
      status: "role_collision",
      message: ROLE_COLLISION_MESSAGE,
    };
  }

  if (familySideMemberships.length > 0) {
    return {
      status: "circle_conflict",
      message: CIRCLE_CONFLICT_MESSAGE,
    };
  }

  return { status: "eligible" };
}

async function listMembershipsForInviteTarget(
  ctx: MutationCtx,
  familySpaceId: Id<"familySpaces">,
  authIdentityToken: string,
) {
  const memberships = await ctx.db
    .query("familySpaceMemberships")
    .withIndex("by_familySpaceId_and_authIdentityToken", (query) =>
      query
        .eq("familySpaceId", familySpaceId)
        .eq("authIdentityToken", authIdentityToken),
    )
    .take(20);

  return pickDeterministicMembership([...memberships]);
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

    const circle = await getCircleByFamilySpaceId(ctx, membership.familySpaceId);
    if (circle) {
      const circleMemberships = await ctx.db
        .query("circleMemberships")
        .withIndex("by_circleId", (query) => query.eq("circleId", circle._id))
        .take(50);

      return circleMemberships
        .filter((candidate) => candidate.role !== "independent_senior")
        .sort((left, right) => {
          const leftRank = left.role === "member" ? 1 : 0;
          const rightRank = right.role === "member" ? 1 : 0;
          return leftRank - rightRank || left._creationTime - right._creationTime;
        })
        .map((candidate) => ({
          id: candidate._id,
          displayName: candidate.displayName,
          role: candidate.role,
          roleLabel: candidate.role === "organiser" ? ORGANISER_LABEL : MEMBER_LABEL,
          authEmail: candidate.authEmail,
          joinedAt: candidate._creationTime,
          isCurrentAccount:
            candidate.authIdentityToken === membership.authIdentityToken,
        }));
    }

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

    const circle = await getCircleByFamilySpaceId(ctx, membership.familySpaceId);
    if (circle) {
      const circleInvites = await ctx.db
        .query("circleInviteCodes")
        .withIndex("by_circleId_and_role", (query) =>
          query.eq("circleId", circle._id).eq("role", "member"),
        )
        .take(25);

      return circleInvites
        .filter((invite) => isCircleInviteActive(invite, now))
        .map((invite) => ({
          id: invite._id,
          role: invite.role,
          expiresAt: invite.expiresAt,
        }));
    }

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
    const revokedAt = Date.now();

    let revokedCircleCount = 0;
    const circle = await getCircleByFamilySpaceId(ctx, membership.familySpaceId);
    if (circle) {
      const circleInvites = await ctx.db
        .query("circleInviteCodes")
        .withIndex("by_circleId_and_role", (query) =>
          query.eq("circleId", circle._id).eq("role", "member"),
        )
        .take(25);

      for (const invite of circleInvites) {
        if (!isCircleInviteActive(invite, revokedAt)) {
          continue;
        }

        await ctx.db.patch(invite._id, {
          revokedAt,
        });
        revokedCircleCount += 1;
      }
    }

    const revokedLegacyCount = await revokeActiveMemberInvitesForFamilySpace(
      ctx,
      membership.familySpaceId,
      revokedAt,
    );

    return {
      revokedCount: Math.max(revokedLegacyCount, revokedCircleCount),
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

    const legacyInviteId = await ctx.db.insert("familyInvites", {
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

    const circle = await ensureCircleForFamilySpace(ctx, membership.familySpaceId);
    const circleMembership = await ensureCircleMembershipForLegacyMembership(
      ctx,
      membership._id,
    );

    if (circleMembership) {
      await ctx.db.insert("circleInviteCodes", {
        circleId: circle._id,
        legacyFamilyInviteId: legacyInviteId,
        createdByCircleMembershipId: circleMembership._id,
        role: "member",
        inviteCodeHash,
        expiresAt,
        consumedAt: null,
        revokedAt: null,
        redeemedByAuthIdentityToken: null,
        redeemedByCircleMembershipId: null,
      });
    }

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
      return {
        status: lookup.state,
        message: getInviteLookupMessage(lookup.state, "preview"),
      };
    }

    await mirrorLegacyInviteToCircle(ctx, lookup.invite._id);
    const familySpace = await ctx.db.get(lookup.invite.familySpaceId);

    if (!familySpace) {
      const circle = await ctx.db
        .query("circles")
        .withIndex("by_legacyFamilySpaceId", (query) =>
          query.eq("legacyFamilySpaceId", lookup.invite.familySpaceId),
        )
        .unique();

      return {
        status: "ready",
        circleName: circle?.displayName ?? null,
      };
    }

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
      const lookupInvite = "invite" in lookup ? lookup.invite : null;
      if (lookupInvite?.redeemedByAuthIdentityToken === identity.tokenIdentifier) {
        const redeemedMembership =
          lookupInvite.redeemedByMembershipId !== null
            ? await ctx.db.get(lookupInvite.redeemedByMembershipId)
            : null;
        if (redeemedMembership) {
          return buildAlreadyJoinedResult(redeemedMembership);
        }

        const fallbackMembership = await listMembershipsForInviteTarget(
          ctx,
          lookupInvite.familySpaceId,
          identity.tokenIdentifier,
        );
        if (fallbackMembership) {
          return buildAlreadyJoinedResult(fallbackMembership);
        }
      }

      return {
        status: lookup.state,
        message: getInviteLookupMessage(lookup.state, "redeem"),
      };
    }

    const membershipsForIdentity = await listMembershipsByAuthIdentityToken(
      ctx,
      identity.tokenIdentifier,
    );

    const membershipEvaluation = evaluateRedeemMemberships(
      membershipsForIdentity,
      lookup.invite.familySpaceId,
    );
    if (membershipEvaluation.status === "already_joined") {
      return buildAlreadyJoinedResult(membershipEvaluation.membership);
    }
    if (membershipEvaluation.status === "role_collision") {
      return {
        status: "role_collision",
        message: membershipEvaluation.message,
      };
    }
    if (membershipEvaluation.status === "circle_conflict") {
      return {
        status: "circle_conflict",
        message: membershipEvaluation.message,
      };
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

    await ensureCircleMembershipForLegacyMembership(ctx, membershipId);

    await ctx.db.patch(lookup.invite._id, {
      consumedAt,
      redeemedByAuthIdentityToken: identity.tokenIdentifier,
      redeemedByMembershipId: membershipId,
    });

    const circleInvite = await mirrorLegacyInviteToCircle(ctx, lookup.invite._id);
    if (circleInvite) {
      const circleMembership = await ensureCircleMembershipForLegacyMembership(
        ctx,
        membershipId,
      );
      await ctx.db.patch(circleInvite._id, {
        consumedAt,
        redeemedByAuthIdentityToken: identity.tokenIdentifier,
        redeemedByCircleMembershipId: circleMembership?._id ?? null,
      });
    }

    return {
      status: "joined" as const,
      familySpaceId: lookup.invite.familySpaceId,
      membershipId,
      role: "member" as const,
    };
  },
});
