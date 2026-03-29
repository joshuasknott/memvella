"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Mic, X, Volume2 } from 'lucide-react';
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
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [activeMemoryId, setActiveMemoryId] = useState<string | null>(null);

  // ── Safe localStorage read — avoids SSR/hydration mismatch ──────────────
  // Primary key: memvella_lovedOneName (written by caregiver onboarding).
  // Secondary key: memvella_seniorName (legacy / senior-side override).
  // Falls back to generic 'there' if neither is set.
  const [caregiverId, setCaregiverId] = useState<string>('');
  const [localName, setLocalName] = useState<string>('');

  useEffect(() => {
    const id = localStorage.getItem('memvella_caregiverId') ?? '';
    const name = localStorage.getItem('memvella_seniorName') || 'Friend';
    setCaregiverId(id);
    setLocalName(name);
  }, []);

  const seniorName = localName;

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
    <main className="flex flex-col md:flex-row min-h-screen w-full overflow-y-auto md:overflow-hidden bg-[#f0ebf5]">
      {/* Left Column (40%) */}
      <section className="w-full md:w-[40%] flex-none flex flex-col justify-between p-4 md:p-12 border-b md:border-b-0 md:border-r border-outline-variant/10 bg-[#f8f5fa]">

        {/* Branding */}
        <BrandLogo className="mb-8" />

        {/* Time and Date */}
        <div className="grow flex flex-col justify-center py-6 md:py-0">
          {/* Greeting */}
          <p className="font-headline text-slate-500 font-semibold text-2xl md:text-5xl mb-2 md:mb-4">
            {now ? `${getGreeting(now)}, ${seniorName || 'there'}` : `Good Day`}
          </p>
          {/* Live Clock */}
          <h1 className="font-headline font-extrabold text-4xl md:text-7xl text-slate-900 tracking-tighter mb-2">
            {now ? formatTime(now) : '-- : --'}
          </h1>
          <p className="font-headline text-2xl md:text-4xl font-bold mb-6 md:mb-12 text-slate-900">
            {now ? `Today is ${formatDate(now)}` : 'Loading…'}
          </p>

          {/* Next Event Card or Empty State */}
          {!nextEvent ? (
            <div className="bg-white/60 backdrop-blur-md px-6 py-4 md:px-8 md:py-6 rounded-3xl shadow-sm border border-white/40 inline-block w-fit">
              <p className="font-headline text-lg md:text-2xl font-bold text-[#4e0078] leading-tight">
                No routines scheduled right now. Enjoy your day!
              </p>
            </div>
          ) : (
            <div className="bg-surface-container-lowest p-6 md:p-10 rounded-4xl shadow-md border border-slate-200 border-l-12 border-l-secondary relative overflow-hidden">
              <div className="flex items-start gap-6">
                <div>
                  <p className="font-headline text-xl md:text-3xl font-bold text-on-surface leading-tight">
                    {nextEvent.time
                      ? `${nextEvent.title} at ${nextEvent.time}.`
                      : nextEvent.title}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Voice Action Button */}
        <div className="mt-8 md:fixed md:bottom-8 md:right-8 md:mt-0 md:z-40">
          <button 
            onClick={() => setIsVoiceModalOpen(true)}
            className="block text-center bg-linear-to-br from-primary to-secondary w-full md:w-auto py-6 md:py-8 px-8 md:px-10 rounded-full shadow-xl hover:scale-[1.02] active:scale-95 transition-transform duration-200"
          >
            <div className="flex items-center justify-center gap-4 md:gap-6">
              <Mic className="text-white shrink-0 h-10 w-10 md:h-12 md:w-12" strokeWidth={2.5} />
              <span className="text-white font-headline font-bold text-2xl md:text-3xl">Tap to talk to Memvella</span>
            </div>
          </button>
        </div>
      </section>

      {/* Right Column (60%) — Memory Gallery */}
      <section className="w-full md:w-[60%] flex-1 p-4 md:p-12 overflow-y-auto relative flex flex-col justify-center">
        <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl md:rounded-3xl p-6 md:p-8 w-full max-w-4xl mx-auto h-full overflow-y-auto">
        <header className="mb-8 md:mb-12 flex justify-between items-end">
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface">Memory Gallery</h2>
        </header>

        {/* Bento-style Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12 pb-12">
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
      </section>

      {/* Voice Modal Overlay */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
          <div className="bg-white/95 rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-lg text-center relative flex flex-col items-center space-y-8">
            <button 
              onClick={() => setIsVoiceModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={32} />
            </button>
            <h2 className="font-headline text-3xl font-bold text-slate-900 mt-4">
              Listening...
            </h2>
            <div className="h-32 w-32 rounded-full bg-linear-to-r from-[#4e0078] to-[#7a2e9e] text-white shadow-xl flex items-center justify-center animate-pulse">
              <Mic size={56} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
