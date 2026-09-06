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
import { encodeLiveAudio, LiveAudioPlayer } from "@/lib/live-audio";
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
  microphoneEnabled?: boolean;
  manualTurns?: boolean;
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



function getMemvellaTestLiveVoiceControls() {
  return window.__memvellaTestLiveVoice ?? {};
}

export function useAssistedLiveVoice({
  sessionToken,
  deviceFingerprint,
  isActive,
  microphoneEnabled = true,
  manualTurns = false,
  onTurnComplete,
  onSoftCheckInTimeout,
}: LiveVoiceOptions) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMicrophonePaused, setIsMicrophonePaused] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceUiState>("idle");
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [lastReply, setLastReply] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [liveReply, setLiveReply] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<Session | null>(null);
  const playerRef = useRef<LiveAudioPlayer | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<AudioWorkletNode | null>(null);
  const assistantTextBufferRef = useRef("");
  const transcriptBufferRef = useRef("");
  const currentTurnRef = useRef<PendingTurnContext | null>(null);
  const pendingCheckInIdRef = useRef<Id<"routineCheckIns"> | null>(null);

  const closingPromiseRef = useRef<Promise<void> | null>(null);
  const openAttemptIdRef = useRef(0);
  const isActiveRef = useRef(isActive);
  const microphonePausedRef = useRef(false);
  const readAttemptRef = useRef(0);
  const suppressAudioRef = useRef(false);
  const pendingActivityEndRef = useRef(false);

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

  function fullyCloseSession(options?: { skipSessionClose?: boolean }): Promise<void> {
    if (closingPromiseRef.current) return closingPromiseRef.current;
    openAttemptIdRef.current += 1;
    const activeSession = sessionRef.current;
    const player = playerRef.current;
    sessionRef.current = null;
    playerRef.current = null;
    const closing = (async () => {
      pendingCheckInIdRef.current = null;
      currentTurnRef.current = null;
      assistantTextBufferRef.current = "";
      transcriptBufferRef.current = "";
      setLiveTranscript("");
      setIsConnecting(false);
      setIsConnected(false);
      microphonePausedRef.current = false;
      setIsMicrophonePaused(false);
      readAttemptRef.current += 1;
      suppressAudioRef.current = false;
      pendingActivityEndRef.current = false;
      setLiveReply("");
      setVoiceState("idle");
      stopSpeaking();
      // Detach before closing: late events cannot tear down a replacement session.
      await Promise.allSettled([
        Promise.resolve().then(() => { if (!options?.skipSessionClose) activeSession?.close(); }),
        player?.close(),
        stopMicrophone(),
      ]);
    })();
    closingPromiseRef.current = closing;
    void closing.finally(() => {
      if (closingPromiseRef.current === closing) closingPromiseRef.current = null;
    });
    return closing;
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
    if (sessionRef.current !== session || !isActiveRef.current) {
      mediaStream.getTracks().forEach((track) => track.stop());
      return;
    }
    mediaStreamRef.current = mediaStream;
    if (manualTurns) {
      microphonePausedRef.current = true;
      setIsMicrophonePaused(true);
      mediaStream.getAudioTracks().forEach((track) => { track.enabled = false; });
    }

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    await audioContext.resume();

    const mediaSource = audioContext.createMediaStreamSource(mediaStream);
    mediaSourceRef.current = mediaSource;

    try {
      await audioContext.audioWorklet.addModule("/pcm16-processor.worklet.js");
    } catch {
      throw new Error("Audio worklet failed to load.");
    }

    const processor = new AudioWorkletNode(audioContext, "pcm16-processor");
    processorRef.current = processor;

    processor.port.onmessage = (event) => {
      if (sessionRef.current !== session) return;
      if (event.data === "flushed") {
        if (pendingActivityEndRef.current) {
          pendingActivityEndRef.current = false;
          session.sendRealtimeInput({ activityEnd: {} });
        }
        return;
      }
      if (microphonePausedRef.current && !pendingActivityEndRef.current) {
        return;
      }

      const chunk = event.data as ArrayBuffer;
      if (!chunk || chunk.byteLength === 0) {
        return;
      }

      session.sendRealtimeInput({
        audio: encodeLiveAudio(chunk),
      });
    };

    mediaSource.connect(processor);
    processor.connect(audioContext.destination);
  }

  async function handleServerMessage(message: LiveServerMessage) {
    if ("voiceActivity" in message && message.voiceActivity?.voiceActivityType) {
      if (message.voiceActivity.voiceActivityType === VoiceActivityType.ACTIVITY_START) {
        readAttemptRef.current += 1;
        suppressAudioRef.current = false;
        stopSpeaking();
        playerRef.current?.stop();
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
      playerRef.current?.stop();
      assistantTextBufferRef.current = "";
      setLiveReply("");
      setVoiceState("idle");
    }

    if ("serverContent" in message && message.serverContent?.inputTranscription?.text) {
      transcriptBufferRef.current += message.serverContent.inputTranscription.text;
      setLiveTranscript(transcriptBufferRef.current);
    }

    const content = message.serverContent;
    if (content?.outputTranscription?.text) {
      assistantTextBufferRef.current += content.outputTranscription.text;
      setLiveReply(assistantTextBufferRef.current);
    }
    for (const part of content?.modelTurn?.parts ?? []) {
      if (part.inlineData?.data && part.inlineData.mimeType?.startsWith("audio/pcm")) {
        if (!suppressAudioRef.current) playerRef.current?.play(part.inlineData.data);
      }
    }

    if ("serverContent" in message && message.serverContent?.turnComplete) {
      const turnContext =
        currentTurnRef.current ??
        (pendingCheckInIdRef.current && transcriptBufferRef.current.trim() ? {
          kind: "soft_check_in_response",
          checkInId: pendingCheckInIdRef.current,
        } : {
          kind: "conversation",
          checkInId: null,
        } satisfies PendingTurnContext);
      if (turnContext.kind === "soft_check_in_response") pendingCheckInIdRef.current = null;
      const transcript = transcriptBufferRef.current.trim();
      const reply = assistantTextBufferRef.current.trim();

      setLastTranscript(transcript || null);
      setLastReply(reply || null);
      setLiveTranscript("");
      setLiveReply("");
      setIsListening(microphoneEnabled && !microphonePausedRef.current);
      suppressAudioRef.current = false;
      currentTurnRef.current = null;
      assistantTextBufferRef.current = "";
      transcriptBufferRef.current = "";

      if (turnContext.kind === "soft_check_in_prompt") {
        pendingCheckInIdRef.current = turnContext.checkInId;
      }

      if (!microphoneEnabled || !reply) {
        setVoiceState("idle");
      }

      // Keep the check-in open until the person responds or closes the conversation.

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

    }
  }

  async function openSession() {
    if (
      !sessionToken ||
      !deviceFingerprint ||
      sessionRef.current ||
      closingPromiseRef.current
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
        setIsConnected(true);
        if (manualTurns) {
          microphonePausedRef.current = true;
          setIsMicrophonePaused(true);
        }
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
          manualTurns,
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
      if (microphoneEnabled) {
        playerRef.current = new LiveAudioPlayer((speaking) => {
          setVoiceState(speaking ? "speaking" : "idle");
        });
        await playerRef.current.resume();
      }
      const session = await ai.live.connect({
        model: payload.model,
        config: buildAssistedLiveConnectConfig(undefined, manualTurns),
        callbacks: {
          onmessage: (message) => {
            if (isStaleAttempt()) return;
            void handleServerMessage(message).catch(() => {
              if (isStaleAttempt()) return;
              setError("Something interrupted this conversation. Please reconnect.");
              void fullyCloseSessionRef.current();
            });
          },
          onerror: (event) => {
            if (isStaleAttempt()) return;
            console.error("Gemini Live error:", event.message);
            setError("We can’t connect right now. Try again in a moment, or close this to enjoy your memories.");
            void fullyCloseSessionRef.current();
          },
          onclose: () => {
            if (isStaleAttempt()) return;
            setError("The connection ended. Your last reply is still here. Choose Try again to reconnect.");
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
      if (microphoneEnabled) await startMicrophone(session);

      if (isStaleAttempt()) {
        await fullyCloseSession();
        return;
      }

      setVoiceState("idle");
      setIsConnecting(false);
      setIsConnected(true);
      setIsListening(microphoneEnabled && !manualTurns);
    } catch (connectError) {
      if (isStaleAttempt()) return;
      console.error(connectError);
      setError(connectError instanceof DOMException && connectError.name === "NotAllowedError"
        ? "Microphone access is off. Close this conversation and choose Type a message, or allow microphone access in your browser."
        : "We can’t connect right now. Try again in a moment, or close this to enjoy your memories.");
      await fullyCloseSession();
    }
  }

  async function closeSession() {
    await fullyCloseSession();
  }

  function pauseMicrophone(paused: boolean) {
    if (pendingActivityEndRef.current || paused === microphonePausedRef.current) return;
    microphonePausedRef.current = paused;
    setIsMicrophonePaused(paused);
    setIsListening(microphoneEnabled && !paused);
    for (const track of mediaStreamRef.current?.getAudioTracks() ?? []) track.enabled = !paused;
    if (manualTurns) {
      if (paused) {
        setVoiceState("processing");
        if (processorRef.current && !isMemvellaBrowserTestMode()) {
          pendingActivityEndRef.current = true;
          processorRef.current.port.postMessage("flush");
        }
      } else {
        stopReply();
        suppressAudioRef.current = false;
        currentTurnRef.current = pendingCheckInIdRef.current
          ? { kind: "soft_check_in_response", checkInId: pendingCheckInIdRef.current }
          : { kind: "conversation", checkInId: null };
        pendingCheckInIdRef.current = null;
        if (!isMemvellaBrowserTestMode()) sessionRef.current?.sendRealtimeInput({ activityStart: {} });
      }
    } else if (paused && sessionRef.current && !isMemvellaBrowserTestMode()) {
      sessionRef.current.sendRealtimeInput({ audioStreamEnd: true });
    }
  }

  function stopReply() {
    readAttemptRef.current += 1;
    suppressAudioRef.current = true;
    playerRef.current?.stop();
    stopSpeaking();
    setVoiceState("idle");
  }

  function readReply(slower = false) {
    if (!lastReply) return;
    stopReply();
    // Keep replay out of the live microphone and let the person explicitly resume.
    if (microphoneEnabled) pauseMicrophone(true);
    const attempt = readAttemptRef.current;
    void speakText(lastReply, {
      lang: "en-GB",
      rate: slower ? 0.75 : 1,
      onStart: () => { if (attempt === readAttemptRef.current) setVoiceState("speaking"); },
      onEnd: () => { if (attempt === readAttemptRef.current) setVoiceState("idle"); },
      onError: () => { if (attempt === readAttemptRef.current) setVoiceState("idle"); },
    });
  }

  function sendText(text: string) {
    const value = text.trim();
    if (!value || !sessionRef.current || voiceState === "processing") return false;
    playerRef.current?.stop();
    currentTurnRef.current = pendingCheckInIdRef.current
      ? { kind: "soft_check_in_response", checkInId: pendingCheckInIdRef.current }
      : { kind: "conversation", checkInId: null };
    pendingCheckInIdRef.current = null;
    transcriptBufferRef.current = value;
    assistantTextBufferRef.current = "";
    setLastTranscript(value);
    setLiveReply("");
    setVoiceState("processing");
    if (isMemvellaBrowserTestMode()) {
      void handleServerMessage({ serverContent: {
        outputTranscription: { text: "Thank you for sharing that with me." },
        turnComplete: true,
      } } as LiveServerMessage);
    } else {
      sessionRef.current.sendRealtimeInput({ text: value });
    }
    return true;
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
    pendingCheckInIdRef.current = null;
    currentTurnRef.current = {
      kind: "soft_check_in_prompt",
      checkInId,
    };
    assistantTextBufferRef.current = "";
    transcriptBufferRef.current = "";
    setLiveTranscript("");
    setVoiceState("processing");
    // Realtime text starts its own turn, even when microphone turns are manual.
    // Wrapping it in audio activity markers makes Gemini reject the session.
    sessionRef.current.sendRealtimeInput({ text: promptInstruction });
    return true;
  }

  const openSessionRef = useRef(openSession);
  const closeSessionRef = useRef(closeSession);
  const fullyCloseSessionRef = useRef(fullyCloseSession);
  openSessionRef.current = openSession;
  closeSessionRef.current = closeSession;
  fullyCloseSessionRef.current = fullyCloseSession;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await closeSessionRef.current();
      if (!cancelled && isActive) await openSessionRef.current();
    })();
    return () => { cancelled = true; };
  }, [deviceFingerprint, isActive, sessionToken, microphoneEnabled, manualTurns]);

  useEffect(() => {
    return () => {
      void fullyCloseSessionRef.current();
    };
  }, []);

  return {
    closeSession,
    error,
    isConnecting,
    isConnected,
    isListening,
    isMicrophonePaused,
    pauseMicrophone,
    readReply,
    stopReply,
    lastReply,
    lastTranscript,
    liveTranscript,
    liveReply,
    sendText,
    sendSoftCheckIn,
    setError,
    voiceState,
  };
}
