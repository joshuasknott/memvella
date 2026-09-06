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
  manualTurns = false,
): LiveConnectConfig {
  return {
    responseModalities: [Modality.AUDIO],
    temperature: 0.3,
    inputAudioTranscription: {},
    outputAudioTranscription: {},
    sessionResumption: {},
    contextWindowCompression: {
      slidingWindow: {},
    },
    realtimeInputConfig: {
      activityHandling: ActivityHandling.START_OF_ACTIVITY_INTERRUPTS,
      turnCoverage: TurnCoverage.TURN_INCLUDES_ONLY_ACTIVITY,
      automaticActivityDetection: manualTurns ? { disabled: true } : {
        disabled: false,
        startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_HIGH,
        endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
        prefixPaddingMs: 180,
        silenceDurationMs: 2000,
      },
    },
    ...(systemInstruction ? { systemInstruction } : {}),
  };
}
