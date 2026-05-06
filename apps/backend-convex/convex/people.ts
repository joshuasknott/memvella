import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  mutation,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import {
  getSeniorProfileByMode,
  requireFamilySideCapability,
} from "./circleAuth";
import { assertValidStoredUpload, consumeUploadIntent } from "./uploadValidation";

type DbCtx = MutationCtx | QueryCtx;

export async function listPeopleForSeniorProfile(
  ctx: DbCtx,
  seniorProfileId: Id<"seniorProfiles">,
  limit: number,
) {
  return await ctx.db
    .query("people")
    .withIndex("by_seniorProfileId", (query) =>
      query.eq("seniorProfileId", seniorProfileId),
    )
    .take(limit);
}

export async function listPeopleForCircle(
  ctx: DbCtx,
  circleId: Id<"circles">,
  limit: number,
) {
  const seniorProfile =
    (await getSeniorProfileByMode(ctx, circleId, "assisted")) ??
    (await getSeniorProfileByMode(ctx, circleId, "independent"));
  if (!seniorProfile) {
    return [];
  }

  return await listPeopleForSeniorProfile(ctx, seniorProfile._id, limit);
}

export async function createPersonRecord(
  ctx: MutationCtx,
  args: {
    seniorProfileId: Id<"seniorProfiles">;
    circleMembershipId: Id<"circleMemberships"> | null;
    name: string;
    relationship: string;
    isLiving: boolean;
    aiContext: string;
    photoStorageId?: Id<"_storage">;
  },
) {
  const now = Date.now();

  return await ctx.db.insert("people", {
    seniorProfileId: args.seniorProfileId,
    name: args.name,
    relationship: args.relationship,
    isLiving: args.isLiving,
    aiContext: args.aiContext,
    photoStorageId: args.photoStorageId,
    createdByCircleMembershipId: args.circleMembershipId,
    updatedByCircleMembershipId: args.circleMembershipId,
    lastEditedAt: now,
  });
}

export const addPerson = mutation({
  args: {
    name: v.string(),
    relationship: v.string(),
    isLiving: v.boolean(),
    aiContext: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
    uploadIntentId: v.optional(v.id("uploadIntents")),
  },
  handler: async (ctx, args) => {
    const { membership, circleMembership } = await requireFamilySideCapability(
      ctx,
      "manage_people",
    );
    if (args.photoStorageId && args.uploadIntentId && circleMembership) {
      await consumeUploadIntent(ctx, {
        uploadIntentId: args.uploadIntentId,
        storageId: args.photoStorageId,
        circleMembershipId: circleMembership._id,
      });
    }
    if (args.photoStorageId) {
      await assertValidStoredUpload(ctx, {
        storageId: args.photoStorageId,
        kind: "image",
      });
    }

    const seniorProfile =
      (membership.seniorProfileId
        ? await ctx.db.get(membership.seniorProfileId)
        : null) ??
      (await getSeniorProfileByMode(ctx, membership.circleId, "assisted")) ??
      (await getSeniorProfileByMode(ctx, membership.circleId, "independent"));
    if (!seniorProfile) {
      throw new Error("No senior profile is linked to this Circle.");
    }

    return await createPersonRecord(ctx, {
      seniorProfileId: seniorProfile._id,
      circleMembershipId: circleMembership?._id ?? null,
      name: args.name,
      relationship: args.relationship,
      isLiving: args.isLiving,
      aiContext: args.aiContext,
      photoStorageId: args.photoStorageId,
    });
  },
});
