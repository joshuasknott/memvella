"use client";

import { useCallback, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import type { VoiceUiState } from "@/lib/browser-speech";

interface VoiceInputPillProps {
  onSubmit: (text: string) => void;
  voiceState?: VoiceUiState;
  statusMessage?: string | null;
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
}: VoiceInputPillProps) {
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isBusy = isListening || voiceState !== "idle";

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore duplicate stop calls after recognition has already ended.
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsListening(false);
  }, []);

  const startRecording = useCallback(async () => {
    setInputValue("");
    setIsListening(true);

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const speechWindow = window as SpeechWindow;
      const RecognitionApi =
        speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

      if (!RecognitionApi) {
        alert("Voice recognition is not available in this browser. Please type instead.");
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
        setInputValue(currentTranscript);
        finalCaptured = currentTranscript;
      };

      recognition.onend = () => {
        stopRecording();
        if (finalCaptured.trim()) {
          onSubmit(finalCaptured.trim());
          setInputValue("");
        }
      };

      recognition.start();
    } catch (error) {
      console.error(error);
      alert("Microphone access is blocked. Please type instead.");
      setIsListening(false);
    }
  }, [onSubmit, stopRecording]);

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
          <div className="mb-4 rounded-3xl border border-blue-100 bg-blue-50 px-5 py-4 text-lg font-medium text-blue-900 shadow-sm">
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
                className="mr-3 min-h-[56px] shrink-0 rounded-full bg-[#1D4ED8] px-5 text-lg font-bold text-white shadow-sm transition-transform active:scale-95"
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
                  : "bg-[#6B21A8] text-white shadow-md active:scale-95"
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
