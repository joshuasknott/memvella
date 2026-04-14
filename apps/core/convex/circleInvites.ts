import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import {
  listMembershipsByAuthIdentityToken,
  normalizeFamilySideMembershipRole,
  pickDeterministicMembership,
  requireFamilySideCapability,
  requireFamilySideMembership,
} from "./circleAuth";
import {
  generateNumericCode,
  hashCircleInviteCode,
  normalizeOptionalEmail,
  normalizeOptionalText,
} from "./security";
import { MEMBER_LABEL, ORGANISER_LABEL } from "./terminology";

const CIRCLE_INVITE_TTL_MS = 10 * 60 * 1000;
const MAX_ACTIVE_INVITE_COLLISION_ATTEMPTS = 20;
const INVITE_REDEEM_MAX_HITS = 5;
const INVITE_REDEEM_WINDOW_MS = 10 * 60 * 1000;
const INVITE_REDEEM_BLOCK_MS = 10 * 60 * 1000;
const INVITE_PREVIEW_MAX_HITS = 10;
const INVITE_PREVIEW_WINDOW_MS = 10 * 60 * 1000;
const INVITE_PREVIEW_BLOCK_MS = 10 * 60 * 1000;

type InviteLookupState =
  | { state: "active"; invite: Doc<"circleInviteCodes"> }
  | { state: "invalid_code" }
  | { state: "expired"; invite: Doc<"circleInviteCodes"> | null }
  | { state: "revoked"; invite: Doc<"circleInviteCodes"> | null }
  | { state: "already_used"; invite: Doc<"circleInviteCodes"> | null };

type InviteTerminalLookupState = Exclude<InviteLookupState["state"], "active">;

