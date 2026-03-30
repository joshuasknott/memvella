"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Numpad } from '@/components/shared-senior/Numpad';

export default function SeniorSetupPage() {
  const router = useRouter();
  const pairTablet = useMutation(api.kiosk.pairTabletSession);

  const [pin, setPin] = useState<string>('');
  const [isPairing, setIsPairing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  };

  const handleConnect = async () => {
    if (pin.length !== 6) return;
    setError(null);
    setIsPairing(true);
    try {
      const result = await pairTablet({ pinCode: pin });

      if (result.success) {
        // CRITICAL: Explicitly wipe old state to prevent state bleed
        localStorage.removeItem('memvella_seniorName');
        localStorage.removeItem('memvella_organizerId');
        localStorage.removeItem('memvella_friendName');

        // Persist organizer context to localStorage so the kiosk home page
        // can read it without a Better Auth session
        localStorage.setItem('memvella_organizerId', result.caregiverId); // Kept result field same assuming API wasn't changed yet
        localStorage.setItem('memvella_seniorName', result.seniorName);
        router.push('/assisted');
      } else {
        setError(result.error);
        setPin('');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setPin('');
      console.error(err);
    } finally {
      setIsPairing(false);
    }
  };

  const boxes = Array.from({ length: 6 });

  return (
    <main className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-white font-body p-6 relative">
      <div className="w-full flex flex-col items-center">

        {/* Escape Hatch */}
        <div className="w-full max-w-lg mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[#4e0078] font-medium hover:opacity-80 transition-opacity">
            <ArrowLeft size={24} /> Back
          </button>
        </div>

        {/* Headlines */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="font-headline text-slate-900 font-bold text-6xl tracking-tight">
            Let&apos;s connect your tablet.
          </h1>
          <p className="font-headline text-slate-600 font-medium text-3xl">
            Ask your Organizer for the 6-digit code on their phone.
          </p>
        </div>

        {/* PIN Input Display */}
        <div className="flex gap-4 mb-6">
          {boxes.map((_, i) => (
            <div
              key={i}
              className={`h-20 w-16 border-2 rounded-2xl text-5xl font-bold flex items-center justify-center text-slate-900 bg-white transition-colors ${
                error
                  ? 'border-red-400'
                  : pin[i]
                  ? 'border-[#4e0078]'
                  : 'border-gray-200'
              }`}
            >
              {pin[i] ? '●' : ''}
            </div>
          ))}
        </div>

        {/* Inline Error Message */}
        <div className="h-10 mb-8 flex items-center justify-center">
          {error && (
            <p className="font-headline font-semibold text-red-500 text-xl text-center animate-in slide-in-from-top duration-200">
              {error}
            </p>
          )}
        </div>

        {/* Massive Keypad */}
        <Numpad onInput={handleKeyPress} onDelete={handleDelete} disabled={isPairing} />

        {/* Connect Button — appears when PIN is complete */}
        {pin.length === 6 && (
          <button
            onClick={handleConnect}
            disabled={isPairing}
            className="w-full max-w-lg bg-[#4e0078] text-white rounded-3xl py-6 font-semibold text-2xl hover:bg-[#3d005e] active:scale-95 transition-all shadow-md animate-in slide-in-from-bottom flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isPairing ? (
              <>
                <Loader2 className="w-7 h-7 animate-spin" />
                Connecting…
              </>
            ) : (
              'Connect to Memvella'
            )}
          </button>
        )}
      </div>
    </main>
  );
}
