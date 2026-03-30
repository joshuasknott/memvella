"use client";

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { MonitorSmartphone, RefreshCw, Loader2, WifiOff } from 'lucide-react';

export default function PairingSettingsPage() {
  const generatePin = useMutation(api.kiosk.generateKioskPin);
  const deactivate = useMutation(api.kiosk.deactivateKioskDevice);

  const lovedOneName = "your loved one"; // TODO: wire to Convex profile

  const [pin, setPin] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleGeneratePin = async () => {
    setIsGenerating(true);
    try {
      const result = await generatePin({ seniorName: lovedOneName });
      setPin(result.pinCode);
    } catch (err) {
      console.error('Failed to generate PIN:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      await deactivate({});
      setPin(null);
    } catch (err) {
      console.error('Failed to deactivate:', err);
    } finally {
      setIsDeactivating(false);
    }
  };

  // Format PIN as XXX-XXX for readability
  const formattedPin = pin ? `${pin.slice(0, 3)}-${pin.slice(3)}` : null;

  return (
    <div className="flex flex-col items-center justify-center px-4 w-full flex-1 text-center">
      <div className="w-24 h-24 bg-purple-50 rounded-full flex flex-col items-center justify-center mb-10 border border-purple-100 shadow-sm relative overflow-hidden">
        <MonitorSmartphone className="w-10 h-10 text-purple-600 z-10" />
        <div className="absolute -bottom-4 right-0 w-12 h-12 bg-purple-200/50 rounded-full blur-xl"></div>
      </div>

      <p className="font-headline text-2xl font-bold text-gray-900 mb-4">Pair Senior Tablet</p>
      <p className="text-gray-500 text-sm max-w-[240px] leading-relaxed mb-8">
        {pin
          ? `Show this code to ${lovedOneName} and enter it on the tablet to connect securely.`
          : `Generate a code to connect ${lovedOneName}'s device to Memvella.`}
      </p>

      {/* PIN Display */}
      <div className="bg-white border-2 border-dashed border-purple-200 rounded-3xl p-8 w-full shadow-sm max-w-[300px] mb-6">
        {formattedPin ? (
          <span className="font-mono font-bold tracking-[0.2em] text-4xl text-purple-600">
            {formattedPin}
          </span>
        ) : (
          <span className="font-mono font-bold tracking-[0.2em] text-4xl text-purple-200">
            ···-···
          </span>
        )}
      </div>

      {/* Generate / Regenerate Button */}
      <button
        onClick={handleGeneratePin}
        disabled={isGenerating}
        className="w-full max-w-[300px] bg-[#4e0078] text-white rounded-2xl py-3.5 font-semibold text-base hover:bg-[#3d005e] active:scale-95 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            {pin ? 'Generate New Code' : 'Generate Code'}
          </>
        )}
      </button>

      {/* Deactivate Button — only shown when a PIN is active */}
      {pin && (
        <button
          onClick={handleDeactivate}
          disabled={isDeactivating}
          className="w-full max-w-[300px] bg-transparent text-gray-400 border border-gray-200 rounded-2xl py-3 font-medium text-sm hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isDeactivating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Deactivating...
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              Deactivate Tablet
            </>
          )}
        </button>
      )}
    </div>
  );
}
