"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

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

export function MemoryGallery({ gallery }: { gallery?: MemoryItem[] }) {
  const [index, setIndex] = useState(0);
  if (!gallery)
    return (
      <div role="status" className="companion-empty">
        Your memories are loading…
      </div>
    );
  if (!gallery.length)
    return (
      <div className="companion-empty">
        <h2>There&apos;s always time for a chat.</h2>
        <p>Tap the button to talk with Memvella.</p>
      </div>
    );
  const currentIndex = Math.min(index, gallery.length - 1);
  const item = gallery[currentIndex]!;
  return (
    <div className="companion-memory">
      <figure>
        <div className="companion-memory-image">
          {item.mediaAssetType === "video" ? (
            <video
              key={item.id}
              src={item.mediaUrl}
              controls
              playsInline
              preload="metadata"
              aria-label={item.caption}
            />
          ) : (
            <Image
              src={item.mediaUrl}
              loading="eager"
              alt={item.caption}
              fill
              sizes="(min-width: 900px) 55vw, 90vw"
              unoptimized
              className="object-contain"
            />
          )}
        </div>
        <figcaption aria-live="polite">
          <h2>{item.caption}</h2>
          <p>{item.excerpt}</p>
          {item.date ? <span>{item.dateLabel}</span> : null}
        </figcaption>
      </figure>
      {gallery.length > 1 ? (
        <nav aria-label="Browse memories">
          <button
            type="button"
            onClick={() =>
              setIndex((currentIndex + gallery.length - 1) % gallery.length)
            }
          >
            <ArrowLeft size={24} aria-hidden="true" /> Previous
          </button>
          <span>
            {currentIndex + 1} of {gallery.length}
          </span>
          <button
            type="button"
            onClick={() => setIndex((currentIndex + 1) % gallery.length)}
          >
            Next <ArrowRight size={24} aria-hidden="true" />
          </button>
        </nav>
      ) : null}
    </div>
  );
}
