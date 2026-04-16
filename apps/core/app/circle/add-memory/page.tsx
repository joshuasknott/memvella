"use client";

import Link from "next/link";
import { Camera, Mic, Music, Type } from "lucide-react";
import { useCircleProfile } from "@/lib/use-circle-profile";

export default function AddMemoryPage() {
  const { seniorDisplayName } = useCircleProfile();

  return (
    <div className="flex w-full flex-col gap-6 px-4">
      <div>
        <h1 className="text-center font-family text-3xl font-extrabold tracking-tight text-text-primary">
          Add a Memory
        </h1>
        <p className="mb-4 mt-2 text-center text-lg text-text-secondary">
          Choose a format to capture a moment for {seniorDisplayName}.
        </p>
      </div>

      <section className="space-y-4">
        <Link
          href="/circle/add-memory/voice"
          data-testid="open-voice-memory-link"
          className="flex items-center gap-5 rounded-xl border border-border bg-surface p-5 shadow-sm transition-transform active:scale-[0.98]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-family-primary/10 text-family-primary/80">
            <Mic className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-family text-lg font-bold text-text-primary">
              Record Voice Note
            </span>
            <span className="text-base font-medium text-text-secondary">
              Speak naturally and review the transcript before saving
            </span>
          </div>
        </Link>

        <Link
          href="/circle/add-memory/media"
          className="flex items-center gap-5 rounded-xl border border-border bg-surface p-5 shadow-sm transition-transform active:scale-[0.98]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-family-accent/10 text-family-accent">
            <Camera className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-family text-lg font-bold text-text-primary">
              Photo or Video
            </span>
            <span className="text-base font-medium text-text-secondary">
              Upload from your camera roll
            </span>
          </div>
        </Link>

        <Link
          href="/circle/add-memory/audio"
          className="flex items-center gap-5 rounded-xl border border-border bg-surface p-5 shadow-sm transition-transform active:scale-[0.98]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
            <Music className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-family text-lg font-bold text-text-primary">
              Favorite Song
            </span>
            <span className="text-base font-medium text-text-secondary">
              Save the story behind a track or recording
            </span>
          </div>
        </Link>

        <Link
          href="/circle/add-memory/text"
          className="flex items-center gap-5 rounded-xl border border-border bg-surface p-5 shadow-sm transition-transform active:scale-[0.98]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-muted text-text-secondary">
            <Type className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-family text-lg font-bold text-text-primary">
              Write a Story
            </span>
            <span className="text-base font-medium text-text-secondary">
              Add a detailed memory in text
            </span>
          </div>
        </Link>
      </section>
    </div>
  );
}
