"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle, Mic, MicOff, Volume2 } from "lucide-react";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  isProcessing?: boolean;
  isSpeaking?: boolean;
  lastTranscript?: string | null;
  lastReply?: string | null;
  errorMessage?: string | null;
}

interface SpeechRecognitionResultLike {
  0: {
    transcript: string;
  };
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface ISpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => ISpeechRecognition;
type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
};

function VoiceStateHeadline({
  isListening,
  isProcessing,
  isSpeaking,
  hasError,
}: {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  hasError: boolean;
}) {
  if (hasError) {
    return "Try Again";
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
  onSubmit,
  isProcessing = false,
  isSpeaking = false,
  lastTranscript,
  lastReply,
  errorMessage,
}: VoiceModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState("");

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const combinedError = errorMessage ?? localError;

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore repeat stop requests after recognition already ended.
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsListening(false);
  }, []);

  const startRecording = useCallback(async () => {
    setLocalError(null);
    setLiveTranscript("");
    setIsListening(true);

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const speechWindow = window as SpeechWindow;
      const RecognitionApi =
        speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

      if (!RecognitionApi) {
        setLocalError("Voice recognition is not available in this browser.");
        setIsListening(false);
        return;
      }

      const recognition = new RecognitionApi();
      recognitionRef.current = recognition;
      recognition.lang = "en-GB";
      recognition.interimResults = true;
      recognition.continuous = false;

      let finalCaptured = "";

      recognition.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setLiveTranscript(currentTranscript);
        finalCaptured = currentTranscript;
      };

      recognition.onend = () => {
        stopRecording();
        if (finalCaptured.trim()) {
          onSubmit(finalCaptured.trim());
          setLiveTranscript("");
          return;
        }

        setLocalError("I didn't hear anything. Tap listen again.");
      };

      recognition.start();
    } catch (error) {
      console.error(error);
      setLocalError("Microphone access is blocked on this device.");
      setIsListening(false);
    }
  }, [onSubmit, stopRecording]);

  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      setLocalError(null);
      setLiveTranscript("");
      return;
    }

    if (!isListening && !isProcessing && !isSpeaking && !combinedError) {
      void startRecording();
    }
  }, [combinedError, isListening, isOpen, isProcessing, isSpeaking, startRecording, stopRecording]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl flex-col items-center rounded-[40px] bg-[#FCFCF9] px-6 py-8 text-center shadow-2xl md:px-10 md:py-10">
        <h2 className="font-headline text-4xl font-bold text-slate-900 md:text-5xl">
          <VoiceStateHeadline
            isListening={isListening}
            isProcessing={isProcessing}
            isSpeaking={isSpeaking}
            hasError={Boolean(combinedError)}
          />
        </h2>

        <p className="mt-3 max-w-xl text-xl leading-relaxed text-slate-600 md:text-2xl">
          {combinedError
            ? combinedError
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
                setLocalError(null);
                void startRecording();
              }}
              className="flex min-h-[72px] flex-1 items-center justify-center rounded-full bg-[#1D4ED8] px-8 text-2xl font-bold text-white shadow-md transition-transform active:scale-95"
            >
              Listen Again
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
