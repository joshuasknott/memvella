"use client";

import {
  GoogleGenAI,
  type LiveServerMessage,
  type Session,
  VoiceActivityType,
} from "@google/genai";
import { useEffect, useRef, useState } from "react";
import type { Id } from "@memvella/backend/dataModel";
import { buildAssistedLiveConnectConfig } from "@/lib/gemini-live-config";
import {
  isMemvellaBrowserTestMode,
  speakText,
  stopSpeaking,
  type VoiceUiState,
} from "@/lib/browser-speech";

type CompletedLiveTurn =
  | {
      kind: "conversation";
      transcript: string;
      reply: string;
      checkInId: null;
    }
  | {
      kind: "soft_check_in_prompt";
      transcript: string;
      reply: string;
      checkInId: Id<"routineCheckIns">;
    }
  | {
      kind: "soft_check_in_response";
      transcript: string;
      reply: string;
      checkInId: Id<"routineCheckIns">;
    };

type LiveVoiceOptions = {
  sessionToken: string | null | undefined;
  deviceFingerprint: string | null | undefined;
  isActive: boolean;
  onTurnComplete?: (turn: CompletedLiveTurn) => Promise<void> | void;
  onSoftCheckInTimeout?: (checkInId: Id<"routineCheckIns">) => Promise<void> | void;
};

type PendingTurnContext =
  | { kind: "conversation"; checkInId: null }
  | { kind: "soft_check_in_prompt"; checkInId: Id<"routineCheckIns"> }
  | { kind: "soft_check_in_response"; checkInId: Id<"routineCheckIns"> };

type MemvellaTestLiveVoiceControls = {
  connectError?: string;
  softCheckInPromptReply?: string;
  softCheckInResponseTranscript?: string;
  softCheckInResponseReply?: string;
};

declare global {
  interface Window {
    __memvellaTestLiveVoice?: MemvellaTestLiveVoiceControls;
  }
}

const CHECK_IN_RESPONSE_TIMEOUT_MS = 30 * 1000;

function getMemvellaTestLiveVoiceControls() {
  return window.__memvellaTestLiveVoice ?? {};
}

