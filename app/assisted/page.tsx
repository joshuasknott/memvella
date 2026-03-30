"use client";

import { useState, useEffect } from 'react';
import BrandLogo from '@/components/BrandLogo';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Mic } from 'lucide-react';
import { MemoryGallery } from '@/components/shared-senior/MemoryGallery';
import { VoiceModal } from '@/components/shared-senior/VoiceModal';

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

// ─── Component ────────────────────────────────────────────────────────────────
export default function AssistedHomePage() {
  const now = useLiveClock();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // ── Safe localStorage read — avoids SSR/hydration mismatch ──────────────
  // Primary key: memvella_friendName (written by organizer onboarding).
  // Secondary key: memvella_seniorName (legacy / senior-side override).
  // Falls back to generic 'Friend' if neither is set.
  const [organizerId, setOrganizerId] = useState<string>('');
  const [localName, setLocalName] = useState<string>('');

  useEffect(() => {
    const id = localStorage.getItem('memvella_organizerId') ?? '';
    const name = localStorage.getItem('memvella_seniorName') || localStorage.getItem('memvella_friendName') || 'Friend';
    setOrganizerId(id);
    setLocalName(name);
  }, []);

  // Set mock user for dynamic greeting
  const user = { firstName: localName };

  // ── Convex queries — only run when organizerId is available ───────────────
  const nextEvent = useQuery(
    api.kiosk.getSeniorNextEvent,
    // @ts-ignore - Backend migration pending for organizerId
    organizerId ? { organizerId } : 'skip'
  );
  const gallery = useQuery(
    api.kiosk.getMemoryGallery,
    // @ts-ignore - Backend migration pending for organizerId
    organizerId ? { organizerId } : 'skip'
  );

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
            {now ? `${getGreeting(now)}, ${user.firstName}` : `Good Day`}
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

        {/* Hero Voice Action Button */}
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
        <MemoryGallery gallery={gallery} />
      </section>

      {/* Voice Modal Overlay */}
      <VoiceModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} />
    </main>
  );
}
