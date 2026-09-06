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
    if (pin.length !== 6 || isPairing) {
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

  return (
    <main className="companion-pairing relative flex min-h-dvh w-full flex-col items-center justify-start overflow-x-hidden bg-canvas p-4 font-senior md:justify-center md:p-6">
      <div className="flex w-full flex-col items-center">
        <header className="relative mb-5 flex h-14 w-full max-w-lg items-center justify-between md:mb-8">
          <button
            onClick={() => router.back()}
            className="flex min-h-[44px] w-fit items-center gap-2 font-medium text-family-primary transition-opacity hover:opacity-80 z-10"
          >
            <ArrowLeft size={24} /> Back
          </button>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <BrandLogo standalone className="w-auto h-8 md:h-10" />
          </div>
          <div className="w-[84px]" aria-hidden="true" />
        </header>

        <div className="mb-6 space-y-3 text-center md:mb-12 md:space-y-4">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-text-primary md:text-6xl">
            Connect the companion tablet.
          </h1>
          <p className="font-headline text-xl font-medium text-text-secondary md:text-3xl">
            Ask the person who set up Memvella for the 6-digit code in Settings, Companion tablet.
          </p>
        </div>

        <label htmlFor="tablet-code" className="mb-3 text-2xl font-bold">Tablet code</label>
        <input
          id="tablet-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={pin}
          disabled={isPairing}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "tablet-code-error" : undefined}
          onChange={(event) => {
            setPin(event.target.value.replace(/\D/g, "").slice(0, 6));
            setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleConnect();
            }
          }}
          className="mb-4 min-h-[72px] w-full max-w-lg rounded-2xl border-2 border-input-border bg-white p-3 text-center text-4xl tracking-[0.2em] text-text-primary"
        />

        <div className="mb-4 flex min-h-8 items-center justify-center md:mb-8 md:min-h-10">
          {error ? (
            <p id="tablet-code-error" role="alert" className="text-center font-headline text-xl font-semibold text-status-alert">
              {error}
            </p>
          ) : null}
        </div>

        <Numpad onInput={handleKeyPress} onDelete={handleDelete} disabled={isPairing} />

        {pin.length === 6 ? (
          <button
            onClick={handleConnect}
            disabled={isPairing}
            data-testid="assisted-connect-button"
            className="mt-4 flex w-full max-w-lg items-center justify-center gap-3 rounded-full bg-senior-primary py-5 text-2xl font-semibold text-white shadow-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 md:mt-8 md:py-6"
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
