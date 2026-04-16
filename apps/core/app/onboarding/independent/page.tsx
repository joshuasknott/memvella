"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { PrimaryButton, SecondaryButton, TextInput, BrandLogo } from "@memvella/ui";
import { FormCard } from "@/components/ui/FormCard";
import { api } from "@/convex/_generated/api";
import { getDeviceFingerprint } from "@/lib/device-fingerprint";
import { registerIndependentPasskey } from "@/lib/independent-passkey-client";
import {
  clearSeniorRecoveryHint,
  saveSeniorSession,
} from "@/lib/senior-session-client";

type Step = "details" | "passkey" | "recovery";

type ReadySession = {
  sessionToken: string;
  seniorName: string;
};

function IndependentSetupContent() {
  const router = useRouter();
  const generateRecoveryCodes = useMutation(api.independentAccess.rotateIndependentRecoveryCodes);

  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null);
  const [readySession, setReadySession] = useState<ReadySession | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingRecoveryCodes, setIsGeneratingRecoveryCodes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getDeviceFingerprint("independent").then(setDeviceFingerprint);
  }, []);

  const finishSetup = () => {
    router.replace("/independent");
  };

  const handleStart = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Please tell Memvella what to call you.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/independent/onboarding/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: name.trim(),
        }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Memvella could not start setup on this device.");
      }

      setStep("passkey");
    } catch (setupError) {
      console.error(setupError);
      setError(
        setupError instanceof Error
          ? setupError.message
          : "Memvella could not start setup on this device.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePasskey = async () => {
    if (!deviceFingerprint) {
      setError("Memvella is still preparing this device. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await registerIndependentPasskey({ deviceFingerprint });
      if (!result.sessionToken) {
        throw new Error("Memvella could not finish passkey setup.");
      }

      const nextSession = {
        sessionToken: result.sessionToken,
        deviceFingerprint,
        seniorName: result.seniorName ?? name.trim(),
        hasPasskey: true,
      };

      saveSeniorSession("independent", nextSession);
      clearSeniorRecoveryHint("independent");
      setReadySession({
        sessionToken: result.sessionToken,
        seniorName: result.seniorName ?? name.trim(),
      });
      setStep("recovery");
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

  const handleGenerateRecoveryCodes = async () => {
    if (!readySession || !deviceFingerprint) {
      return;
    }

    setIsGeneratingRecoveryCodes(true);
    setError(null);

    try {
      const result = await generateRecoveryCodes({
        sessionToken: readySession.sessionToken,
        deviceFingerprint,
      });
      setRecoveryCodes(result.codes);
    } catch (recoveryError) {
      console.error(recoveryError);
      setError(
        recoveryError instanceof Error
          ? recoveryError.message
          : "Memvella could not create recovery codes right now.",
      );
    } finally {
      setIsGeneratingRecoveryCodes(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-surface p-6 font-body text-text-primary selection:bg-family-primary-fixed selection:text-family-primary md:p-12">
      <div className="relative z-20 mb-8 flex h-14 w-full max-w-7xl items-center justify-between">
        {step === "details" ? (
          <Link
            href="/"
            className="z-10 flex w-fit items-center gap-2 font-semibold text-family-primary transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} /> Exit
          </Link>
        ) : (
          <div className="w-20" aria-hidden="true" />
        )}

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <BrandLogo standalone className="h-8 w-auto drop-shadow-sm md:h-10" />
        </div>

        <div className="z-10 flex gap-2">
          <div className="h-2 w-8 rounded-full bg-family-primary md:w-12" />
          <div
            className={`h-2 w-8 rounded-full md:w-12 ${
              step === "passkey" || step === "recovery"
                ? "bg-family-primary"
                : "bg-outline-variant/30"
            }`}
          />
          <div
            className={`h-2 w-8 rounded-full md:w-12 ${
              step === "recovery" ? "bg-family-primary" : "bg-outline-variant/30"
            }`}
          />
        </div>
      </div>

      <div className="relative z-10 flex w-full max-w-3xl flex-1 flex-col items-center justify-center">
        {step === "details" ? (
          <div className="w-full max-w-md animate-in slide-in-from-right-8 fade-in duration-500">
            <h1 className="mb-4 text-center text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
              Set Up My Own Profile
            </h1>
            <p className="mb-8 text-center text-lg leading-relaxed text-text-secondary">
              Start with your name, then create a passkey on this device using your face, fingerprint, or device screen lock.
            </p>

            <form onSubmit={handleStart}>
              <FormCard className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="ml-2 text-lg font-medium text-text-secondary">
                  What should Memvella call you?
                </label>
                <TextInput
                  type="text"
                  autoFocus
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. David"
                  disabled={isSubmitting}
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-status-alert">
                  {error}
                </div>
              ) : null}

                <PrimaryButton
                  type="submit"
                  disabled={!name.trim() || isSubmitting || !deviceFingerprint}
                  className="mt-4"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    "Continue"
                  )}
                </PrimaryButton>
              </FormCard>
            </form>
          </div>
        ) : null}

        {step === "passkey" ? (
          <div className="w-full max-w-xl animate-in slide-in-from-right-8 fade-in duration-500">
            <FormCard className="flex flex-col gap-6 text-center">
              <div className="mx-auto flex h-12 w-16 items-center justify-center rounded-full bg-family-primary/10 text-family-primary">
                <ShieldCheck className="h-8 w-8" />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
                  Create your passkey
                </h1>
                <p className="mt-3 text-lg leading-relaxed text-text-secondary">
                  This keeps sign-in simple on this device. You can use your face, fingerprint, or device screen lock the next time you open Memvella.
                </p>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-status-alert">
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
            </FormCard>
          </div>
        ) : null}

        {step === "recovery" && readySession ? (
          <div className="w-full max-w-xl animate-in slide-in-from-right-8 fade-in duration-500">
            <FormCard className="flex flex-col gap-6 text-center">
              <div className="mx-auto flex h-12 w-16 items-center justify-center rounded-full bg-family-accent/10 text-family-accent">
                <KeyRound className="h-8 w-8" />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
                  Add recovery codes
                </h1>
                <p className="mt-3 text-lg leading-relaxed text-text-secondary">
                  If you ever can&apos;t use this device, recovery codes help you sign in and set up a new passkey.
                </p>
              </div>

              {recoveryCodes ? (
                <div className="rounded-xl border border-family-accent/10 bg-family-accent/10 p-5 text-left">
                  <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-family-accent">
                    Store these somewhere safe
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {recoveryCodes.map((code) => (
                      <div
                        key={code}
                        className="rounded-xl bg-surface px-4 py-4 text-center text-lg font-bold tracking-[0.12em] text-text-primary shadow-sm"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                    These codes are shown once. When you create a new set, the older set stops working.
                  </p>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-status-alert">
                  {error}
                </div>
              ) : null}

              {recoveryCodes ? (
                <PrimaryButton type="button" onClick={finishSetup} className="justify-center">
                  I stored these safely
                </PrimaryButton>
              ) : (
                <PrimaryButton
                  type="button"
                  onClick={() => {
                    void handleGenerateRecoveryCodes();
                  }}
                  disabled={isGeneratingRecoveryCodes || !deviceFingerprint}
                  className="justify-center"
                >
                  {isGeneratingRecoveryCodes ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating recovery codes...
                    </>
                  ) : (
                    "Show recovery codes"
                  )}
                </PrimaryButton>
              )}

              <SecondaryButton type="button" onClick={finishSetup} className="justify-center">
                Finish for now
              </SecondaryButton>
            </FormCard>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function IndependentSetupFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface p-6">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-senior-primary/20 border-t-senior-primary" />
    </div>
  );
}

export default function IndependentSetupPage() {
  return (
    <Suspense fallback={<IndependentSetupFallback />}>
      <IndependentSetupContent />
    </Suspense>
  );
}
