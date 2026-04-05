"use client";

import { Film, ImageIcon } from "lucide-react";
import { formatMemoryRecordTypeLabel } from "@/lib/memory-record-ui";

interface MemoryItem {
  id: string;
  mediaUrl: string;
  mediaAssetType: "image" | "video";
  caption: string;
  excerpt: string;
  date: string | null;
  dateLabel: string;
  recordType: "text" | "media" | "audio" | "voice";
}

interface MemoryGalleryProps {
  gallery?: MemoryItem[];
}

const CARD_ROTATIONS = ["-rotate-2", "rotate-2", "-rotate-1", "rotate-1", ""];
const CARD_OFFSETS = ["", "md:translate-y-8", "", "md:-translate-y-8", ""];

function PolaroidSkeleton({ className }: { className: string }) {
  return (
    <div className={`transform ${className}`}>
      <div className="rounded-[30px] bg-white p-4 shadow-md">
        <div className="rounded-[24px] border border-[#eadfca] bg-[#f6f1e7] p-4">
          <div className="mb-3 h-4 w-28 animate-pulse rounded-full bg-[#e8dfcf]" />
          <div className="aspect-[4/3] animate-pulse rounded-[18px] bg-[#e8dfcf]" />
          <div className="mt-4 space-y-3">
            <div className="h-7 w-3/4 animate-pulse rounded-full bg-[#e8dfcf]" />
            <div className="h-5 w-full animate-pulse rounded-full bg-[#efe7d9]" />
            <div className="h-5 w-4/5 animate-pulse rounded-full bg-[#efe7d9]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaPreview({ item }: { item: MemoryItem }) {
  if (item.mediaAssetType === "video") {
    return (
      <video
        controls
        playsInline
        preload="metadata"
        className="h-full w-full rounded-[18px] bg-[#efe6d5] object-contain"
        src={item.mediaUrl}
      />
    );
  }

  return (
    <img
      alt={item.caption}
      className="h-full w-full rounded-[18px] bg-[#efe6d5] object-contain"
      src={item.mediaUrl}
    />
  );
}

export function MemoryGallery({ gallery }: MemoryGalleryProps) {
  return (
    <div className="h-full w-full max-w-5xl overflow-y-auto rounded-[32px] border border-white/50 bg-[#fffdfa]/80 p-6 shadow-xl backdrop-blur-md md:p-8">
      <header className="mb-8 flex flex-col gap-3 md:mb-10">
        <h2 className="font-headline text-4xl font-extrabold text-on-surface md:text-5xl">
          Memory Gallery
        </h2>
        <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
          Photos and videos stay fully in frame, with each memory note shown right below.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 pb-8 md:grid-cols-2 md:gap-10 xl:grid-cols-3">
        {gallery === undefined ? (
          <>
            <PolaroidSkeleton className="-rotate-2" />
            <PolaroidSkeleton className="rotate-2 md:translate-y-8" />
            <PolaroidSkeleton className="-rotate-1" />
            <PolaroidSkeleton className="rotate-1 md:-translate-y-8" />
          </>
        ) : null}

        {gallery?.map((item, index) => (
          <article
            key={item.id}
            className={`transform ${CARD_ROTATIONS[index % CARD_ROTATIONS.length]} ${
              CARD_OFFSETS[index % CARD_OFFSETS.length]
            }`}
          >
            <div className="rounded-[30px] bg-white p-4 shadow-md">
              <div className="rounded-[24px] border border-[#eadfca] bg-[#f6f1e7] p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#7b6d58]">
                  <span>{item.dateLabel}</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-[#5f4c8d] shadow-sm">
                    {item.mediaAssetType === "video" ? (
                      <Film className="h-3.5 w-3.5" />
                    ) : (
                      <ImageIcon className="h-3.5 w-3.5" />
                    )}
                    {formatMemoryRecordTypeLabel(item.recordType)}
                  </span>
                </div>

                <div
                  className={`overflow-hidden rounded-[18px] border border-[#e9dcc4] bg-[#efe6d5] ${
                    item.mediaAssetType === "video" ? "aspect-video" : "aspect-[4/3]"
                  }`}
                >
                  <MediaPreview item={item} />
                </div>

                <div className="mt-4 space-y-3 px-1 pb-1">
                  <h3 className="font-headline text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                    {item.caption}
                  </h3>
                  <p className="text-lg leading-relaxed text-slate-700 md:text-xl">
                    {item.excerpt}
                  </p>
                </div>
              </div>
            </div>
          </article>
        ))}

        {gallery !== undefined && gallery.length === 0 ? (
          <div className="col-span-full rounded-[32px] border border-dashed border-[#d8ccb7] bg-white/90 p-10 text-center shadow-sm">
            <p className="font-headline text-2xl font-bold text-slate-900 md:text-3xl">
              No photos or videos yet
            </p>
            <p className="mt-3 text-lg leading-relaxed text-slate-600 md:text-xl">
              Add a memory with a photo or video from the Organiser app to fill this gallery.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
