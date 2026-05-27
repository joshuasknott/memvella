"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import type { VoiceUiState } from "@/lib/browser-speech";
import {
  isMemvellaBrowserTestMode,
  resolveSpeechRecognitionCtor,
  type BrowserSpeechRecognitionEventLike,
  type BrowserSpeechRecognitionInstance,
} from "@/lib/browser-speech";

interface VoiceInputPillProps {
  onSubmit: (text: string) => void;
  voiceState?: VoiceUiState;
  statusMessage?: string | null;
  errorMessage?: string | null;
  onVoiceError?: (message: string) => void;
}

function resolvePlaceholder(isListening: boolean, voiceState: VoiceUiState) {
  if (isListening) {
    return "Listening...";
  }

  if (voiceState === "processing") {
    return "Processing your request...";
  }

  if (voiceState === "speaking") {
    return "Speaking...";
  }

  return "Say hello, ask a question, or log a memory...";
}

export function VoiceInputPill({
  onSubmit,
  voiceState = "idle",
  statusMessage,
  errorMessage,
  onVoiceError,
}: VoiceInputPillProps) {
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<BrowserSpeechRecognitionInstance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stopIntentRef = useRef<"none" | "user-stop" | "teardown">("none");
  const startRequestIdRef = useRef(0);
  const isStartPendingRef = useRef(false);
  const isMountedRef = useRef(true);
  const isBusy = isListening || voiceState !== "idle";

  const releaseStream = useCallback((stream?: MediaStream | null) => {
    if (!stream) {
      return;
    }

    stream.getTracks().forEach((track) => track.stop());
  }, []);

  const cleanupAfterStop = useCallback(() => {
    releaseStream(streamRef.current);
    streamRef.current = null;
    recognitionRef.current = null;

    if (isMountedRef.current) {
      setIsListening(false);
    }
  }, [releaseStream]);

  const stopRecording = useCallback((intent: "user-stop" | "teardown" = "user-stop") => {
    startRequestIdRef.current += 1;
    isStartPendingRef.current = false;
    stopIntentRef.current = intent;

    const recognition = recognitionRef.current;
    if (!recognition) {
      cleanupAfterStop();
      return;
    }

    if (intent === "teardown") {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    }

    try {
      if (intent === "teardown" && typeof recognition.abort === "function") {
        recognition.abort();
      } else {
        recognition.stop?.();
      }
    } catch {
      cleanupAfterStop();
      return;
    }

    if (intent === "teardown") {
      cleanupAfterStop();
    }
  }, [cleanupAfterStop]);

  const startRecording = useCallback(async () => {
    if (voiceState !== "idle" || isListening || isStartPendingRef.current) {
      return;
    }

    const RecognitionApi = resolveSpeechRecognitionCtor();

    if (!RecognitionApi) {
      onVoiceError?.("Voice recognition is not available in this browser. Please type instead.");
      return;
    }

    setInputValue("");
    setIsListening(true);
    stopIntentRef.current = "none";
    isStartPendingRef.current = true;

    const startRequestId = startRequestIdRef.current + 1;
    startRequestIdRef.current = startRequestId;

    try {
      const shouldSkipMicrophoneAccess = isMemvellaBrowserTestMode();
      const mediaStream = shouldSkipMicrophoneAccess
        ? null
        : await navigator.mediaDevices.getUserMedia({ audio: true });

      if (
        startRequestId !== startRequestIdRef.current ||
        stopIntentRef.current !== "none" ||
        !isMountedRef.current
      ) {
        releaseStream(mediaStream);
        isStartPendingRef.current = false;
        if (isMountedRef.current) {
          setIsListening(false);
        }
        return;
      }

      streamRef.current = mediaStream;

      const recognition = new RecognitionApi();
      recognitionRef.current = recognition;
      recognition.lang = "en-GB";
      recognition.interimResults = true;
      recognition.continuous = false;

      let finalCaptured = "";

      recognition.onresult = (event: BrowserSpeechRecognitionEventLike) => {
        const currentTranscript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        if (isMountedRef.current) {
          setInputValue(currentTranscript);
        }
        finalCaptured = currentTranscript;
      };

      recognition.onerror = (event) => {
        const wasIntentionalStop = stopIntentRef.current !== "none";
        const isExpectedStopError =
          event.error === "aborted" || event.error === "no-speech";

        if (!wasIntentionalStop && !isExpectedStopError) {
          console.error("Speech recognition error:", event.error);
          onVoiceError?.("Mic error. Please try again or type instead.");
        }

        if (!wasIntentionalStop && !isExpectedStopError) {
          stopIntentRef.current = "teardown";
          cleanupAfterStop();
        }
      };

      recognition.onend = () => {
        const captured = finalCaptured.trim();
        const stopIntent = stopIntentRef.current;

        cleanupAfterStop();
        stopIntentRef.current = "none";

        if (captured && stopIntent !== "teardown") {
          onSubmit(captured);
          if (isMountedRef.current) {
            setInputValue("");
          }
        }
      };

      isStartPendingRef.current = false;
      recognition.start();
    } catch (error) {
      console.error(error);
      onVoiceError?.("Microphone access is blocked. Please type instead.");
      cleanupAfterStop();
      stopIntentRef.current = "none";
      isStartPendingRef.current = false;
    }
  }, [cleanupAfterStop, isListening, onSubmit, releaseStream, voiceState]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopRecording("teardown");
    };
  }, [stopRecording]);

  const handleTextInputSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue.trim() || isBusy) {
      return;
    }

    onSubmit(inputValue.trim());
    setInputValue("");
  };

  return (
    <div className="absolute bottom-6 z-10 flex w-full justify-center px-4 md:bottom-10 md:px-6">
      <div className="w-full max-w-3xl">
        {errorMessage ? (
          <div className="mb-4 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-lg font-medium text-red-900 shadow-sm">
            {errorMessage}
          </div>
        ) : statusMessage ? (
          <div className="mb-4 rounded-3xl border border-family-accent/15 bg-family-accent/10 px-5 py-4 text-lg font-medium text-family-accent shadow-sm">
            {statusMessage}
          </div>
        ) : null}

        <form
          onSubmit={handleTextInputSubmit}
          className="animate-in slide-in-from-bottom-8 duration-700"
        >
          <div className="mx-auto flex w-full items-center rounded-[40px] border border-gray-200 bg-white p-3 shadow-xl">
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              disabled={isBusy}
              placeholder={resolvePlaceholder(isListening, voiceState)}
              className="min-w-0 flex-1 bg-transparent px-5 text-xl text-gray-900 outline-none placeholder:text-gray-400 disabled:opacity-70 md:px-6 md:text-2xl"
            />

            {inputValue.trim() && !isListening && voiceState === "idle" ? (
              <button
                type="submit"
                className="mr-3 min-h-[56px] shrink-0 rounded-full bg-family-accent px-5 text-lg font-bold text-white shadow-sm transition-transform active:scale-95"
              >
                Save
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  stopRecording();
                } else if (voiceState === "idle") {
                  void startRecording();
                }
              }}
              disabled={voiceState !== "idle"}
              className={`flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                isListening
                  ? "scale-105 bg-red-500 text-white shadow-[0_0_18px_rgba(239,68,68,0.35)]"
                  : "bg-senior-primary text-white shadow-md active:scale-95"
              } ${voiceState !== "idle" && !isListening ? "opacity-60" : ""}`}
            >
              {isListening ? (
                <MicOff className="h-7 w-7" strokeWidth={2.5} />
              ) : (
                <Mic className="h-7 w-7" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
