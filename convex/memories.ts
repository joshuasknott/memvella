import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { requireFamilySpaceMembership } from "./familySpaceAuth";
import {
  createMemoryRecord,
  deleteMemoryRecordCascade,
  getMemoryDetailForFamilySpace,
  listMemoryCardsForFamilySpace,
  type MemoryAssetInput,
  replaceMemoryAssets,
} from "./memoryHelpers";
import { normalizeOptionalText } from "./security";
import { assertValidStoredUpload } from "./uploadValidation";

function normalizeOptionalDate(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function buildStorageAsset(
  assetType: "image" | "video" | "audio",
  storageId: Id<"_storage"> | undefined,
  mimeType: string | undefined,
  fileName: string | undefined,
) {
  if (!storageId) {
    return [] as MemoryAssetInput[];
  }

  return [
    {
      assetType,
      storageId,
      mimeType: normalizeOptionalText(mimeType) ?? null,
      fileName: normalizeOptionalText(fileName) ?? null,
      externalUrl: null,
    },
  ];
}

async function buildValidatedStorageAsset(
  ctx: MutationCtx,
  assetType: "image" | "video" | "audio",
  storageId: Id<"_storage"> | undefined,
  mimeType: string | undefined,
  fileName: string | undefined,
) {
  if (!storageId) {
    return [] as MemoryAssetInput[];
  }

  const validated = await assertValidStoredUpload(ctx, {
    storageId,
    kind: assetType,
  });

  return buildStorageAsset(
    assetType,
    storageId,
    validated.contentType || mimeType,
    fileName,
  );
}

export const listMemoryRecords = query({
  args: {},
  handler: async (ctx) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
    return await listMemoryCardsForFamilySpace(ctx, membership.familySpaceId);
  },
});

