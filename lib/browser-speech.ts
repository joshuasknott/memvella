"use client";

export type VoiceUiState = "idle" | "processing" | "speaking";

type SpeakTextOptions = {
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
};

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
