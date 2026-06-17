import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import {
  getSeniorProfileByMode,
  requireCircleMembership,
  requireFamilySideCapability,
} from "./circleAuth";
import type { Doc } from "./_generated/dataModel";
import { assertValidStoredUpload, consumeUploadIntent } from "./uploadValidation";
import { normalizeOptionalText } from "./security";

type DbCtx = MutationCtx | QueryCtx;

export async function listPeopleForSeniorProfile(
  ctx: DbCtx,
  seniorProfileId: Id<"seniorProfiles">,
  limit: number,
) {
  return await ctx.db
    .query("people")
    .withIndex("by_seniorProfileId_and_lastEditedAt", (query) =>
      query.eq("seniorProfileId", seniorProfileId),
    )
    .order("desc")
    .take(limit);
}

export async function listPeopleForCircle(
  ctx: DbCtx,
  circleId: Id<"circles">,
  limit: number,
) {
  const seniorProfile = await getSeniorProfileByMode(ctx, circleId, "assisted");
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

async function getPreferredSeniorProfileForCircle(
  ctx: DbCtx,
  circleId: Id<"circles">,
) {
  return await getSeniorProfileByMode(ctx, circleId, "assisted");
}

async function getVisibleSeniorProfileForMembership(
  ctx: DbCtx,
  membership: Doc<"circleMemberships">,
) {
  return (
    (membership.seniorProfileId
      ? await ctx.db.get(membership.seniorProfileId)
      : null) ?? (await getPreferredSeniorProfileForCircle(ctx, membership.circleId))
  );
}

function normalizeRequiredPersonText(value: string, fieldName: string) {
  const normalized = normalizeOptionalText(value);
  if (!normalized) {
    throw new Error(`${fieldName} is required.`);
  }

  return normalized;
}

async function serializePerson(ctx: QueryCtx, person: Doc<"people">) {
  const photoUrl = person.photoStorageId
    ? await ctx.storage.getUrl(person.photoStorageId)
    : null;

  return {
    id: person._id,
    name: person.name,
    relationship: person.relationship,
    isLiving: person.isLiving,
    aiContext: person.aiContext,
    photoUrl,
    lastEditedAt: person.lastEditedAt,
  };
}

async function getPersonForMembership(
  ctx: DbCtx,
  args: {
    personId: Id<"people">;
    membership: Doc<"circleMemberships">;
  },
) {
  const seniorProfile = await getVisibleSeniorProfileForMembership(
    ctx,
    args.membership,
  );
  if (!seniorProfile) {
    throw new Error("No senior profile is linked to this Workspace.");
  }

  const person = await ctx.db.get(args.personId);
  if (!person || person.seniorProfileId !== seniorProfile._id) {
    return null;
  }

  return person;
}

export const listPeople = query({
  args: {},
  handler: async (ctx) => {
    const { membership } = await requireCircleMembership(ctx, "family_side");
    const seniorProfile = await getVisibleSeniorProfileForMembership(ctx, membership);
    if (!seniorProfile) {
      return [];
    }

    const people = await listPeopleForSeniorProfile(ctx, seniorProfile._id, 100);
    return await Promise.all(
      people.map(async (person) => await serializePerson(ctx, person)),
    );
  },
});

export const getPersonDetail = query({
  args: {
    personId: v.id("people"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireCircleMembership(ctx, "family_side");
    const person = await getPersonForMembership(ctx, {
      personId: args.personId,
      membership,
    });
    if (!person) {
      return null;
    }

    return await serializePerson(ctx, person);
  },
});

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
      (await getSeniorProfileByMode(ctx, membership.circleId, "assisted"));
    if (!seniorProfile) {
      throw new Error("No senior profile is linked to this Workspace.");
    }

    return await createPersonRecord(ctx, {
      seniorProfileId: seniorProfile._id,
      circleMembershipId: circleMembership?._id ?? null,
      name: normalizeRequiredPersonText(args.name, "Name"),
      relationship: normalizeRequiredPersonText(args.relationship, "Relationship"),
      isLiving: args.isLiving,
      aiContext: normalizeOptionalText(args.aiContext) ?? "",
      photoStorageId: args.photoStorageId,
    });
  },
});

export const updatePerson = mutation({
  args: {
    personId: v.id("people"),
    name: v.string(),
    relationship: v.string(),
    isLiving: v.boolean(),
    aiContext: v.string(),
    replacePhotoStorageId: v.optional(v.id("_storage")),
    removePhoto: v.optional(v.boolean()),
    uploadIntentId: v.optional(v.id("uploadIntents")),
  },
  handler: async (ctx, args) => {
    const { membership, circleMembership } = await requireFamilySideCapability(
      ctx,
      "manage_people",
    );
    const person = await getPersonForMembership(ctx, {
      personId: args.personId,
      membership,
    });
    if (!person) {
      throw new Error("This person does not belong to your Workspace.");
    }

    if (args.replacePhotoStorageId && args.uploadIntentId && circleMembership) {
      await consumeUploadIntent(ctx, {
        uploadIntentId: args.uploadIntentId,
        storageId: args.replacePhotoStorageId,
        circleMembershipId: circleMembership._id,
      });
    }

    if (args.replacePhotoStorageId) {
      await assertValidStoredUpload(ctx, {
        storageId: args.replacePhotoStorageId,
        kind: "image",
      });
    }

    const nextPhotoStorageId = args.replacePhotoStorageId
      ? args.replacePhotoStorageId
      : args.removePhoto
        ? undefined
        : person.photoStorageId;

    if (
      person.photoStorageId &&
      (args.removePhoto || args.replacePhotoStorageId)
    ) {
      await ctx.storage.delete(person.photoStorageId);
    }

    await ctx.db.replace(person._id, {
      seniorProfileId: person.seniorProfileId,
      name: normalizeRequiredPersonText(args.name, "Name"),
      relationship: normalizeRequiredPersonText(args.relationship, "Relationship"),
      isLiving: args.isLiving,
      aiContext: normalizeOptionalText(args.aiContext) ?? "",
      ...(nextPhotoStorageId ? { photoStorageId: nextPhotoStorageId } : {}),
      createdByCircleMembershipId: person.createdByCircleMembershipId,
      updatedByCircleMembershipId: circleMembership?._id ?? null,
      lastEditedAt: Date.now(),
    });

    return person._id;
  },
});

export const deletePerson = mutation({
  args: {
    personId: v.id("people"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySideCapability(
      ctx,
      "manage_people",
    );
    const person = await getPersonForMembership(ctx, {
      personId: args.personId,
      membership,
    });
    if (!person) {
      throw new Error("This person does not belong to your Workspace.");
    }

    if (person.photoStorageId) {
      await ctx.storage.delete(person.photoStorageId);
    }

    await ctx.db.delete(person._id);
    return { deleted: true as const };
  },
});
