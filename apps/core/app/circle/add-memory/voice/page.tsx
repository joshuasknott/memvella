"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Loader2, Mic, Square } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@memvella/backend";
import {
  resolveSpeechRecognitionCtor,
  type BrowserSpeechRecognitionEventLike,
  type BrowserSpeechRecognitionInstance,
} from "@/lib/browser-speech";
type RecordState = "idle" | "recording" | "done";

export default function VoiceMemoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const addMemoryVoice = useMutation(api.memories.addMemoryVoice);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [transcript, setTranscript] = useState("");
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<BrowserSpeechRecognitionInstance | null>(null);
  const stopIntentRef = useRef<"none" | "user-stop" | "teardown">("none");
  const finalTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");
  const isStartPendingRef = useRef(false);
  const isStopPendingRef = useRef(false);

  const stopRecording = useCallback(() => {
    if (isStopPendingRef.current) {
      return;
    }

    const recognition = recognitionRef.current;
    if (!recognition) {
      return;
    }

    stopIntentRef.current = "user-stop";
    isStopPendingRef.current = true;

    try {
        if (typeof recognition.stop === "function") {
          recognition.stop();
        } else {
          recognition.abort();
        }
      } catch {
        isStopPendingRef.current = false;
      }
  }, []);

  const startRecording = useCallback(() => {
    if (
      recognitionRef.current ||
      isStartPendingRef.current ||
      isStopPendingRef.current
    ) {
      return;
    }

    setError(null);
    setTranscript("");
    setRecordState("idle");
    stopIntentRef.current = "none";
    finalTranscriptRef.current = "";
    interimTranscriptRef.current = "";
    isStartPendingRef.current = true;

    const RecognitionApi = resolveSpeechRecognitionCtor();

    if (!RecognitionApi) {
      setError("Voice dictation is not supported in this browser. Please type your memory instead.");
      isStartPendingRef.current = false;
      return;
    }

    const recognition = new RecognitionApi();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onstart = () => {
      isStartPendingRef.current = false;
      setRecordState("recording");
    };
    recognition.onresult = (event: BrowserSpeechRecognitionEventLike) => {
      let nextInterim = "";

      for (
        let index = event.resultIndex ?? 0;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];
        const chunk = result?.[0]?.transcript ?? "";

        if (!chunk) {
          continue;
        }

        if (result.isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current}${chunk}`;
        } else {
          nextInterim = `${nextInterim}${chunk}`;
        }
      }

      interimTranscriptRef.current = nextInterim;
      setTranscript(
        `${finalTranscriptRef.current}${interimTranscriptRef.current}`.trim(),
      );
    };
    recognition.onerror = (event) => {
      isStartPendingRef.current = false;
      const wasIntentionalStop = stopIntentRef.current !== "none";
      const shouldIgnoreError =
        event.error === "no-speech" ||
        (wasIntentionalStop &&
          (event.error === "aborted" || event.error === "no-speech"));

      if (!shouldIgnoreError) {
        setError(`Mic error: ${event.error}`);
      }
    };
    recognition.onend = () => {
      const finalizedTranscript = `${finalTranscriptRef.current}${interimTranscriptRef.current}`.trim();
      if (finalizedTranscript) {
        setTranscript(finalizedTranscript);
      }

      recognitionRef.current = null;
      isStartPendingRef.current = false;
      isStopPendingRef.current = false;
      interimTranscriptRef.current = "";

      const wasTeardown = stopIntentRef.current === "teardown";
      stopIntentRef.current = "none";

      if (!wasTeardown) {
        setRecordState("done");
      }
    };
    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (startError) {
      recognitionRef.current = null;
      isStartPendingRef.current = false;
      setError(
        startError instanceof Error
          ? startError.message
          : "Mic could not start. Please try again.",
      );
    }
  }, []);

  useEffect(() => {
    return () => {
      stopIntentRef.current = "teardown";
      isStartPendingRef.current = false;
      isStopPendingRef.current = false;

      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      if (!recognition) {
        return;
      }

      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;

      try {
        recognition.abort();
      } catch {
        // Ignore teardown races.
      }
    };
  }, []);

  const isFormValid = title.trim().length > 0 && transcript.trim().length > 0;

  const handleSave = async () => {
    if (!isFormValid) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await addMemoryVoice({
        title: title.trim(),
        date: date.trim() || undefined,
        transcript: transcript.trim(),
      });
      toast({
        tone: "success",
        title: "Voice memory saved",
        description: `${title.trim()} was added to the Circle.`,
      });
      router.push("/circle/memories");
    } catch (saveError) {
      console.error(saveError);
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Failed to save memory. Please try again.";
      setError(message);
      toast({
        tone: "error",
        title: "Voice memory did not save",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 px-4 pb-32">
      <section className="mt-4 space-y-8 rounded-4xl border border-white bg-white/80 p-6 shadow-xl shadow-family-primary/5 backdrop-blur-xl md:p-8">
        <div className="space-y-3">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="voice_title">
            Title
          </label>
          <input
            id="voice_title"
            data-testid="voice-memory-title-input"
            type="text"
            required
            placeholder="The camping trip"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-16 w-full rounded-2xl border-2 border-gray-100 bg-white px-6 text-lg shadow-sm outline-none transition-all placeholder:text-outline/50 focus:border-family-primary/50 focus:ring-4 focus:ring-family-primary/10"
          />
        </div>

        <div className="space-y-3">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="voice_date">
            When was this? <span className="ml-2 text-sm font-normal italic text-outline">(Optional)</span>
          </label>
          <input
            id="voice_date"
            data-testid="voice-memory-date-input"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-16 w-full rounded-2xl border-2 border-gray-100 bg-white px-6 text-lg shadow-sm outline-none transition-all placeholder:text-outline/50 focus:border-family-primary/50 focus:ring-4 focus:ring-family-primary/10"
          />
        </div>
      </section>

      <div className="flex w-full flex-col items-center justify-center gap-8 px-4 pb-4 pt-8">
        <button
          type="button"
          onClick={recordState === "recording" ? stopRecording : startRecording}
          data-testid="voice-memory-record-button"
          className={`rounded-full p-10 shadow-xl transition-all active:scale-[0.98] ${
            recordState === "recording"
              ? "animate-pulse bg-error-container text-on-error-container shadow-error/20"
              : "bg-primary-container text-on-primary-container shadow-primary/20"
          }`}
        >
          {recordState === "recording" ? (
            <Square size={56} className="fill-current" />
          ) : (
            <Mic size={56} />
          )}
        </button>

        <div className="px-4 text-center">
          {recordState === "idle" ? (
            <>
              <h2 className="mb-3 font-headline text-3xl font-bold tracking-tight text-on-surface">
                Tap to dictate a memory.
              </h2>
              <p className="mx-auto max-w-sm text-lg leading-relaxed text-on-surface-variant">
                Speak naturally. Memvella will transcribe your story so you can review it before saving.
              </p>
            </>
          ) : null}

          {recordState === "recording" ? (
            <p className="font-headline text-2xl font-bold tracking-tight text-error animate-pulse">
              Recording... tap to stop.
            </p>
          ) : null}

          {recordState === "done" ? (
            <p className="font-headline text-2xl font-bold tracking-tight text-primary">
              Done! Review below and save.
            </p>
          ) : null}
        </div>
      </div>

      {recordState === "recording" || recordState === "done" ? (
        <section className="space-y-4 rounded-4xl border border-white bg-white/80 p-6 shadow-xl shadow-family-primary/5 backdrop-blur-xl md:p-8">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="voice_transcript">
            Transcript
          </label>
          <textarea
            id="voice_transcript"
            data-testid="voice-memory-transcript-input"
            rows={5}
            required
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            placeholder="Your words will appear here..."
            className="w-full resize-none rounded-2xl border-none bg-surface-container-highest p-6 text-xl font-medium leading-relaxed transition-all placeholder:text-outline/50 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="px-2 text-sm italic text-outline">
            You can edit the transcript before saving.
          </p>
        </section>
      ) : null}

      {error ? (
        <p className="px-1 text-center text-sm font-medium text-red-500">{error}</p>
      ) : null}

      {recordState === "done" ? (
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !isFormValid}
          data-testid="voice-memory-save-button"
          className="mb-8 flex h-16 w-full items-center justify-center gap-2 rounded-full bg-senior-primary text-xl font-semibold text-white shadow-md transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Dictated Memory"
          )}
        </button>
      ) : null}
    </div>
  );
}
