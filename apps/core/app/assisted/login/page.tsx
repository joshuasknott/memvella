"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Numpad } from "@/components/shared-senior/Numpad";
import { BrandLogo } from "@memvella/ui";
import { persistDeviceFingerprint } from "@/lib/device-fingerprint";
import {
  clearSeniorSession,
  saveSeniorSession,
} from "@/lib/senior-session-client";

export default function AssistedSetupPage() {
  const router = useRouter();

  const [pin, setPin] = useState("");
  const [isPairing, setIsPairing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleKeyPress = (value: string) => {
    if (pin.length < 6) {
      setPin((currentPin) => currentPin + value);
    }
  };

  const handleDelete = () => {
    setPin((currentPin) => currentPin.slice(0, -1));
    setError(null);
  };

  const handleConnect = async () => {
    if (pin.length !== 6) {
      return;
    }

    setError(null);
    setIsPairing(true);

    try {
      const response = await fetch("/api/assisted/pairing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pinCode: pin,
        }),
      });
      const result = (await response.json()) as
        | {
            success: true;
            sessionToken: string;
            seniorName: string;
            deviceFingerprint: string;
          }
        | {
            success: false;
            error: string;
          };

      if (!result.success) {
        setError(result.error);
        setPin("");
        return;
      }

      persistDeviceFingerprint("assisted", result.deviceFingerprint);
      clearSeniorSession("assisted");
      saveSeniorSession("assisted", {
        sessionToken: result.sessionToken,
        seniorName: result.seniorName,
        deviceFingerprint: result.deviceFingerprint,
      });
      router.push("/assisted");
    } catch (pairingError) {
      console.error(pairingError);
      setError("Something went wrong. Please try again.");
      setPin("");
    } finally {
      setIsPairing(false);
    }
  };

  const boxes = Array.from({ length: 6 });

  return (
    <main className="relative flex min-h-dvh w-full flex-col items-center justify-center bg-white p-6 font-body">
      <div className="flex w-full flex-col items-center">
        <header className="mb-8 flex h-14 w-full max-w-lg items-center justify-between relative">
          <button
            onClick={() => router.back()}
            className="flex w-fit items-center gap-2 font-medium text-[#4e0078] transition-opacity hover:opacity-80 z-10"
          >
            <ArrowLeft size={24} /> Back
          </button>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <BrandLogo standalone animated className="w-auto h-8 md:h-10 drop-shadow-sm" />
          </div>
          <div className="w-[84px]" aria-hidden="true" />
        </header>

        <div className="mb-12 space-y-4 text-center">
          <h1 className="font-headline text-5xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Let&apos;s connect your tablet.
          </h1>
          <p className="font-headline text-2xl font-medium text-slate-600 md:text-3xl">
            Ask an Organiser for the 6-digit code on their phone.
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          {boxes.map((_, index) => (
            <div
              key={index}
              className={`flex h-20 w-16 items-center justify-center rounded-2xl border-2 bg-white text-5xl font-bold text-slate-900 transition-colors ${
                error
                  ? "border-red-400"
                  : pin[index]
                    ? "border-[#6B21A8]"
                    : "border-gray-200"
              }`}
            >
              {pin[index] ? "*" : ""}
            </div>
          ))}
        </div>

        <div className="mb-8 flex h-10 items-center justify-center">
          {error ? (
            <p className="text-center font-headline text-xl font-semibold text-red-500">
              {error}
            </p>
          ) : null}
        </div>

        <Numpad onInput={handleKeyPress} onDelete={handleDelete} disabled={isPairing} />

        {pin.length === 6 ? (
          <button
            onClick={handleConnect}
            disabled={isPairing}
            className="mt-8 flex w-full max-w-lg items-center justify-center gap-3 rounded-3xl bg-[#6B21A8] py-6 text-2xl font-semibold text-white shadow-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPairing ? (
              <>
                <Loader2 className="h-7 w-7 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect to Memvella"
            )}
          </button>
        ) : null}
      </div>
    </main>
  );
}
