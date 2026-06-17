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
    <main className="relative flex min-h-dvh w-full flex-col items-center justify-start overflow-x-hidden bg-white p-4 font-body md:justify-center md:p-6">
      <div className="flex w-full flex-col items-center">
        <header className="relative mb-5 flex h-14 w-full max-w-lg items-center justify-between md:mb-8">
          <button
            onClick={() => router.back()}
            className="flex w-fit items-center gap-2 font-medium text-family-primary transition-opacity hover:opacity-80 z-10"
          >
            <ArrowLeft size={24} /> Back
          </button>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <BrandLogo standalone className="w-auto h-8 md:h-10 drop-shadow-sm" />
          </div>
          <div className="w-[84px]" aria-hidden="true" />
        </header>

        <div className="mb-6 space-y-3 text-center md:mb-12 md:space-y-4">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-text-primary md:text-6xl">
            Connect the companion tablet.
          </h1>
          <p className="font-headline text-xl font-medium text-text-secondary md:text-3xl">
            Ask a Supporter for the 6-digit tablet code on their phone.
          </p>
        </div>

        <div className="mb-3 grid w-full max-w-[342px] grid-cols-6 gap-2 md:mb-6 md:max-w-lg md:gap-4">
          {boxes.map((_, index) => (
            <div
              key={index}
              className={`flex h-14 w-full items-center justify-center rounded-2xl border-2 bg-white text-4xl font-bold text-text-primary transition-colors md:h-20 md:text-5xl ${
                error
                  ? "border-red-400"
                  : pin[index]
                    ? "border-senior-primary"
                    : "border-gray-200"
              }`}
            >
              {pin[index] ? "*" : ""}
            </div>
          ))}
        </div>

        <div className="mb-4 flex h-8 items-center justify-center md:mb-8 md:h-10">
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
            className="mt-4 flex w-full max-w-lg items-center justify-center gap-3 rounded-3xl bg-senior-primary py-5 text-2xl font-semibold text-white shadow-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 md:mt-8 md:py-6"
          >
            {isPairing ? (
              <>
                <Loader2 className="h-7 w-7 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect companion"
            )}
          </button>
        ) : null}
      </div>
    </main>
  );
}
