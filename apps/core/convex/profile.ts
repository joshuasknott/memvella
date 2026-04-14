import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import {
  getOptionalCircleMembership,
  getMembershipByAuthIdentityToken,
  getSeniorProfileByMode,
  isFamilySideRole,
  normalizeFamilySideMembershipRole,
  requireFamilySideCapability,
  upsertAssistedSeniorProfile,
  upsertIndependentSeniorProfile,
} from "./circleAuth";
import {
  normalizeOptionalEmail,
  normalizeOptionalText,
} from "./security";
import {
  buildCircleName,
  MEMBER_LABEL,
  normalizeUserFacingText,
  ORGANISER_LABEL,
} from "./terminology";

const organiserProfileRoleValidator = v.optional(
  v.union(v.literal("organiser"), v.literal("assisted_senior"), v.literal("independent")),
);

async function getPreferredSeniorProfile(
  circleId: Id<"circles">,
  ctx: QueryCtx,
) {
  const assistedSenior = await getSeniorProfileByMode(ctx, circleId, "assisted");
  if (assistedSenior) {
    return assistedSenior;
  }

  return await getSeniorProfileByMode(ctx, circleId, "independent");
}

export const createOrganiserProfile = mutation({
  args: {
    organiserName: v.optional(v.string()),
    seniorDisplayName: v.optional(v.string()),
    role: organiserProfileRoleValidator,
    onboardingStep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated: a valid organiser session is required.");
    }

    const authIdentityToken = identity.tokenIdentifier;
    const authEmail = normalizeOptionalEmail(identity.email) ?? null;

    const existingMembership = await getMembershipByAuthIdentityToken(
      ctx,
      authIdentityToken,
    );

    const organiserName = normalizeOptionalText(args.organiserName) ?? ORGANISER_LABEL;
    const seniorDisplayName = normalizeOptionalText(args.seniorDisplayName);
    const seniorMode = args.role === "independent" ? "independent" : "assisted";

    if (existingMembership) {
      if (!isFamilySideRole(existingMembership.role)) {
        throw new Error("This account is already linked to a different experience.");
      }

      if (normalizeFamilySideMembershipRole(existingMembership.role) !== "organiser") {
        throw new Error("This account does not have access to that Circle setting.");
      }

      const circle = await ctx.db.get(existingMembership.circleId);
      if (!circle) {
        throw new Error("The linked Circle could not be found.");
      }

      await ctx.db.patch(existingMembership._id, {
        displayName: organiserName,
        authEmail,
        onboardingStep: args.onboardingStep,
        lastSeenAt: Date.now(),
      });

      if (seniorDisplayName) {
        if (seniorMode === "independent") {
          const independentSenior = await upsertIndependentSeniorProfile(ctx, {
            circleId: existingMembership.circleId,
            displayName: seniorDisplayName,
          });

          await ctx.db.patch(existingMembership._id, {
            seniorProfileId: independentSenior?._id ?? null,
          });
        } else {
          const assistedSenior = await upsertAssistedSeniorProfile(ctx, {
            circleId: existingMembership.circleId,
            displayName: seniorDisplayName,
          });

          await ctx.db.patch(existingMembership._id, {
            seniorProfileId: assistedSenior?._id ?? null,
          });
        }

        await ctx.db.patch(circle._id, {
          displayName: buildCircleName(seniorDisplayName),
        });
      }

      return existingMembership._id;
    }

    const circleId = await ctx.db.insert("circles", {
      displayName: seniorDisplayName
        ? buildCircleName(seniorDisplayName)
        : buildCircleName(organiserName),
      timezone: undefined,
      locale: undefined,
    });

    let linkedSeniorProfileId: Id<"seniorProfiles"> | null = null;
    if (seniorDisplayName) {
      const seniorProfile =
        seniorMode === "independent"
          ? await upsertIndependentSeniorProfile(ctx, {
              circleId,
              displayName: seniorDisplayName,
            })
          : await upsertAssistedSeniorProfile(ctx, {
              circleId,
              displayName: seniorDisplayName,
            });

      linkedSeniorProfileId = seniorProfile?._id ?? null;
    }

    const membershipId = await ctx.db.insert("circleMemberships", {
      circleId,
      authIdentityToken,
      authEmail,
      displayName: organiserName,
      role: "organiser",
      seniorProfileId: linkedSeniorProfileId,
      onboardingStep: args.onboardingStep,
      lastSeenAt: Date.now(),
    });

    return membershipId;
  },
});

export const patchOrganiserProfile = mutation({
  args: {
    organiserName: v.optional(v.string()),
    seniorDisplayName: v.optional(v.string()),
    role: organiserProfileRoleValidator,
    onboardingStep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySideCapability(
      ctx,
      "manage_circle_admin",
    );
    const organiserName = normalizeOptionalText(args.organiserName);
    const seniorDisplayName = normalizeOptionalText(args.seniorDisplayName);
    const seniorMode = args.role === "independent" ? "independent" : "assisted";

    if (organiserName || args.onboardingStep !== undefined) {
      await ctx.db.patch(membership._id, {
        ...(organiserName ? { displayName: organiserName } : {}),
        ...(args.onboardingStep !== undefined
          ? { onboardingStep: args.onboardingStep }
          : {}),
        lastSeenAt: Date.now(),
      });
    }

    if (seniorDisplayName) {
      if (seniorMode === "independent") {
        const independentSenior = await upsertIndependentSeniorProfile(ctx, {
          circleId: membership.circleId,
          displayName: seniorDisplayName,
        });

        await ctx.db.patch(membership._id, {
          seniorProfileId: independentSenior?._id ?? null,
        });
      } else {
        const assistedSenior = await upsertAssistedSeniorProfile(ctx, {
          circleId: membership.circleId,
          displayName: seniorDisplayName,
        });

        await ctx.db.patch(membership._id, {
          seniorProfileId: assistedSenior?._id ?? null,
        });
      }

      await ctx.db.patch(membership.circleId, {
        displayName: buildCircleName(seniorDisplayName),
      });
    }

    return membership._id;
  },
});

export const getOrganiserProfile = query({
  args: {},
  handler: async (ctx) => {
    const circleContext = await getOptionalCircleMembership(
      ctx,
      "family_side",
    );
    if (!circleContext) {
      return null;
    }

    const seniorProfile =
      circleContext.membership.seniorProfileId !== null
        ? await ctx.db.get(circleContext.membership.seniorProfileId)
        : await getPreferredSeniorProfile(
            circleContext.membership.circleId,
            ctx,
          );

    return {
      _id: circleContext.membership._id,
      circleId: circleContext.membership.circleId,
      organiserName:
        normalizeUserFacingText(circleContext.membership.displayName) ??
        ORGANISER_LABEL,
      seniorDisplayName:
        normalizeUserFacingText(seniorProfile?.displayName) ?? MEMBER_LABEL,
      role:
        normalizeFamilySideMembershipRole(circleContext.membership.role) ??
        "organiser",
      onboardingStep: circleContext.membership.onboardingStep,
      seniorProfileId: seniorProfile?._id ?? null,
      seniorMode: seniorProfile?.seniorMode ?? null,
      authEmail: circleContext.membership.authEmail,
    };
  },
});
