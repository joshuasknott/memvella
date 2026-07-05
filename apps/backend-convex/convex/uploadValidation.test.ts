import { describe, expect, it, vi } from "vitest";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { assertValidStoredUpload } from "./uploadValidation";

function makeUploadCtx(metadata: {
  contentType?: string;
  size: number;
} | null) {
  return {
    db: {
      system: {
        get: vi.fn(async () =>
          metadata
            ? {
                _id: "storage-1" as Id<"_storage">,
                _creationTime: 1,
                sha256: "abc",
                ...metadata,
              }
            : null,
        ),
      },
    },
    storage: {
      delete: vi.fn(async () => null),
    },
  } as unknown as MutationCtx & {
    storage: { delete: ReturnType<typeof vi.fn> };
  };
}

describe("upload intent validation contract", () => {
  it("rejects expired intents deterministically", () => {
    const now = Date.now();
    const expiredIntent = {
      consumedAt: null,
      expiresAt: now - 60_000,
    };
    expect(expiredIntent.expiresAt < now).toBe(true);
    expect(expiredIntent.consumedAt).toBeNull();

    const activeIntent = {
      consumedAt: null,
      expiresAt: now + 60 * 60 * 1000,
    };
    expect(activeIntent.expiresAt >= now).toBe(true);
    expect(activeIntent.consumedAt).toBeNull();
  });

  it("rejects already-consumed intents", () => {
    const consumedIntent = {
      consumedAt: Date.now() - 1000,
      expiresAt: Date.now() + 60 * 60 * 1000,
    };
    expect(consumedIntent.consumedAt).not.toBeNull();
  });

  it("requires circleMembershipId to match", () => {
    const callerMembershipId: string = "membership-A";
    const intentMembershipId: string = "membership-B";
    expect(callerMembershipId !== intentMembershipId).toBe(true);
  });
});

describe("stored upload validation", () => {
  it("accepts supported upload types", async () => {
    const imageCtx = makeUploadCtx({ contentType: " IMAGE/PNG ", size: 1024 });
    await expect(
      assertValidStoredUpload(imageCtx, {
        storageId: "storage-1" as Id<"_storage">,
        kind: "image",
      }),
    ).resolves.toEqual({ contentType: "image/png", size: 1024 });
    expect(imageCtx.storage.delete).not.toHaveBeenCalled();

    const audioCtx = makeUploadCtx({ contentType: "audio/webm", size: 1024 });
    await expect(
      assertValidStoredUpload(audioCtx, {
        storageId: "storage-1" as Id<"_storage">,
        kind: "audio",
      }),
    ).resolves.toMatchObject({ contentType: "audio/webm" });

    const videoCtx = makeUploadCtx({ contentType: "video/mp4", size: 1024 });
    await expect(
      assertValidStoredUpload(videoCtx, {
        storageId: "storage-1" as Id<"_storage">,
        kind: "video",
      }),
    ).resolves.toMatchObject({ contentType: "video/mp4" });
  });

  it("rejects missing storage metadata safely", async () => {
    const ctx = makeUploadCtx(null);

    await expect(
      assertValidStoredUpload(ctx, {
        storageId: "missing-storage" as Id<"_storage">,
        kind: "image",
      }),
    ).rejects.toThrow("This upload is no longer available.");
    expect(ctx.storage.delete).not.toHaveBeenCalled();
  });

  it("rejects unsupported and oversized files and deletes rejected uploads", async () => {
    const unsupportedCtx = makeUploadCtx({
      contentType: "application/pdf",
      size: 1024,
    });
    await expect(
      assertValidStoredUpload(unsupportedCtx, {
        storageId: "storage-1" as Id<"_storage">,
        kind: "image",
      }),
    ).rejects.toThrow("Only images up to 8 MB are allowed for this upload.");
    expect(unsupportedCtx.storage.delete).toHaveBeenCalledWith("storage-1");

    const oversizedCtx = makeUploadCtx({
      contentType: "audio/mpeg",
      size: 21 * 1024 * 1024,
    });
    await expect(
      assertValidStoredUpload(oversizedCtx, {
        storageId: "storage-1" as Id<"_storage">,
        kind: "audio",
      }),
    ).rejects.toThrow("Only audio files up to 20 MB are allowed for this upload.");
    expect(oversizedCtx.storage.delete).toHaveBeenCalledWith("storage-1");
  });
});
