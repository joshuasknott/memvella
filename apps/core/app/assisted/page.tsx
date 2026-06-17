"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@memvella/backend/dataModel";
import { Mic } from "lucide-react";
import { BrandLogo } from "@memvella/ui";
import { MemoryGallery } from "@/components/shared-senior/MemoryGallery";
import { VoiceModal } from "@/components/shared-senior/VoiceModal";
import { api } from "@memvella/backend";
import { stopSpeaking } from "@/lib/browser-speech";
import { useAssistedLiveVoice } from "@/lib/use-assisted-live-voice";
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
    <main
      className="flex min-h-screen items-center justify-center bg-[#f8f5fa] p-6"
      data-testid="assisted-recovery-state"
    >
      <div className="w-full max-w-xl rounded-[32px] bg-white p-8 text-center shadow-lg">
        <h1 className="mb-3 font-headline text-3xl font-bold text-text-primary">
          Tablet code expired.
        </h1>
        <p className="mb-6 text-xl leading-relaxed text-text-secondary">
          This companion tablet needs a fresh 6-digit tablet code from a Supporter.
        </p>
        <a
          href="/assisted/login"
          data-testid="assisted-recovery-cta"
          className="inline-flex min-h-[72px] items-center justify-center rounded-full bg-senior-primary px-8 text-xl font-semibold text-white shadow-md"
        >
          Reconnect tablet
        </a>
      </div>
    </main>
  );
}

