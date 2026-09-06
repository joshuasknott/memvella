"use client";

import { LoaderCircle, Mic, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  isConnecting?: boolean;
  isConnected?: boolean;
  textMode?: boolean;
  manualTurns?: boolean;
  onSendText?: (text: string) => boolean;
  liveReply?: string;
  isListening?: boolean;
  isMicrophonePaused?: boolean;
  onPauseMicrophone?: (paused: boolean) => void;
  onReadReply?: (slower: boolean) => void;
  onStopReply?: () => void;
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
  isConnected = false,
  textMode = false,
  manualTurns = false,
  onSendText,
  liveReply,
  isListening = false,
  isMicrophonePaused = false,
  onPauseMicrophone,
  onReadReply,
  onStopReply,
  isProcessing = false,
  isSpeaking = false,
  liveTranscript,
  lastTranscript,
  lastReply,
  errorMessage,
}: VoiceModalProps) {
  const combinedError = errorMessage;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-label={textMode ? "Text conversation" : "Voice conversation"}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none items-center justify-center bg-transparent p-4 backdrop:bg-surface-inverse/40 open:flex"
    >
      <div
        className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[40px] bg-surface text-center shadow-2xl"
      >
        <div className="min-h-0 w-full overflow-y-auto px-6 py-8 md:px-10 md:py-10">
        <h2 role="status" aria-live="polite" aria-atomic="true" className="font-senior text-4xl font-bold text-text-primary md:text-5xl">
          {isMicrophonePaused && !isSpeaking && !isProcessing && !combinedError ? "Microphone paused" : <VoiceStateHeadline
            isConnecting={isConnecting}
            isListening={isListening}
            isProcessing={isProcessing}
            isSpeaking={isSpeaking}
            hasError={Boolean(combinedError)}
          />}
        </h2>

        <p role={combinedError ? "alert" : undefined} className="mt-3 max-w-xl font-senior text-2xl leading-relaxed text-text-secondary">
          {combinedError
            ? combinedError
            : isConnecting
              ? "Just a moment. We’re getting ready."
              : isSpeaking
                ? "Take your time. You can speak when you’re ready."
                : isProcessing
                  ? "Memvella is preparing a reply for you."
                  : manualTurns ? (isMicrophonePaused ? "Tap Start speaking when you’re ready." : "Take your time. Tap I’m finished when you want a reply.")
                  : isMicrophonePaused ? "Your microphone is off. Resume it when you’re ready to speak."
                  : textMode ? "Write your message below. Take as much time as you need."
                  : "Speak naturally and Memvella will reply aloud."}
        </p>

        {!textMode ? <div aria-hidden="true" className="relative mx-auto mt-6 flex h-32 w-32 shrink-0 items-center justify-center">
          <div
            className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full md:h-32 md:w-32 ${
              combinedError
                ? "bg-status-alert text-white"
                : isSpeaking
                  ? "bg-family-accent text-white"
                  : isProcessing
                    ? "bg-family-accent text-white"
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
        </div> : null}

        {(liveTranscript || lastTranscript || lastReply || liveReply) ? (
          <div className="mt-6 w-full space-y-4 text-left">
            {liveTranscript || lastTranscript ? (
              <div>
                <p className="mb-2 text-lg font-bold uppercase tracking-[0.18em] text-text-tertiary">
                  You Said
                </p>
                <p className="font-senior text-2xl leading-relaxed text-text-primary">
                  {liveTranscript || lastTranscript}
                </p>
              </div>
            ) : null}

            {liveReply || lastReply ? (
              <div>
                <p className="mb-2 text-lg font-bold uppercase tracking-[0.18em] text-text-tertiary">
                  Memvella
                </p>
                <p className="font-senior text-2xl leading-relaxed text-text-primary">
                  {liveReply || lastReply}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
        <p className="sr-only" aria-live="polite" aria-atomic="true">{lastReply}</p>
        {lastReply ? (
          <details className="mt-6 w-full text-left font-senior text-xl text-text-primary">
            <summary className="min-h-[72px] cursor-pointer rounded-2xl border border-input-border p-5 font-bold">Listen to this reply</summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button type="button" disabled={isProcessing} onClick={() => onReadReply?.(false)} className="min-h-[72px] rounded-2xl border border-input-border p-4 disabled:opacity-50">Read aloud</button>
              <button type="button" disabled={isProcessing} onClick={() => onReadReply?.(true)} className="min-h-[72px] rounded-2xl border border-input-border p-4 disabled:opacity-50">Read more slowly</button>
              <button type="button" onClick={onStopReply} className="min-h-[72px] rounded-2xl border border-input-border p-4">Stop reading</button>
            </div>
          </details>
        ) : null}
        {!textMode && isConnected && !combinedError ? (
          <button type="button" aria-pressed={manualTurns ? !isMicrophonePaused : isMicrophonePaused} disabled={manualTurns && isProcessing} onClick={() => onPauseMicrophone?.(!isMicrophonePaused)}
            className="mt-4 min-h-[72px] w-full rounded-full border-2 border-input-border px-6 py-4 font-senior text-2xl font-bold text-text-primary">
            {manualTurns ? (isMicrophonePaused ? "Start speaking" : "I’m finished") : (isMicrophonePaused ? "Resume microphone" : "Pause microphone")}
          </button>
        ) : null}
        {textMode && !combinedError ? (
          <form className="mt-6 w-full text-left" onSubmit={(event) => {
            event.preventDefault();
            if (onSendText?.(draft)) setDraft("");
          }}>
            <label htmlFor="companion-message" className="mb-2 block font-senior text-2xl font-bold">Your message</label>
            <textarea id="companion-message" value={draft} onChange={(event) => setDraft(event.target.value)} rows={3}
              className="w-full rounded-2xl border-2 border-input-border bg-white p-4 font-senior text-2xl text-text-primary" />
            <button type="submit" disabled={!isConnected || isProcessing || !draft.trim()}
              className="mt-3 min-h-[72px] w-full rounded-full bg-senior-primary px-6 py-4 font-senior text-2xl font-bold text-white disabled:opacity-50">Send message</button>
          </form>
        ) : null}

        {combinedError ? (
          <div className="mt-10 flex w-full flex-col gap-4 md:flex-row">
            <button
              type="button"
              onClick={() => {
                onRetry?.();
              }}
              className="flex min-h-[72px] flex-1 items-center justify-center rounded-full bg-family-accent px-8 font-senior text-2xl font-bold text-white transition-transform active:scale-95"
            >
              Try again
            </button>
          </div>
        ) : null}
        </div>
        <div className="w-full shrink-0 border-t border-border bg-surface px-6 py-4 md:px-10">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[72px] w-full items-center justify-center rounded-full bg-senior-primary px-6 font-senior text-2xl font-bold text-white transition-transform active:scale-95"
          >
            {combinedError ? "Close" : "Close conversation"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
