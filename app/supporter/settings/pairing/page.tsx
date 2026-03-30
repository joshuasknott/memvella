"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Loader2, MonitorSmartphone, RefreshCw, WifiOff } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useFamilySpaceProfile } from "@/lib/use-family-space-profile";

export default function PairingSettingsPage() {
  const { seniorDisplayName } = useFamilySpaceProfile();
  const generatePin = useMutation(api.kiosk.generateKioskPin);
  const deactivate = useMutation(api.kiosk.deactivateKioskDevice);

  const [pin, setPin] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleGeneratePin = async () => {
    setIsGenerating(true);
    try {
      const result = await generatePin({ seniorName: seniorDisplayName });
      setPin(result.pinCode);
    } catch (generationError) {
      console.error("Failed to generate PIN:", generationError);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      await deactivate({});
      setPin(null);
    } catch (deactivationError) {
      console.error("Failed to deactivate:", deactivationError);
    } finally {
      setIsDeactivating(false);
    }
  };

  const formattedPin = pin ? `${pin.slice(0, 3)}-${pin.slice(3)}` : null;

  return (
    <div className="flex flex-1 w-full flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-10 flex h-24 w-24 flex-col items-center justify-center overflow-hidden rounded-full border border-purple-100 bg-purple-50 shadow-sm">
        <MonitorSmartphone className="z-10 h-10 w-10 text-purple-600" />
        <div className="absolute bottom-0 right-0 h-12 w-12 rounded-full bg-purple-200/50 blur-xl" />
      </div>

      <p className="mb-4 font-headline text-2xl font-bold text-gray-900">
        Pair Assisted Senior Tablet
      </p>
      <p className="mb-8 max-w-[260px] text-lg leading-relaxed text-gray-500">
        {pin
          ? `Show this code to ${seniorDisplayName} and enter it on the tablet to connect securely.`
          : `Generate a code to connect ${seniorDisplayName}'s tablet to Memvella.`}
      </p>

      <div className="mb-6 w-full max-w-[300px] rounded-3xl border-2 border-dashed border-purple-200 bg-white p-8 shadow-sm">
        {formattedPin ? (
          <span className="font-mono text-4xl font-bold tracking-[0.2em] text-purple-600">
            {formattedPin}
          </span>
        ) : (
          <span className="font-mono text-4xl font-bold tracking-[0.2em] text-purple-200">
            ...-...
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleGeneratePin}
        disabled={isGenerating}
        className="mb-3 flex w-full max-w-[300px] items-center justify-center gap-2 rounded-2xl bg-[#6B21A8] py-4 text-base font-semibold text-white shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            {pin ? "Generate New Code" : "Generate Code"}
          </>
        )}
      </button>

      {pin ? (
        <button
          type="button"
          onClick={handleDeactivate}
          disabled={isDeactivating}
          className="flex w-full max-w-[300px] items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-transparent py-3 text-sm font-medium text-gray-500 transition-all active:scale-95 hover:bg-gray-50"
        >
          {isDeactivating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Deactivating...
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              Deactivate Tablet
            </>
          )}
        </button>
      ) : null}
    </div>
  );
}
