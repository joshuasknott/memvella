"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Loader2, Mic, Square } from "lucide-react";
import { api } from "@/convex/_generated/api";

interface ISpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult:
    | ((event: { results: { isFinal: boolean; 0: { transcript: string } }[] }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
}

type SpeechRecognitionCtor = new () => ISpeechRecognition;
type RecordState = "idle" | "recording" | "done";

export default function VoiceMemoryPage() {
  const router = useRouter();
  const addMemoryVoice = useMutation(api.memories.addMemoryVoice);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [transcript, setTranscript] = useState("");
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setRecordState("done");
  }, []);

  const startRecording = useCallback(() => {
    setError(null);
    setTranscript("");

    const speechWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const RecognitionApi =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!RecognitionApi) {
      setError("Voice dictation is not supported in this browser. Please type your memory instead.");
      return;
    }

    const recognition = new RecognitionApi();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onstart = () => setRecordState("recording");
    recognition.onresult = (event) => {
      const currentTranscript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      setTranscript(currentTranscript);
    };
    recognition.onerror = (event) => {
      if (event.error !== "no-speech") {
        setError(`Mic error: ${event.error}`);
      }
    };
    recognition.onend = () =>
      setRecordState((currentState) =>
        currentState === "recording" ? "done" : currentState,
      );
    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  useEffect(() => {
    return () => recognitionRef.current?.abort();
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
      router.push("/supporter/memories");
    } catch (saveError) {
      console.error(saveError);
      setError("Failed to save memory. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 px-4 pb-32">
      <section className="mt-4 space-y-8 rounded-4xl border border-white bg-white/80 p-6 shadow-xl shadow-[#4e0078]/5 backdrop-blur-xl md:p-8">
        <div className="space-y-3">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="voice_title">
            Title
          </label>
          <input
            id="voice_title"
            type="text"
            required
            placeholder="The camping trip"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-16 w-full rounded-2xl border-2 border-gray-100 bg-white px-6 text-lg shadow-sm outline-none transition-all placeholder:text-outline/50 focus:border-[#4e0078]/50 focus:ring-4 focus:ring-[#4e0078]/10"
          />
        </div>

        <div className="space-y-3">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="voice_date">
            When was this? <span className="ml-2 text-sm font-normal italic text-outline">(Optional)</span>
          </label>
          <input
            id="voice_date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-16 w-full rounded-2xl border-2 border-gray-100 bg-white px-6 text-lg shadow-sm outline-none transition-all placeholder:text-outline/50 focus:border-[#4e0078]/50 focus:ring-4 focus:ring-[#4e0078]/10"
          />
        </div>
      </section>

      <div className="flex w-full flex-col items-center justify-center gap-8 px-4 pb-4 pt-8">
        <button
          type="button"
          onClick={recordState === "recording" ? stopRecording : startRecording}
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
        <section className="space-y-4 rounded-4xl border border-white bg-white/80 p-6 shadow-xl shadow-[#4e0078]/5 backdrop-blur-xl md:p-8">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="voice_transcript">
            Transcript
          </label>
          <textarea
            id="voice_transcript"
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
          className="mb-8 flex h-16 w-full items-center justify-center gap-2 rounded-full bg-[#6B21A8] text-xl font-semibold text-white shadow-md transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
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
