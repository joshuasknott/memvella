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

  const handleSave = async () => {
    if (!title.trim() || !transcript.trim()) {
      setError('Please record a memory and add a title before saving.');
      return;
    }
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
    <div className="flex flex-col gap-8 px-4 w-full">
      {/* Title + Date */}
      <section className="space-y-4">
        <div className="space-y-2">
          <label className="font-headline font-bold text-lg text-gray-900 tracking-tight" htmlFor="voice_title">Memory Title</label>
          <input
            id="voice_title"
            type="text"
            placeholder="The camping trip"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="appearance-none w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="space-y-2">
          <label className="font-headline font-bold text-lg text-gray-900 tracking-tight" htmlFor="voice_date">When was this?</label>
          <input
            id="voice_date"
            type="text"
            placeholder="Summer 1994"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="appearance-none w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </section>

      {/* Mic Hero */}
      <div className="flex flex-col items-center justify-center py-4 w-full gap-6">
        <button
          onClick={recordState === 'recording' ? stopRecording : startRecording}
          className={`rounded-full p-8 shadow-sm transition-all active:scale-95 ${
            recordState === 'recording'
              ? 'bg-red-100 text-red-600 animate-pulse'
              : 'bg-purple-100 text-purple-600'
          }`}
        >
          {recordState === 'recording' ? <Square size={48} /> : <Mic size={48} />}
        </button>

        <div className="text-center">
          {recordState === 'idle' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tap to dictate a memory.</h2>
              <p className="text-gray-500 text-center max-w-xs">Speak naturally. Memvella will automatically transcribe and format your story.</p>
            </>
          )}
          {recordState === 'recording' && (
            <p className="text-red-500 font-semibold animate-pulse text-lg">Recording… tap to stop.</p>
          )}
          {recordState === 'done' && (
            <p className="text-green-600 font-semibold text-lg">Done! Review below and save.</p>
          )}
        </div>
      </div>

      {/* Live transcript display / edit */}
      {(recordState === 'recording' || recordState === 'done') && (
        <div className="space-y-2">
          <label className="font-headline font-bold text-lg text-gray-900 tracking-tight" htmlFor="voice_transcript">Transcript</label>
          <textarea
            id="voice_transcript"
            rows={5}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your words will appear here…"
            className="appearance-none w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-xs text-gray-400 px-1">You can edit the transcript before saving.</p>
        </div>
      )}

      {error && (
        <p className="text-red-500 font-medium text-sm text-center">{error}</p>
      )}

      {recordState === 'done' && (
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-[#4e0078] text-white rounded-2xl py-4 font-semibold text-lg hover:bg-[#3d005e] active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" />Saving…</> : 'Save Dictated Memory'}
        </button>
      )}
    </div>
  );
}
