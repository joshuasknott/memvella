import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import {
  requireFamilySpaceMembership,
  upsertAssistedSeniorProfile,
  upsertIndependentSeniorProfile,
} from "./familySpaceAuth";
import { createPersonRecord } from "./people";
import { normalizeOptionalText } from "./security";
import { buildCircleName } from "./terminology";
import { patchCircleFromFamilySpace } from "./circleCompat";

export const processOnboardingAction = internalMutation({
  args: {
    actionPayload: v.any(),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "family_side");
    const payload = args.actionPayload as Record<string, unknown>;
    const action = payload.action as string | undefined;

    switch (action) {
      case "update_profile": {
        const organiserName = normalizeOptionalText(
          typeof payload.organiserName === "string"
            ? payload.organiserName
            : undefined,
        );
        const seniorDisplayName = normalizeOptionalText(
          typeof payload.seniorDisplayName === "string"
            ? payload.seniorDisplayName
            : undefined,
        );
        const incomingRole =
          typeof payload.role === "string" ? payload.role : "assisted_senior";

        if (organiserName || typeof payload.onboardingStep === "number") {
          await ctx.db.patch(membership._id, {
            ...(organiserName ? { displayName: organiserName } : {}),
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
                })
              : await upsertAssistedSeniorProfile(ctx, {
                  familySpaceId: membership.familySpaceId,
                  displayName: seniorDisplayName,
                });

          if (seniorProfile) {
            await ctx.db.patch(membership._id, {
              seniorProfileId:
                incomingRole === "independent_senior"
                  ? seniorProfile._id
                  : membership.seniorProfileId,
            });
            await ctx.db.patch(membership.familySpaceId, {
              displayName: buildCircleName(seniorDisplayName),
            });
            await patchCircleFromFamilySpace(ctx, membership.familySpaceId, {
              displayName: buildCircleName(seniorDisplayName),
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

        await createPersonRecord(ctx, {
          familySpaceId: membership.familySpaceId,
          seniorProfileId: membership.seniorProfileId,
          membershipId: membership._id,
          name,
          relationship,
          isLiving: true,
          aiContext,
          photoStorageId: undefined,
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
