import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import {
  requireFamilySpaceMembership,
  upsertAssistedSeniorProfile,
  upsertIndependentSeniorProfile,
} from "./familySpaceAuth";
import { normalizeOptionalText } from "./security";

export const processOnboardingAction = internalMutation({
  args: {
    actionPayload: v.any(),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
    const payload = args.actionPayload as Record<string, unknown>;
    const action = payload.action as string | undefined;

    switch (action) {
      case "update_profile": {
        const supporterName = normalizeOptionalText(
          typeof payload.supporterName === "string"
            ? payload.supporterName
            : undefined,
        );
        const seniorDisplayName = normalizeOptionalText(
          typeof payload.seniorDisplayName === "string"
            ? payload.seniorDisplayName
            : undefined,
        );
        const incomingRole =
          typeof payload.role === "string" ? payload.role : "assisted_senior";

        if (supporterName || typeof payload.onboardingStep === "number") {
          await ctx.db.patch(membership._id, {
            ...(supporterName ? { displayName: supporterName } : {}),
            ...(typeof payload.onboardingStep === "number"
              ? { onboardingStep: payload.onboardingStep }
              : {}),
            lastSeenAt: Date.now(),
          });
        }

        if (seniorDisplayName) {
          const seniorProfile =
            incomingRole === "independent_senior"
              ? await upsertIndependentSeniorProfile(ctx, {
                  familySpaceId: membership.familySpaceId,
                  displayName: seniorDisplayName,
                  recoveryEmail: membership.authEmail ?? undefined,
                })
              : await upsertAssistedSeniorProfile(ctx, {
                  familySpaceId: membership.familySpaceId,
                  displayName: seniorDisplayName,
                  recoveryEmail: membership.authEmail ?? undefined,
                });

          if (seniorProfile) {
            await ctx.db.patch(membership._id, {
              seniorProfileId:
                incomingRole === "independent_senior"
                  ? seniorProfile._id
                  : membership.seniorProfileId,
            });
            await ctx.db.patch(membership.familySpaceId, {
              displayName: `${seniorDisplayName} FamilySpace`,
            });
          }
        }

        return { success: true, action };
      }

      case "add_relation": {
        const name = typeof payload.name === "string" ? payload.name.trim() : "";
        const relationship =
          typeof payload.relationship === "string"
            ? payload.relationship.trim()
            : "";
        const aiContext =
          typeof payload.aiContext === "string" ? payload.aiContext.trim() : "";

        if (!name || !relationship) {
          throw new Error(
            "add_relation requires both 'name' and 'relationship'.",
          );
        }

        await ctx.db.insert("familyMembers", {
          familySpaceId: membership.familySpaceId,
          name,
          relationship,
          isLiving: true,
          aiContext,
        });

        return { success: true, action };
      }

      default:
        throw new Error(
          `processOnboardingAction: unknown action "${action ?? "(none)"}".`,
        );
    }
  },
});