export const getMemoryRecordDetail = query({
  args: {
    memoryRecordId: v.id("memoryRecords"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
    return await getMemoryDetailForFamilySpace(ctx, {
      familySpaceId: membership.familySpaceId,
      memoryRecordId: args.memoryRecordId,
    });
  },
});

export const addMemoryText = mutation({
  args: {
    title: v.string(),
    date: v.optional(v.string()),
    story: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
    photoMimeType: v.optional(v.string()),
    photoFileName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
    const assets = await buildValidatedStorageAsset(
      ctx,
      "image",
      args.photoStorageId,
      args.photoMimeType,
      args.photoFileName,
    );

    return await createMemoryRecord(ctx, {
      familySpaceId: membership.familySpaceId,
      membershipId: membership._id,
      recordType: "text",
      title: args.title.trim(),
      story: args.story.trim(),
      memoryDate: normalizeOptionalDate(args.date ?? undefined),
      assets,
    });
  },
});

export const addMemoryAudio = mutation({
  args: {
    title: v.string(),
    date: v.optional(v.string()),
    story: v.string(),
    songLink: v.optional(v.string()),
    audioStorageId: v.optional(v.id("_storage")),
    audioMimeType: v.optional(v.string()),
    audioFileName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
    const assets = await buildValidatedStorageAsset(
      ctx,
      "audio",
      args.audioStorageId,
      args.audioMimeType,
      args.audioFileName,
    );

    return await createMemoryRecord(ctx, {
      familySpaceId: membership.familySpaceId,
      membershipId: membership._id,
      recordType: "audio",
      title: args.title.trim(),
      story: args.story.trim(),
      memoryDate: normalizeOptionalDate(args.date ?? undefined),
      externalUrl: normalizeOptionalText(args.songLink) ?? null,
      assets,
    });
  },
});

export const addMemoryVoice = mutation({
  args: {
    title: v.string(),
    date: v.optional(v.string()),
    transcript: v.string(),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");

    return await createMemoryRecord(ctx, {
      familySpaceId: membership.familySpaceId,
      membershipId: membership._id,
      recordType: "voice",
      title: args.title.trim(),
      transcript: args.transcript.trim(),
      memoryDate: normalizeOptionalDate(args.date ?? undefined),
    });
  },
});

export const addMemoryMedia = mutation({
  args: {
    title: v.string(),
    date: v.optional(v.string()),
    story: v.string(),
    mediaStorageId: v.id("_storage"),
    mediaMimeType: v.optional(v.string()),
    mediaFileName: v.optional(v.string()),
    mediaAssetType: v.optional(v.union(v.literal("image"), v.literal("video"))),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
    const assets = await buildValidatedStorageAsset(
      ctx,
      args.mediaAssetType ?? "image",
      args.mediaStorageId,
      args.mediaMimeType,
      args.mediaFileName,
    );

    return await createMemoryRecord(ctx, {
      familySpaceId: membership.familySpaceId,
      membershipId: membership._id,
      recordType: "media",
      title: args.title.trim(),
      story: normalizeOptionalText(args.story) ?? null,
      memoryDate: normalizeOptionalDate(args.date ?? undefined),
      assets,
    });
  },
});

export const updateTextMemory = mutation({
  args: {
    memoryRecordId: v.id("memoryRecords"),
    title: v.string(),
    date: v.optional(v.string()),
    story: v.string(),
    replacePhotoStorageId: v.optional(v.id("_storage")),
    replacePhotoMimeType: v.optional(v.string()),
    replacePhotoFileName: v.optional(v.string()),
    removePhoto: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
    const record = await ctx.db.get(args.memoryRecordId);
    if (!record || record.familySpaceId !== membership.familySpaceId || record.recordType !== "text") {
      throw new Error("This memory record does not belong to your FamilySpace.");
    }

    await ctx.db.patch(record._id, {
      title: args.title.trim(),
      story: args.story.trim(),
      memoryDate: normalizeOptionalDate(args.date ?? undefined),
      updatedByMembershipId: membership._id,
      lastEditedAt: Date.now(),
    });

    if (args.removePhoto || args.replacePhotoStorageId) {
      const assets = args.replacePhotoStorageId
        ? await buildValidatedStorageAsset(
            ctx,
            "image",
            args.replacePhotoStorageId,
            args.replacePhotoMimeType,
            args.replacePhotoFileName,
          )
        : [];
      await replaceMemoryAssets(ctx, {
        familySpaceId: membership.familySpaceId,
        memoryRecordId: record._id,
        assets,
      });
    }

    return record._id;
  },
});

export const updateAudioMemory = mutation({
  args: {
    memoryRecordId: v.id("memoryRecords"),
    title: v.string(),
    date: v.optional(v.string()),
    story: v.string(),
    songLink: v.optional(v.string()),
    replaceAudioStorageId: v.optional(v.id("_storage")),
    replaceAudioMimeType: v.optional(v.string()),
    replaceAudioFileName: v.optional(v.string()),
    removeAudio: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
    const record = await ctx.db.get(args.memoryRecordId);
    if (!record || record.familySpaceId !== membership.familySpaceId || record.recordType !== "audio") {
      throw new Error("This memory record does not belong to your FamilySpace.");
    }

    await ctx.db.patch(record._id, {
      title: args.title.trim(),
      story: args.story.trim(),
      memoryDate: normalizeOptionalDate(args.date ?? undefined),
      externalUrl: normalizeOptionalText(args.songLink) ?? null,
      updatedByMembershipId: membership._id,
      lastEditedAt: Date.now(),
    });

    if (args.removeAudio || args.replaceAudioStorageId) {
      const assets = args.replaceAudioStorageId
        ? await buildValidatedStorageAsset(
            ctx,
            "audio",
            args.replaceAudioStorageId,
            args.replaceAudioMimeType,
            args.replaceAudioFileName,
          )
        : [];
      await replaceMemoryAssets(ctx, {
        familySpaceId: membership.familySpaceId,
        memoryRecordId: record._id,
        assets,
      });
    }

    return record._id;
  },
});

export const updateVoiceMemory = mutation({
  args: {
    memoryRecordId: v.id("memoryRecords"),
    title: v.string(),
    date: v.optional(v.string()),
    transcript: v.string(),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
    const record = await ctx.db.get(args.memoryRecordId);
    if (!record || record.familySpaceId !== membership.familySpaceId || record.recordType !== "voice") {
      throw new Error("This memory record does not belong to your FamilySpace.");
    }

    await ctx.db.patch(record._id, {
      title: args.title.trim(),
      transcript: args.transcript.trim(),
      memoryDate: normalizeOptionalDate(args.date ?? undefined),
      updatedByMembershipId: membership._id,
      lastEditedAt: Date.now(),
    });

    return record._id;
  },
});

export const updateMediaMemory = mutation({
  args: {
    memoryRecordId: v.id("memoryRecords"),
    title: v.string(),
    date: v.optional(v.string()),
    story: v.string(),
    replaceMediaStorageId: v.optional(v.id("_storage")),
    replaceMediaMimeType: v.optional(v.string()),
    replaceMediaFileName: v.optional(v.string()),
    replaceMediaAssetType: v.optional(v.union(v.literal("image"), v.literal("video"))),
    removeMedia: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
    const record = await ctx.db.get(args.memoryRecordId);
    if (!record || record.familySpaceId !== membership.familySpaceId || record.recordType !== "media") {
      throw new Error("This memory record does not belong to your FamilySpace.");
    }

    await ctx.db.patch(record._id, {
      title: args.title.trim(),
      story: normalizeOptionalText(args.story) ?? null,
      memoryDate: normalizeOptionalDate(args.date ?? undefined),
      updatedByMembershipId: membership._id,
      lastEditedAt: Date.now(),
    });

    if (args.removeMedia || args.replaceMediaStorageId) {
      const assets = args.replaceMediaStorageId
        ? await buildValidatedStorageAsset(
            ctx,
            args.replaceMediaAssetType ?? "image",
            args.replaceMediaStorageId,
            args.replaceMediaMimeType,
            args.replaceMediaFileName,
          )
        : [];
      await replaceMemoryAssets(ctx, {
        familySpaceId: membership.familySpaceId,
        memoryRecordId: record._id,
        assets,
      });
    }

    return record._id;
  },
});

export const deleteMemoryRecord = mutation({
  args: {
    memoryRecordId: v.id("memoryRecords"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
    const record = await ctx.db.get(args.memoryRecordId);
    if (!record || record.familySpaceId !== membership.familySpaceId) {
      throw new Error("This memory record does not belong to your FamilySpace.");
    }

    await deleteMemoryRecordCascade(ctx, record._id);
    return { deleted: true as const };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireFamilySpaceMembership(ctx, "supporter");
    return await ctx.storage.generateUploadUrl();
  },
});
