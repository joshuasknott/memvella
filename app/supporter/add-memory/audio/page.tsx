"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Loader2, Music, Upload } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { FormCard } from "@/components/ui/FormCard";
import { TextInput } from "@/components/ui/Input";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { useFamilySpaceProfile } from "@/lib/use-family-space-profile";

export default function AudioMemoryPage() {
  const router = useRouter();
  const { seniorDisplayName } = useFamilySpaceProfile();
  const addMemoryAudio = useMutation(api.memories.addMemoryAudio);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [songLink, setSongLink] = useState("");
  const [story, setStory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = title.trim().length > 0 && story.trim().length > 0;

  const handleSave = async () => {
    if (!isFormValid) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await addMemoryAudio({
        title: title.trim(),
        date: date.trim() || "Unknown date",
        story: story.trim(),
        songLink: songLink.trim() || undefined,
        mediaStorageId: undefined,
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
      <section className="mb-4 mt-8 flex justify-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-low shadow-xl shadow-primary/5">
          <Music className="h-12 w-12 text-primary" strokeWidth={1.5} />
          <div className="absolute left-1/2 top-1/2 -z-10 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-2xl" />
        </div>
      </section>

      <FormCard as="section" className="space-y-8">
        <div className="space-y-3">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="audio_title">
            Memory Title
          </label>
          <TextInput
            id="audio_title"
            type="text"
            required
            placeholder="Our Wedding Song"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="space-y-3">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="audio_date">
            When was this? <span className="ml-2 text-sm font-normal italic text-outline">(Optional)</span>
          </label>
          <TextInput
            id="audio_date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>

        <div className="space-y-3">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="song_link">
            Link <span className="ml-2 text-sm font-normal italic text-outline">(Optional)</span>
          </label>
          <TextInput
            id="song_link"
            type="url"
            placeholder="Spotify or Apple Music..."
            value={songLink}
            onChange={(event) => setSongLink(event.target.value)}
          />
        </div>

        <div className="space-y-4">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="song_context">
            Why does {seniorDisplayName} love this?
          </label>
          <textarea
            id="song_context"
            placeholder="They played this at a wedding celebration..."
            rows={4}
            required
            value={story}
            onChange={(event) => setStory(event.target.value)}
            className="w-full resize-none rounded-2xl bg-surface-container-highest p-6 text-xl font-medium transition-all placeholder:text-outline/50 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </FormCard>

      <section className="space-y-3 pt-2">
        <h3 className="text-center font-headline text-xl font-bold tracking-tight text-on-surface">
          Direct uploads arrive next
        </h3>
        <SecondaryButton type="button" disabled>
          <Upload className="h-6 w-6" />
          <span className="font-bold">Audio Upload Coming Soon</span>
        </SecondaryButton>
      </section>

      {error ? (
        <p className="px-1 text-center text-sm font-medium text-red-500">{error}</p>
      ) : null}

      <PrimaryButton onClick={handleSave} disabled={isSaving || !isFormValid} className="mb-8">
        {isSaving ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Audio Memory"
        )}
      </PrimaryButton>
    </div>
  );
}
