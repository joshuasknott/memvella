"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { FormCard } from "@/components/ui/FormCard";
import { TextInput } from "@/components/ui/Input";
import { authClient } from "@/lib/auth-client";
import { getDeviceFingerprint } from "@/lib/device-fingerprint";
import { normalizePhoneNumber } from "@/lib/phone-number";
import {
  clearSeniorSession,
  type SeniorRecoveryHint,
  loadSeniorRecoveryHint,
  saveSeniorRecoveryHint,
  saveSeniorSession,
} from "@/lib/senior-session-client";

type RecoveryStep = "details" | "verify" | "passkey";

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

export default function IndependentRecoveryPage() {
  const router = useRouter();
  const [step, setStep] = useState<RecoveryStep>("details");
  const [recoveryHint, setRecoveryHint] = useState<SeniorRecoveryHint | null>(null);
  const [countryCode, setCountryCode] = useState("+44");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [normalizedPhoneNumber, setNormalizedPhoneNumber] = useState<string | null>(
    null,
  );
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null);
  const [finalizedSession, setFinalizedSession] =
    useState<FinalizedSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUsingPasskey, setIsUsingPasskey] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    clearSeniorSession("independent");
    const nextRecoveryHint = loadSeniorRecoveryHint("independent");
    setRecoveryHint(nextRecoveryHint);
    setPhoneNumber(
      nextRecoveryHint?.recoveryPhoneNumber ?? nextRecoveryHint?.recoveryEmail ?? "",
    );
    void getDeviceFingerprint("independent").then(setDeviceFingerprint);
  }, []);

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

  const handleSendCode = async () => {
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
    } catch (sendCodeError) {
      console.error(sendCodeError);
      setError(
        sendCodeError instanceof Error
          ? sendCodeError.message
          : "Memvella could not send your secure sign-in code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
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
      setRecoveryHint(nextSession);
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

  const handlePasskeyRecovery = async () => {
    if (!recoveryHint?.recoveryKey || !deviceFingerprint) {
      return;
    }

    setIsUsingPasskey(true);
    setError(null);

    try {
      const { startAuthentication } = await import("@simplewebauthn/browser");
      const optionsResponse = await fetch(
        "/api/independent/passkey/authenticate/options",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recoveryKey: recoveryHint.recoveryKey }),
        },
      );
      const optionsPayload = (await optionsResponse.json()) as {
        error?: string;
        optionsJSON?: Record<string, unknown>;
      };

      if (!optionsResponse.ok || !optionsPayload.optionsJSON) {
        throw new Error(
          optionsPayload.error ?? "Unable to prepare Face ID / Touch ID sign-in.",
        );
      }

      const responseJSON = await startAuthentication({
        optionsJSON: optionsPayload.optionsJSON as unknown as Parameters<
          typeof startAuthentication
        >[0]["optionsJSON"],
      });

      const verifyResponse = await fetch(
        "/api/independent/passkey/authenticate/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recoveryKey: recoveryHint.recoveryKey,
            deviceFingerprint,
            responseJSON,
          }),
        },
      );
      const verifyPayload = (await verifyResponse.json()) as {
        error?: string;
        sessionToken?: string;
        recoveryKey?: string;
        seniorName?: string;
      };

      if (
        !verifyResponse.ok ||
        !verifyPayload.sessionToken ||
        !verifyPayload.recoveryKey
      ) {
        throw new Error(
          verifyPayload.error ?? "Unable to finish Face ID / Touch ID sign-in.",
        );
      }

      const nextRecoveryHint = {
        recoveryKey: verifyPayload.recoveryKey,
        seniorName: verifyPayload.seniorName,
        recoveryPhoneNumber:
          recoveryHint.recoveryPhoneNumber ?? normalizedPhoneNumber ?? phoneNumber,
        hasPasskey: true,
      };
      saveSeniorSession("independent", {
        sessionToken: verifyPayload.sessionToken,
        recoveryKey: verifyPayload.recoveryKey,
        seniorName: verifyPayload.seniorName,
        recoveryPhoneNumber: nextRecoveryHint.recoveryPhoneNumber,
        hasPasskey: true,
      });
      saveSeniorRecoveryHint("independent", nextRecoveryHint);
      setRecoveryHint(nextRecoveryHint);

      router.replace("/independent");
    } catch (passkeyError) {
      console.error(passkeyError);
      setError(
        passkeyError instanceof Error
          ? passkeyError.message
          : "Unable to finish Face ID / Touch ID sign-in.",
      );
    } finally {
      setIsUsingPasskey(false);
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
    <main className="flex min-h-[100dvh] items-center justify-center bg-surface p-6 md:p-12">
      <FormCard className="flex w-full max-w-xl flex-col gap-6 p-8 md:p-10">
        {step === "details" ? (
          <>
            <h1 className="text-center text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
              Restore Independent User access
            </h1>
            <p className="text-center text-lg leading-relaxed text-on-surface-variant">
              Sign back in with a secure text message code, or use Face ID / Touch ID if this device already has biometrics enabled.
            </p>

            {recoveryHint?.hasPasskey && recoveryHint.recoveryKey ? (
              <PrimaryButton
                type="button"
                onClick={() => {
                  void handlePasskeyRecovery();
                }}
                disabled={isUsingPasskey || !deviceFingerprint}
                className="justify-center"
              >
                {isUsingPasskey ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Checking Face ID / Touch ID...
                  </>
                ) : (
                  "Use Face ID / Touch ID"
                )}
              </PrimaryButton>
            ) : null}

            <div className="space-y-2">
              <label className="font-headline text-lg font-bold">
                Phone Number
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
                  placeholder="07700 900000"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
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

            <SecondaryButton
              type="button"
              onClick={() => {
                void handleSendCode();
              }}
              disabled={isSubmitting}
              className="justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending secure code...
                </>
              ) : (
                "Send secure code"
              )}
            </SecondaryButton>
          </>
        ) : null}

        {step === "verify" ? (
          <>
            <h1 className="text-center text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
              Enter your code
            </h1>
            <p className="text-center text-lg leading-relaxed text-on-surface-variant">
              We sent a secure code to <strong>{normalizedPhoneNumber}</strong>.
            </p>

            <div className="flex justify-center gap-3" role="group" aria-label="6-digit recovery code">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
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
              type="button"
              onClick={() => {
                void handleVerifyCode();
              }}
              disabled={!isComplete || isSubmitting}
              className={isComplete ? "justify-center" : "justify-center opacity-40"}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Confirm Code"
              )}
            </PrimaryButton>

            <SecondaryButton
              type="button"
              onClick={() => setStep("details")}
              disabled={isSubmitting}
              className="justify-center"
            >
              Back
            </SecondaryButton>
          </>
        ) : null}

        {step === "passkey" && finalizedSession ? (
          <>
            <h1 className="text-center text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
              Enable Faster Access
            </h1>
            <p className="text-center text-lg leading-relaxed text-on-surface-variant">
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
              className="justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
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
          </>
        ) : null}
      </FormCard>
    </main>
  );
}
