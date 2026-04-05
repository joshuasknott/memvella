"use client";

import { Suspense, useMemo, useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";
import { FormCard } from "@/components/ui/FormCard";
import BrandLogo from "@/components/BrandLogo";

type Step = "details" | "verify" | "passkey";

const CODE_LENGTH = 6;

const COUNTRY_CODES = [
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+1", flag: "🇺🇸", name: "United States" },
  { code: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+64", flag: "🇳🇿", name: "New Zealand" },
  { code: "+353", flag: "🇮🇪", name: "Ireland" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "+31", flag: "🇳🇱", name: "Netherlands" },
  { code: "+32", flag: "🇧🇪", name: "Belgium" },
  { code: "+46", flag: "🇸🇪", name: "Sweden" },
  { code: "+41", flag: "🇨🇭", name: "Switzerland" },
  { code: "+43", flag: "🇦🇹", name: "Austria" },
];
function IndependentSetupVoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionReason = searchParams.get("reason");

  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+44");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // OTP State
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bannerMessage = useMemo(() => {
    if (sessionReason === "session-expired") {
      return "Your secure session ended, so we need to send a fresh sign-in link.";
    }
    return null;
  }, [sessionReason]);

  const handleDetailsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Please tell Memvella what to call you first.");
      return;
    }
    if (!phoneNumber.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Mock SMS request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStep("verify");
    } catch (e) {
      console.error(e);
      setError("Memvella could not send your secure sign-in code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- OTP Handlers ---
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
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;

    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    setError(null);
    focusBox(Math.min(pasted.length, CODE_LENGTH - 1));
  };

  const handleVerifySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isComplete) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Mock OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStep("passkey");
    } catch (e) {
      setError("Incorrect code. Please try again.");
      setDigits(Array(CODE_LENGTH).fill(""));
      focusBox(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Passkey Handlers ---
  const handleEnablePasskey = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.replace("/independent");
    } catch (e) {
      setError("Could not enable Face ID / Touch ID.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipPasskey = () => {
    router.replace("/independent");
  };

  return (
    <div className="min-h-dvh w-full flex flex-col items-center justify-center overflow-hidden bg-surface p-6 font-body text-on-surface relative selection:bg-primary-fixed selection:text-on-primary-fixed md:p-12">
      <div className="w-full max-w-7xl mx-auto flex h-14 items-center justify-between relative mb-8 z-20">
        {step === "details" ? (
          <Link
            href="/"
            className="flex w-fit items-center gap-2 font-semibold text-[#4e0078] transition-opacity hover:opacity-80 z-10"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} /> Exit
          </Link>
        ) : step === "verify" ? (
          <button
            onClick={() => setStep("details")}
            className="flex w-fit items-center gap-2 font-semibold text-[#4e0078] transition-opacity hover:opacity-80 z-10"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} /> Back
          </button>
        ) : (
          <div className="w-20" /> /* Spacer for passkey step where back makes less sense */
        )}

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <BrandLogo standalone animated className="w-auto h-8 md:h-10 drop-shadow-sm" />
        </div>

        <div className="flex gap-2 z-10">
          <div
            className={`h-2 w-8 md:w-12 rounded-full transition-all duration-500 bg-primary`}
          />
          <div
            className={`h-2 w-8 md:w-12 rounded-full transition-all duration-500 ${
              step === "verify" || step === "passkey" ? "bg-primary" : "bg-outline-variant/30"
            }`}
          />
          <div
            className={`h-2 w-8 md:w-12 rounded-full transition-all duration-500 ${
              step === "passkey" ? "bg-primary" : "bg-outline-variant/30"
            }`}
          />
        </div>
      </div>

      <div className="flex-1 w-full max-w-3xl flex flex-col items-center justify-center mb-24 relative z-10">
        {bannerMessage ? (
          <div className="mb-6 w-full max-w-xl rounded-3xl border border-blue-100 bg-blue-50 px-6 py-5 text-center text-lg leading-relaxed text-blue-900">
            {bannerMessage}
          </div>
        ) : null}

        {step === "details" ? (
          <div className="w-full max-w-md animate-in slide-in-from-right-8 fade-in duration-500">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] text-center mb-8">
              Set Up My Profile
            </h1>
            <FormCard
              as="form"
              onSubmit={handleDetailsSubmit}
              className="flex flex-col gap-6"
            >
              <div className="space-y-2">
                <label className="font-medium text-on-surface-variant ml-2 text-lg">
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
              <div className="space-y-2">
                <label className="font-medium text-on-surface-variant ml-2 text-lg">
                  Your Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    disabled={isSubmitting}
                    className="h-[60px] w-full max-w-[160px] cursor-pointer shrink-0 truncate rounded-2xl border-2 border-transparent bg-surface-container px-3 py-[18px] text-center text-lg font-medium text-on-surface outline-none transition-all focus:border-[#4e0078]/30 focus:ring-4 focus:ring-[#4e0078]/10"
                  >
                    {COUNTRY_CODES.map((c, i) => (
                      <option key={`${c.code}-${c.name}-${i}`} value={c.code}>
                        {c.flag} {c.code} {c.name}
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

              <PrimaryButton type="submit" disabled={!name.trim() || !phoneNumber.trim() || isSubmitting} className="mt-4">
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin w-6 h-6 mr-2" />
                    Continuing...
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
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] text-center mb-8">
              Enter your code
            </h1>
            <FormCard as="form" className="flex flex-col space-y-8" onSubmit={handleVerifySubmit}>
              <p className="text-center text-lg text-on-surface-variant">
                We sent a secure code to <strong>{countryCode} {phoneNumber}</strong>.
              </p>

              <div className="flex justify-center gap-3" role="group" aria-label="6-digit verification code">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    id={`otp-code-${index}`}
                    type="text"
                    inputMode="numeric"
                    aria-label={`Digit ${index + 1}`}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={(e) => e.target.select()}
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
                className={!isComplete ? "opacity-40 mt-4" : "mt-4"}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin w-6 h-6 mr-2" />
                    Verifying...
                  </>
                ) : (
                  "Confirm Code"
                )}
              </PrimaryButton>
            </FormCard>
          </div>
        ) : null}

        {step === "passkey" ? (
          <div className="w-full max-w-xl animate-in slide-in-from-right-8 fade-in duration-500">
            <FormCard className="flex flex-col gap-6 text-center">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a]">
                Enable Faster Access
              </h1>
              <p className="text-lg leading-relaxed text-on-surface-variant">
                Face ID or Touch ID lets {name || "you"} reopen Memvella on
                this device without waiting for another text message code.
              </p>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
                  {error}
                </div>
              ) : null}

              <PrimaryButton
                type="button"
                onClick={handleEnablePasskey}
                disabled={isSubmitting}
                className="justify-center mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Enabling Face ID / Touch ID...
                  </>
                ) : (
                  "Enable Face ID / Touch ID"
                )}
              </PrimaryButton>

              <SecondaryButton
                type="button"
                onClick={handleSkipPasskey}
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

export default function IndependentSetupVoicePage() {
  return (
    <Suspense fallback={<IndependentSetupFallback />}>
      <IndependentSetupVoiceContent />
    </Suspense>
  );
}
