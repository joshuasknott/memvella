"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Mic, X } from 'lucide-react';

// ─── SpeechRecognition type shim ─────────────────────────────────────────────
// The Web Speech API is not in tsconfig's lib target — define minimal types locally.
interface ISpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
}
interface ISpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly 0: { transcript: string };
}
interface ISpeechRecognitionEvent {
  readonly results: ISpeechRecognitionResult[];
}
interface ISpeechRecognitionErrorEvent {
  readonly error: string;
}
type SpeechRecognitionCtor = new () => ISpeechRecognition;

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

export default function ListeningStatePage() {
  const handleVoiceChat = useAction(api.voice.handleVoiceChat);

  // ── SSR-safe localStorage reads ──────────────────────────────────────────
  const [caregiverId, setCaregiverId] = useState('');
  const [seniorName, setSeniorName] = useState('');

  useEffect(() => {
    setCaregiverId(localStorage.getItem('memvella_caregiverId') ?? '');
    setSeniorName(localStorage.getItem('memvella_seniorName') ?? 'there');
  }, []);

  // ── Conversational state ─────────────────────────────────────────────────
  const [voiceState, setVoiceState] = useState<VoiceState>('listening');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isMountedRef = useRef(true);

  // ── Speech Synthesis helper ──────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop anything already playing
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;    // Slightly slower — better for seniors
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onstart = () => isMountedRef.current && setVoiceState('speaking');
    utterance.onend = () => {
      if (!isMountedRef.current) return;
      setVoiceState('listening');
      // Auto-restart listening after Memvella finishes speaking
      startListening();
    };
    window.speechSynthesis.speak(utterance);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send transcript to Gemini via Convex action ──────────────────────────
  const sendToMemvella = useCallback(async (userTranscript: string) => {
    if (!caregiverId || !userTranscript.trim()) return;
    setVoiceState('thinking');
    setError(null);
    try {
      const result = await handleVoiceChat({
        caregiverId,
        seniorName,
        transcript: userTranscript,
      });
      if (!isMountedRef.current) return;
      setResponse(result.response);
      speak(result.response);
    } catch (err) {
      console.error('Memvella voice error:', err);
      if (!isMountedRef.current) return;
      setError("I'm having a little trouble right now. Please try again.");
      setVoiceState('listening');
      startListening();
    }
  }, [caregiverId, seniorName, handleVoiceChat, speak]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── SpeechRecognition setup ──────────────────────────────────────────────
  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognitionAPI: SpeechRecognitionCtor | undefined =
      win.SpeechRecognition ?? win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setError('Voice recognition is not supported in this browser.');
      return;
    }

    // Abort any existing session before creating a new one
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      if (!isMountedRef.current) return;
      setVoiceState('listening');
      setTranscript('');
    };

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      if (!isMountedRef.current) return;
      const current = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('');
      setTranscript(current);

      // When the user stops speaking (result is final), send to Gemini
      if (event.results[event.results.length - 1].isFinal) {
        sendToMemvella(current);
      }
    };

    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      if (!isMountedRef.current) return;
      // 'no-speech' is not a real error — just restart
      if (event.error === 'no-speech') {
        startListening();
        return;
      }
      setError(`Voice error: ${event.error}`);
      setVoiceState('idle');
    };

    recognition.onend = () => {
      // If we ended in listening state without a result, auto-restart
      if (isMountedRef.current && voiceState === 'listening') {
        startListening();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setVoiceState('listening');
  }, [sendToMemvella, voiceState]);

  // ── Start recognition on mount (once caregiverId is ready) ───────────────
  useEffect(() => {
    if (!caregiverId) return;
    startListening();
    return () => {
      isMountedRef.current = false;
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, [caregiverId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ── UI helpers ────────────────────────────────────────────────────────────
  const stateLabel: Record<VoiceState, string> = {
    idle: 'Tap to start',
    listening: 'Listening…',
    thinking: 'Memvella is thinking…',
    speaking: 'Memvella is speaking',
  };

  const displayText = response && voiceState === 'speaking'
    ? `"${response}"`
    : transcript
    ? `"${transcript}"`
    : voiceState === 'thinking'
    ? 'Processing your message…'
    : 'Tap the button and speak';

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

      {/* Frosted Glass Overlay with AAA Contrast fix */}
      <div className="absolute inset-0 bg-[#faf9f6]/95 backdrop-blur-xl z-50 pointer-events-none"></div>

      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-60 flex justify-between items-center px-10 h-24">
        <BrandLogo />
      </header>

      {/* Main Content Canvas */}
      <main className="relative z-60 flex flex-col items-center justify-center min-h-screen px-6 text-center">

        {/* Voice Interaction Visualizer */}
        <div className="relative flex items-center justify-center mb-12">
          {/* Pulsing outer ring — faster when listening, slow when thinking */}
          <div
            className={`absolute w-80 h-80 rounded-full bg-linear-to-br from-primary to-secondary opacity-15 ${
              voiceState === 'listening' ? 'animate-pulse' :
              voiceState === 'speaking' ? 'animate-ping' :
              'opacity-5'
            }`}
            style={{ boxShadow: '0 0 80px rgba(70, 21, 153, 0.3), 0 0 120px rgba(0, 95, 175, 0.15)' }}
          ></div>

          {/* Inner glowing circle — button to manually trigger if auto doesn't start */}
          <button
            onClick={() => {
              if (voiceState === 'idle' || voiceState === 'listening') {
                startListening();
              }
            }}
            className="relative w-64 h-64 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          >
            <Mic className="text-white" size={120} strokeWidth={2} />
          </button>
        </div>

        {/* State Label */}
        <p className="font-headline font-semibold text-slate-500 text-2xl mb-4 tracking-wide">
          {stateLabel[voiceState]}
        </p>

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

      {/* Contextual Footer Actions */}
      <div className="fixed bottom-12 right-12 z-60">
        <Link
          href="/senior"
          onClick={() => {
            recognitionRef.current?.abort();
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
