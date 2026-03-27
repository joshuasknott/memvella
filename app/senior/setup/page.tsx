"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Delete, ArrowLeft } from 'lucide-react';

export default function SeniorSetupPage() {
  const [pin, setPin] = useState<string>('');
  const router = useRouter();

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
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
        <div className="flex gap-4 mb-14">
          {boxes.map((_, i) => (
            <div 
              key={i} 
              className="h-20 w-16 border-2 border-gray-200 rounded-2xl text-5xl font-bold flex items-center justify-center text-slate-900 bg-white"
            >
              {pin[i] || ''}
            </div>
          ))}
        </div>

        {/* Massive Keypad */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-lg mx-auto mb-10">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="h-24 bg-gray-50 text-slate-900 text-4xl font-bold rounded-3xl active:bg-gray-200 shadow-sm transition-transform active:scale-95"
            >
              {num}
            </button>
          ))}
          {/* Empty Space */}
          <div></div>
          
          {/* Zero */}
          <button
            onClick={() => handleKeyPress('0')}
            className="h-24 bg-gray-50 text-slate-900 text-4xl font-bold rounded-3xl active:bg-gray-200 shadow-sm transition-transform active:scale-95"
          >
            0
          </button>
          
          {/* Delete / Backspace */}
          <button
            onClick={handleDelete}
            className="h-24 bg-gray-50 text-slate-600 flex items-center justify-center rounded-3xl active:bg-gray-200 shadow-sm transition-transform active:scale-95"
          >
            <Delete size={40} strokeWidth={2.5} />
          </button>
        </div>

        {/* Action Button conditionally hidden or shown */}
        {pin.length === 6 && (
          <button
            onClick={() => router.push('/senior')}
            className="w-full max-w-lg bg-[#4e0078] text-white rounded-3xl py-6 font-semibold text-2xl hover:bg-[#3d005e] active:scale-95 transition-all shadow-md animate-in slide-in-from-bottom flex items-center justify-center"
          >
            Connect to Memvella
          </button>
        )}
      </div>
    </main>
  );
}
