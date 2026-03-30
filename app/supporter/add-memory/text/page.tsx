"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Camera, Lightbulb, Loader2, Sparkles, X } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { FormCard } from "@/components/ui/FormCard";
import { useFamilySpaceProfile } from "@/lib/use-family-space-profile";

export default function TextMemoryPage() {
  const router = useRouter();
  const { seniorDisplayName } = useFamilySpaceProfile();
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
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedPhoto.type },
          body: selectedPhoto,
        });

        if (!result.ok) {
          throw new Error("Photo upload failed.");
        }

        const { storageId } = (await result.json()) as { storageId: Id<"_storage"> };
        photoStorageId = storageId;
      }

      await addMemoryText({
        title: title.trim(),
        date: date.trim() || "Unknown date",
        story: story.trim(),
        photoStorageId,
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
      <FormCard as="section" className="mt-4 space-y-8">
        <div className="space-y-6">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="memory_title">
            Memory Title
          </label>
          <input
            id="memory_title"
            placeholder="David&apos;s Graduation"
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-16 w-full rounded-2xl border border-gray-200 bg-white px-6 text-lg transition-all focus:border-[#4e0078] focus:outline-none focus:ring-2 focus:ring-[#4e0078]/30"
          />
        </div>

        <div className="space-y-6">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="memory_date">
            When was this? <span className="ml-2 text-sm font-normal italic text-outline">(Optional)</span>
          </label>
          <input
            id="memory_date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-16 w-full rounded-2xl border border-gray-200 bg-white px-6 text-lg transition-all focus:border-[#4e0078] focus:outline-none focus:ring-2 focus:ring-[#4e0078]/30"
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="memory_story">
              The Story
            </label>
            <Sparkles className="h-5 w-5 fill-primary/20 text-primary" />
          </div>
          <textarea
            id="memory_story"
            placeholder="David graduated from college and we had a big family picnic..."
            rows={5}
            required
            value={story}
            onChange={(event) => setStory(event.target.value)}
            className="min-h-[120px] w-full resize-none rounded-2xl border border-gray-200 bg-white p-6 text-lg transition-all placeholder:text-outline/50 focus:border-[#4e0078] focus:outline-none focus:ring-2 focus:ring-[#4e0078]/30"
          />
          <p className="px-1 text-sm text-outline">
            What happened, and why is it meaningful for {seniorDisplayName}?
          </p>
        </div>
      </FormCard>

      <div className="group relative overflow-hidden rounded-3xl bg-primary-fixed/30 p-6">
        <div className="relative z-10 flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-primary-fixed">
              Memory Curation
            </h4>
            <p className="mt-1 text-sm leading-snug text-on-primary-fixed-variant">
              Detailed stories help Memvella bring up the right moments when talking with {seniorDisplayName}.
            </p>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 h-24 w-24 scale-150 rounded-full bg-primary/5 transition-transform duration-700 group-hover:scale-110" />
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
        <div className="relative overflow-hidden rounded-3xl shadow-sm">
          <img src={photoPreview} alt="Photo preview" className="h-48 w-full object-cover" />
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
          <div className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-outline-variant/40 bg-white p-6 text-lg font-bold text-primary shadow-sm transition-all active:scale-[0.98] hover:bg-surface-container-lowest">
            <Camera size={26} />
            Add Photo <span className="ml-1 text-sm font-normal italic text-outline">(Optional)</span>
          </div>
        </label>
      )}

      {error ? (
        <p className="px-1 text-center text-sm font-medium text-red-500">{error}</p>
      ) : null}

      <button
        type="button"
        onClick={handleSaveMemory}
        disabled={isSaving || !isFormValid}
        className="mb-8 flex h-16 w-full items-center justify-center gap-2 rounded-full bg-[#6B21A8] text-xl font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
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
