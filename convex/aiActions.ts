import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// processOnboardingAction
// =============================================================================
// Internal bridge between the Gemini conversational onboarding agent and the
// database. The frontend LLM agent produces structured JSON for each user
// utterance during onboarding; this function receives that JSON and applies
// the appropriate write operation.
//
// This is intentionally internalMutation — it is NOT part of the public API
// and must never be callable directly from the client. The frontend must call
// a public action that validates/sanitises the payload before running this.
//
// actionPayload shape today:
//   { action: 'update_profile', caregiverName?, lovedOneName?, role?, onboarding_step? }
//   { action: 'add_relation',   name, relationship, aiContext? }
//
// The v.any() validator is intentionally loose for now (we will tighten it
// once the agent's output schema is stable).
// =============================================================================
export const processOnboardingAction = internalMutation({
  args: {
    actionPayload: v.any(),
  },
  handler: async (ctx, args) => {
    // -------------------------------------------------------------------------
    // Auth guard
    // -------------------------------------------------------------------------
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error(
        "Unauthenticated: processOnboardingAction requires a valid session."
      );
    }
    const tokenIdentifier = identity.tokenIdentifier;

    const payload = args.actionPayload as Record<string, unknown>;
    const action = payload.action as string | undefined;

    // -------------------------------------------------------------------------
    // Route by action type
    // -------------------------------------------------------------------------
    switch (action) {
      // -----------------------------------------------------------------------
      // update_profile
      // -----------------------------------------------------------------------
      // Patches the authenticated user's caregiverProfiles record with whatever
      // fields the agent extracted from the conversation turn.
      // -----------------------------------------------------------------------
      case "update_profile": {
        const profile = await ctx.db
          .query("caregiverProfiles")
          .withIndex("by_authUserId", (q) =>
            q.eq("authUserId", tokenIdentifier)
          )
          .first();

        if (!profile) {
          throw new Error(
            "No caregiverProfile found. The frontend must call " +
              "createCaregiverProfile before the onboarding agent runs."
          );
        }

        // Build a patch from whichever fields are present in the payload.
        // Never write undefined — Convex will reject it.
        const patch: Record<string, unknown> = {};

        if (typeof payload.caregiverName === "string") {
          patch.caregiverName = payload.caregiverName.trim();
        }

        // Role-specific logic: independent_senior means the user IS the senior,
        // so lovedOneName mirrors caregiverName unless explicitly overridden.
        const incomingRole =
          typeof payload.role === "string" ? payload.role : profile.role;

        const explicitLovedOneName =
          typeof payload.lovedOneName === "string"
            ? payload.lovedOneName.trim()
            : undefined;

        const mirroredLovedOneName =
          incomingRole === "independent_senior"
            ? ((patch.caregiverName as string | undefined) ??
               profile.caregiverName)
            : undefined;

        const effectiveLovedOneName =
          explicitLovedOneName ?? mirroredLovedOneName;

        if (effectiveLovedOneName !== undefined) {
          patch.lovedOneName = effectiveLovedOneName;
        }

        if (typeof payload.role === "string") {
          patch.role = payload.role;
        }

        if (typeof payload.onboarding_step === "number") {
          patch.onboarding_step = payload.onboarding_step;
        }

        if (Object.keys(patch).length > 0) {
          await ctx.db.patch(profile._id, patch);
        }

        return { success: true, action };
      }

      // -----------------------------------------------------------------------
      // add_relation
      // -----------------------------------------------------------------------
      // Inserts a new familyMembers record linked to the authenticated user.
      // isLiving defaults to true — the agent can set it false in a later turn
      // once we add the deceased-relative prompt.
      // -----------------------------------------------------------------------
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
            "add_relation requires at least 'name' and 'relationship' fields."
          );
        }

        await ctx.db.insert("familyMembers", {
          caregiverId: tokenIdentifier,
          name,
          relationship,
          // ⚠️ TEMPORAL SAFETY FLAG — defaulting to true here.
          // A future agent turn will ask the caregiver and call update_relation
          // to flip this flag if the person is deceased.
          isLiving: true,
          aiContext,
        });

        return { success: true, action };
      }

      // -----------------------------------------------------------------------
      // Unknown action — surface a clear error rather than silently no-oping
      // -----------------------------------------------------------------------
      default: {
        throw new Error(
          `processOnboardingAction: unknown action "${action ?? "(none)"}". ` +
            `Expected 'update_profile' or 'add_relation'.`
        );
      }
    }
  },
});
