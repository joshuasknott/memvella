"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Mic, MicOff, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/Input';
import { FormCard } from '@/components/ui/FormCard';

type Step = 1 | 2 | 3;

export default function IndependentSetupVoicePage() {
  const router = useRouter();
  
  // -- State Machine --
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // -- Voice / Text Input State --
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiReply, setAiReply] = useState("All set! To help me get to know you, who is someone important in your life?");

  // -- Refs --
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleOnboardingInput = useAction((api as any).agent?.handleOnboardingInput || api.voice?.handleVoiceChat);

  // -- Voice Helpers --
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, []);

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
          // Fire auto-submit logic if we are using voice
          if (step === 1) {
            setName(finalCaptured);
            setStep(2);
            setInputValue('');
          } else if (step === 3) {
            handleStep3Submit(finalCaptured);
          }
        }
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      alert("Microphone access denied. Please type instead.");
      setIsListening(false);
    }
  }, [step, stopRecording]); // handleStep3Submit and others aren't strictly needed as deps or we can rely on standard closure if we defined it earlier, but let's define them in scope.

  const handleStep3Submit = async (finalText: string) => {
    if (!finalText.trim()) return;
    setIsProcessing(true);
    setAiReply('Thinking...');
    
    try {
      const response = await handleOnboardingInput({ userInput: finalText });
      const replyText = typeof response === 'string' ? response : (response as any)?.response || (response as any)?.reply || "Got it.";
      
      setAiReply(replyText);
      speak(replyText);
      
      // Delay to let the AI speak briefly before routing
      setTimeout(() => {
        router.push('/senior');
      }, 3500);

    } catch (error) {
      console.error('Error processing input:', error);
      const errorMsg = "I'm sorry, I had trouble processing that. Could you try again?";
      setAiReply(errorMsg);
      speak(errorMsg);
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      stopRecording();
      // Wait for onend to trigger the auto-submit, 
      // but if transcript is ready we could force it here.
    } else {
      if (!isProcessing) {
        startRecording();
      }
    }
  };

  const handleTextInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (step === 1) {
      setName(inputValue);
      setStep(2);
      setInputValue('');
    } else if (step === 3) {
      handleStep3Submit(inputValue);
      setInputValue('');
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsProcessing(true);

    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) {
        alert(error.message);
        setIsProcessing(false);
        return;
      }
      
      // Success, move to step 3
      setStep(3);
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      alert("An error occurred creating your account.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden bg-surface text-on-surface font-body relative selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Top Bar */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
        {step === 1 ? (
          <SecondaryButton href="/" className="w-auto px-8">
            &larr; Exit
          </SecondaryButton>
        ) : (
          <SecondaryButton 
            onClick={() => {
              if (step === 3) setStep(2);
              if (step === 2) setStep(1);
            }} 
            className="w-auto px-8"
          >
            &larr; Back
          </SecondaryButton>
        )}
        
        {/* Step Indicator */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-2 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-outline-variant/30'}`} 
            />
          ))}
        </div>
      </div>

      <div className="flex-1 w-full max-w-3xl flex flex-col items-center justify-center mb-24 relative">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="w-full text-center animate-in slide-in-from-right-8 fade-in duration-500 space-y-4">
             <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] text-center mb-8">
               Hi there! What would you like us to call you?
             </h1>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="w-full max-w-md animate-in slide-in-from-right-8 fade-in duration-500">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] text-center mb-8">
              Nice to meet you, {name}. Let's secure your account.
            </h1>
            
            <FormCard as="form" onSubmit={handleStep2Submit} className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="font-medium text-on-surface-variant ml-2 text-lg">Email Address</label>
                <TextInput 
                  type="email" 
                  autoFocus
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="font-medium text-on-surface-variant ml-2 text-lg">Password</label>
                <TextInput 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <PrimaryButton 
                type="submit"
                disabled={isProcessing}
                className="mt-4"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin w-6 h-6" />
                ) : (
                  <>
                    Continue <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </PrimaryButton>
            </FormCard>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="w-full text-center animate-in slide-in-from-right-8 fade-in duration-500 space-y-4">
             <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] text-center mb-8">
               {aiReply}
             </h1>
             {isProcessing && (
               <p className="font-medium text-2xl text-on-surface-variant animate-pulse pt-4">Processing...</p>
             )}
          </div>
        )}
      </div>

      {/* Reusable Input Pill strictly for Step 1 and 3 */}
      {(step === 1 || step === 3) && (
        <form 
          onSubmit={handleTextInputSubmit}
          className="absolute bottom-12 w-full px-6 flex justify-center animate-in slide-in-from-bottom-8 duration-700"
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
              className={`h-14 w-14 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
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
      )}
    </div>
  );
}
