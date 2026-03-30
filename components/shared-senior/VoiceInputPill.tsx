"use client";

import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputPillProps {
  onSubmit: (text: string) => void;
  isProcessing?: boolean;
}

export function VoiceInputPill({ onSubmit, isProcessing = false }: VoiceInputPillProps) {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Handle abort
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startRecording = useCallback(async () => {
    window.speechSynthesis?.cancel(); 
    setInputValue('');
    setIsListening(true);
    
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const win = window as any;
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        alert("Voice recognition isn't supported in this browser. Please type instead.");
        setIsListening(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false; 

      let finalCaptured = '';

      recognition.onresult = (e: any) => {
        const currentTranscript = Array.from(e.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setInputValue(currentTranscript);
        finalCaptured = currentTranscript;
      };

      recognition.onend = () => {
        stopRecording();
        if (finalCaptured) {
          onSubmit(finalCaptured);
          setInputValue('');
        }
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      alert("Microphone access denied. Please type instead.");
      setIsListening(false);
    }
  }, [onSubmit, stopRecording]);

  const toggleRecording = () => {
    if (isListening) {
      stopRecording();
    } else {
      if (!isProcessing) {
        startRecording();
      }
    }
  };

  const handleTextInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    onSubmit(inputValue);
    setInputValue('');
  };

  return (
    <form 
      onSubmit={handleTextInputSubmit}
      className="absolute bottom-12 w-full px-6 flex justify-center animate-in slide-in-from-bottom-8 duration-700 z-10"
    >
      <div className="flex items-center w-full max-w-2xl bg-white rounded-full p-2 pr-3 shadow-lg border border-gray-100 mx-auto transition-all focus-within:ring-4 focus-within:ring-[#4e0078]/10">
        <input 
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          disabled={isListening || isProcessing}
          placeholder={isListening ? "Listening..." : "Type or speak..."}
          className="flex-1 bg-transparent text-xl outline-none min-w-0 px-6 text-gray-800 placeholder:text-gray-400 disabled:opacity-70"
        />
        
        {/* Enter to submit hint if typing */}
        {inputValue.trim() && !isListening && (
          <button 
            type="submit"
            className="shrink-0 bg-surface-container text-on-surface-variant rounded-xl px-4 py-2 font-semibold text-sm hover:bg-surface-container-highest transition-colors mr-2"
          >
            Press Enter ↵
          </button>
        )}

        <button
          type="button"
          onClick={toggleRecording}
          disabled={isProcessing}
          className={`h-14 w-14 rounded-full shrink-0 flex items-center justify-center transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 text-white scale-105 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
              : 'bg-linear-to-r from-[#4e0078] to-[#7a2e9e] text-white shadow-md active:scale-95'
          }`}
        >
          {isListening ? (
            <MicOff className="w-6 h-6" strokeWidth={2.5} />
          ) : (
            <Mic className="w-6 h-6" strokeWidth={2.5} />
          )}
        </button>
      </div>
    </form>
  );
}
