import {
  ActivityHandling,
  EndSensitivity,
  Modality,
  StartSensitivity,
  TurnCoverage,
  type LiveConnectConfig,
} from "@google/genai";

export const DEFAULT_GEMINI_LIVE_MODEL = "gemini-3.1-flash-live-preview";

export function buildAssistedLiveConnectConfig(
  systemInstruction?: string,
): LiveConnectConfig {
  return {
    responseModalities: [Modality.TEXT],
    temperature: 0.3,
    maxOutputTokens: 180,
    inputAudioTranscription: {},
    sessionResumption: {},
    contextWindowCompression: {
      slidingWindow: {},
    },
    realtimeInputConfig: {
      activityHandling: ActivityHandling.START_OF_ACTIVITY_INTERRUPTS,
      turnCoverage: TurnCoverage.TURN_INCLUDES_ONLY_ACTIVITY,
      automaticActivityDetection: {
        disabled: false,
        startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_HIGH,
        endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
        prefixPaddingMs: 180,
        silenceDurationMs: 900,
      },
    },
    ...(systemInstruction ? { systemInstruction } : {}),
  };
}
