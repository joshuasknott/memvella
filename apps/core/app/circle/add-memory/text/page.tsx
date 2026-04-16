"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Camera, Lightbulb, Loader2, Sparkles, X } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/convex/_generated/api";
import { FormCard } from "@/components/ui/FormCard";
import { uploadFileToConvex } from "@/lib/convex-upload";
import { useCircleProfile } from "@/lib/use-circle-profile";

export default function TextMemoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { seniorDisplayName } = useCircleProfile();
  const addMemoryText = useMutation(api.memories.addMemoryText);
  const generateUploadUrl = useMutation(api.memories.generateUploadUrl);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [story, setStory] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleClearPhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  };

  const isFormValid = title.trim().length > 0 && story.trim().length > 0;

  const handleSaveMemory = async () => {
    if (!isFormValid) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      let photoStorageId: Id<"_storage"> | undefined;

      if (selectedPhoto) {
        photoStorageId = await uploadFileToConvex(
          generateUploadUrl,
          selectedPhoto,
          "image",
        );
      }

      await addMemoryText({
        title: title.trim(),
        date: date.trim() || undefined,
        story: story.trim(),
        photoStorageId,
        photoMimeType: selectedPhoto?.type || undefined,
        photoFileName: selectedPhoto?.name || undefined,
      });

      toast({
        tone: "success",
        title: "Memory saved",
        description: `${title.trim()} was added to the Circle.`,
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
        title: "Memory did not save",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 px-4 pb-32">
      <FormCard as="section" className="mt-4 space-y-8">
        <div className="space-y-6">
          <label className="font-family text-lg font-bold tracking-tight text-text-primary" htmlFor="memory_title">
            Memory Title
          </label>
          <input
            id="memory_title"
            placeholder="David&apos;s Graduation"
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-surface px-6 text-lg transition-all focus:border-family-primary focus:outline-none focus:ring-2 focus:ring-family-primary/30"
          />
        </div>

        <div className="space-y-6">
          <label className="font-family text-lg font-bold tracking-tight text-text-primary" htmlFor="memory_date">
            When was this? <span className="ml-2 text-sm font-normal italic text-text-secondary">(Optional)</span>
          </label>
          <input
            id="memory_date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-surface px-6 text-lg transition-all focus:border-family-primary focus:outline-none focus:ring-2 focus:ring-family-primary/30"
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <label className="font-family text-lg font-bold tracking-tight text-text-primary" htmlFor="memory_story">
              The Story
            </label>
            <Sparkles className="h-5 w-5 fill-family-primary/20 text-family-primary" />
          </div>
          <textarea
            id="memory_story"
            placeholder="David graduated from college and we had a big family picnic..."
            rows={5}
            required
            value={story}
            onChange={(event) => setStory(event.target.value)}
            className="min-h-[120px] w-full resize-none rounded-xl border border-border bg-surface p-6 text-lg transition-all placeholder:text-text-secondary/50 focus:border-family-primary focus:outline-none focus:ring-2 focus:ring-family-primary/30"
          />
          <p className="px-1 text-sm text-text-secondary">
            What happened, and why is it meaningful for {seniorDisplayName}?
          </p>
        </div>
      </FormCard>

      <div className="group relative overflow-hidden rounded-xl bg-family-primary/10 p-6">
        <div className="relative z-10 flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface shadow-sm">
            <Lightbulb className="h-6 w-6 text-family-primary" />
          </div>
          <div>
            <h4 className="font-family font-bold text-family-primary">
              Memory Curation
            </h4>
            <p className="mt-1 text-sm leading-snug text-family-primary-variant">
              Detailed stories help Memvella bring up the right moments when talking with {seniorDisplayName}.
            </p>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 h-24 w-24 scale-150 rounded-full bg-family-primary/5 transition-transform duration-700 group-hover:scale-110" />
      </div>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        id="photo-input"
        onChange={handlePhotoSelect}
      />

      {photoPreview ? (
        <div className="relative h-48 overflow-hidden rounded-xl shadow-sm">
          <Image
            src={photoPreview}
            alt="Photo preview"
            fill
            unoptimized
            className="object-cover"
          />
          <button
            type="button"
            onClick={handleClearPhoto}
            className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <label htmlFor="photo-input">
          <div className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface p-6 text-lg font-bold text-family-primary shadow-sm transition-all active:scale-[0.98] hover:bg-surface">
            <Camera size={26} />
            Add Photo <span className="ml-1 text-sm font-normal italic text-text-secondary">(Optional)</span>
          </div>
        </label>
      )}

      {error ? (
        <p className="px-1 text-center text-sm font-medium text-status-alert">{error}</p>
      ) : null}

      <button
        type="button"
        onClick={handleSaveMemory}
        disabled={isSaving || !isFormValid}
        className="mb-8 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-senior-primary text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            {selectedPhoto ? "Uploading and Saving..." : "Saving..."}
          </>
        ) : (
          "Save Memory"
        )}
      </button>
    </div>
  );
}
