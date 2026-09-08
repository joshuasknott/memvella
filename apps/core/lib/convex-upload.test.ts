import { afterEach, describe, expect, it, vi } from "vitest";
import { inferMemoryAssetType, uploadFileToConvex, validateUploadFile } from "./convex-upload";

afterEach(() => vi.unstubAllGlobals());

describe("memory upload handling", () => {
  it("accepts browser codec parameters and stores the canonical media type", async () => {
    const file = new File(["recorded audio"], "memory.webm", { type: "audio/webm;codecs=opus" });
    expect(() => validateUploadFile(file, "audio")).not.toThrow();
    expect(inferMemoryAssetType(file)).toBe("audio");
    const fetch = vi.fn().mockResolvedValue(Response.json({ storageId: "stored-audio" }));
    vi.stubGlobal("fetch", fetch);
    const getUploadUrl = vi.fn().mockResolvedValue({ uploadUrl: "https://upload.example", uploadIntentId: "intent-1" });
    expect(await uploadFileToConvex(getUploadUrl, file, "audio")).toEqual({ storageId: "stored-audio", uploadIntentId: "intent-1" });
    expect(fetch.mock.calls[0][1]).toMatchObject({ headers: { "Content-Type": "audio/webm" }, body: file });
  });

  it.each([{}, null, [], { storageId: "" }, { storageId: 42 }])("rejects malformed success responses: %j", async (body) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(body)));
    await expect(uploadFileToConvex(async () => "https://upload.example", new File(["photo"], "photo.png", { type: "image/png" }), "image")).rejects.toThrow(/storage ID/);
  });

  it("rejects unsupported media and empty files before requesting an upload URL", async () => {
    const getUploadUrl = vi.fn();
    for (const file of [new File(["html"], "page.html", { type: "text/html;charset=utf-8" }), new File([], "empty.png", { type: "image/png" })]) {
      await expect(uploadFileToConvex(getUploadUrl, file, "image")).rejects.toThrow(/allowed/);
    }
    expect(getUploadUrl).not.toHaveBeenCalled();
  });

  it("preserves legacy string upload URLs and surfaces HTTP failures", async () => {
    const file = new File(["photo"], "photo.png", { type: "image/png" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(Response.json({ storageId: "image-1" })).mockResolvedValueOnce(new Response(null, { status: 503 })));
    expect(await uploadFileToConvex(async () => "https://upload.example", file, "image")).toEqual({ storageId: "image-1", uploadIntentId: null });
    await expect(uploadFileToConvex(async () => "https://upload.example", file, "image")).rejects.toThrow("File upload failed");
  });
});