function buildSoftCheckInInstruction(
  seniorName: string,
  title: string,
  timeLabel: string,
  aiInstructions: string | null,
) {
  return [
    `Perform one soft double-tap routine check-in for ${seniorName}.`,
    `The routine was "${title}" at ${timeLabel} and it was ignored for 15 minutes.`,
    aiInstructions ? `Context: ${aiInstructions}` : null,
    "Speak directly to the senior in one short sentence.",
    "Keep the tone calm, familiar, and non-judgmental.",
    "Invite a very simple yes or no response.",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function AssistedHomePage() {
  const now = useLiveClock();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [activeCheckInId, setActiveCheckInId] = useState<Id<"routineCheckIns"> | null>(null);
  const { dashboard, deviceFingerprint, sessionState, clearSession } =
    useSeniorDashboardSession("assisted");
  const logAssistedLiveTurn = useMutation(api.liveVoice.logAssistedLiveTurn);
  const markRoutineCheckInPrompted = useMutation(
    api.routines.markRoutineCheckInPrompted,
  );
  const resolveRoutineCheckIn = useMutation(api.routines.resolveRoutineCheckIn);
  const readyRoutineCheckIns = useQuery(
    api.routines.listReadyRoutineCheckIns,
    sessionState?.sessionToken && deviceFingerprint
      ? {
          sessionToken: sessionState.sessionToken,
          deviceFingerprint,
        }
      : "skip",
  );
  const {
    closeSession: closeLiveSession,
    error: voiceError,
    isConnecting,
    isListening,
    lastReply,
    lastTranscript,
    liveTranscript,
    sendSoftCheckIn,
    setError: setVoiceError,
    voiceState,
  } = useAssistedLiveVoice({
    sessionToken: sessionState?.sessionToken,
    deviceFingerprint,
    isActive: isVoiceModalOpen,
    onTurnComplete: async (turn) => {
      if (!sessionState?.sessionToken || !deviceFingerprint) {
        return;
      }

      if (turn.kind === "soft_check_in_prompt") {
        await markRoutineCheckInPrompted({
          sessionToken: sessionState.sessionToken,
          deviceFingerprint,
          checkInId: turn.checkInId,
          promptText: turn.reply || "Just checking in with you now.",
        });
        return;
      }

      if (!turn.transcript.trim() || !turn.reply.trim()) {
        return;
      }

      const interactionId = await logAssistedLiveTurn({
        sessionToken: sessionState.sessionToken,
        deviceFingerprint,
        transcript: turn.transcript,
        assistantResponse: turn.reply,
      });

      if (turn.kind === "soft_check_in_response") {
        await resolveRoutineCheckIn({
          sessionToken: sessionState.sessionToken,
          deviceFingerprint,
          checkInId: turn.checkInId,
          outcome: "confirmed",
          responseTranscript: turn.transcript,
          ...(interactionId ? { voiceInteractionId: interactionId } : {}),
        });
        setActiveCheckInId(null);
      }
    },
    onSoftCheckInTimeout: async (checkInId) => {
      if (!sessionState?.sessionToken || !deviceFingerprint) {
        return;
      }

      await resolveRoutineCheckIn({
        sessionToken: sessionState.sessionToken,
        deviceFingerprint,
        checkInId,
        outcome: "unconfirmed",
      });
      setActiveCheckInId(null);
    },
  });

  useEffect(() => {
    if (dashboard?.status === "invalid") {
      clearSession();
    }
  }, [clearSession, dashboard]);

  const closeVoiceModal = () => {
    stopSpeaking();
    if (activeCheckInId && sessionState?.sessionToken && deviceFingerprint) {
      void resolveRoutineCheckIn({
        sessionToken: sessionState.sessionToken,
        deviceFingerprint,
        checkInId: activeCheckInId,
        outcome: "unconfirmed",
      });
      setActiveCheckInId(null);
    }
    void closeLiveSession();
    setVoiceError(null);
    setIsVoiceModalOpen(false);
  };

  useEffect(() => {
    if (
      !readyRoutineCheckIns?.length ||
      !dashboard ||
      dashboard.status !== "active"
    ) {
      return;
    }

    const nextCheckIn = readyRoutineCheckIns[0];
    if (!nextCheckIn || activeCheckInId) {
      return;
    }

    if (!isVoiceModalOpen) {
      const openModalTimeout = window.setTimeout(() => {
        setIsVoiceModalOpen(true);
      }, 0);
      return () => window.clearTimeout(openModalTimeout);
    }

    if (isConnecting) {
      return;
    }

    const sent = sendSoftCheckIn(
      buildSoftCheckInInstruction(
        dashboard.seniorName,
        nextCheckIn.title,
        nextCheckIn.timeLabel,
        nextCheckIn.aiInstructions,
      ),
      nextCheckIn.id,
    );
    if (sent) {
      const setCheckInTimeout = window.setTimeout(() => {
        setActiveCheckInId(nextCheckIn.id);
      }, 0);
      return () => window.clearTimeout(setCheckInTimeout);
    }
  }, [
    activeCheckInId,
    dashboard,
    isConnecting,
    isVoiceModalOpen,
    readyRoutineCheckIns,
    sendSoftCheckIn,
  ]);

  if (!deviceFingerprint) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5fa]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-senior-primary/20 border-t-senior-primary" />
      </main>
    );
  }

  if (!sessionState?.sessionToken) {
    return <AssistedRecoveryState />;
  }

  if (!dashboard || dashboard.status === "invalid") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5fa]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-senior-primary/20 border-t-senior-primary" />
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
            <p className="mb-2 font-headline text-2xl font-semibold text-text-tertiary md:mb-4 md:text-5xl">
              {`${getGreeting(now)}, ${dashboard.seniorName}`}
            </p>
            <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tighter text-text-primary md:text-7xl">
              {formatTime(now)}
            </h1>
            <p className="mb-6 font-headline text-2xl font-bold text-text-primary md:mb-12 md:text-4xl">
              {`Today is ${formatDate(now)}`}
            </p>
          </div>

          {!hasRoutine ? (
            <div className="inline-block w-fit rounded-3xl border border-white/40 bg-white/70 px-8 py-6 shadow-sm">
              <p className="font-headline text-2xl font-bold leading-tight text-family-primary">
                No routines scheduled right now. Enjoy your day!
              </p>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[32px] border border-border border-l-12 border-l-secondary bg-surface-container-lowest p-6 shadow-md md:p-10">
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
            onClick={() => {
              setVoiceError(null);
              setIsVoiceModalOpen(true);
            }}
            className="block w-full rounded-full bg-senior-primary px-8 py-6 text-center shadow-xl transition-transform duration-200 hover:scale-[1.02] active:scale-95 md:w-auto md:px-10 md:py-8"
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

      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={closeVoiceModal}
        onRetry={() => {
          setVoiceError(null);
          setIsVoiceModalOpen(false);
          window.setTimeout(() => {
            setIsVoiceModalOpen(true);
          }, 100);
        }}
        isConnecting={isConnecting}
        isListening={isListening}
        isProcessing={voiceState === "processing"}
        isSpeaking={voiceState === "speaking"}
        liveTranscript={liveTranscript}
        lastTranscript={lastTranscript}
        lastReply={lastReply}
        errorMessage={voiceError}
      />
    </main>
  );
}
