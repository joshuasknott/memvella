"use client";

import { useState, useCallback, useRef } from 'react';
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/Input';
import { FormCard } from '@/components/ui/FormCard';
import { VoiceInputPill } from '@/components/shared-senior/VoiceInputPill';

type Step = 1 | 2 | 3;

export default function IndependentSetupVoicePage() {
  const router = useRouter();
  
  // -- State Machine --
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVoiceSubmit = (text: string) => {
    if (step === 1) {
      setName(text);
      setStep(2);
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

  const skipBiometrics = () => router.push('/independent');
  const enableBiometrics = async () => {
    // Mock enabling FaceID/TouchID via WebAuthn
    await new Promise(resolve => setTimeout(resolve, 500));
    router.push('/independent');
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
        <VoiceInputPill onSubmit={handleVoiceSubmit} isProcessing={isProcessing} />
      )}
    </div>
  );
}
