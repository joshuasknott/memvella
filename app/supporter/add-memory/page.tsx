"use client";

import Link from "next/link";
import { Camera, Mic, Music, Type } from "lucide-react";
import { useFamilySpaceProfile } from "@/lib/use-family-space-profile";

export default function AddMemoryPage() {
  const { seniorDisplayName } = useFamilySpaceProfile();

  return (
    <div className="flex w-full flex-col gap-6 px-4">
      <div>
        <h1 className="text-center font-headline text-3xl font-extrabold tracking-tight text-gray-900">
          Add a Memory
        </h1>
        <p className="mb-4 mt-2 text-center text-lg text-gray-500">
          Choose a format to capture a moment for {seniorDisplayName}.
        </p>
      </div>

      <section className="space-y-4">
        <Link
          href="/supporter/add-memory/voice"
          className="flex items-center gap-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-transform active:scale-[0.98]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
            <Mic className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-lg font-bold text-gray-900">
              Record Voice Note
            </span>
            <span className="text-base font-medium text-gray-500">
              Speak naturally and review the transcript before saving
            </span>
          </div>
        </Link>

        <Link
          href="/supporter/add-memory/media"
          className="flex items-center gap-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-transform active:scale-[0.98]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Camera className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-lg font-bold text-gray-900">
              Photo or Video
            </span>
            <span className="text-base font-medium text-gray-500">
              Upload from your camera roll
            </span>
          </div>
        </Link>

        <Link
          href="/supporter/add-memory/audio"
          className="flex items-center gap-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-transform active:scale-[0.98]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
            <Music className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-lg font-bold text-gray-900">
              Favorite Song
            </span>
            <span className="text-base font-medium text-gray-500">
              Save the story behind a track or recording
            </span>
          </div>
        </Link>

        <Link
          href="/supporter/add-memory/text"
          className="flex items-center gap-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-transform active:scale-[0.98]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
            <Type className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-lg font-bold text-gray-900">
              Write a Story
            </span>
            <span className="text-base font-medium text-gray-500">
              Add a detailed memory in text
            </span>
          </div>
        </Link>
      </section>
    </div>
  );
}
