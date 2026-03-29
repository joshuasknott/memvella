"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Mic, MicOff, X } from 'lucide-react';

// ─── State Machine ────────────────────────────────────────────────────────────
// idle       → tap mic  → recording
// recording  → tap mic  → processing   (user manually stops)
// recording  → silence  → processing   (VAD: auto-stop after quiet period)
// processing → response → speaking
// speaking   → done     → idle
type VoiceState = 'idle' | 'recording' | 'processing' | 'speaking';

export default function ListeningStatePage() {
  const handleVoiceChat = useAction(api.voice.handleVoiceChat);

  // ── SSR-safe localStorage reads ────────────────────────────────────────────
  const [caregiverId, setCaregiverId] = useState('');
  const [seniorName, setSeniorName] = useState('');

  useEffect(() => {
    setCaregiverId(localStorage.getItem('memvella_caregiverId') ?? '');
    setSeniorName(localStorage.getItem('memvella_seniorName') ?? 'there');
  }, []);

  // ── Component state ────────────────────────────────────────────────────────
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopRecording();
      window.speechSynthesis?.cancel();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Speech Synthesis ───────────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onstart = () => isMountedRef.current && setVoiceState('speaking');
    utterance.onend = () => {
      if (!isMountedRef.current) return;
      setVoiceState('idle');
    };
    window.speechSynthesis.speak(utterance);
  }, []);

  // ── Send audio blob to Convex via handleVoiceChat ──────────────────────────
  // NOTE: The current backend uses a text transcript. We use the Web Speech API
  // for transcription client-side, then send the text. The MediaRecorder gives
  // us the tap-to-stop control we need; we run SpeechRecognition in parallel.
  const sendTranscript = useCallback(async (userTranscript: string) => {
    if (!caregiverId || !userTranscript.trim()) {
      setVoiceState('idle');
      return;
    }
    setVoiceState('processing');
    setError(null);
    try {
      const result = await handleVoiceChat({ caregiverId, seniorName, transcript: userTranscript });
      if (!isMountedRef.current) return;
      setResponse(result.response);
      speak(result.response);
    } catch (err) {
      console.error('Memvella voice error:', err);
      if (!isMountedRef.current) return;
      setError("I'm having a little trouble right now. Please try again.");
      setVoiceState('idle');
    }
  }, [caregiverId, seniorName, handleVoiceChat, speak]);

  // ── Stop recording and transition to processing ────────────────────────────
  const stopRecording = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  // ── Start recording ────────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript('');
    setResponse('');

    // 1. Get mic access
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      if (!isMountedRef.current) return;
      setError('Microphone access was denied. Please allow microphone access and try again.');
      setVoiceState('idle');
      return;
    }

    if (!isMountedRef.current) {
      stream.getTracks().forEach(t => t.stop());
      return;
    }

    streamRef.current = stream;
    audioChunksRef.current = [];

    // 2. Run Web Speech API in parallel for transcription
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognitionAPI = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    let finalTranscript = '';

    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = true; // We control stopping via MediaRecorder
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: { results: { isFinal: boolean; 0: { transcript: string } }[] }) => {
        if (!isMountedRef.current) return;
        const all = Array.from(event.results).map(r => r[0].transcript).join('');
        setTranscript(all);
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          finalTranscript = all;
        } else {
          finalTranscript = all; // Keep updating so stop captures latest
        }
      };

      recognition.onerror = () => { /* Silently ignore — MediaRecorder controls the flow */ };
      recognition.onend = () => { /* Do nothing — we don't auto-restart */ };

      recognition.start();
      // Store abort handle so stopRecording can clean it up
      (mediaRecorderRef.current as unknown as { _recognition?: { abort: () => void } }); // type hint
      // Attach to recorder ref for access in stop handler
      const recorder = new MediaRecorder(stream);
      (recorder as unknown as { _recognition: typeof recognition })._recognition = recognition;
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // Stop speech recognition
        try { recognition.abort(); } catch { /* ignore */ }

        if (!isMountedRef.current) return;
        const captured = finalTranscript.trim();
        if (captured) {
          sendTranscript(captured);
        } else {
          setError('No speech detected. Tap the mic and try again.');
          setVoiceState('idle');
        }
      };

      recorder.start();
      setVoiceState('recording');

      // Auto-stop after 30 seconds (safety valve)
      silenceTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 30_000);

    } else {
      // Fallback: No SpeechRecognition — just record and show unsupported message
      stream.getTracks().forEach(t => t.stop());
      setError('Voice recognition is not supported in this browser.');
      setVoiceState('idle');
    }
  }, [sendTranscript]);

  // ── Mic button tap handler (toggle) ───────────────────────────────────────
  const handleMicTap = useCallback(() => {
    if (voiceState === 'idle') {
      startRecording();
    } else if (voiceState === 'recording') {
      // THE FIX: tap again to stop and send
      stopRecording();
    } else if (voiceState === 'speaking') {
      // Interrupt Memvella and go back to idle
      window.speechSynthesis?.cancel();
      setVoiceState('idle');
    }
    // 'processing' state: ignore taps — wait for response
  }, [voiceState, startRecording, stopRecording]);

  // ── UI helpers ─────────────────────────────────────────────────────────────
  const stateLabel: Record<VoiceState, string> = {
    idle:       'Tap to speak',
    recording:  'Listening… tap to send',
    processing: 'Memvella is thinking…',
    speaking:   'Memvella is speaking',
  };

  const displayText =
    voiceState === 'speaking' && response
      ? `"${response}"`
      : voiceState === 'recording' && transcript
      ? `"${transcript}"`
      : voiceState === 'processing'
      ? 'Processing your message…'
      : transcript && voiceState === 'idle'
      ? `"${transcript}"`
      : 'Tap the button and speak';

  const isRecording = voiceState === 'recording';
  const isProcessing = voiceState === 'processing';
  const isSpeaking = voiceState === 'speaking';

  return (
    <div className="bg-background font-body text-on-background overflow-hidden min-h-screen">
      {/* Background Layer: Heavily Blurred Photo Gallery */}
      <div className="fixed inset-0 z-0 grid grid-cols-3 gap-4 p-4 scale-110 blur-2xl opacity-60 pointer-events-none">
        <img className="w-full h-full object-cover rounded-3xl" alt="Gallery memory 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkqdWw7UzIAVOKSCwaVCjqRiyNKabCMN4YN5CK7bFcWBI43PIqrf_C7xTRqeLEFcttamF8p4wZghyu2OmOuutZxXnHILyFeTEXhh6n5LKs46v0E3CdiQ_W0THnNRbYrZCaVubWw9ebaEoZnDUsQt7ZaYa3_RLDvQADxrBD48Ag5FDAhuW8MzzAUp-TWzN8QodSlD0y7AmtdtAGYx2_r4nRdhIO2o-iwpK6-1Js8evQdH9oP99J67uGPWYwjcfnbjapelnnZyaTPF2W"/>
        <img className="w-full h-full object-cover rounded-3xl" alt="Gallery memory 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtrPZQaLdCsIApfz19RpcPYfyqlQRCQ9AGMAv0yJuTGfaRgZhTe0iUR5lOW_q97X14OByXpE2kC2RbXiutuMt79gZ2CM45feP8EgUn9ob4g9hch88W-QAWeosU091YhTU-dJJ6mAkYathcjf2BTfqOk1hEHJ1J1jg7MTsroAWDh1ROL6bewoPpP2-QXsZnmORqzpyviibZ_0EdMYRPutFbTtIBMArjTCMBiFMhZAfsgNzW3XuZB9PLRN5xqTOX0hXvRVUi5s15YMP1"/>
        <img className="w-full h-full object-cover rounded-3xl" alt="Gallery memory 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD65mON6T2r12jbhtO59IAZOWziWt8HIAhKkDGW6eQSSyG3--XXNZ6H2836EEhFcYTk00pdWaJ7WQ3cOt4JiilO0_UqASDG05jc8BXpTEP2GB-TpHflsFVWnW3aqhm6Px1_4G26R41ZTy6HdHD1boTvaHN4NbCfHgBYHs5bIsv2fTkJsO_MKz6xXq6E1ESiRJ9e65YGCoPe4rHl5ypT2Tegw9RbZY_A6qiv-17p2w7uFLI8sh4iPBopbDt0kinZ8CiVyEVf4iulEQyn"/>
        <img className="w-full h-full object-cover rounded-3xl" alt="Gallery memory 4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2i7zWLg1-ElrK4FiUY5Xpa169INvvz59sbtfz973xX1i1Cs4495z9VMITrTbrtx5VYeZwQZdQ9zqTz0N7G0-jgHzgqoDWTWzPsLevJCXkroblNdg20MvlShSzZaLzJOKtLNa_0zSF3pYHQL7V2hi6Q1R4dH3d0-bubA2paN-b-GYQ3hzLnHvE82X-fvtYD0xZaFe9HOhuNpVeiLfkhTDpKOFQeCozAhfm4i9AsrZCrAdKiRPvp-kfZ12qyWH3nyLva6ZCMs33DvkH"/>
        <img className="w-full h-full object-cover rounded-3xl" alt="Gallery memory 5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxIJyf4TUNedMHkxAWdQ5lTp8DqX88kZdPAhDDIxoxl2Iu2_3ACeV8y7hNXA14jNKiGyRvTQhacoacQDPiOso4Qjx2h-kpMNDxmLv8Whpj7Ui6KX-fkYvE4Y43AhYtwOjRhrZMgc6oRWw9SWCQ_RqpJ8mzvxHuxZtfZi6tGSAp7GkyWY6McqmiM6xSfc54qBMJIHD0V0T3z9J1aZ-KzovIBc07AAalREd-GY1oPTXHGY0zcZwv5U2iCAf7tbhJevpWaj1dFozswfyr"/>
        <img className="w-full h-full object-cover rounded-3xl" alt="Gallery memory 6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClO5R-6p4r0mKwaRwqg6twsBnPOLzfjrZUEREjLf2m8fyd9O-bljs_fbLOCptD16bymePeZPMeRWHLOy7dkW2K1NR82UeUy1JjEat31MnBPfgmguJke3jT7-kGZY8gPe8ZfcB9AKwJAuUpvRnpjgeoEKnWP2NLSeyh1VuxTgguL9OOEE8Pwb0BTbR66ywqlQeWFiwE6hQHmyDd7IWEYjH5xX-Pp3pkZHk-H9fAMTlY3xSRSO-85bfCFLdVlEN8fdkuLFz_Baco_j64"/>
      </div>

      {/* Frosted Glass Overlay */}
      <div className="absolute inset-0 bg-[#faf9f6]/95 backdrop-blur-xl z-50 pointer-events-none"></div>

      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-60 flex justify-between items-center px-10 h-24">
        <BrandLogo />
      </header>

      {/* Main Content Canvas */}
      <main className="relative z-60 flex flex-col items-center justify-center min-h-screen px-6 text-center">

        {/* Voice Interaction Visualizer */}
        <div className="relative flex items-center justify-center mb-12">
          {/* Pulsing outer ring — matches recording state */}
          <div
            className={`absolute w-80 h-80 rounded-full bg-linear-to-br from-primary to-secondary transition-all duration-500 ${
              isRecording   ? 'opacity-20 animate-ping' :
              isSpeaking    ? 'opacity-15 animate-pulse' :
              isProcessing  ? 'opacity-10 animate-pulse' :
              'opacity-0'
            }`}
            style={{ boxShadow: '0 0 80px rgba(70, 21, 153, 0.3), 0 0 120px rgba(0, 95, 175, 0.15)' }}
          ></div>

          {/* Mic Button — tap to start, tap again to stop */}
          <button
            id="mic-toggle-btn"
            onClick={handleMicTap}
            disabled={isProcessing}
            aria-label={isRecording ? 'Stop recording and send' : 'Start recording'}
            className={`relative w-64 h-64 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${
              isRecording
                ? 'bg-linear-to-br from-red-500 to-rose-600 scale-105 ring-4 ring-red-300'
                : isProcessing
                ? 'bg-linear-to-br from-amber-400 to-orange-500'
                : 'bg-linear-to-br from-primary to-secondary hover:scale-105'
            }`}
          >
            {isRecording
              ? <MicOff className="text-white" size={120} strokeWidth={2} />
              : <Mic className="text-white" size={120} strokeWidth={2} />
            }
          </button>
        </div>

        {/* State Label */}
        <p className="font-headline font-semibold text-slate-500 text-2xl mb-4 tracking-wide">
          {stateLabel[voiceState]}
        </p>

        {/* Instruction hint when recording */}
        {isRecording && (
          <p className="font-body text-slate-400 text-lg mb-4 animate-pulse">
            When done speaking, tap the mic to send
          </p>
        )}

        {/* High-Contrast Transcription / Response */}
        <div className="max-w-4xl space-y-6">
          <p className="font-headline font-bold text-slate-900 text-6xl md:text-8xl leading-tight">
            {displayText}
          </p>
        </div>

        {/* Error display */}
        {error && (
          <p className="mt-8 font-headline font-semibold text-red-500 text-xl">
            {error}
          </p>
        )}
      </main>

      {/* Footer: End Chat */}
      <div className="fixed bottom-12 right-12 z-60">
        <Link
          href="/senior"
          onClick={() => {
            stopRecording();
            window.speechSynthesis?.cancel();
          }}
          className="flex items-center gap-5 px-10 py-4 bg-slate-100 text-slate-600 border border-slate-200 rounded-2xl shadow-xl hover:bg-slate-200 transition-all active:scale-95 group"
        >
          <span className="font-headline font-bold text-2xl">End Chat</span>
          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center group-hover:bg-slate-300 transition-colors">
            <X className="font-bold w-6 h-6" strokeWidth={2.5} />
          </div>
        </Link>
      </div>
    </div>
  );
}
