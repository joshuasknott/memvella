"use client";

import { useEffect, useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import { MemoryGallery } from "@/components/shared-senior/MemoryGallery";
import { VoiceInputPill } from "@/components/shared-senior/VoiceInputPill";
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

function IndependentRecoveryState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f5fa] p-6">
      <div className="w-full max-w-xl rounded-[32px] bg-white p-8 text-center shadow-lg">
        <h1 className="mb-3 font-headline text-3xl font-bold text-slate-900">
          Your session needs to be refreshed.
        </h1>
        <p className="mb-6 text-xl leading-relaxed text-slate-600">
          Sign back in with your secure link or use Face ID / Touch ID to reopen your FamilySpace.
        </p>
        <a
          href="/independent/recover"
          className="inline-flex min-h-[72px] items-center justify-center rounded-full bg-[#6B21A8] px-8 text-xl font-semibold text-white shadow-md"
        >
          Restore Access
        </a>
      </div>
    </main>
  );
}

export default function IndependentHomePage() {
  const now = useLiveClock();
  const { dashboard, deviceFingerprint, sessionState, clearSession } =
    useSeniorDashboardSession("independent");
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);

  useEffect(() => {
    if (dashboard?.status === "invalid") {
      clearSession();
    }
  }, [clearSession, dashboard]);

  const handleVoiceSubmit = (text: string) => {
    setVoiceStatus(
      `Heard: "${text}". Voice creation will save directly to your FamilySpace in the next sprint.`,
    );
  };

  if (!deviceFingerprint) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5fa]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#6B21A8]/20 border-t-[#6B21A8]" />
      </main>
    );
  }

  if (!sessionState?.sessionToken) {
    return <IndependentRecoveryState />;
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
    <main className="relative flex min-h-screen w-full flex-col overflow-y-auto bg-[#f0ebf5] md:flex-row md:overflow-hidden">
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
            <div className="rounded-[32px] border border-slate-200 border-l-[12px] border-l-secondary bg-surface-container-lowest p-6 shadow-md md:p-10">
              <p className="font-headline text-2xl font-bold leading-tight text-on-surface md:text-3xl">
                {dashboard.nextEvent.time
                  ? `${dashboard.nextEvent.title} at ${dashboard.nextEvent.time}.`
                  : dashboard.nextEvent.title}
              </p>
            </div>
          )}

          {voiceStatus ? (
            <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-5 text-lg leading-relaxed text-blue-900">
              {voiceStatus}
            </div>
          ) : null}
        </div>
      </section>

      <section className="relative flex w-full flex-1 flex-col justify-center overflow-y-auto p-4 md:w-[60%] md:p-12">
        <MemoryGallery gallery={dashboard.gallery} />
      </section>

      <VoiceInputPill onSubmit={handleVoiceSubmit} />
    </main>
  );
}
