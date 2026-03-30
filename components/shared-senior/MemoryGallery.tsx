"use client";

import { useState } from 'react';
import { Volume2 } from 'lucide-react';

interface MemoryItem {
  id: string;
  imageUrl: string;
  caption: string;
}

interface MemoryGalleryProps {
  gallery?: MemoryItem[];
}

// ─── Polaroid skeleton placeholder ──────────────────────────────────────────
function PolaroidSkeleton({ rotate }: { rotate: string }) {
  return (
    <div className={`flex flex-col gap-4 ${rotate}`}>
      <div className="bg-white p-4 pb-12 rounded-sm border border-slate-200 shadow-md animate-pulse">
        <div className="aspect-4/3 bg-surface-container rounded-sm" />
      </div>
    </div>
  );
}

export function MemoryGallery({ gallery }: MemoryGalleryProps) {
  const [activeMemoryId, setActiveMemoryId] = useState<string | null>(null);

  const ROTATIONS = ['-rotate-2', 'rotate-2', '-rotate-2', 'rotate-2', ''];

  return (
    <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl md:rounded-3xl p-6 md:p-8 w-full max-w-4xl mx-auto h-full overflow-y-auto">
      <header className="mb-8 md:mb-12 flex justify-between items-end">
        <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface">Memory Gallery</h2>
      </header>

      {/* Bento-style Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12 pb-12">
        {/* Loading skeletons — shown before gallery loads */}
        {(gallery === undefined) && (
          <>
            <PolaroidSkeleton rotate="-rotate-2" />
            <PolaroidSkeleton rotate="rotate-2 mt-8" />
            <PolaroidSkeleton rotate="-rotate-2" />
            <PolaroidSkeleton rotate="rotate-2 -mt-12" />
          </>
        )}

        {/* Live gallery from Convex */}
        {gallery !== undefined && gallery.length > 0 && gallery.map((item, index) => {
          const rotation = ROTATIONS[index % ROTATIONS.length];
          const isLast = index === gallery.length - 1;
          const isSpanning = isLast && gallery.length % 2 !== 0;

          return (
            <button
              key={item.id}
              onClick={(e) => {
                e.preventDefault();
                setActiveMemoryId(activeMemoryId === item.id ? null : item.id);
              }}
              className={`flex flex-col gap-4 text-left group transition-all duration-300 transform outline-none focus:ring-4 focus:ring-primary/30 rounded-lg pb-4
                ${activeMemoryId === item.id ? 'scale-105' : 'hover:scale-105'}
                ${rotation} ${index === 1 ? 'mt-8' : ''} ${index === 3 ? '-mt-12' : ''} ${isSpanning ? 'col-span-2 items-center' : ''}`}
            >
              <div className={`bg-white p-4 pb-12 rounded-sm border shadow-md relative overflow-hidden transition-all duration-300
                ${activeMemoryId === item.id ? 'border-primary ring-2 ring-primary/50 shadow-xl' : 'border-slate-200'}
                ${isSpanning ? 'w-[70%] -rotate-2' : ''}`}>
                
                {/* Playing Overlays */}
                {activeMemoryId === item.id && (
                  <div className="absolute inset-0 z-10 pointer-events-none rounded-sm bg-primary/5 shimmer-overlay" />
                )}
                {activeMemoryId === item.id && (
                  <div className="absolute top-6 right-6 z-20 bg-primary text-on-primary p-2 rounded-full shadow-lg animate-pulse">
                    <Volume2 className="w-5 h-5" />
                  </div>
                )}

                <div className={`overflow-hidden rounded-sm bg-surface-container ${isSpanning ? 'aspect-video' : index % 3 === 2 ? 'aspect-square' : 'aspect-4/3'}`}>
                  <img
                    alt={item.caption}
                    className="w-full h-full object-cover relative z-0"
                    src={item.imageUrl}
                  />
                </div>
              </div>
              {!isSpanning && (
                <p className={`font-headline text-2xl font-bold text-center tracking-tight transition-colors duration-300
                  ${activeMemoryId === item.id ? 'text-primary' : 'text-on-surface'}`}>
                  {item.caption}
                </p>
              )}
            </button>
          );
        })}

        {/* Empty state — only shown once loaded and no media memories exist */}
        {gallery !== undefined && gallery.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-24 text-center">
            <p className="font-headline text-2xl font-bold text-on-surface-variant mb-2">No photos yet</p>
            <p className="text-outline text-sm">Add memories with photos in the Organizer app.</p>
          </div>
        )}
      </div>
    </div>
  );
}
