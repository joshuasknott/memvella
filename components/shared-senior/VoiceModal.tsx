"use client";

import { LoaderCircle, Mic, MicOff, Volume2 } from "lucide-react";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  isConnecting?: boolean;
  isListening?: boolean;
  isProcessing?: boolean;
  isSpeaking?: boolean;
  liveTranscript?: string | null;
  lastTranscript?: string | null;
  lastReply?: string | null;
  errorMessage?: string | null;
}

function VoiceStateHeadline({
  isConnecting,
  isListening,
  isProcessing,
  isSpeaking,
  hasError,
}: {
  isConnecting: boolean;
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  hasError: boolean;
}) {
  if (hasError) {
    return "Try Again";
  }

  if (isConnecting) {
    return "Connecting";
  }

  if (isSpeaking) {
    return "Speaking";
  }

  if (isProcessing) {
    return "Processing";
  }

  if (isListening) {
    return "Listening";
  }

  return "Ready";
}

export function VoiceModal({
  isOpen,
  onClose,
  onRetry,
  isConnecting = false,
  isListening = false,
  isProcessing = false,
  isSpeaking = false,
  liveTranscript,
  lastTranscript,
  lastReply,
  errorMessage,
}: VoiceModalProps) {
  const combinedError = errorMessage;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl flex-col items-center rounded-[40px] bg-[#FCFCF9] px-6 py-8 text-center shadow-2xl md:px-10 md:py-10">
        <h2 className="font-headline text-4xl font-bold text-slate-900 md:text-5xl">
          <VoiceStateHeadline
            isConnecting={isConnecting}
            isListening={isListening}
            isProcessing={isProcessing}
            isSpeaking={isSpeaking}
            hasError={Boolean(combinedError)}
          />
        </h2>

        <p className="mt-3 max-w-xl text-xl leading-relaxed text-slate-600 md:text-2xl">
          {combinedError
            ? combinedError
            : isConnecting
              ? "Memvella is opening the live voice loop."
            : isSpeaking
              ? "Memvella is speaking back now."
              : isProcessing
                ? "Memvella is preparing a reply from your FamilySpace."
                : "Speak naturally and Memvella will reply aloud."}
        </p>

        <div className="relative mt-10 flex h-48 w-48 items-center justify-center md:h-56 md:w-56">
          {isListening ? (
            <>
              <div className="absolute inset-0 rounded-full bg-[#6B21A8]/15 animate-ping" style={{ animationDuration: "1.8s" }} />
              <div className="absolute inset-4 rounded-full bg-[#6B21A8]/20 animate-pulse" />
            </>
          ) : null}

          <div
            className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full shadow-xl md:h-32 md:w-32 ${
              combinedError
                ? "bg-red-500 text-white"
                : isSpeaking
                  ? "bg-[#1D4ED8] text-white"
                  : isProcessing
                    ? "bg-slate-800 text-white"
                    : "bg-[#6B21A8] text-white"
            }`}
          >
            {isProcessing ? (
              <LoaderCircle className="h-12 w-12 animate-spin" strokeWidth={2.5} />
            ) : isSpeaking ? (
              <Volume2 className="h-12 w-12" strokeWidth={2.5} />
            ) : isListening ? (
              <MicOff className="h-12 w-12" strokeWidth={2.5} />
            ) : (
              <Mic className="h-12 w-12" strokeWidth={2.5} />
            )}
          </div>
        </div>

        {(liveTranscript || lastTranscript || lastReply) && !combinedError ? (
          <div className="mt-8 w-full space-y-4 rounded-[32px] bg-white p-6 text-left shadow-sm">
            {(liveTranscript || lastTranscript) ? (
              <div>
                <p className="mb-2 text-lg font-bold uppercase tracking-[0.18em] text-slate-500">
                  You Said
                </p>
                <p className="text-2xl leading-relaxed text-slate-900">
                  {liveTranscript || lastTranscript}
                </p>
              </div>
            ) : null}

            {lastReply ? (
              <div>
                <p className="mb-2 text-lg font-bold uppercase tracking-[0.18em] text-slate-500">
                  Memvella
                </p>
                <p className="text-2xl leading-relaxed text-slate-900">
                  {lastReply}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {combinedError ? (
          <div className="mt-10 flex w-full flex-col gap-4 md:flex-row">
            <button
              type="button"
              onClick={() => {
                onRetry?.();
              }}
              className="flex min-h-[72px] flex-1 items-center justify-center rounded-full bg-[#1D4ED8] px-8 text-2xl font-bold text-white shadow-md transition-transform active:scale-95"
            >
              Reconnect Voice
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[72px] flex-1 items-center justify-center rounded-full bg-white px-8 text-2xl font-bold text-slate-900 shadow-md transition-transform active:scale-95"
            >
              Close
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="mt-10 flex min-h-[72px] w-full items-center justify-center rounded-full bg-[#6B21A8] px-8 text-2xl font-bold text-white shadow-md transition-transform active:scale-95"
          >
            Stop Voice Loop
          </button>
        )}
      </div>
    </div>
  );
}
