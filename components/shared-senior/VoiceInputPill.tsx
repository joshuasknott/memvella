"use client";

import { useCallback, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

interface VoiceInputPillProps {
  onSubmit: (text: string) => void;
  isProcessing?: boolean;
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

export function VoiceInputPill({
  onSubmit,
  isProcessing = false,
}: VoiceInputPillProps) {
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop calls after the recording has already ended.
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsListening(false);
  }, []);

  const startRecording = useCallback(async () => {
    window.speechSynthesis?.cancel();
    setInputValue("");
    setIsListening(true);

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const speechWindow = window as SpeechWindow;
      const RecognitionApi =
        speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

      if (!RecognitionApi) {
        alert("Voice recognition is not supported in this browser. Please type instead.");
        setIsListening(false);
        return;
      }

      const recognition = new RecognitionApi();
      recognitionRef.current = recognition;
      recognition.lang = "en-US";
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
        if (finalCaptured) {
          onSubmit(finalCaptured);
          setInputValue("");
        }
      };

      recognition.start();
    } catch (error) {
      console.error(error);
      alert("Microphone access was denied. Please type instead.");
      setIsListening(false);
    }
  }, [onSubmit, stopRecording]);

  const toggleRecording = () => {
    if (isListening) {
      stopRecording();
    } else if (!isProcessing) {
      void startRecording();
    }
  };

  const handleTextInputSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue.trim()) {
      return;
    }

    onSubmit(inputValue);
    setInputValue("");
  };

  return (
    <form
      onSubmit={handleTextInputSubmit}
      className="absolute bottom-12 z-10 flex w-full justify-center px-6 animate-in slide-in-from-bottom-8 duration-700"
    >
      <div className="mx-auto flex w-full max-w-2xl items-center rounded-full border border-gray-100 bg-white p-2 pr-3 shadow-lg transition-all focus-within:ring-4 focus-within:ring-[#4e0078]/10">
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          disabled={isListening || isProcessing}
          placeholder={isListening ? "Listening..." : "Type or speak..."}
          className="min-w-0 flex-1 bg-transparent px-6 text-xl text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-70"
        />

        {inputValue.trim() && !isListening ? (
          <button
            type="submit"
            className="mr-2 shrink-0 rounded-xl bg-surface-container px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-highest"
          >
            Press Enter
          </button>
        ) : null}

        <button
          type="button"
          onClick={toggleRecording}
          disabled={isProcessing}
          className={`flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
            isListening
              ? "scale-105 bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              : "bg-[#6B21A8] text-white shadow-md active:scale-95"
          }`}
        >
          {isListening ? (
            <MicOff className="h-6 w-6" strokeWidth={2.5} />
          ) : (
            <Mic className="h-6 w-6" strokeWidth={2.5} />
          )}
        </button>
      </div>
    </form>
  );
}
