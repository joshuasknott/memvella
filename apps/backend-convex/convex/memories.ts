import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { requireCircleMembership } from "./circleAuth";
import {
  createMemoryRecord,
  deleteMemoryRecordCascade,
  getMemoryDetailForSenior,
  listMemoryCardsForSenior,
  type MemoryAssetInput,
  replaceMemoryAssets,
} from "./memoryHelpers";
import { normalizeOptionalText, sanitizeExternalUrl } from "./security";
import { assertValidStoredUpload, consumeUploadIntent } from "./uploadValidation";

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
    const { membership } = await requireCircleMembership(ctx, "family_side");
    const seniorProfileId = membership.seniorProfileId;
    if (!seniorProfileId) {
      return [];
    }

    return await listMemoryCardsForSenior(ctx, seniorProfileId);
  },
});

export const getMemoryRecordDetail = query({
  args: {
    memoryRecordId: v.id("memoryRecords"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireCircleMembership(ctx, "family_side");
    const seniorProfileId = membership.seniorProfileId;
    if (!seniorProfileId) {
      return null;
    }

    return await getMemoryDetailForSenior(ctx, {
      seniorProfileId,
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
    uploadIntentId: v.optional(v.id("uploadIntents")),
  },
  handler: async (ctx, args) => {
    const { membership, circleMembership } = await requireCircleMembership(
      ctx,
      "family_side",
    );
    const seniorProfileId = membership.seniorProfileId;
    if (!seniorProfileId) {
      throw new Error("No senior profile is linked to this Circle.");
    }

    if (args.photoStorageId && args.uploadIntentId && circleMembership) {
      await consumeUploadIntent(ctx, {
        uploadIntentId: args.uploadIntentId,
        storageId: args.photoStorageId,
        circleMembershipId: circleMembership._id,
      });
    }

    const assets = await buildValidatedStorageAsset(
      ctx,
      "image",
      args.photoStorageId,
      args.photoMimeType,
      args.photoFileName,
    );

    return await createMemoryRecord(ctx, {
      seniorProfileId,
      circleMembershipId: circleMembership?._id ?? null,
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
    uploadIntentId: v.optional(v.id("uploadIntents")),
  },
  handler: async (ctx, args) => {
    const { membership, circleMembership } = await requireCircleMembership(
      ctx,
      "family_side",
    );
    const seniorProfileId = membership.seniorProfileId;
    if (!seniorProfileId) {
      throw new Error("No senior profile is linked to this Circle.");
    }

    if (args.audioStorageId && args.uploadIntentId && circleMembership) {
      await consumeUploadIntent(ctx, {
        uploadIntentId: args.uploadIntentId,
        storageId: args.audioStorageId,
        circleMembershipId: circleMembership._id,
      });
    }

    const assets = await buildValidatedStorageAsset(
      ctx,
      "audio",
      args.audioStorageId,
      args.audioMimeType,
      args.audioFileName,
    );

    return await createMemoryRecord(ctx, {
      seniorProfileId,
      circleMembershipId: circleMembership?._id ?? null,
      recordType: "audio",
      title: args.title.trim(),
      story: args.story.trim(),
      memoryDate: normalizeOptionalDate(args.date ?? undefined),
      externalUrl: sanitizeExternalUrl(args.songLink),
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
    const { membership, circleMembership } = await requireCircleMembership(
      ctx,
      "family_side",
    );
    const seniorProfileId = membership.seniorProfileId;
    if (!seniorProfileId) {
      throw new Error("No senior profile is linked to this Circle.");
    }

    return await createMemoryRecord(ctx, {
      seniorProfileId,
      circleMembershipId: circleMembership?._id ?? null,
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
    uploadIntentId: v.optional(v.id("uploadIntents")),
  },
  handler: async (ctx, args) => {
    const { membership, circleMembership } = await requireCircleMembership(
      ctx,
      "family_side",
    );
    const seniorProfileId = membership.seniorProfileId;
    if (!seniorProfileId) {
      throw new Error("No senior profile is linked to this Circle.");
    }

    if (args.uploadIntentId && circleMembership) {
      await consumeUploadIntent(ctx, {
        uploadIntentId: args.uploadIntentId,
        storageId: args.mediaStorageId,
        circleMembershipId: circleMembership._id,
      });
    }

    const assets = await buildValidatedStorageAsset(
      ctx,
      args.mediaAssetType ?? "image",
      args.mediaStorageId,
      args.mediaMimeType,
      args.mediaFileName,
    );

    return await createMemoryRecord(ctx, {
      seniorProfileId,
      circleMembershipId: circleMembership?._id ?? null,
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
    uploadIntentId: v.optional(v.id("uploadIntents")),
  },
  handler: async (ctx, args) => {
    const { membership, circleMembership } = await requireCircleMembership(
      ctx,
      "family_side",
    );
    const record = await ctx.db.get(args.memoryRecordId);
    if (
      !record ||
      record.seniorProfileId !== membership.seniorProfileId ||
      record.recordType !== "text"
    ) {
      throw new Error("This memory record does not belong to your Circle.");
    }

    await ctx.db.patch(record._id, {
      title: args.title.trim(),
      story: args.story.trim(),
      memoryDate: normalizeOptionalDate(args.date ?? undefined),
      updatedByCircleMembershipId: circleMembership?._id ?? null,
      lastEditedAt: Date.now(),
    });

    if (args.removePhoto || args.replacePhotoStorageId) {
      if (
        args.replacePhotoStorageId &&
        args.uploadIntentId &&
        circleMembership
      ) {
        await consumeUploadIntent(ctx, {
          uploadIntentId: args.uploadIntentId,
          storageId: args.replacePhotoStorageId,
          circleMembershipId: circleMembership._id,
        });
      }
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
        seniorProfileId: record.seniorProfileId,
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
    uploadIntentId: v.optional(v.id("uploadIntents")),
  },
  handler: async (ctx, args) => {
    const { membership, circleMembership } = await requireCircleMembership(
      ctx,
      "family_side",
    );
    const record = await ctx.db.get(args.memoryRecordId);
    if (
      !record ||
      record.seniorProfileId !== membership.seniorProfileId ||
      record.recordType !== "audio"
    ) {
      throw new Error("This memory record does not belong to your Circle.");
    }

    await ctx.db.patch(record._id, {
      title: args.title.trim(),
      story: args.story.trim(),
      memoryDate: normalizeOptionalDate(args.date ?? undefined),
      externalUrl: sanitizeExternalUrl(args.songLink),
      updatedByCircleMembershipId: circleMembership?._id ?? null,
      lastEditedAt: Date.now(),
    });

    if (args.removeAudio || args.replaceAudioStorageId) {
      if (
        args.replaceAudioStorageId &&
        args.uploadIntentId &&
        circleMembership
      ) {
        await consumeUploadIntent(ctx, {
          uploadIntentId: args.uploadIntentId,
          storageId: args.replaceAudioStorageId,
          circleMembershipId: circleMembership._id,
        });
      }
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
        seniorProfileId: record.seniorProfileId,
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
    const { membership, circleMembership } = await requireCircleMembership(
      ctx,
      "family_side",
    );
    const record = await ctx.db.get(args.memoryRecordId);
    if (
      !record ||
      record.seniorProfileId !== membership.seniorProfileId ||
      record.recordType !== "voice"
    ) {
      throw new Error("This memory record does not belong to your Circle.");
    }

    await ctx.db.patch(record._id, {
      title: args.title.trim(),
      transcript: args.transcript.trim(),
      memoryDate: normalizeOptionalDate(args.date ?? undefined),
      updatedByCircleMembershipId: circleMembership?._id ?? null,
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
    uploadIntentId: v.optional(v.id("uploadIntents")),
  },
  handler: async (ctx, args) => {
    const { membership, circleMembership } = await requireCircleMembership(
      ctx,
      "family_side",
    );
    const record = await ctx.db.get(args.memoryRecordId);
    if (
      !record ||
      record.seniorProfileId !== membership.seniorProfileId ||
      record.recordType !== "media"
    ) {
      throw new Error("This memory record does not belong to your Circle.");
    }

    await ctx.db.patch(record._id, {
      title: args.title.trim(),
      story: normalizeOptionalText(args.story) ?? null,
      memoryDate: normalizeOptionalDate(args.date ?? undefined),
      updatedByCircleMembershipId: circleMembership?._id ?? null,
      lastEditedAt: Date.now(),
    });

    if (args.removeMedia || args.replaceMediaStorageId) {
      if (
        args.replaceMediaStorageId &&
        args.uploadIntentId &&
        circleMembership
      ) {
        await consumeUploadIntent(ctx, {
          uploadIntentId: args.uploadIntentId,
          storageId: args.replaceMediaStorageId,
          circleMembershipId: circleMembership._id,
        });
      }
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
        seniorProfileId: record.seniorProfileId,
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
    const { membership } = await requireCircleMembership(ctx, "family_side");
    const record = await ctx.db.get(args.memoryRecordId);
    if (!record || record.seniorProfileId !== membership.seniorProfileId) {
      throw new Error("This memory record does not belong to your Circle.");
    }

    await deleteMemoryRecordCascade(ctx, record._id);
    return { deleted: true as const };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const { membership, circleMembership } = await requireCircleMembership(
      ctx,
      "family_side",
    );
    const seniorProfileId = membership.seniorProfileId;
    if (!seniorProfileId) {
      throw new Error("No senior profile is linked to this Circle.");
    }

    const uploadUrl = await ctx.storage.generateUploadUrl();
    const now = Date.now();
    const uploadIntentId = await ctx.db.insert("uploadIntents", {
      circleMembershipId: circleMembership._id,
      circleId: circleMembership.circleId,
      seniorProfileId,
      storageId: null,
      expiresAt: now + 60 * 60 * 1000,
      consumedAt: null,
      createdAt: now,
    });

    return { uploadUrl, uploadIntentId };
  },
});
