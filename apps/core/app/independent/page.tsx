"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAction, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import type { Id } from "@/convex/_generated/dataModel";
import { BrandLogo } from "@memvella/ui";
import { MemoryGallery } from "@/components/shared-senior/MemoryGallery";
import { VoiceInputPill } from "@/components/shared-senior/VoiceInputPill";
import { api } from "@/convex/_generated/api";
import { speakText, type VoiceUiState } from "@/lib/browser-speech";
import { signInWithIndependentPasskey } from "@/lib/independent-passkey-client";
import {
  clearSeniorRecoveryHint,
  saveSeniorSession,
} from "@/lib/senior-session-client";
import { useSeniorDashboardSession } from "@/lib/use-senior-dashboard-session";

type IndependentVoiceDraft = {
  intent: "memory" | "routine";
  title: string;
  description: string;
  date: string | null;
  timeLabel: string | null;
  timeMinutes: number | null;
  daysOfWeek: number[];
  recurrenceLabel: string | null;
};

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

function formatDraftDate(dateKey: string | null) {
  if (!dateKey) {
    return null;
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return utcDate.toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatDraftDays(daysOfWeek: number[]) {
  const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return daysOfWeek.map((day) => labels[day] ?? "").filter(Boolean).join(", ");
}

function IndependentRecoveryState({ deviceFingerprint }: { deviceFingerprint: string }) {
  const router = useRouter();
  const [isUsingPasskey, setIsUsingPasskey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUsePasskey = async () => {
    setIsUsingPasskey(true);
    setError(null);

    try {
      const result = await signInWithIndependentPasskey(deviceFingerprint);
      saveSeniorSession("independent", {
        sessionToken: result.sessionToken,
        deviceFingerprint,
        hasPasskey: true,
        ...(result.seniorName ? { seniorName: result.seniorName } : {}),
      });
      clearSeniorRecoveryHint("independent");
      router.replace("/independent");
    } catch (passkeyError) {
      console.error(passkeyError);
      setError(
        passkeyError instanceof Error
          ? passkeyError.message
          : "Memvella could not finish passkey sign-in.",
      );
    } finally {
      setIsUsingPasskey(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f5fa] p-6">
      <div className="w-full max-w-xl rounded-[32px] bg-white p-8 text-center shadow-lg">
        <h1 className="mb-3 font-headline text-3xl font-bold text-slate-900">
          Sign back in to Memvella
        </h1>
        <p className="mb-6 text-xl leading-relaxed text-slate-600">
          Use the passkey on this device to reopen your Circle. If you can&apos;t use this device, choose the recovery path instead.
        </p>

        {error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-left text-sm font-medium text-red-600">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => {
            void handleUsePasskey();
          }}
          disabled={isUsingPasskey}
          className="inline-flex min-h-[72px] w-full items-center justify-center rounded-full bg-[#6B21A8] px-8 text-xl font-semibold text-white shadow-md transition-transform active:scale-95 disabled:opacity-60"
        >
          {isUsingPasskey ? "Checking passkey..." : "Use passkey"}
        </button>

        <Link
          href="/independent/recover"
          className="mt-4 inline-flex min-h-[72px] w-full items-center justify-center rounded-full border-2 border-[#24005b] bg-white px-8 text-xl font-semibold text-[#24005b] shadow-sm"
        >
          I can&apos;t use this device
        </Link>
      </div>
    </main>
  );
}

export default function IndependentHomePage() {
  const now = useLiveClock();
  const { dashboard, deviceFingerprint, sessionState, clearSession } =
    useSeniorDashboardSession("independent");
  const [voiceState, setVoiceState] = useState<VoiceUiState>("idle");
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState<{
    interactionId: Id<"voiceInteractions">;
    draft: IndependentVoiceDraft;
  } | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const parseIndependentVoiceIntent = useAction(api.voice.parseIndependentVoiceIntent);
  const confirmIndependentVoiceDraft = useMutation(
    api.voiceSession.confirmIndependentVoiceDraft,
  );
  const rejectIndependentVoiceDraft = useMutation(
    api.voiceSession.rejectIndependentVoiceDraft,
  );

  useEffect(() => {
    if (dashboard?.status === "invalid") {
      clearSession();
    }
  }, [clearSession, dashboard]);

  const handleVoiceSubmit = async (text: string) => {
    if (!sessionState?.sessionToken || !deviceFingerprint) {
      setVoiceError("This session needs to be refreshed before voice actions can be saved.");
      return;
    }

    setVoiceError(null);
    setVoiceStatus(null);
    setPendingDraft(null);
    setVoiceState("processing");

    try {
      const result = await parseIndependentVoiceIntent({
        sessionToken: sessionState.sessionToken,
        deviceFingerprint,
        transcript: text,
      });

      setVoiceStatus(result.reply);
      setPendingDraft(
        result.draft && result.interactionId
          ? {
              interactionId: result.interactionId,
              draft: result.draft,
            }
          : null,
      );

      await speakText(result.reply, {
        lang: "en-GB",
        onStart: () => setVoiceState("speaking"),
        onEnd: () => setVoiceState("idle"),
        onError: () => setVoiceState("idle"),
      });
    } catch (error) {
      console.error(error);
      setVoiceState("idle");
      setVoiceError("Voice saving is unavailable right now. Please try again.");
    }
  };

  const confirmDraft = async () => {
    if (!sessionState?.sessionToken || !deviceFingerprint || !pendingDraft) {
      return;
    }

    setIsSavingDraft(true);
    setVoiceError(null);

    try {
      const result = await confirmIndependentVoiceDraft({
        sessionToken: sessionState.sessionToken,
        deviceFingerprint,
        interactionId: pendingDraft.interactionId,
        intent: pendingDraft.draft.intent,
        title: pendingDraft.draft.title,
        description: pendingDraft.draft.description,
        date: pendingDraft.draft.date ?? undefined,
        timeLabel: pendingDraft.draft.timeLabel ?? undefined,
        timeMinutes: pendingDraft.draft.timeMinutes ?? undefined,
        daysOfWeek:
          pendingDraft.draft.intent === "routine"
            ? pendingDraft.draft.daysOfWeek
            : undefined,
      });

      const successMessage =
        result.savedEntityType === "memory"
          ? `Saved "${pendingDraft.draft.title}" to your Circle.`
          : `Created "${pendingDraft.draft.title}" in your Circle.`;

      setPendingDraft(null);
      setVoiceStatus(successMessage);
      setVoiceState("processing");
      await speakText(successMessage, {
        lang: "en-GB",
        onStart: () => setVoiceState("speaking"),
        onEnd: () => setVoiceState("idle"),
        onError: () => setVoiceState("idle"),
      });
    } catch (error) {
      console.error(error);
      setVoiceState("idle");
      setVoiceError("That item could not be saved. Please try again.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const rejectDraft = async () => {
    if (!sessionState?.sessionToken || !deviceFingerprint || !pendingDraft) {
      return;
    }

    setIsSavingDraft(true);
    try {
      await rejectIndependentVoiceDraft({
        sessionToken: sessionState.sessionToken,
        deviceFingerprint,
        interactionId: pendingDraft.interactionId,
      });

      setPendingDraft(null);
      setVoiceStatus("No problem. Say hello, ask a question, or tell me what you want to remember.");
      setVoiceError(null);
    } catch (error) {
      console.error(error);
      setVoiceError("This draft could not be cleared right now. Please try again.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  if (!deviceFingerprint) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5fa]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#6B21A8]/20 border-t-[#6B21A8]" />
      </main>
    );
  }

  if (!sessionState?.sessionToken) {
    return <IndependentRecoveryState deviceFingerprint={deviceFingerprint} />;
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
        <div className="mb-8 flex items-center justify-between gap-4">
          <BrandLogo className="mb-0" />
          <Link
            href="/independent/security"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[#24005b]/15 bg-white px-5 text-base font-semibold text-[#24005b] shadow-sm"
          >
            Security
          </Link>
        </div>

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

          {pendingDraft ? (
            <div className="mt-6 rounded-[32px] bg-white p-6 shadow-md md:p-8">
              <p className="mb-2 text-lg font-bold uppercase tracking-[0.18em] text-slate-500">
                Confirm This Save
              </p>
              <h2 className="font-headline text-3xl font-bold text-slate-900">
                {pendingDraft.draft.intent === "memory" ? "Log a Memory" : "Create a Routine"}
              </h2>
              <div className="mt-4 space-y-3 text-left text-xl leading-relaxed text-slate-700">
                <p>
                  <span className="font-bold text-slate-900">Title:</span>{" "}
                  {pendingDraft.draft.title}
                </p>
                <p>
                  <span className="font-bold text-slate-900">Details:</span>{" "}
                  {pendingDraft.draft.description}
                </p>
                {pendingDraft.draft.timeLabel ? (
                  <p>
                    <span className="font-bold text-slate-900">Time:</span>{" "}
                    {pendingDraft.draft.timeLabel}
                  </p>
                ) : null}
                {pendingDraft.draft.date ? (
                  <p>
                    <span className="font-bold text-slate-900">Date:</span>{" "}
                    {formatDraftDate(pendingDraft.draft.date)}
                  </p>
                ) : null}
                {pendingDraft.draft.intent === "routine" ? (
                  <p>
                    <span className="font-bold text-slate-900">Schedule:</span>{" "}
                    {pendingDraft.draft.daysOfWeek.length > 0
                      ? formatDraftDays(pendingDraft.draft.daysOfWeek)
                      : pendingDraft.draft.date
                        ? "One time"
                        : "Needs a date or days"}
                  </p>
                ) : null}
              </div>

              <div className="mt-6 flex flex-col gap-4 md:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    void confirmDraft();
                  }}
                  disabled={isSavingDraft}
                  className="flex min-h-[72px] flex-1 items-center justify-center rounded-full bg-[#1D4ED8] px-8 text-2xl font-bold text-white shadow-md transition-transform active:scale-95 disabled:opacity-60"
                >
                  {isSavingDraft ? "Saving..." : "Yes, Save It"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void rejectDraft();
                  }}
                  disabled={isSavingDraft}
                  className="flex min-h-[72px] flex-1 items-center justify-center rounded-full bg-white px-8 text-2xl font-bold text-slate-900 shadow-md transition-transform active:scale-95 disabled:opacity-60"
                >
                  No, Try Again
                </button>
              </div>
            </div>
          ) : voiceStatus ? (
            <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-5 text-lg leading-relaxed text-blue-900">
              {voiceStatus}
            </div>
          ) : null}
        </div>
      </section>

      <section className="relative flex w-full flex-1 flex-col justify-center overflow-y-auto p-4 md:w-[60%] md:p-12">
        <MemoryGallery gallery={dashboard.gallery} />
      </section>

      <VoiceInputPill
        onSubmit={(text) => {
          void handleVoiceSubmit(text);
        }}
        voiceState={voiceState}
        statusMessage={pendingDraft ? "Review the confirmation card below." : null}
        errorMessage={voiceError}
      />
    </main>
  );
}
