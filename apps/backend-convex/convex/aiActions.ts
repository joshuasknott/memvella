import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import {
  getSeniorProfileByMode,
  requireCircleMembership,
  upsertAssistedSeniorProfile,
} from "./circleAuth";
import { createPersonRecord } from "./people";
import { normalizeOptionalText } from "./security";
import { buildCircleName } from "./terminology";

export const processOnboardingAction = internalMutation({
  args: {
    actionPayload: v.any(),
  },
  handler: async (ctx, args) => {
    const { membership, circleMembership } = await requireCircleMembership(
      ctx,
      "organiser",
    );
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
          const seniorProfile = await upsertAssistedSeniorProfile(ctx, {
            circleId: membership.circleId,
            displayName: seniorDisplayName,
          });

          if (seniorProfile) {
            await ctx.db.patch(membership._id, {
              seniorProfileId: seniorProfile._id,
            });
            await ctx.db.patch(membership.circleId, {
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

        const seniorProfile =
          (membership.seniorProfileId
            ? await ctx.db.get(membership.seniorProfileId)
            : null) ??
          (await getSeniorProfileByMode(ctx, membership.circleId, "assisted"));
        if (!seniorProfile) {
          throw new Error("No senior profile is linked to this Workspace.");
        }

        await createPersonRecord(ctx, {
          seniorProfileId: seniorProfile._id,
          circleMembershipId: circleMembership?._id ?? null,
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
