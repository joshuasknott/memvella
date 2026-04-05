"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { FormCard } from "@/components/ui/FormCard";
import { TextInput } from "@/components/ui/Input";
import BrandLogo from "@/components/BrandLogo";
import { authClient } from "@/lib/auth-client";
import { getDeviceFingerprint } from "@/lib/device-fingerprint";
import { normalizePhoneNumber } from "@/lib/phone-number";
import {
  saveSeniorRecoveryHint,
  saveSeniorSession,
} from "@/lib/senior-session-client";

type Step = "details" | "verify" | "passkey";

type FinalizedSession = {
  sessionToken: string;
  recoveryKey: string;
  seniorName: string;
  recoveryPhoneNumber: string;
  hasPasskey: boolean;
};

type FinalizeResponse =
  | ({ status: "ready" } & FinalizedSession)
  | { status?: "role_collision"; message?: string; error?: string };

type PasskeyErrorLike = Error & {
  code?: string;
  cause?: unknown;
};

const CODE_LENGTH = 6;

const COUNTRY_CODES = [
  { code: "+44", name: "United Kingdom" },
  { code: "+1", name: "United States" },
  { code: "+1", name: "Canada" },
  { code: "+61", name: "Australia" },
  { code: "+64", name: "New Zealand" },
  { code: "+353", name: "Ireland" },
  { code: "+27", name: "South Africa" },
  { code: "+91", name: "India" },
  { code: "+49", name: "Germany" },
  { code: "+33", name: "France" },
  { code: "+34", name: "Spain" },
  { code: "+39", name: "Italy" },
  { code: "+31", name: "Netherlands" },
  { code: "+32", name: "Belgium" },
  { code: "+46", name: "Sweden" },
  { code: "+41", name: "Switzerland" },
  { code: "+43", name: "Austria" },
];

async function quietlySignOutIndependentBootstrapSession() {
  try {
    await authClient.signOut();
  } catch (error) {
    console.warn("Better Auth sign-out after bootstrap failed:", error);
  }
}

function shouldSkipPasskeyEnrollment(error: unknown) {
  const passkeyError = error as PasskeyErrorLike;
  const nestedCause =
    typeof passkeyError === "object" && passkeyError !== null
      ? passkeyError.cause
      : null;
  const names = new Set(
    [passkeyError, nestedCause]
      .filter((value): value is Error => value instanceof Error)
      .map((value) => value.name),
  );

  return (
    passkeyError.code === "ERROR_CEREMONY_ABORTED" ||
    passkeyError.code === "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY" ||
    names.has("AbortError") ||
    names.has("NotAllowedError") ||
    names.has("NotSupportedError") ||
    names.has("SecurityError")
  );
}

function IndependentSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionReason = searchParams.get("reason");

  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+44");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [normalizedPhoneNumber, setNormalizedPhoneNumber] = useState<string | null>(
    null,
  );
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null);
  const [finalizedSession, setFinalizedSession] =
    useState<FinalizedSession | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    void getDeviceFingerprint("independent").then(setDeviceFingerprint);
  }, []);

  const bannerMessage = useMemo(() => {
    if (sessionReason === "session-expired") {
      return "Your secure session ended. Enter your phone number to receive a fresh sign-in code.";
    }

    return null;
  }, [sessionReason]);

  const code = digits.join("");
  const isComplete = code.length === CODE_LENGTH && !digits.includes("");

  const focusBox = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError(null);

    if (digit && index < CODE_LENGTH - 1) {
      focusBox(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
        focusBox(index - 1);
      }
      setError(null);
    } else if (event.key === "ArrowLeft" && index > 0) {
      focusBox(index - 1);
    } else if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      focusBox(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);
    if (!pasted) {
      return;
    }

    const next = [...digits];
    for (let index = 0; index < pasted.length; index += 1) {
      next[index] = pasted[index];
    }
    setDigits(next);
    setError(null);
    focusBox(Math.min(pasted.length, CODE_LENGTH - 1));
  };

  const handleDetailsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Please tell Memvella what to call you first.");
      return;
    }

    const nextPhoneNumber = normalizePhoneNumber({
      countryCode,
      phoneNumber,
    });
    if (!nextPhoneNumber) {
      setError("Please enter a valid phone number.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await authClient.phoneNumber.sendOtp({
        phoneNumber: nextPhoneNumber,
      });
      if (result.error) {
        throw new Error(
          result.error.message ?? "Memvella could not send your secure sign-in code.",
        );
      }

      setNormalizedPhoneNumber(nextPhoneNumber);
      setDigits(Array(CODE_LENGTH).fill(""));
      setStep("verify");
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Memvella could not send your secure sign-in code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!normalizedPhoneNumber || !isComplete) {
      return;
    }

    if (!deviceFingerprint) {
      setError("Memvella is still preparing this device. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const verification = await authClient.phoneNumber.verify({
        phoneNumber: normalizedPhoneNumber,
        code,
        name: name.trim(),
      });
      if (verification.error) {
        throw new Error(verification.error.message ?? "Incorrect code. Please try again.");
      }

      const finalizeResponse = await fetch("/api/independent/finalize-phone-signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: name.trim(),
          phoneNumber: normalizedPhoneNumber,
          deviceFingerprint,
        }),
      });
      const finalizePayload = (await finalizeResponse.json()) as FinalizeResponse;

      if (!finalizeResponse.ok) {
        throw new Error(
          ("error" in finalizePayload ? finalizePayload.error : undefined) ??
            "Memvella could not finish your secure sign-in.",
        );
      }

      if (finalizePayload.status === "role_collision") {
        throw new Error(
          finalizePayload.message ??
            "This phone number is already linked to another Memvella account.",
        );
      }

      if (finalizePayload.status !== "ready") {
        throw new Error("Memvella could not finish your secure sign-in.");
      }

      const nextSession = {
        sessionToken: finalizePayload.sessionToken,
        recoveryKey: finalizePayload.recoveryKey,
        seniorName: finalizePayload.seniorName,
        recoveryPhoneNumber: finalizePayload.recoveryPhoneNumber,
        hasPasskey: finalizePayload.hasPasskey,
      } satisfies FinalizedSession;

      saveSeniorSession("independent", nextSession);
      saveSeniorRecoveryHint("independent", nextSession);
      setFinalizedSession(nextSession);
      setStep("passkey");
    } catch (verifyError) {
      console.error(verifyError);
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "Incorrect code. Please try again.",
      );
      setDigits(Array(CODE_LENGTH).fill(""));
      focusBox(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnablePasskey = async () => {
    if (!finalizedSession) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const optionsResponse = await fetch(
        "/api/independent/passkey/register/options",
        {
          method: "POST",
        },
      );
      const optionsPayload = (await optionsResponse.json()) as {
        error?: string;
        optionsJSON?: Record<string, unknown>;
      };

      if (!optionsResponse.ok || !optionsPayload.optionsJSON) {
        throw new Error(
          optionsPayload.error ?? "Unable to start Face ID / Touch ID setup.",
        );
      }

      const { startRegistration } = await import("@simplewebauthn/browser");
      const responseJSON = await startRegistration({
        optionsJSON: optionsPayload.optionsJSON as unknown as Parameters<
          typeof startRegistration
        >[0]["optionsJSON"],
      });

      const verifyResponse = await fetch(
        "/api/independent/passkey/register/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ responseJSON }),
        },
      );
      const verifyPayload = (await verifyResponse.json()) as { error?: string };

      if (!verifyResponse.ok) {
        throw new Error(
          verifyPayload.error ?? "Unable to finish Face ID / Touch ID setup.",
        );
      }

      saveSeniorSession("independent", {
        ...finalizedSession,
        hasPasskey: true,
      });
      saveSeniorRecoveryHint("independent", {
        ...finalizedSession,
        hasPasskey: true,
      });
      await quietlySignOutIndependentBootstrapSession();
      router.replace("/independent");
    } catch (passkeyError) {
      if (shouldSkipPasskeyEnrollment(passkeyError)) {
        await quietlySignOutIndependentBootstrapSession();
        router.replace("/independent");
        return;
      }

      console.error(passkeyError);
      setError(
        passkeyError instanceof Error
          ? passkeyError.message
          : "Memvella could not finish Face ID / Touch ID setup.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipPasskey = async () => {
    await quietlySignOutIndependentBootstrapSession();
    router.replace("/independent");
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-surface p-6 font-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed md:p-12">
      <div className="relative z-20 mb-8 flex h-14 w-full max-w-7xl items-center justify-between">
        {step === "details" ? (
          <Link
            href="/"
            className="z-10 flex w-fit items-center gap-2 font-semibold text-[#4e0078] transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} /> Exit
          </Link>
        ) : step === "verify" ? (
          <button
            type="button"
            onClick={() => setStep("details")}
            className="z-10 flex w-fit items-center gap-2 font-semibold text-[#4e0078] transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} /> Back
          </button>
        ) : (
          <div className="w-20" />
        )}

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <BrandLogo standalone animated className="h-8 w-auto drop-shadow-sm md:h-10" />
        </div>

        <div className="z-10 flex gap-2">
          <div className="h-2 w-8 rounded-full bg-primary transition-all duration-500 md:w-12" />
          <div
            className={`h-2 w-8 rounded-full transition-all duration-500 md:w-12 ${
              step === "verify" || step === "passkey"
                ? "bg-primary"
                : "bg-outline-variant/30"
            }`}
          />
          <div
            className={`h-2 w-8 rounded-full transition-all duration-500 md:w-12 ${
              step === "passkey" ? "bg-primary" : "bg-outline-variant/30"
            }`}
          />
        </div>
      </div>

      <div className="relative z-10 mb-24 flex w-full max-w-3xl flex-1 flex-col items-center justify-center">
        {bannerMessage ? (
          <div className="mb-6 w-full max-w-xl rounded-3xl border border-blue-100 bg-blue-50 px-6 py-5 text-center text-lg leading-relaxed text-blue-900">
            {bannerMessage}
          </div>
        ) : null}

        {step === "details" ? (
          <div className="w-full max-w-md animate-in slide-in-from-right-8 fade-in duration-500">
            <h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
              Set Up My Profile
            </h1>
            <FormCard as="form" onSubmit={handleDetailsSubmit} className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="ml-2 text-lg font-medium text-on-surface-variant">
                  What should Memvella call you?
                </label>
                <TextInput
                  type="text"
                  autoFocus
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g., David"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label className="ml-2 text-lg font-medium text-on-surface-variant">
                  Your Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(event) => setCountryCode(event.target.value)}
                    disabled={isSubmitting}
                    className="h-[60px] w-full max-w-[180px] cursor-pointer rounded-2xl border-2 border-transparent bg-surface-container px-3 py-[18px] text-center text-lg font-medium text-on-surface outline-none transition-all focus:border-[#4e0078]/30 focus:ring-4 focus:ring-[#4e0078]/10"
                  >
                    {COUNTRY_CODES.map((option) => (
                      <option key={`${option.code}-${option.name}`} value={option.code}>
                        {option.code} {option.name}
                      </option>
                    ))}
                  </select>
                  <TextInput
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    placeholder="07700 900000"
                    disabled={isSubmitting}
                    className="flex-1"
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
                  {error}
                </div>
              ) : null}

              <PrimaryButton
                type="submit"
                disabled={!name.trim() || !phoneNumber.trim() || isSubmitting}
                className="mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  "Continue"
                )}
              </PrimaryButton>
            </FormCard>
          </div>
        ) : null}

        {step === "verify" ? (
          <div className="w-full max-w-md animate-in slide-in-from-right-8 fade-in duration-500">
            <h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
              Enter your code
            </h1>
            <FormCard as="form" className="flex flex-col space-y-8" onSubmit={handleVerifySubmit}>
              <p className="text-center text-lg text-on-surface-variant">
                We sent a secure code to <strong>{normalizedPhoneNumber}</strong>.
              </p>

              <div className="flex justify-center gap-3" role="group" aria-label="6-digit verification code">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    id={`otp-code-${index}`}
                    type="text"
                    inputMode="numeric"
                    aria-label={`Digit ${index + 1}`}
                    maxLength={1}
                    value={digit}
                    onChange={(event) => handleOtpChange(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    onFocus={(event) => event.target.select()}
                    disabled={isSubmitting}
                    className={`h-16 w-12 rounded-2xl border-2 bg-white text-center text-2xl font-bold text-slate-900 shadow-sm outline-none transition-all focus:ring-2 focus:ring-[#4e0078]/50 disabled:opacity-50 ${
                      error
                        ? "border-red-400"
                        : digit
                          ? "border-[#6B21A8]"
                          : "border-gray-200"
                    }`}
                  />
                ))}
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
                  {error}
                </div>
              ) : null}

              <PrimaryButton
                type="submit"
                disabled={!isComplete || isSubmitting}
                className={isComplete ? "mt-4" : "mt-4 opacity-40"}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Confirm Code"
                )}
              </PrimaryButton>
            </FormCard>
          </div>
        ) : null}

        {step === "passkey" && finalizedSession ? (
          <div className="w-full max-w-xl animate-in slide-in-from-right-8 fade-in duration-500">
            <FormCard className="flex flex-col gap-6 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
                Enable Faster Access
              </h1>
              <p className="text-lg leading-relaxed text-on-surface-variant">
                Face ID or Touch ID lets {finalizedSession.seniorName} reopen Memvella on this device without waiting for another text message code.
              </p>

              {finalizedSession.hasPasskey ? (
                <p className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-900">
                  This profile already has biometric sign-in enabled elsewhere. You can add it on this device too.
                </p>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
                  {error}
                </div>
              ) : null}

              <PrimaryButton
                type="button"
                onClick={() => {
                  void handleEnablePasskey();
                }}
                disabled={isSubmitting}
                className="mt-2 justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enabling Face ID / Touch ID...
                  </>
                ) : (
                  "Enable Face ID / Touch ID"
                )}
              </PrimaryButton>

              <SecondaryButton
                type="button"
                onClick={() => {
                  void handleSkipPasskey();
                }}
                disabled={isSubmitting}
                className="justify-center"
              >
                Skip for now
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
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#6B21A8]/20 border-t-[#6B21A8]" />
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
