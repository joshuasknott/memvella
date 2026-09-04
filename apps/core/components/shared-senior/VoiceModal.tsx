"use client";

import { LoaderCircle, Mic, Volume2 } from "lucide-react";
import { useEffect, useRef } from "react";

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
    return "Thinking";
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
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement;

    const panel = panelRef.current;
    if (panel) {
      const firstButton = panel.querySelector<HTMLElement>("button");
      firstButton?.focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panel) {
        return;
      }

      const focusable = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Voice conversation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div
        ref={panelRef}
        className="flex max-h-[90dvh] overflow-y-auto w-full max-w-2xl flex-col items-center rounded-[40px] bg-[#FCFCF9] px-6 py-8 text-center shadow-2xl md:px-10 md:py-10"
      >
        <h2 className="font-family text-4xl font-bold text-text-primary md:text-5xl">
          <VoiceStateHeadline
            isConnecting={isConnecting}
            isListening={isListening}
            isProcessing={isProcessing}
            isSpeaking={isSpeaking}
            hasError={Boolean(combinedError)}
          />
        </h2>

        <p className="mt-3 max-w-xl text-lg leading-relaxed text-text-secondary md:text-lg">
          {combinedError
            ? "We can’t connect right now. Try again in a moment, or close this to enjoy your memories."
            : isConnecting
              ? "Just a moment. We’re getting ready to listen."
              : isSpeaking
                ? "Take your time. You can speak when you’re ready."
                : isProcessing
                  ? "Memvella is preparing a reply for you."
                  : "Speak naturally and Memvella will reply aloud."}
        </p>

        <div className="relative mt-6 flex h-32 w-32 items-center justify-center">
          <div
            className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full shadow-xl md:h-32 md:w-32 ${
              combinedError
                ? "bg-red-500 text-white"
                : isSpeaking
                  ? "bg-family-accent text-white"
                  : isProcessing
                    ? "bg-surface-inverse text-white"
                    : "bg-senior-primary text-white"
            }`}
          >
            {isProcessing ? (
              <LoaderCircle
                className="h-12 w-12 animate-spin"
                strokeWidth={2.5}
              />
            ) : isSpeaking ? (
              <Volume2 className="h-12 w-12" strokeWidth={2.5} />
            ) : isListening ? (
              <Mic className="h-12 w-12" strokeWidth={2.5} />
            ) : (
              <Mic className="h-12 w-12" strokeWidth={2.5} />
            )}
          </div>
        </div>

        {(liveTranscript || lastTranscript || lastReply) && !combinedError ? (
          <div className="mt-8 w-full space-y-4 rounded-[32px] bg-surface p-6 text-left shadow-sm">
            {liveTranscript || lastTranscript ? (
              <div>
                <p className="mb-2 text-lg font-bold uppercase tracking-[0.18em] text-text-tertiary">
                  You Said
                </p>
                <p className="text-lg leading-relaxed text-text-primary">
                  {liveTranscript || lastTranscript}
                </p>
              </div>
            ) : null}

            {lastReply ? (
              <div>
                <p className="mb-2 text-lg font-bold uppercase tracking-[0.18em] text-text-tertiary">
                  Memvella
                </p>
                <p className="text-lg leading-relaxed text-text-primary">
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
              className="flex min-h-[72px] flex-1 items-center justify-center rounded-full bg-family-accent px-8 text-lg font-bold text-white shadow-md transition-transform active:scale-95"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[72px] flex-1 items-center justify-center rounded-full bg-surface px-8 text-lg font-bold text-text-primary shadow-md transition-transform active:scale-95"
            >
              Close
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="mt-10 flex min-h-[72px] w-full items-center justify-center rounded-full bg-senior-primary px-8 text-lg font-bold text-white shadow-md transition-transform active:scale-95"
          >
            Stop Voice Loop
          </button>
        )}
      </div>
    </div>
  );
}
