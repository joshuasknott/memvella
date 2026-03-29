"use client";

import { useState } from 'react';
import BrandLogo from '@/components/BrandLogo';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';

export default function UniversalSplash() {
  const [view, setView] = useState<'initial' | 'selfSetup'>('initial');

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-linear-to-b from-primary-fixed border-t border-transparent to-surface px-6 text-center font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      <div className="mb-12">
        <BrandLogo className="w-auto h-20 md:h-24 drop-shadow-sm transition-all" />
      </div>
      
      {view === 'initial' ? (
        <div className="w-full max-w-lg flex flex-col items-center animate-in slide-in-from-bottom-4 fade-in duration-500 zoom-in-95">
          <div className="space-y-4 mb-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] text-center mb-8">
              Welcome to Memvella.
            </h1>
            <p className="text-xl md:text-2xl text-on-surface-variant font-medium tracking-wide text-center">
              Who is setting this up today?
            </p>
          </div>

          <div className="flex flex-col gap-6 w-full max-w-sm md:max-w-md mx-auto">
            <PrimaryButton href="/onboarding/caregiver">
              I am a Caregiver
            </PrimaryButton>

            <SecondaryButton onClick={() => setView('selfSetup')}>
              I am setting this up for myself
            </SecondaryButton>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-lg flex flex-col items-center animate-in slide-in-from-right-8 fade-in duration-500 zoom-in-95">
          <div className="space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] text-center mb-8">
              Connection Check
            </h2>
            <p className="text-xl md:text-2xl text-on-surface-variant font-medium tracking-wide text-center">
              Do you have a 6-digit connection code?
            </p>
          </div>

          <div className="flex flex-col gap-6 w-full max-w-sm md:max-w-md mx-auto">
            <PrimaryButton href="/senior/setup">
              Yes, I have a code
            </PrimaryButton>

            <SecondaryButton href="/onboarding/independent">
              No, I want to create an account
            </SecondaryButton>

            <SecondaryButton onClick={() => setView('initial')} className="mt-4">
              Back
            </SecondaryButton>
          </div>
        </div>
      )}
    </main>
  );
}
