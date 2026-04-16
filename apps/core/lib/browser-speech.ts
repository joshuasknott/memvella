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

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
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
    utterance.lang = options.lang ?? "en-GB";
    utterance.onstart = () => {
      options.onStart?.();
    };
    utterance.onend = () => {
      options.onEnd?.();
      resolve();
    };
    utterance.onerror = () => {
      options.onError?.();
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}
