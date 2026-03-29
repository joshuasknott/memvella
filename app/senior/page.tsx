"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Mic } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

// ─── Live Clock ───────────────────────────────────────────────────────────────
function useLiveClock() {
  const [time, setTime] = useState<Date | null>(null);
  
  useEffect(() => {
    setTime(new Date());
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 60_000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return time;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function getGreeting(date: Date) {
  const h = date.getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// ─── Polaroid gallery placeholder while images load ──────────────────────────
function PolaroidSkeleton({ rotate }: { rotate: string }) {
  return (
    <div className={`flex flex-col gap-4 ${rotate}`}>
      <div className="bg-white p-4 pb-12 rounded-sm border border-slate-200 shadow-md animate-pulse">
        <div className="aspect-4/3 bg-surface-container rounded-sm" />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SeniorHomePage() {
  const now = useLiveClock();
  const { data: session } = authClient.useSession();

  // ── Safe localStorage read — avoids SSR/hydration mismatch ──────────────
  // Primary key: memvella_lovedOneName (written by caregiver onboarding).
  // Secondary key: memvella_seniorName (legacy / senior-side override).
  // Falls back to generic 'there' if neither is set.
  const [caregiverId, setCaregiverId] = useState<string>('');
  const [localName, setLocalName] = useState<string>('');

  useEffect(() => {
    const id = localStorage.getItem('memvella_caregiverId') ?? '';
    const name =
      localStorage.getItem('memvella_lovedOneName') ??
      localStorage.getItem('memvella_seniorName') ??
      '';
    setCaregiverId(id);
    setLocalName(name);
  }, []);

  const seniorName = session?.user?.name || localName;

  // ── Convex queries — only run when caregiverId is available ───────────────
  // Skip queries (return undefined) until caregiverId is hydrated from localStorage
  const nextEvent = useQuery(
    api.kiosk.getSeniorNextEvent,
    caregiverId ? { caregiverId } : 'skip'
  );
  const gallery = useQuery(
    api.kiosk.getMemoryGallery,
    caregiverId ? { caregiverId } : 'skip'
  );

  // Polaroid rotation classes — applied in sequence
  const ROTATIONS = ['-rotate-2', 'rotate-2', '-rotate-2', 'rotate-2', ''];

  return (
    <main className="flex h-full w-full overflow-hidden">
      {/* Left Column (40%) */}
      <section className="w-[40%] h-full flex flex-col justify-between p-12 border-r border-outline-variant/10 bg-surface-container-low/30">

        {/* Branding */}
        <BrandLogo className="mb-8" />

        {/* Time and Date */}
        <div className="grow flex flex-col justify-center">
          {/* Greeting */}
          <p className="font-headline text-slate-500 font-semibold text-4xl mb-4">
            {now ? `${getGreeting(now)}, ${seniorName || 'there'}` : `Good Day`}
          </p>
          {/* Live Clock */}
          <h1 className="font-headline font-extrabold text-7xl text-slate-900 tracking-tighter mb-2">
            {now ? formatTime(now) : '-- : --'}
          </h1>
          <p className="font-headline text-5xl font-bold mb-12 text-slate-900">
            {now ? `Today is ${formatDate(now)}` : 'Loading…'}
          </p>

          {/* Next Event Card */}
          <div className="bg-surface-container-lowest p-10 rounded-4xl shadow-md border border-slate-200 border-l-12 border-l-secondary relative overflow-hidden">
            <div className="flex items-start gap-6">
              <div>
                <p className="font-headline text-3xl font-bold text-on-surface leading-tight">
                  {nextEvent === undefined
                    ? 'Loading schedule…'
                    : nextEvent.time
                    ? `${nextEvent.title} at ${nextEvent.time}.`
                    : nextEvent.title}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Action Button */}
        <div className="mt-12">
          <Link href="/senior/voice" className="block text-center bg-linear-to-br from-primary to-secondary w-full py-10 px-8 rounded-full shadow-xl active:scale-95 transition-transform duration-200">
            <div className="flex items-center justify-center gap-6">
              <Mic className="text-white shrink-0" size={48} strokeWidth={2.5} />
              <span className="text-white font-headline font-bold text-3xl">Tap to talk to Memvella</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Right Column (60%) — Memory Gallery */}
      <section className="w-[60%] h-full p-12 overflow-y-auto bg-surface relative">
        <header className="mb-12 flex justify-between items-end">
          <h2 className="font-headline text-5xl font-extrabold text-on-surface">Memory Gallery</h2>
        </header>

        {/* Bento-style Gallery Grid */}
        <div className="grid grid-cols-2 gap-12 pb-12">
          {/* Loading skeletons — shown before caregiverId hydrates or gallery loads */}
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
              <div
                key={item.id}
                className={`flex flex-col gap-4 ${rotation} ${index === 1 ? 'mt-8' : ''} ${index === 3 ? '-mt-12' : ''} ${isSpanning ? 'col-span-2 items-center' : ''}`}
              >
                <div className={`bg-white p-4 pb-12 rounded-sm border border-slate-200 shadow-md ${isSpanning ? 'w-[70%] -rotate-2' : ''}`}>
                  <div className={`overflow-hidden rounded-sm bg-surface-container ${isSpanning ? 'aspect-video' : index % 3 === 2 ? 'aspect-square' : 'aspect-4/3'}`}>
                    <img
                      alt={item.caption}
                      className="w-full h-full object-cover"
                      src={item.imageUrl}
                    />
                  </div>
                </div>
                {!isSpanning && (
                  <p className="font-headline text-2xl font-bold text-on-surface text-center tracking-tight">{item.caption}</p>
                )}
              </div>
            );
          })}

          {/* Empty state — only shown once loaded and no media memories exist */}
          {gallery !== undefined && gallery.length === 0 && (
            <div className="col-span-2 flex flex-col items-center justify-center py-24 text-center">
              <p className="font-headline text-2xl font-bold text-on-surface-variant mb-2">No photos yet</p>
              <p className="text-outline text-sm">Add memories with photos in the caregiver app.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