function downsampleToPcm16(
  input: Float32Array,
  inputSampleRate: number,
  outputSampleRate = 16_000,
) {
  if (input.length === 0) {
    return new ArrayBuffer(0);
  }

  const ratio = inputSampleRate / outputSampleRate;
  if (ratio <= 1) {
    const output = new Int16Array(input.length);
    for (let index = 0; index < input.length; index += 1) {
      const sample = Math.max(-1, Math.min(1, input[index] ?? 0));
      output[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
    return output.buffer;
  }

  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Int16Array(outputLength);
  let outputIndex = 0;
  let inputIndex = 0;

  while (outputIndex < outputLength) {
    const nextInputIndex = Math.min(
      input.length,
      Math.round((outputIndex + 1) * ratio),
    );
    let accumulator = 0;
    let count = 0;

    for (let index = inputIndex; index < nextInputIndex; index += 1) {
      accumulator += input[index] ?? 0;
      count += 1;
    }

    const averagedSample = Math.max(
      -1,
      Math.min(1, accumulator / Math.max(count, 1)),
    );
    output[outputIndex] =
      averagedSample < 0
        ? averagedSample * 0x8000
        : averagedSample * 0x7fff;

    outputIndex += 1;
    inputIndex = nextInputIndex;
  }

  return output.buffer;
}

export function useAssistedLiveVoice({
  sessionToken,
  deviceFingerprint,
  isActive,
  onTurnComplete,
  onSoftCheckInTimeout,
}: LiveVoiceOptions) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceUiState>("idle");
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [lastReply, setLastReply] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<Session | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const assistantTextBufferRef = useRef("");
  const transcriptBufferRef = useRef("");
  const currentTurnRef = useRef<PendingTurnContext | null>(null);
  const pendingCheckInIdRef = useRef<Id<"routineCheckIns"> | null>(null);
  const checkInTimeoutRef = useRef<number | null>(null);
  const isClosingRef = useRef(false);
  const openAttemptIdRef = useRef(0);
  const isActiveRef = useRef(isActive);

  isActiveRef.current = isActive;

  async function stopMicrophone() {
    processorRef.current?.disconnect();
    mediaSourceRef.current?.disconnect();
    processorRef.current = null;
    mediaSourceRef.current = null;

    if (audioContextRef.current) {
      await audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      for (const track of mediaStreamRef.current.getTracks()) {
        track.stop();
      }
      mediaStreamRef.current = null;
    }

    setIsListening(false);
  }

  function clearCheckInTimeout() {
    if (checkInTimeoutRef.current !== null) {
      window.clearTimeout(checkInTimeoutRef.current);
      checkInTimeoutRef.current = null;
    }
  }

  function beginCheckInTimeout(checkInId: Id<"routineCheckIns">) {
    clearCheckInTimeout();
    pendingCheckInIdRef.current = checkInId;
    checkInTimeoutRef.current = window.setTimeout(() => {
      pendingCheckInIdRef.current = null;
      void onSoftCheckInTimeout?.(checkInId);
    }, CHECK_IN_RESPONSE_TIMEOUT_MS);
  }

  async function fullyCloseSession(options?: { skipSessionClose?: boolean }) {
    if (isClosingRef.current) {
      return;
    }

    isClosingRef.current = true;
    openAttemptIdRef.current += 1;

    try {
      clearCheckInTimeout();
      pendingCheckInIdRef.current = null;
      currentTurnRef.current = null;
      assistantTextBufferRef.current = "";
      transcriptBufferRef.current = "";
      setLiveTranscript("");
      setIsConnecting(false);
      setVoiceState("idle");
      stopSpeaking();

      const activeSession = sessionRef.current;
      sessionRef.current = null;

      if (!options?.skipSessionClose) {
        activeSession?.close();
      }

      await stopMicrophone();
    } finally {
      isClosingRef.current = false;
    }
  }

  async function startMicrophone(session: Session) {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    mediaStreamRef.current = mediaStream;

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    await audioContext.resume();

    const mediaSource = audioContext.createMediaStreamSource(mediaStream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    mediaSourceRef.current = mediaSource;
    processorRef.current = processor;

    processor.onaudioprocess = (event) => {
      if (!sessionRef.current) {
        return;
      }

      const chunk = downsampleToPcm16(
        event.inputBuffer.getChannelData(0),
        event.inputBuffer.sampleRate,
      );
      if (chunk.byteLength === 0) {
        return;
      }
      const audioChunk = new Blob([chunk], {
        type: "audio/pcm;rate=16000",
      }) as unknown as NonNullable<
        Parameters<Session["sendRealtimeInput"]>[0]["audio"]
      >;

      session.sendRealtimeInput({
        audio: audioChunk,
      });
    };

    mediaSource.connect(processor);
    processor.connect(audioContext.destination);
  }

  async function handleServerMessage(message: LiveServerMessage) {
    if ("voiceActivity" in message && message.voiceActivity?.voiceActivityType) {
      if (message.voiceActivity.voiceActivityType === VoiceActivityType.ACTIVITY_START) {
        stopSpeaking();
        clearCheckInTimeout();
        setIsListening(true);
        setVoiceState("idle");

        if (pendingCheckInIdRef.current) {
          currentTurnRef.current = {
            kind: "soft_check_in_response",
            checkInId: pendingCheckInIdRef.current,
          };
          pendingCheckInIdRef.current = null;
        } else if (!currentTurnRef.current) {
          currentTurnRef.current = {
            kind: "conversation",
            checkInId: null,
          };
        }
      }

      if (message.voiceActivity.voiceActivityType === VoiceActivityType.ACTIVITY_END) {
        setIsListening(false);
        setVoiceState("processing");
      }
    }

    if ("serverContent" in message && message.serverContent?.interrupted) {
      stopSpeaking();
      assistantTextBufferRef.current = "";
      setVoiceState("idle");
    }

    if ("serverContent" in message && message.serverContent?.inputTranscription?.text) {
      transcriptBufferRef.current = message.serverContent.inputTranscription.text;
      setLiveTranscript(message.serverContent.inputTranscription.text);
    }

    if ("text" in message && typeof message.text === "string" && message.text.trim()) {
      assistantTextBufferRef.current = `${assistantTextBufferRef.current}${message.text}`;
      setVoiceState("processing");
    }

    if ("serverContent" in message && message.serverContent?.turnComplete) {
      const turnContext =
        currentTurnRef.current ??
        ({
          kind: "conversation",
          checkInId: null,
        } satisfies PendingTurnContext);
      const transcript = transcriptBufferRef.current.trim();
      const reply = assistantTextBufferRef.current.trim();

      setLastTranscript(transcript || null);
      setLastReply(reply || null);
      setLiveTranscript("");
      setIsListening(false);

      if (turnContext.kind === "soft_check_in_prompt") {
        pendingCheckInIdRef.current = turnContext.checkInId;
      }

      if (reply) {
        await speakText(reply, {
          lang: "en-GB",
          onStart: () => setVoiceState("speaking"),
          onEnd: () => setVoiceState("idle"),
          onError: () => setVoiceState("idle"),
        });
      } else {
        setVoiceState("idle");
      }

      if (
        turnContext.kind === "soft_check_in_prompt" &&
        pendingCheckInIdRef.current === turnContext.checkInId
      ) {
        beginCheckInTimeout(turnContext.checkInId);
      }

      if (turnContext.kind === "conversation") {
        await onTurnComplete?.({
          kind: "conversation",
          checkInId: null,
          transcript,
          reply,
        });
      } else if (turnContext.kind === "soft_check_in_prompt") {
        await onTurnComplete?.({
          kind: "soft_check_in_prompt",
          checkInId: turnContext.checkInId,
          transcript,
          reply,
        });
      } else {
        await onTurnComplete?.({
          kind: "soft_check_in_response",
          checkInId: turnContext.checkInId,
          transcript,
          reply,
        });
      }

      const turnStillCurrent = currentTurnRef.current === turnContext;
      if (turnStillCurrent) {
        currentTurnRef.current = null;
        assistantTextBufferRef.current = "";
        transcriptBufferRef.current = "";
      }
    }
  }

  async function openSession() {
    if (
      !sessionToken ||
      !deviceFingerprint ||
      sessionRef.current ||
      isConnecting ||
      isClosingRef.current
    ) {
      return;
    }

    setError(null);
    const openAttemptId = openAttemptIdRef.current + 1;
    openAttemptIdRef.current = openAttemptId;
    setIsConnecting(true);

    const isStaleAttempt = () =>
      openAttemptId !== openAttemptIdRef.current || !isActiveRef.current;

    try {
      if (isMemvellaBrowserTestMode()) {
        const controls = getMemvellaTestLiveVoiceControls();
        if (controls.connectError) {
          throw new Error(controls.connectError);
        }

        sessionRef.current = {
          close: () => undefined,
        } as Session;

        if (isStaleAttempt()) {
          sessionRef.current = null;
          setIsConnecting(false);
          return;
        }

        setVoiceState("idle");
        setIsConnecting(false);
        return;
      }

      const response = await fetch("/api/voice/live/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionToken,
          deviceFingerprint,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to bootstrap the live voice session.");
      }

      if (isStaleAttempt()) {
        setIsConnecting(false);
        return;
      }

      const payload = (await response.json()) as {
        token?: string;
        model?: string;
      };
      if (
        typeof payload.token !== "string" ||
        typeof payload.model !== "string"
      ) {
        throw new Error("The live voice bootstrap response was malformed.");
      }

      if (isStaleAttempt()) {
        setIsConnecting(false);
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: payload.token,
        apiVersion: "v1alpha",
      });
      const session = await ai.live.connect({
        model: payload.model,
        config: buildAssistedLiveConnectConfig(),
        callbacks: {
          onmessage: (message) => {
            void handleServerMessage(message);
          },
          onerror: (event) => {
            console.error("Gemini Live error:", event.message);
            setError("The voice loop is unavailable right now. Please try again.");
            void fullyCloseSessionRef.current();
          },
          onclose: () => {
            void fullyCloseSessionRef.current({ skipSessionClose: true });
          },
        },
      });

      if (isStaleAttempt()) {
        session.close();
        setIsConnecting(false);
        return;
      }

      sessionRef.current = session;
      await startMicrophone(session);

      if (isStaleAttempt()) {
        await fullyCloseSession();
        return;
      }

      setVoiceState("idle");
      setIsConnecting(false);
    } catch (connectError) {
      console.error(connectError);
      setError("The voice loop is unavailable right now. Please try again.");
      await fullyCloseSession();
    }
  }

  async function closeSession() {
    await fullyCloseSession();
  }

  function sendSoftCheckIn(
    promptInstruction: string,
    checkInId: Id<"routineCheckIns">,
  ) {
    if (!sessionRef.current) {
      return false;
    }

    if (isMemvellaBrowserTestMode()) {
      const controls = getMemvellaTestLiveVoiceControls();
      clearCheckInTimeout();
      pendingCheckInIdRef.current = null;
      currentTurnRef.current = {
        kind: "soft_check_in_prompt",
        checkInId,
      };
      assistantTextBufferRef.current = "";
      transcriptBufferRef.current = "";
      setLiveTranscript("");
      setVoiceState("processing");

      window.setTimeout(() => {
        const promptReply =
          controls.softCheckInPromptReply?.trim() ||
          "Just checking in with you now.";
        setLastReply(promptReply);
        setVoiceState("idle");
        void onTurnComplete?.({
          kind: "soft_check_in_prompt",
          checkInId,
          transcript: "",
          reply: promptReply,
        });

        const responseTranscript =
          typeof controls.softCheckInResponseTranscript === "string"
            ? controls.softCheckInResponseTranscript.trim()
            : "Yes";

        if (!responseTranscript) {
          currentTurnRef.current = null;
          void onSoftCheckInTimeout?.(checkInId);
          return;
        }

        const responseReply =
          controls.softCheckInResponseReply?.trim() || "Thank you.";
        setLastTranscript(responseTranscript);
        setLastReply(responseReply);
        void onTurnComplete?.({
          kind: "soft_check_in_response",
          checkInId,
          transcript: responseTranscript,
          reply: responseReply,
        });
        currentTurnRef.current = null;
      }, 0);

      return true;
    }

    clearCheckInTimeout();
    pendingCheckInIdRef.current = null;
    currentTurnRef.current = {
      kind: "soft_check_in_prompt",
      checkInId,
    };
    assistantTextBufferRef.current = "";
    transcriptBufferRef.current = "";
    setLiveTranscript("");
    setVoiceState("processing");
    sessionRef.current.sendClientContent({
      turns: promptInstruction,
      turnComplete: true,
    });
    return true;
  }

  const openSessionRef = useRef(openSession);
  const closeSessionRef = useRef(closeSession);
  const fullyCloseSessionRef = useRef(fullyCloseSession);
  openSessionRef.current = openSession;
  closeSessionRef.current = closeSession;
  fullyCloseSessionRef.current = fullyCloseSession;

  useEffect(() => {
    if (isActive) {
      void openSessionRef.current();
      return;
    }

    void closeSessionRef.current();
  }, [deviceFingerprint, isActive, sessionToken]);

  useEffect(() => {
    return () => {
      void fullyCloseSessionRef.current();
    };
  }, []);

  return {
    closeSession,
    error,
    isConnecting,
    isListening,
    lastReply,
    lastTranscript,
    liveTranscript,
    sendSoftCheckIn,
    setError,
    voiceState,
  };
}
