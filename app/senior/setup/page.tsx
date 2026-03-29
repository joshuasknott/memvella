"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Delete, ArrowLeft, Loader2 } from 'lucide-react';

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
        localStorage.removeItem('memvella_caregiverId');
        localStorage.removeItem('memvella_lovedOneName');

        // Persist caregiver context to localStorage so the kiosk home page
        // can read it without a Better Auth session
        localStorage.setItem('memvella_caregiverId', result.caregiverId);
        localStorage.setItem('memvella_seniorName', result.seniorName);
        router.push('/senior');
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
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-white font-body p-6 relative">
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
            Ask your caregiver for the 6-digit code on their phone.
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
        <div className="grid grid-cols-3 gap-6 w-full max-w-lg mx-auto mb-10">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              disabled={isPairing}
              className="h-24 bg-gray-50 text-slate-900 text-4xl font-bold rounded-3xl active:bg-gray-200 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          {/* Empty Space */}
          <div></div>

          {/* Zero */}
          <button
            onClick={() => handleKeyPress('0')}
            disabled={isPairing}
            className="h-24 bg-gray-50 text-slate-900 text-4xl font-bold rounded-3xl active:bg-gray-200 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
          >
            0
          </button>

          {/* Delete / Backspace */}
          <button
            onClick={handleDelete}
            disabled={isPairing}
            className="h-24 bg-gray-50 text-slate-600 flex items-center justify-center rounded-3xl active:bg-gray-200 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
          >
            <Delete size={40} strokeWidth={2.5} />
          </button>
        </div>

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
