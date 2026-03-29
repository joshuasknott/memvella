"use client";

import { useState, useCallback, useRef } from 'react';
import { Mic, MicOff, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
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
  const [contactMethod, setContactMethod] = useState('');
  
  // -- Voice / Text Input State --
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // -- Refs --
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // -- Voice Helpers --
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
        if (finalCaptured && step === 1) {
          // Fire auto-submit logic if we are using voice
          setName(finalCaptured);
          setStep(2);
          setInputValue('');
        }
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      alert("Microphone access denied. Please type instead.");
      setIsListening(false);
    }
  }, [step, stopRecording]);

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

    if (step === 1) {
      setName(inputValue);
      setStep(2);
      setInputValue('');
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMethod) return;
    setIsProcessing(true);

    try {
      // Mock magic link / passwordless auth sending
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsProcessing(false);
      setStep(3); // Move to biometric prompt
    } catch (err) {
      console.error(err);
      alert("An error occurred creating your account.");
      setIsProcessing(false);
    }
  };

  const skipBiometrics = () => router.push('/senior');
  const enableBiometrics = async () => {
    // Mock enabling FaceID/TouchID via WebAuthn
    await new Promise(resolve => setTimeout(resolve, 500));
    router.push('/senior');
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
            onClick={() => setStep(1)} 
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
               Hi there! What should I call you?
             </h1>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="w-full max-w-md animate-in slide-in-from-right-8 fade-in duration-500">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] text-center mb-8">
              Nice to meet you, {name}. Where should we send your login link?
            </h1>
            
            <FormCard as="form" onSubmit={handleStep2Submit} className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="font-medium text-on-surface-variant ml-2 text-lg">Email Address or Phone Number</label>
                <TextInput 
                  type="text" 
                  autoFocus
                  required
                  value={contactMethod}
                  onChange={e => setContactMethod(e.target.value)}
                  placeholder="hello@example.com or 555-123-4567"
                  disabled={isProcessing}
                />
              </div>

              <PrimaryButton 
                type="submit"
                disabled={isProcessing}
                className="mt-4"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin w-6 h-6 mr-2" />
                    Sending link...
                  </>
                ) : (
                  <>
                    Send Login Link <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </PrimaryButton>
            </FormCard>
          </div>
        )}

        {/* STEP 3 - BIOMETRICS PROMPT */}
        {step === 3 && (
          <div className="w-full max-w-md animate-in slide-in-from-right-8 fade-in duration-500">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] text-center mb-6">
              Enable Faster Access
            </h1>
            <p className="text-on-surface-variant text-lg text-center mb-8">
              Use FaceID or TouchID to log in seamlessly next time without waiting for a link.
            </p>
            
            <FormCard className="flex flex-col gap-4">
              <PrimaryButton 
                onClick={enableBiometrics}
                type="button"
                className="w-full justify-center"
              >
                Enable FaceID / TouchID
              </PrimaryButton>
              <SecondaryButton 
                onClick={skipBiometrics}
                type="button"
                className="w-full justify-center opacity-80"
              >
                Skip for now
              </SecondaryButton>
            </FormCard>
          </div>
        )}
      </div>

      {/* Reusable Input Pill strictly for Step 1 */}
      {step === 1 && (
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
      )}
    </div>
  );
}
