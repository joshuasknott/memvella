"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import type { Id } from "@memvella/backend/dataModel";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@memvella/backend";
import { inferMemoryAssetType, uploadFileToConvex } from "@/lib/convex-upload";

export default function MediaMemoryPage() {
  const router = useRouter();
  const { toast } = useToast();
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
      const assetKind =
        inferMemoryAssetType(selectedFile) === "video" ? "video" : "image";
      const uploadResult = await uploadFileToConvex(
        generateUploadUrl,
        selectedFile,
        assetKind,
      );
      await addMemoryMedia({
        title: title.trim(),
        date: date.trim() || undefined,
        story: story.trim(),
        mediaStorageId: uploadResult.storageId as Id<"_storage">,
        mediaMimeType: selectedFile.type || undefined,
        mediaFileName: selectedFile.name || undefined,
        mediaAssetType: assetKind,
        uploadIntentId: uploadResult.uploadIntentId ?? undefined,
      });
      toast({
        tone: "success",
        title: "Media memory saved",
        description: `${title.trim()} was added to the Workspace.`,
      });
      router.push("/circle/memories");
    } catch (saveError) {
      console.error(saveError);
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Failed to save memory. Please try again.";
      setError(message);
      toast({
        tone: "error",
        title: "Media memory did not save",
        description: message,
      });
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
          <div className="relative flex aspect-4/3 w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-surface shadow-sm transition-colors hover:bg-surface-muted">
            {preview ? (
              <>
                {selectedFile?.type.startsWith("video/") ? (
                  <video src={preview} className="h-full w-full rounded-xl object-cover" />
                ) : (
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    unoptimized
                    className="rounded-xl object-cover"
                  />
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
                <div className="relative z-10 mb-4 rounded-full bg-surface p-6 shadow-xl shadow-ambient transition-transform group-active:scale-95">
                  <ImageIcon className="h-10 w-10 text-family-primary" strokeWidth={1.5} />
                </div>
                <p className="relative z-10 font-family text-lg font-bold text-family-primary">
                  Upload File
                </p>
                <p className="relative z-10 mt-1 text-sm italic text-text-secondary">
                  Tap to select from camera roll
                </p>
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-family-primary/5 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-secondary/5 blur-3xl" />
              </>
            )}
          </div>
        </label>
      </section>

      <section className="space-y-8 bg-surface rounded-xl p-4 md:p-6 shadow-card border border-border">
        <div className="space-y-3">
          <label className="font-family text-lg font-bold tracking-tight text-text-primary" htmlFor="media_title">
            Title
          </label>
          <input
            id="media_title"
            type="text"
            required
            placeholder="Family reunion 2012"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-12 w-full rounded-xl border-2 border-border bg-surface px-6 text-lg shadow-sm outline-none transition-all placeholder:text-text-secondary/50 focus:border-family-primary/50 focus:ring-4 focus:ring-family-primary/10"
          />
        </div>

        <div className="space-y-3">
          <label className="font-family text-lg font-bold tracking-tight text-text-primary" htmlFor="media_date">
            When was this? <span className="ml-2 text-sm font-normal italic text-text-secondary">(Optional)</span>
          </label>
          <input
            id="media_date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-12 w-full rounded-xl border-2 border-border bg-surface px-6 text-lg shadow-sm outline-none transition-all placeholder:text-text-secondary/50 focus:border-family-primary/50 focus:ring-4 focus:ring-family-primary/10"
          />
        </div>

        <div className="space-y-3">
          <label className="font-family text-lg font-bold tracking-tight text-text-primary" htmlFor="media_story">
            The Story <span className="ml-2 text-sm font-normal italic text-text-secondary">(Optional)</span>
          </label>
          <textarea
            id="media_story"
            placeholder="Where were you? Who is in this?"
            rows={4}
            value={story}
            onChange={(event) => setStory(event.target.value)}
            className="w-full resize-none rounded-xl border-none bg-surface-muted p-6 text-lg font-medium transition-all placeholder:text-text-secondary/50 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-family-primary"
          />
        </div>
      </section>

      {error ? (
        <p className="px-1 text-center text-sm font-medium text-status-alert">{error}</p>
      ) : null}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || !isFormValid}
        className="mb-8 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-senior-primary text-lg font-semibold text-white shadow-md transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
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
