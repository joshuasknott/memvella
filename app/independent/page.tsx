"use client";

import { useState, useEffect } from 'react';
import BrandLogo from '@/components/BrandLogo';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { authClient } from '@/lib/auth-client';
import { MemoryGallery } from '@/components/shared-senior/MemoryGallery';
import { VoiceInputPill } from '@/components/shared-senior/VoiceInputPill';

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
export default function IndependentHomePage() {
  const now = useLiveClock();
  const [isProcessing, setIsProcessing] = useState(false);
  const [userName, setUserName] = useState('Friend');

  // Authenticated Independent Senior session
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name);
    }
  }, [session]);

  const organizerId = session?.user?.id;

  // ── Convex queries ───────────────
  const nextEvent = useQuery(
    api.kiosk.getSeniorNextEvent,
    // @ts-ignore
    organizerId ? { organizerId } : 'skip'
  );
  
  const gallery = useQuery(
    api.kiosk.getMemoryGallery,
    // @ts-ignore
    organizerId ? { organizerId } : 'skip'
  );

  // ── Voice Controller for Creating Routines ───────────────
  const handleVoiceSubmit = async (text: string) => {
    setIsProcessing(true);
    try {
      console.log('Sending voice creation command to NLP:', text);
      // await createRoutineFromVoice({ text, userId: organizerId });
      
      await new Promise((res) => setTimeout(res, 1000));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="flex flex-col md:flex-row min-h-screen w-full overflow-y-auto md:overflow-hidden bg-[#f0ebf5] relative">
      {/* Left Column (40%) */}
      <section className="w-full md:w-[40%] flex-none flex flex-col justify-between p-4 md:p-12 border-b md:border-b-0 md:border-r border-outline-variant/10 bg-[#f8f5fa]">
        
        <BrandLogo className="mb-8" />

        <div className="grow flex flex-col justify-center py-6 md:py-0">
          <p className="font-headline text-slate-500 font-semibold text-2xl md:text-5xl mb-2 md:mb-4">
            {now ? `${getGreeting(now)}, ${userName}` : `Good Day`}
          </p>
          <h1 className="font-headline font-extrabold text-4xl md:text-7xl text-slate-900 tracking-tighter mb-2">
            {now ? formatTime(now) : '-- : --'}
          </h1>
          <p className="font-headline text-2xl md:text-4xl font-bold mb-6 md:mb-12 text-slate-900">
            {now ? `Today is ${formatDate(now)}` : 'Loading…'}
          </p>

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
      </section>

      {/* Right Column (60%) — Memory Gallery */}
      <section className="w-full md:w-[60%] flex-1 p-4 md:p-12 overflow-y-auto relative flex flex-col justify-center">
        <MemoryGallery gallery={gallery} />
      </section>

      {/* Voice Pill strictly for CREATING context (independent senior) */}
      <VoiceInputPill onSubmit={handleVoiceSubmit} isProcessing={isProcessing} />
    </main>
  );
}
