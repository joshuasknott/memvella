"use client";

import { useEffect, useRef, useState } from "react";
import {
  resolveSpeechRecognitionCtor,
  type BrowserSpeechRecognitionInstance,
} from "./browser-speech";

type DictationSession = { stop: () => void; dispose: () => void };
type DictationState = "idle" | "starting" | "recording" | "stopping";

export function useMemoryDictation(
  onText: (text: string) => void,
  onError: (message: string) => void,
) {
  const session = useRef<DictationSession | null>(null);
  const callbacks = useRef({ onText, onError });
  useEffect(() => {
    callbacks.current = { onText, onError };
  }, [onText, onError]);
  const [state, setState] = useState<DictationState>("idle");

  useEffect(
    () => () => session.current?.dispose(),
    [],
  );

  function stop() {
    session.current?.stop();
  }

  function start(existingText: string) {
    if (session.current) return;
    const Recognition = resolveSpeechRecognitionCtor();
    if (!Recognition) {
      callbacks.current.onError(
        "Voice dictation is not supported in this browser. You can still type your memory.",
      );
      return;
    }
    let current: BrowserSpeechRecognitionInstance;
    try {
      current = new Recognition();
    } catch {
      callbacks.current.onError(
        "The microphone couldn’t start. Please try again, or type your memory.",
      );
      return;
    }
    let started = false;
    let stopping = false;
    let stopTimeout: ReturnType<typeof setTimeout> | undefined;

    function finish(abort = false, updateState = true) {
      if (session.current !== activeSession) return;
      session.current = null;
      clearTimeout(stopTimeout);
      // Detach before aborting: some browsers deliver cancellation events late.
      current.onstart = current.onresult = current.onerror = current.onend = null;
      if (abort) {
        try {
          current.abort();
        } catch {
          /* Already stopped. */
        }
      }
      if (updateState) setState("idle");
    }

    const activeSession: DictationSession = {
      dispose: () => finish(true, false),
      stop: () => {
        if (session.current !== activeSession || stopping) return;
        if (!started || !current.stop) {
          finish(true);
          return;
        }
        stopping = true;
        setState("stopping");
        // Allow a final result, but never leave the editor locked waiting for end.
        stopTimeout = setTimeout(() => finish(true), 2_000);
        try {
          current.stop();
        } catch {
          finish(true);
          callbacks.current.onError(
            "Dictation was interrupted. You can edit your words or try again.",
          );
        }
      },
    };
    session.current = activeSession;
    current.lang = "en-GB";
    current.continuous = true;
    current.interimResults = true;
    setState("starting");
    current.onstart = () => {
      if (session.current !== activeSession || stopping) return;
      started = true;
      setState("recording");
    };
    current.onresult = (event) => {
      if (session.current !== activeSession) return;
      // Results is the full session snapshot. Unchanged interim words before
      // resultIndex still belong to the story; withdrawn results must disappear.
      const dictatedText = Array.from(
        event.results,
        (result) => result[0]?.transcript ?? "",
      ).join("").trim();
      const separator = existingText && !/\s$/.test(existingText) ? " " : "";
      callbacks.current.onText(
        dictatedText ? existingText + separator + dictatedText : existingText,
      );
    };
    current.onerror = (event) => {
      if (session.current !== activeSession) return;
      finish(true);
      if (event.error !== "no-speech" && event.error !== "aborted") {
        callbacks.current.onError(
          event.error === "not-allowed" || event.error === "service-not-allowed"
            ? "Allow microphone access to dictate, or type your memory below."
            : "We couldn’t hear you. Try again, or type your memory below.",
        );
      }
    };
    current.onend = () => finish();
    try {
      current.start();
    } catch {
      if (session.current !== activeSession) return;
      finish(true);
      callbacks.current.onError(
        "The microphone couldn’t start. Please try again, or type your memory.",
      );
    }
  }
  return {
    isRecording: state === "recording",
    isStarting: state === "starting",
    isStopping: state === "stopping",
    isBusy: state !== "idle",
    start,
    stop,
  };
}
