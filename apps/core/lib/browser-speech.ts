"use client";

export type VoiceUiState = "idle" | "processing" | "speaking";

export interface BrowserSpeechRecognitionResultLike {
  0: {
    transcript: string;
  };
  isFinal?: boolean;
}

export interface BrowserSpeechRecognitionEventLike {
  resultIndex?: number;
  results: ArrayLike<BrowserSpeechRecognitionResultLike>;
}

export interface BrowserSpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
  stop?: () => void;
}

export type BrowserSpeechRecognitionCtor =
  new () => BrowserSpeechRecognitionInstance;

type MemvellaBrowserSpeechTestControls = {
  speechRecognitionCtor?: BrowserSpeechRecognitionCtor;
  disableSpeechRecognition?: boolean;
  instantSpeechSynthesis?: boolean;
};

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionCtor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionCtor;
    __MEMVELLA_TEST_MODE__?: boolean;
    __memvellaTestSpeech?: MemvellaBrowserSpeechTestControls;
  }
}

type SpeakTextOptions = {
  lang?: string;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
};

export function isMemvellaBrowserTestMode() {
  return (
    process.env.NEXT_PUBLIC_MEMVELLA_TEST_MODE === "1" ||
    window.__MEMVELLA_TEST_MODE__ === true
  );
}

export function resolveSpeechRecognitionCtor() {
  if (window.__memvellaTestSpeech?.disableSpeechRecognition) {
    return null;
  }

  if (window.__memvellaTestSpeech?.speechRecognitionCtor) {
    return window.__memvellaTestSpeech.speechRecognitionCtor;
  }

  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function shouldUseInstantSpeechSynthesis() {
  return (
    window.__memvellaTestSpeech?.instantSpeechSynthesis === true ||
    isMemvellaBrowserTestMode()
  );
}

let cancelActiveSpeech: (() => void) | null = null;

export function stopSpeaking() {
  // Some engines omit end/error for queued utterances cancelled before start.
  // Detach callbacks before cancelling, then settle our own promise.
  if (cancelActiveSpeech) cancelActiveSpeech();
  else window.speechSynthesis?.cancel();
}

export async function speakText(
  text: string,
  options: SpeakTextOptions = {},
) {
  if (!text.trim()) {
    options.onEnd?.();
    return;
  }

  if (shouldUseInstantSpeechSynthesis()) {
    options.onStart?.();
    options.onEnd?.();
    return;
  }

  if (!window.speechSynthesis) {
    options.onEnd?.();
    return;
  }

  stopSpeaking();

  await new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    let settled = false;
    const finish = (failed: boolean) => {
      if (settled) return;
      settled = true;
      utterance.onstart = null;
      utterance.onend = null;
      utterance.onerror = null;
      if (cancelActiveSpeech === cancel) cancelActiveSpeech = null;
      resolve();
      if (failed) options.onError?.();
      else options.onEnd?.();
    };
    const cancel = () => {
      utterance.onstart = null;
      utterance.onend = null;
      utterance.onerror = null;
      // Cancel before onEnd: that callback may start the next utterance.
      try { window.speechSynthesis?.cancel(); }
      finally { finish(false); }
    };
    cancelActiveSpeech = cancel;
    utterance.lang = options.lang ?? "en-GB";
    utterance.rate = options.rate ?? 1;
    utterance.onstart = () => {
      options.onStart?.();
    };
    utterance.onend = () => {
      finish(false);
    };
    utterance.onerror = () => {
      finish(true);
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      finish(true);
    }
  });
}
