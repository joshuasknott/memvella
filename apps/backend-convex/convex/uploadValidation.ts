import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

type UploadIntent = {
  _id: Id<"uploadIntents">;
  circleMembershipId: Id<"circleMemberships">;
  storageId: Id<"_storage"> | null;
  expiresAt: number;
  consumedAt: number | null;
};

type UploadAssetKind = "image" | "audio" | "video";

type UploadRule = {
  label: string;
  maxBytes: number;
  allowedMimeTypes: string[];
};

type StoredFileMetadata = {
  _id: Id<"_storage">;
  _creationTime: number;
  contentType?: string;
  sha256: string;
  size: number;
};

const MB = 1024 * 1024;

const MEMORY_UPLOAD_RULES: Record<UploadAssetKind, UploadRule> = {
  image: {
    label: "image",
    maxBytes: 8 * MB,
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/heic",
      "image/heif",
    ],
  },
  audio: {
    label: "audio file",
    maxBytes: 20 * MB,
    allowedMimeTypes: [
      "audio/mpeg",
      "audio/mp3",
      "audio/mp4",
      "audio/x-m4a",
      "audio/aac",
      "audio/wav",
      "audio/x-wav",
      "audio/webm",
      "audio/ogg",
      "audio/flac",
    ],
  },
  video: {
    label: "video",
    maxBytes: 40 * MB,
    allowedMimeTypes: ["video/mp4", "video/quicktime", "video/webm", "video/ogg"],
  },
};

function getRule(kind: UploadAssetKind) {
  return MEMORY_UPLOAD_RULES[kind];
}

function normalizeMimeType(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function formatUploadError(rule: UploadRule) {
  const maxMb = Math.floor(rule.maxBytes / MB);
  return `Only ${rule.label}s up to ${maxMb} MB are allowed for this upload.`;
}

async function deleteRejectedUpload(
  ctx: MutationCtx,
  storageId: Id<"_storage">,
) {
  await ctx.storage.delete(storageId);
}

export async function assertValidStoredUpload(
  ctx: MutationCtx,
  args: {
    storageId: Id<"_storage">;
    kind: UploadAssetKind;
  },
) {
  const rule = getRule(args.kind);
  const metadata = (await ctx.db.system.get(
    "_storage",
    args.storageId,
  )) as StoredFileMetadata | null;

  if (!metadata) {
    throw new Error("This upload is no longer available.");
  }

  const normalizedMimeType = normalizeMimeType(metadata.contentType);
  const mimeAllowed = rule.allowedMimeTypes.includes(normalizedMimeType);
  const sizeAllowed = metadata.size > 0 && metadata.size <= rule.maxBytes;

  if (!mimeAllowed || !sizeAllowed) {
    await deleteRejectedUpload(ctx, args.storageId);
    throw new Error(formatUploadError(rule));
  }

  return {
    contentType: normalizedMimeType,
    size: metadata.size,
  };
}

export async function consumeUploadIntent(
  ctx: MutationCtx,
  args: {
    uploadIntentId: Id<"uploadIntents">;
    storageId: Id<"_storage">;
    circleMembershipId: Id<"circleMemberships">;
  },
) {
  const intent = (await ctx.db.get(args.uploadIntentId)) as UploadIntent | null;
  if (!intent) {
    throw new Error("This upload is no longer available.");
  }

  if (intent.circleMembershipId !== args.circleMembershipId) {
    throw new Error("This upload does not belong to your Workspace.");
  }

  const now = Date.now();
  if (intent.consumedAt !== null || intent.expiresAt < now) {
    throw new Error("This upload has expired.");
  }

  await ctx.db.patch(intent._id, {
    storageId: args.storageId,
    consumedAt: now,
  });
}
