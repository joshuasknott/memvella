"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormCard } from "@/components/ui/FormCard";
import { TextInput } from "@/components/ui/Input";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { getDeviceFingerprint } from "@/lib/device-fingerprint";
import {
  registerIndependentPasskey,
  signInWithIndependentPasskey,
} from "@/lib/independent-passkey-client";
import {
  clearSeniorRecoveryHint,
  saveSeniorSession,
} from "@/lib/senior-session-client";

type Step = "recovery" | "passkey";

type RecoverySession = {
  sessionToken: string;
  seniorName: string;
};

function normalizeRecoveryCode(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  return digits.match(/.{1,4}/g)?.join("-") ?? digits;
}

function compactRecoveryCode(value: string) {
  return value.replace(/\D/g, "");
}

export default function IndependentRecoveryPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("recovery");
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoverySession, setRecoverySession] = useState<RecoverySession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUsingPasskey, setIsUsingPasskey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getDeviceFingerprint("independent").then(setDeviceFingerprint);
  }, []);

  const finishRecovery = () => {
    router.replace("/independent");
  };

  const handleUsePasskey = async () => {
    if (!deviceFingerprint) {
      setError("Memvella is still preparing this device. Please try again.");
      return;
    }

    setIsUsingPasskey(true);
    setError(null);

    try {
      const result = await signInWithIndependentPasskey(deviceFingerprint);
      saveSeniorSession("independent", {
        sessionToken: result.sessionToken,
        deviceFingerprint,
        hasPasskey: true,
        ...(result.seniorName ? { seniorName: result.seniorName } : {}),
      });
      clearSeniorRecoveryHint("independent");
      router.replace("/independent");
    } catch (passkeyError) {
      console.error(passkeyError);
      setError(
        passkeyError instanceof Error
          ? passkeyError.message
          : "Memvella could not finish passkey sign-in.",
      );
    } finally {
      setIsUsingPasskey(false);
    }
  };

  const handleRecoveryCode = async () => {
    if (!deviceFingerprint) {
      setError("Memvella is still preparing this device. Please try again.");
      return;
    }

    const normalizedCode = compactRecoveryCode(recoveryCode);
    if (normalizedCode.length !== 12) {
      setError("Enter a 12-digit recovery code.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/independent/recovery-codes/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recoveryCode: normalizedCode,
          deviceFingerprint,
        }),
      });
      const payload = (await response.json()) as {
        status?: string;
        sessionToken?: string;
        seniorName?: string;
        message?: string;
        error?: string;
      };

      if (!response.ok || payload.status !== "ready" || !payload.sessionToken) {
        throw new Error(payload.message ?? payload.error ?? "That recovery code is no longer available.");
      }

      saveSeniorSession("independent", {
        sessionToken: payload.sessionToken,
        deviceFingerprint,
        seniorName: payload.seniorName,
        hasPasskey: false,
      });
      clearSeniorRecoveryHint("independent");
      setRecoverySession({
        sessionToken: payload.sessionToken,
        seniorName: payload.seniorName ?? "Friend",
      });
      setStep("passkey");
    } catch (recoveryError) {
      console.error(recoveryError);
      setError(
        recoveryError instanceof Error
          ? recoveryError.message
          : "Memvella could not use that recovery code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePasskey = async () => {
    if (!recoverySession || !deviceFingerprint) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await registerIndependentPasskey({
        sessionToken: recoverySession.sessionToken,
        deviceFingerprint,
      });

      saveSeniorSession("independent", {
        sessionToken: recoverySession.sessionToken,
        deviceFingerprint,
        seniorName: recoverySession.seniorName,
        hasPasskey: true,
      });
      clearSeniorRecoveryHint("independent");
      finishRecovery();
    } catch (passkeyError) {
      console.error(passkeyError);
      setError(
        passkeyError instanceof Error
          ? passkeyError.message
          : "Memvella could not create a passkey on this device.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-surface p-6 md:p-12">
      <FormCard className="flex w-full max-w-xl flex-col gap-6 p-8 md:p-10">
        {step === "recovery" ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/independent"
                className="flex items-center gap-2 text-sm font-semibold text-[#4e0078] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
              <button
                type="button"
                onClick={() => {
                  void handleUsePasskey();
                }}
                disabled={isUsingPasskey || !deviceFingerprint}
                className="text-sm font-semibold text-[#4e0078] hover:underline disabled:opacity-60"
              >
                {isUsingPasskey ? "Checking passkey..." : "Use a passkey instead"}
              </button>
            </div>

            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
                I can&apos;t use this device
              </h1>
              <p className="mt-3 text-lg leading-relaxed text-on-surface-variant">
                Enter one of your recovery codes to sign in and set up this device again.
              </p>
            </div>

            <div className="space-y-2">
              <label className="font-headline text-lg font-bold" htmlFor="recovery-code">
                Recovery code
              </label>
              <TextInput
                id="recovery-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="1234-5678-9012"
                value={recoveryCode}
                onChange={(event) => setRecoveryCode(normalizeRecoveryCode(event.target.value))}
                disabled={isSubmitting}
              />
              <p className="px-1 text-sm text-gray-500">Use the 12-digit code you saved when you first set up Memvella.</p>
            </div>

            <div className="rounded-3xl border border-amber-100 bg-amber-50 px-5 py-5 text-left">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div>
                  <p className="text-base font-bold text-amber-900">Need more help?</p>
                  <p className="mt-1 text-sm leading-relaxed text-amber-900/80">
                    Ask your Organiser for recovery help if you do not have a code. They can revoke a lost device or create a fresh set of recovery codes without signing in as you.
                  </p>
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
                {error}
              </div>
            ) : null}

            <PrimaryButton
              type="button"
              onClick={() => {
                void handleRecoveryCode();
              }}
              disabled={isSubmitting || compactRecoveryCode(recoveryCode).length !== 12}
              className="justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Checking code...
                </>
              ) : (
                "Continue"
              )}
            </PrimaryButton>
          </>
        ) : null}

        {step === "passkey" && recoverySession ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#4e0078]/10 text-[#4e0078]">
              <KeyRound className="h-8 w-8" />
            </div>

            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
                Set up this device again
              </h1>
              <p className="mt-3 text-lg leading-relaxed text-on-surface-variant">
                Create a fresh passkey for {recoverySession.seniorName} so you can sign in here with your face, fingerprint, or device screen lock next time.
              </p>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
                {error}
              </div>
            ) : null}

            <PrimaryButton
              type="button"
              onClick={() => {
                void handleCreatePasskey();
              }}
              disabled={isSubmitting || !deviceFingerprint}
              className="justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating passkey...
                </>
              ) : (
                "Create passkey"
              )}
            </PrimaryButton>

            <SecondaryButton type="button" onClick={finishRecovery} className="justify-center">
              Continue for now
            </SecondaryButton>
          </>
        ) : null}
      </FormCard>
    </main>
  );
}
