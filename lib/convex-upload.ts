import type { Id } from "@/convex/_generated/dataModel";

export async function uploadFileToConvex(
  getUploadUrl: () => Promise<string>,
  file: File,
) {
  const postUrl = await getUploadUrl();
  const response = await fetch(postUrl, {
    method: "POST",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });

  if (!response.ok) {
    throw new Error("File upload failed.");
  }

  const { storageId } = (await response.json()) as { storageId: Id<"_storage"> };
  return storageId;
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
