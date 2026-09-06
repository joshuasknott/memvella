"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@memvella/ui";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@memvella/backend/dataModel";
import { Mic } from "lucide-react";

import { MemoryGallery } from "@/components/shared-senior/MemoryGallery";
import { VoiceModal } from "@/components/shared-senior/VoiceModal";
import { api } from "@memvella/backend";
import { stopSpeaking } from "@/lib/browser-speech";
import { useAssistedLiveVoice } from "@/lib/use-assisted-live-voice";
import { routineResponseOutcome } from "@/lib/routine-response";
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
  return date.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
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
      className="flex min-h-screen items-center justify-center bg-canvas p-6"
      data-testid="assisted-recovery-state"
    >
      <div className="w-full max-w-xl rounded-[32px] bg-white p-8 text-center shadow-lg">
        <h1 className="mb-3 font-headline text-3xl font-bold text-text-primary">
          Tablet code expired.
        </h1>
        <p className="mb-6 text-xl leading-relaxed text-text-secondary">
          This companion tablet needs a fresh 6-digit tablet code from a
          Supporter.
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
  const [conversationMode, setConversationMode] = useState<"voice" | "text">("voice");
  const [manualTurns, setManualTurns] = useState(false);
  const [activeCheckInId, setActiveCheckInId] =
    useState<Id<"routineCheckIns"> | null>(null);
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
    isConnected,
    isListening,
    isMicrophonePaused,
    pauseMicrophone,
    readReply,
    stopReply,
    lastReply,
    lastTranscript,
    liveTranscript,
    liveReply,
    sendText,
    sendSoftCheckIn,
    setError: setVoiceError,
    voiceState,
  } = useAssistedLiveVoice({
    sessionToken: sessionState?.sessionToken,
    deviceFingerprint,
    isActive: isVoiceModalOpen,
    microphoneEnabled: conversationMode === "voice",
    manualTurns: conversationMode === "voice" && manualTurns,
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
          outcome: routineResponseOutcome(turn.transcript),
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

    // Reminders stay on screen until the person chooses to talk.
    if (!isVoiceModalOpen) return;

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
      <main className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-senior-primary/20 border-t-senior-primary" />
      </main>
    );
  }

  if (!sessionState?.sessionToken) {
    return <AssistedRecoveryState />;
  }

  if (!dashboard || dashboard.status === "invalid") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-senior-primary/20 border-t-senior-primary" />
      </main>
    );
  }

  const dueReminder = readyRoutineCheckIns?.[0];
  const hasRoutine = !!dueReminder || dashboard.nextEvent.time !== null;

  return (
    <main className="companion-page">
      <section className="companion-orientation">
        <p className="circle-wordmark">
          <BrandLogo />
        </p>
        <div>
          <p className="companion-greeting">
            {getGreeting(now)}, {dashboard.seniorName}.
          </p>
          <h1>{formatTime(now)}</h1>
          <p className="companion-date">{formatDate(now)}</p>
          {hasRoutine ? (
            <div className="companion-next">
              <p>{dueReminder ? "A gentle reminder" : "Coming up"}</p>
              <h2>{dueReminder?.title ?? dashboard.nextEvent.title}</h2>
              <p>{dueReminder?.timeLabel ?? dashboard.nextEvent.time}</p>
            </div>
          ) : (
            <p className="companion-no-routine">
              Take the day at your own pace.
            </p>
          )}
        </div>
        <button
          type="button"
          className="companion-talk"
          onClick={() => {
            setVoiceError(null);
            setConversationMode("voice");
            setIsVoiceModalOpen(true);
          }}
        >
          <Mic size={32} aria-hidden="true" /> Tap to talk
        </button>
        <button
          type="button"
          className="min-h-[72px] rounded-full border-2 border-input-border bg-white px-6 py-4 font-senior text-2xl font-bold text-text-primary"
          onClick={() => {
            setVoiceError(null);
            setConversationMode("text");
            setIsVoiceModalOpen(true);
          }}
        >
          Type a message
        </button>
        <details className="font-senior text-xl text-text-primary">
          <summary className="min-h-[72px] cursor-pointer py-5">Conversation options</summary>
          <label className="flex min-h-[72px] items-start gap-3 rounded-2xl border border-input-border bg-white p-4">
            <input type="checkbox" checked={manualTurns} onChange={(event) => setManualTurns(event.target.checked)} className="mt-1 h-7 w-7 shrink-0" />
            <span>Wait until I tap “I’m finished” before replying.</span>
          </label>
        </details>
      </section>
      <section className="companion-gallery" aria-label="Your memories">
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
        isConnected={isConnected}
        textMode={conversationMode === "text"}
        manualTurns={conversationMode === "voice" && manualTurns}
        onSendText={sendText}
        isListening={isListening}
        isMicrophonePaused={isMicrophonePaused}
        onPauseMicrophone={pauseMicrophone}
        onReadReply={readReply}
        onStopReply={stopReply}
        isProcessing={voiceState === "processing"}
        isSpeaking={voiceState === "speaking"}
        liveTranscript={liveTranscript}
        liveReply={liveReply}
        lastTranscript={lastTranscript}
        lastReply={lastReply}
        errorMessage={voiceError}
      />
    </main>
  );
}
