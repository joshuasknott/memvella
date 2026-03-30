"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { inferMemoryAssetType, uploadFileToConvex } from "@/lib/convex-upload";

export default function MediaMemoryPage() {
  const router = useRouter();
  const addMemoryMedia = useMutation(api.memories.addMemoryMedia);
  const generateUploadUrl = useMutation(api.memories.generateUploadUrl);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [story, setStory] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isFormValid = selectedFile !== null && title.trim().length > 0;

  const handleSave = async () => {
    if (!isFormValid) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const storageId = await uploadFileToConvex(generateUploadUrl, selectedFile);
      await addMemoryMedia({
        title: title.trim(),
        date: date.trim() || undefined,
        story: story.trim(),
        mediaStorageId: storageId as Id<"_storage">,
        mediaMimeType: selectedFile.type || undefined,
        mediaFileName: selectedFile.name || undefined,
        mediaAssetType: inferMemoryAssetType(selectedFile) === "video" ? "video" : "image",
      });
      router.push("/supporter/memories");
    } catch (saveError) {
      console.error(saveError);
      setError("Failed to save memory. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 px-4 pb-32">
      <section className="group relative mt-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          id="media-file-input"
          onChange={handleFileSelect}
        />
        <label htmlFor="media-file-input" className="block cursor-pointer">
          <div className="relative flex aspect-4/3 w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-outline-variant/40 bg-surface-container-low shadow-sm transition-colors hover:bg-surface-container-high">
            {preview ? (
              <>
                {selectedFile?.type.startsWith("video/") ? (
                  <video src={preview} className="h-full w-full rounded-3xl object-cover" />
                ) : (
                  <img src={preview} alt="Preview" className="h-full w-full rounded-3xl object-cover" />
                )}
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    handleClearFile();
                  }}
                  className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <div className="relative z-10 mb-4 rounded-full bg-white p-6 shadow-xl shadow-primary/5 transition-transform group-active:scale-95">
                  <ImageIcon className="h-10 w-10 text-primary" strokeWidth={1.5} />
                </div>
                <p className="relative z-10 font-headline text-xl font-bold text-primary">
                  Upload File
                </p>
                <p className="relative z-10 mt-1 text-sm italic text-outline">
                  Tap to select from camera roll
                </p>
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-secondary/5 blur-3xl" />
              </>
            )}
          </div>
        </label>
      </section>

      <section className="space-y-8 rounded-4xl border border-white bg-white/80 p-6 shadow-xl shadow-[#4e0078]/5 backdrop-blur-xl md:p-8">
        <div className="space-y-3">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="media_title">
            Title
          </label>
          <input
            id="media_title"
            type="text"
            required
            placeholder="Family reunion 2012"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-16 w-full rounded-2xl border-2 border-gray-100 bg-white px-6 text-lg shadow-sm outline-none transition-all placeholder:text-outline/50 focus:border-[#4e0078]/50 focus:ring-4 focus:ring-[#4e0078]/10"
          />
        </div>

        <div className="space-y-3">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="media_date">
            When was this? <span className="ml-2 text-sm font-normal italic text-outline">(Optional)</span>
          </label>
          <input
            id="media_date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-16 w-full rounded-2xl border-2 border-gray-100 bg-white px-6 text-lg shadow-sm outline-none transition-all placeholder:text-outline/50 focus:border-[#4e0078]/50 focus:ring-4 focus:ring-[#4e0078]/10"
          />
        </div>

        <div className="space-y-3">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="media_story">
            The Story <span className="ml-2 text-sm font-normal italic text-outline">(Optional)</span>
          </label>
          <textarea
            id="media_story"
            placeholder="Where were you? Who is in this?"
            rows={4}
            value={story}
            onChange={(event) => setStory(event.target.value)}
            className="w-full resize-none rounded-2xl border-none bg-surface-container-highest p-6 text-xl font-medium transition-all placeholder:text-outline/50 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </section>

      {error ? (
        <p className="px-1 text-center text-sm font-medium text-red-500">{error}</p>
      ) : null}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || !isFormValid}
        className="mb-8 flex h-16 w-full items-center justify-center gap-2 rounded-full bg-[#6B21A8] text-xl font-semibold text-white shadow-md transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            Uploading and Saving...
          </>
        ) : (
          "Save Photo/Video"
        )}
      </button>
    </div>
  );
}
