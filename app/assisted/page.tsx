"use client";

import { useEffect, useState } from "react";
import { Mic } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { MemoryGallery } from "@/components/shared-senior/MemoryGallery";
import { VoiceModal } from "@/components/shared-senior/VoiceModal";
import { useSeniorDashboardSession } from "@/lib/use-senior-dashboard-session";

function useLiveClock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 60_000);

    return () => clearInterval(intervalId);
  }, []);

  return time;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getGreeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function AssistedRecoveryState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f5fa] p-6">
      <div className="w-full max-w-xl rounded-[32px] bg-white p-8 text-center shadow-lg">
        <h1 className="mb-3 font-headline text-3xl font-bold text-slate-900">
          Tablet pairing expired.
        </h1>
        <p className="mb-6 text-xl leading-relaxed text-slate-600">
          This Assisted Senior tablet needs a fresh 6-digit code from a Supporter.
        </p>
        <a
          href="/assisted/login"
          className="inline-flex min-h-[72px] items-center justify-center rounded-full bg-[#6B21A8] px-8 text-xl font-semibold text-white shadow-md"
        >
          Reconnect Tablet
        </a>
      </div>
    </main>
  );
}

export default function AssistedHomePage() {
  const now = useLiveClock();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const { dashboard, deviceFingerprint, sessionState, clearSession } =
    useSeniorDashboardSession("assisted");

  useEffect(() => {
    if (dashboard?.status === "invalid") {
      clearSession();
    }
  }, [clearSession, dashboard]);

  if (!deviceFingerprint) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5fa]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#6B21A8]/20 border-t-[#6B21A8]" />
      </main>
    );
  }

  if (!sessionState?.sessionToken) {
    return <AssistedRecoveryState />;
  }

  if (!dashboard || dashboard.status === "invalid") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5fa]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#6B21A8]/20 border-t-[#6B21A8]" />
      </main>
    );
  }

  const hasRoutine = dashboard.nextEvent.time !== null;

  return (
    <main className="flex min-h-screen w-full flex-col overflow-y-auto bg-[#f0ebf5] md:flex-row md:overflow-hidden">
      <section className="flex w-full flex-none flex-col justify-between border-b border-outline-variant/10 bg-[#f8f5fa] p-4 md:w-[40%] md:border-b-0 md:border-r md:p-12">
        <BrandLogo className="mb-8" />

        <div className="grow flex flex-col justify-center py-6 md:py-0">
          <div className="sticky top-0 z-40 mb-4 bg-[#f8f5fa] pb-4 pt-4 md:mb-0 md:pb-0 md:pt-0">
            <p className="mb-2 font-headline text-2xl font-semibold text-slate-500 md:mb-4 md:text-5xl">
              {`${getGreeting(now)}, ${dashboard.seniorName}`}
            </p>
            <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tighter text-slate-900 md:text-7xl">
              {formatTime(now)}
            </h1>
            <p className="mb-6 font-headline text-2xl font-bold text-slate-900 md:mb-12 md:text-4xl">
              {`Today is ${formatDate(now)}`}
            </p>
          </div>

          {!hasRoutine ? (
            <div className="inline-block w-fit rounded-3xl border border-white/40 bg-white/70 px-8 py-6 shadow-sm">
              <p className="font-headline text-2xl font-bold leading-tight text-[#4e0078]">
                No routines scheduled right now. Enjoy your day!
              </p>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[32px] border border-slate-200 border-l-[12px] border-l-secondary bg-surface-container-lowest p-6 shadow-md md:p-10">
              <p className="font-headline text-2xl font-bold leading-tight text-on-surface md:text-3xl">
                {dashboard.nextEvent.time
                  ? `${dashboard.nextEvent.title} at ${dashboard.nextEvent.time}.`
                  : dashboard.nextEvent.title}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 md:fixed md:bottom-8 md:right-8 md:z-40 md:mt-0">
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="block w-full rounded-full bg-[#6B21A8] px-8 py-6 text-center shadow-xl transition-transform duration-200 hover:scale-[1.02] active:scale-95 md:w-auto md:px-10 md:py-8"
          >
            <div className="flex items-center justify-center gap-4 md:gap-6">
              <Mic className="h-10 w-10 shrink-0 text-white md:h-12 md:w-12" strokeWidth={2.5} />
              <span className="font-headline text-2xl font-bold text-white md:text-3xl">
                Tap to Talk
              </span>
            </div>
          </button>
        </div>
      </section>

      <section className="relative flex w-full flex-1 flex-col justify-center overflow-y-auto p-4 md:w-[60%] md:p-12">
        <MemoryGallery gallery={dashboard.gallery} />
      </section>

      <VoiceModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} />
    </main>
  );
}
