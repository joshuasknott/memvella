import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  mutation,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { requireFamilySideCapability } from "./familySpaceAuth";
import { assertValidStoredUpload } from "./uploadValidation";

type DbCtx = MutationCtx | QueryCtx;

export async function listPeopleForFamilySpace(
  ctx: DbCtx,
  familySpaceId: Id<"familySpaces">,
  limit: number,
) {
  return await ctx.db
    .query("people")
    .withIndex("by_familySpaceId", (query) => query.eq("familySpaceId", familySpaceId))
    .take(limit);
}

export async function createPersonRecord(
  ctx: MutationCtx,
  args: {
    familySpaceId: Id<"familySpaces">;
    seniorProfileId: Id<"seniorProfiles"> | null;
    membershipId: Id<"familySpaceMemberships">;
    name: string;
    relationship: string;
    isLiving: boolean;
    aiContext: string;
    photoStorageId?: Id<"_storage">;
  },
) {
  const now = Date.now();

  return await ctx.db.insert("people", {
    familySpaceId: args.familySpaceId,
    seniorProfileId: args.seniorProfileId,
    name: args.name,
    relationship: args.relationship,
    isLiving: args.isLiving,
    aiContext: args.aiContext,
    photoStorageId: args.photoStorageId,
    createdByMembershipId: args.membershipId,
    updatedByMembershipId: args.membershipId,
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
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySideCapability(ctx, "manage_people");
    if (args.photoStorageId) {
      await assertValidStoredUpload(ctx, {
        storageId: args.photoStorageId,
        kind: "image",
      });
    }

    return await createPersonRecord(ctx, {
      familySpaceId: membership.familySpaceId,
      seniorProfileId: membership.seniorProfileId,
      membershipId: membership._id,
      name: args.name,
      relationship: args.relationship,
      isLiving: args.isLiving,
      aiContext: args.aiContext,
      photoStorageId: args.photoStorageId,
    });
  },
});
