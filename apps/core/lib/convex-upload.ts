import type { Id } from "@memvella/backend/dataModel";

export type UploadKind = "image" | "audio" | "video";

type UploadRule = {
  label: string;
  maxBytes: number;
  allowedMimeTypes: string[];
};

const MB = 1024 * 1024;

const UPLOAD_RULES: Record<UploadKind, UploadRule> = {
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

function buildUploadError(rule: UploadRule) {
  const maxMb = Math.floor(rule.maxBytes / MB);
  return `Only ${rule.label}s up to ${maxMb} MB are allowed for this upload.`;
}

export function validateUploadFile(file: File, kind: UploadKind) {
  const rule = UPLOAD_RULES[kind];
  const normalizedMimeType = file.type.trim().toLowerCase();

  if (!rule.allowedMimeTypes.includes(normalizedMimeType)) {
    throw new Error(buildUploadError(rule));
  }

  if (file.size <= 0 || file.size > rule.maxBytes) {
    throw new Error(buildUploadError(rule));
  }
}

export type UploadUrlResult = {
  uploadUrl: string;
  uploadIntentId: Id<"uploadIntents"> | null;
};

export type UploadResult = {
  storageId: Id<"_storage">;
  uploadIntentId: Id<"uploadIntents"> | null;
};

export async function uploadFileToConvex(
  getUploadUrl: () => Promise<string | UploadUrlResult>,
  file: File,
  kind?: UploadKind,
): Promise<UploadResult> {
  if (kind) {
    validateUploadFile(file, kind);
  }

  const urlResult = await getUploadUrl();
  const postUrl =
    typeof urlResult === "string" ? urlResult : urlResult.uploadUrl;
  const uploadIntentId =
    typeof urlResult === "string" ? null : urlResult.uploadIntentId;

  const response = await fetch(postUrl, {
    method: "POST",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });

  if (!response.ok) {
    throw new Error("File upload failed.");
  }

  const { storageId } = (await response.json()) as { storageId: Id<"_storage"> };
  return { storageId, uploadIntentId };
}

export function inferMemoryAssetType(file: File) {
  if (file.type.startsWith("video/")) {
    return "video" as const;
  }

  if (file.type.startsWith("audio/")) {
    return "audio" as const;
  }

  return "image" as const;
}
