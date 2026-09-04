"use client";

import { useEffect, useRef, useState } from "react";
import {
  resolveSpeechRecognitionCtor,
  type BrowserSpeechRecognitionInstance,
} from "./browser-speech";

export function useMemoryDictation(
  onText: (text: string) => void,
  onError: (message: string) => void,
) {
  const recognition = useRef<BrowserSpeechRecognitionInstance | null>(null);
  const callbacks = useRef({ onText, onError });
  useEffect(() => {
    callbacks.current = { onText, onError };
  }, [onText, onError]);
  const [isRecording, setIsRecording] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(
    () => () => {
      const current = recognition.current;
      recognition.current = null;
      if (current) {
        current.onstart =
          current.onresult =
          current.onerror =
          current.onend =
            null;
        try {
          current.abort();
        } catch {
          /* Already stopped. */
        }
      }
    },
    [],
  );

  function stop() {
    const current = recognition.current;
    if (!current) return;
    try {
      if (current.stop) current.stop();
      else current.abort();
    } catch {
      callbacks.current.onError(
        "The microphone could not stop. Please try again.",
      );
    }
  }

  function start(existingText: string) {
    if (recognition.current) return;
    const Recognition = resolveSpeechRecognitionCtor();
    if (!Recognition) {
      callbacks.current.onError(
        "Voice dictation is not supported in this browser. You can still type your memory.",
      );
      return;
    }
    let finalText = existingText.trim() ? existingText.trim() + " " : "";
    let interimText = "";
    const current = new Recognition();
    recognition.current = current;
    current.lang = "en-GB";
    current.continuous = true;
    current.interimResults = true;
    setIsStarting(true);
    current.onstart = () => {
      setIsStarting(false);
      setIsRecording(true);
    };
    current.onresult = (event) => {
      interimText = "";
      for (let i = event.resultIndex ?? 0; i < event.results.length; i++) {
        const result = event.results[i];
        const chunk = result?.[0]?.transcript ?? "";
        if (result?.isFinal) finalText += chunk + " ";
        else interimText += chunk;
      }
      callbacks.current.onText((finalText + interimText).trim());
    };
    current.onerror = (event) => {
      setIsStarting(false);
      if (event.error !== "no-speech" && event.error !== "aborted") {
        callbacks.current.onError(
          event.error === "not-allowed"
            ? "Allow microphone access to dictate, or type your memory below."
            : "We couldn’t hear you. Try again, or type your memory below.",
        );
      }
    };
    current.onend = () => {
      callbacks.current.onText((finalText + interimText).trim());
      recognition.current = null;
      setIsRecording(false);
      setIsStarting(false);
    };
    try {
      current.start();
    } catch {
      recognition.current = null;
      setIsStarting(false);
      callbacks.current.onError(
        "The microphone couldn’t start. Please try again, or type your memory.",
      );
    }
  }
  return { isRecording, isStarting, start, stop };
}