type RedeemMembershipEvaluation =
  | { status: "eligible" }
  | {
      status: "already_joined";
      membership: Doc<"circleMemberships">;
    }
  | {
      status: "circle_conflict";
      message: string;
    };

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
      status: "circle_conflict";
      message: string;
    }
  | {
      status: "already_joined";
      circleId: Doc<"circleInviteCodes">["circleId"];
      membershipId: Doc<"circleMemberships">["_id"];
      role: "organiser" | "member";
    }
  | {
      status: "joined";
      circleId: Doc<"circleInviteCodes">["circleId"];
      membershipId: Doc<"circleMemberships">["_id"];
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

const CIRCLE_CONFLICT_MESSAGE =
  "This account is already linked to a different Circle. Use a different email to join this one.";

function isCircleInviteActive(invite: Doc<"circleInviteCodes">, now: number) {
  return (
    invite.revokedAt === null &&
    invite.consumedAt === null &&
    invite.expiresAt > now
  );
}

async function listMemberInvitesForCircle(
  ctx: MutationCtx | QueryCtx,
  circleId: Id<"circles">,
) {
  return await ctx.db
    .query("circleInviteCodes")
    .withIndex("by_circleId_and_role", (query) =>
      query.eq("circleId", circleId).eq("role", "member"),
    )
    .order("desc")
    .take(25);
}

async function revokeActiveMemberInvitesForCircle(
  ctx: MutationCtx,
  circleId: Id<"circles">,
  revokedAt: number,
) {
  const invites = await listMemberInvitesForCircle(ctx, circleId);
  let revokedCount = 0;

  for (const invite of invites) {
    if (!isCircleInviteActive(invite, revokedAt)) {
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

  if (circleInvites.length === 0) {
    return { state: "invalid_code" };
  }

  const now = Date.now();
  const activeCircleInvite = circleInvites.find((invite) =>
    isCircleInviteActive(invite, now),
  );
  if (activeCircleInvite) {
    return { state: "active", invite: activeCircleInvite };
  }

  const latestCircleInvite = circleInvites[0];
  if (latestCircleInvite.consumedAt !== null) {
    return { state: "already_used", invite: latestCircleInvite };
  }

  if (latestCircleInvite.revokedAt !== null) {
    return { state: "revoked", invite: latestCircleInvite };
  }

  if (latestCircleInvite.expiresAt <= now) {
    return { state: "expired", invite: latestCircleInvite };
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
    const inviteCodeHash = await hashCircleInviteCode(inviteCode);
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

function getFamilySideRoleForResult(role: Doc<"circleMemberships">["role"]) {
  return normalizeFamilySideMembershipRole(role) ?? "member";
}

function buildAlreadyJoinedResult(
  membership: Doc<"circleMemberships">,
): RedeemMemberInviteCodeResult {
  return {
    status: "already_joined",
    circleId: membership.circleId,
    membershipId: membership._id,
    role: getFamilySideRoleForResult(membership.role),
  };
}

export function evaluateRedeemMemberships(
  memberships: ReadonlyArray<Doc<"circleMemberships">>,
  targetCircleId: Id<"circles">,
): RedeemMembershipEvaluation {
  const targetMembership = pickDeterministicMembership(
    memberships.filter((membership) => membership.circleId === targetCircleId),
  );
  if (targetMembership) {
    return {
      status: "already_joined",
      membership: targetMembership,
    };
  }

  if (memberships.length > 0) {
    return {
      status: "circle_conflict",
      message: CIRCLE_CONFLICT_MESSAGE,
    };
  }

  return { status: "eligible" };
}

async function listMembershipsForInviteTarget(
  ctx: MutationCtx,
  circleId: Id<"circles">,
  authIdentityToken: string,
) {
  const memberships = await ctx.db
    .query("circleMemberships")
    .withIndex("by_circleId_and_authIdentityToken", (query) =>
      query.eq("circleId", circleId).eq("authIdentityToken", authIdentityToken),
    )
    .take(20);

  return pickDeterministicMembership([...memberships]);
}

function getFamilyRoleLabel(role: Doc<"circleMemberships">["role"]) {
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
    const { circleMembership } = await requireFamilySideMembership(ctx);
    if (!circleMembership) {
      return [];
    }

    const circleMemberships = await ctx.db
      .query("circleMemberships")
      .withIndex("by_circleId", (query) => query.eq("circleId", circleMembership.circleId))
      .take(50);

    return circleMemberships
      .sort((left, right) => {
        const leftRank = left.role === "member" ? 1 : 0;
        const rightRank = right.role === "member" ? 1 : 0;
        return leftRank - rightRank || left._creationTime - right._creationTime;
      })
      .map((candidate) => ({
        id: candidate._id,
        displayName: candidate.displayName,
        role: candidate.role,
        roleLabel: getFamilyRoleLabel(candidate.role),
        authEmail: candidate.authEmail,
        joinedAt: candidate._creationTime,
        isCurrentAccount:
          candidate.authIdentityToken === circleMembership.authIdentityToken,
      }));
  },
});

export const listActiveMemberInvites = query({
  args: {},
  handler: async (ctx) => {
    const { circleMembership } = await requireFamilySideCapability(
      ctx,
      "manage_invite_codes",
    );
    if (!circleMembership) {
      return [];
    }

    const now = Date.now();
    const circleInvites = await listMemberInvitesForCircle(ctx, circleMembership.circleId);

    return circleInvites
      .filter((invite) => isCircleInviteActive(invite, now))
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
    const { circleMembership } = await requireFamilySideCapability(
      ctx,
      "manage_invite_codes",
    );
    if (!circleMembership) {
      return { revokedCount: 0 };
    }

    const revokedCount = await revokeActiveMemberInvitesForCircle(
      ctx,
      circleMembership.circleId,
      Date.now(),
    );

    return {
      revokedCount,
    };
  },
});

export const generateMemberInviteCode = mutation({
  args: {},
  handler: async (ctx) => {
    const { circleMembership } = await requireFamilySideCapability(
      ctx,
      "manage_invite_codes",
    );
    if (!circleMembership) {
      throw new Error("The linked Circle could not be found.");
    }

    const now = Date.now();
    await revokeActiveMemberInvitesForCircle(ctx, circleMembership.circleId, now);

    const { inviteCode, inviteCodeHash } = await generateUniqueActiveInviteCode(ctx);
    const expiresAt = now + CIRCLE_INVITE_TTL_MS;

    await ctx.db.insert("circleInviteCodes", {
      circleId: circleMembership.circleId,
      createdByCircleMembershipId: circleMembership._id,
      role: "member",
      inviteCodeHash,
      expiresAt,
      consumedAt: null,
      revokedAt: null,
      redeemedByAuthIdentityToken: null,
      redeemedByCircleMembershipId: null,
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

    const inviteCodeHash = await hashCircleInviteCode(normalizedInviteCode);
    const lookup = await getInviteLookupByHash(ctx, inviteCodeHash);
    if (lookup.state !== "active") {
      return {
        status: lookup.state,
        message: getInviteLookupMessage(lookup.state, "preview"),
      };
    }

    const circle = await ctx.db.get(lookup.invite.circleId);

    return {
      status: "ready",
      circleName: circle?.displayName ?? null,
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

    const inviteCodeHash = await hashCircleInviteCode(normalizedInviteCode);
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
          lookupInvite.redeemedByCircleMembershipId !== null
            ? await ctx.db.get(lookupInvite.redeemedByCircleMembershipId)
            : null;
        if (redeemedMembership) {
          return buildAlreadyJoinedResult(redeemedMembership);
        }

        const fallbackMembership = await listMembershipsForInviteTarget(
          ctx,
          lookupInvite.circleId,
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
      lookup.invite.circleId,
    );
    if (membershipEvaluation.status === "already_joined") {
      return buildAlreadyJoinedResult(membershipEvaluation.membership);
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

    const circleInviteId = lookup.invite._id;
    const circleInvite = await ctx.db.get(circleInviteId);
    if (!circleInvite || !isCircleInviteActive(circleInvite, consumedAt)) {
      return {
        status: "already_used",
        message: getInviteLookupMessage("already_used", "redeem"),
      };
    }

    const membershipId = await ctx.db.insert("circleMemberships", {
      circleId: circleInvite.circleId,
      authIdentityToken: identity.tokenIdentifier,
      authEmail,
      displayName,
      role: "member",
      seniorProfileId: null,
      onboardingStep: undefined,
      lastSeenAt: consumedAt,
    });

    await ctx.db.patch(circleInviteId, {
      consumedAt,
      redeemedByAuthIdentityToken: identity.tokenIdentifier,
      redeemedByCircleMembershipId: membershipId,
    });

    return {
      status: "joined" as const,
      circleId: circleInvite.circleId,
      membershipId,
      role: "member" as const,
    };
  },
});
