"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Mic, Square, Loader2 } from 'lucide-react';

// Minimal SpeechRecognition type shim (same pattern as voice/page.tsx)
interface ISpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((event: { results: { isFinal: boolean; 0: { transcript: string } }[] }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
}
type SpeechRecognitionCtor = new () => ISpeechRecognition;

type RecordState = 'idle' | 'recording' | 'done';

export default function VoiceMemoryPage() {
  const router = useRouter();
  const addMemoryVoice = useMutation(api.memories.addMemoryVoice);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [transcript, setTranscript] = useState('');
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setRecordState('done');
  }, []);

  const startRecording = useCallback(() => {
    setError(null);
    setTranscript('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const API: SpeechRecognitionCtor | undefined = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!API) {
      setError('Voice dictation is not supported in this browser. Please type your memory instead.');
      return;
    }
    const recognition = new API();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onstart = () => setRecordState('recording');
    recognition.onresult = (event) => {
      const current = Array.from(event.results).map((r) => r[0].transcript).join('');
      setTranscript(current);
    };
    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') setError(`Mic error: ${event.error}`);
    };
    recognition.onend = () => setRecordState((s) => s === 'recording' ? 'done' : s);
    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  // Clean up on unmount
  useEffect(() => () => recognitionRef.current?.abort(), []);

  const isFormValid = title.trim().length > 0 && transcript.trim().length > 0;

  const handleSave = async () => {
    if (!isFormValid) return;
    
    setError(null);
    setIsSaving(true);
    try {
      await addMemoryVoice({
        title: title.trim(),
        date: date.trim() || 'Unknown date',
        transcript: transcript.trim(),
      });
      router.push('/caregiver/memories');
    } catch (err) {
      console.error(err);
      setError('Failed to save memory. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 px-4 w-full pb-32">
      {/* Title + Date inside Premium White Card */}
      <section className="bg-white/80 backdrop-blur-xl rounded-4xl p-6 md:p-8 shadow-xl shadow-[#4e0078]/5 border border-white space-y-8 mt-4">
        <div className="space-y-3">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="voice_title">Title</label>
          <div className="relative">
            <input
              id="voice_title"
              type="text"
              required
              placeholder="The camping trip"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-16 w-full rounded-2xl px-6 bg-white border-2 border-gray-100 text-lg shadow-sm focus:border-[#4e0078]/50 focus:ring-4 focus:ring-[#4e0078]/10 outline-none transition-all placeholder:text-outline/50"
            />
          </div>
        </div>
        <div className="space-y-3">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="voice_date">
            When was this? <span className="text-sm font-normal text-outline italic ml-2">(Optional)</span>
          </label>
          <div className="relative">
            <input
              id="voice_date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-16 w-full rounded-2xl px-6 bg-white border-2 border-gray-100 text-lg shadow-sm focus:border-[#4e0078]/50 focus:ring-4 focus:ring-[#4e0078]/10 outline-none transition-all placeholder:text-outline/50"
            />
          </div>
        </div>
      </section>

      {/* Mic Hero */}
      <div className="flex flex-col items-center justify-center pt-8 pb-4 w-full gap-8">
        <button
          onClick={recordState === 'recording' ? stopRecording : startRecording}
          className={`rounded-full p-10 shadow-xl transition-all active:scale-[0.98] ${
            recordState === 'recording'
              ? 'bg-error-container text-on-error-container shadow-error/20 animate-pulse'
              : 'bg-primary-container text-on-primary-container shadow-primary/20'
          }`}
        >
          {recordState === 'recording' ? <Square size={56} className="fill-current" /> : <Mic size={56} />}
        </button>

        <div className="text-center px-4">
          {recordState === 'idle' && (
            <>
              <h2 className="text-3xl font-bold font-headline text-on-surface mb-3 tracking-tight">Tap to dictate a memory.</h2>
              <p className="text-on-surface-variant text-lg font-body max-w-sm mx-auto leading-relaxed">Speak naturally. Memvella will automatically transcribe and format your story.</p>
            </>
          )}
          {recordState === 'recording' && (
            <p className="text-error font-bold font-headline animate-pulse text-2xl tracking-tight">Recording… tap to stop.</p>
          )}
          {recordState === 'done' && (
            <p className="text-primary font-bold font-headline text-2xl tracking-tight">Done! Review below and save.</p>
          )}
        </div>
      </div>

      {/* Live transcript display / edit in Premium White Card */}
      {(recordState === 'recording' || recordState === 'done') && (
        <section className="bg-white/80 backdrop-blur-xl rounded-4xl p-6 md:p-8 shadow-xl shadow-[#4e0078]/5 border border-white space-y-4">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="voice_transcript">
            Transcript
          </label>
          <textarea
            id="voice_transcript"
            rows={5}
            required
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your words will appear here…"
            className="appearance-none w-full p-6 bg-surface-container-highest border-none rounded-2xl text-xl font-medium focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50 resize-none leading-relaxed"
          />
          <p className="text-sm text-outline italic px-2">You can edit the transcript before saving.</p>
        </section>
      )}

      {error && (
        <p className="text-red-500 font-medium text-sm text-center px-1">{error}</p>
      )}

      {recordState === 'done' && (
        <button
          onClick={handleSave}
          disabled={isSaving || !isFormValid}
          className="h-16 w-full rounded-full bg-linear-to-r from-[#4e0078] to-[#7a2e9e] text-white font-semibold text-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 mb-8 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? <><Loader2 className="w-6 h-6 animate-spin" />Saving…</> : 'Save Dictated Memory'}
        </button>
      )}
    </div>
  );
}
