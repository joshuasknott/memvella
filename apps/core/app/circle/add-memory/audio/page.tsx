"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Loader2, Music, Upload, X } from "lucide-react";
import type { Id } from "@memvella/backend/dataModel";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@memvella/backend";
import { TextInput, PrimaryButton } from "@memvella/ui";
import { FormCard } from "@/components/ui/FormCard";
import { uploadFileToConvex } from "@/lib/convex-upload";
import { useCircleProfile } from "@/lib/use-circle-profile";

export default function AudioMemoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { seniorDisplayName } = useCircleProfile();
  const addMemoryAudio = useMutation(api.memories.addMemoryAudio);
  const generateUploadUrl = useMutation(api.memories.generateUploadUrl);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [songLink, setSongLink] = useState("");
  const [story, setStory] = useState("");
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFormValid = title.trim().length > 0 && story.trim().length > 0;

  const handleAudioSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedAudio(file);
  };

  const clearAudioSelection = () => {
    setSelectedAudio(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!isFormValid) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      let audioStorageId: Id<"_storage"> | undefined;
      let uploadIntentId: Id<"uploadIntents"> | undefined;

      if (selectedAudio) {
        const uploadResult = await uploadFileToConvex(generateUploadUrl, selectedAudio, "audio");
        audioStorageId = uploadResult.storageId;
        uploadIntentId = uploadResult.uploadIntentId ?? undefined;
      }

      await addMemoryAudio({
        title: title.trim(),
        date: date.trim() || undefined,
        story: story.trim(),
        songLink: songLink.trim() || undefined,
        audioStorageId,
        audioMimeType: selectedAudio?.type || undefined,
        audioFileName: selectedAudio?.name || undefined,
        uploadIntentId,
      });

      toast({
        tone: "success",
        title: "Audio memory saved",
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
        title: "Audio memory did not save",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 px-4 pb-32">
      <section className="mb-4 mt-8 flex justify-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-border bg-surface shadow-xl shadow-ambient">
          <Music className="h-12 w-12 text-family-primary" strokeWidth={1.5} />
          <div className="absolute left-1/2 top-1/2 -z-10 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-family-primary/5 blur-2xl" />
        </div>
      </section>

      <FormCard as="section" className="space-y-8">
        <div className="space-y-3">
          <label className="font-family text-lg font-bold tracking-tight text-text-primary" htmlFor="audio_title">
            Memory Title
          </label>
          <TextInput
            id="audio_title"
            type="text"
            required
            placeholder="Our Wedding Song"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            data-testid="audio-memory-title-input"
          />
        </div>

        <div className="space-y-3">
          <label className="font-family text-lg font-bold tracking-tight text-text-primary" htmlFor="audio_date">
            When was this? <span className="ml-2 text-sm font-normal italic text-text-secondary">(Optional)</span>
          </label>
          <TextInput
            id="audio_date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            data-testid="audio-memory-date-input"
          />
        </div>

        <div className="space-y-3">
          <label className="font-family text-lg font-bold tracking-tight text-text-primary" htmlFor="song_link">
            Link <span className="ml-2 text-sm font-normal italic text-text-secondary">(Optional)</span>
          </label>
          <TextInput
            id="song_link"
            type="url"
            placeholder="Spotify or Apple Music..."
            value={songLink}
            onChange={(event) => setSongLink(event.target.value)}
            data-testid="audio-memory-link-input"
          />
        </div>

        <div className="space-y-4">
          <label className="font-family text-lg font-bold tracking-tight text-text-primary" htmlFor="song_context">
            Why does {seniorDisplayName} love this?
          </label>
          <textarea
            id="song_context"
            placeholder="They played this at a wedding celebration..."
            rows={4}
            required
            value={story}
            onChange={(event) => setStory(event.target.value)}
            data-testid="audio-memory-story-input"
            className="w-full resize-none rounded-xl bg-surface-muted p-6 text-lg font-medium transition-all placeholder:text-text-secondary/50 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-family-primary"
          />
        </div>
      </FormCard>

      <input
        ref={fileInputRef}
        id="audio-file-input"
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleAudioSelect}
        data-testid="audio-memory-file-input"
      />

      <section className="space-y-3 pt-2">
        <h3 className="text-center font-family text-lg font-bold tracking-tight text-text-primary">
          Optional audio file
        </h3>
        {selectedAudio ? (
          <div className="rounded-xl border border-family-accent/15 bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-text-primary">{selectedAudio.name}</p>
                <p className="mt-1 text-sm font-medium text-text-secondary">
                  {selectedAudio.type || "Audio file"}
                </p>
              </div>
              <button
                type="button"
                onClick={clearAudioSelection}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-text-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : null}
        <label htmlFor="audio-file-input" className="block">
          <div className="flex min-h-[72px] w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-family-accent/15 bg-surface px-6 text-lg font-semibold text-family-accent shadow-sm transition-transform active:scale-95">
            <Upload className="h-6 w-6" />
            {selectedAudio ? "Replace audio file" : "Choose audio file"}
          </div>
        </label>
      </section>

      {error ? (
        <p className="px-1 text-center text-sm font-medium text-status-alert">{error}</p>
      ) : null}

      <PrimaryButton
        onClick={handleSave}
        disabled={isSaving || !isFormValid}
        className="mb-8"
        data-testid="audio-memory-save-button"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            {selectedAudio ? "Uploading and saving..." : "Saving..."}
          </>
        ) : (
          "Save Audio Memory"
        )}
      </PrimaryButton>
    </div>
  );
}
