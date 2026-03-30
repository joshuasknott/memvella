"use client";

import { Suspense, useMemo, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";
import { FormCard } from "@/components/ui/FormCard";
import { VoiceInputPill } from "@/components/shared-senior/VoiceInputPill";
import { authClient } from "@/lib/auth-client";

type Step = 1 | 2 | 3;

const pendingNameStorageKey = "memvella_pending_independent_name";
const pendingEmailStorageKey = "memvella_pending_independent_email";

function IndependentSetupVoiceContent() {
  const searchParams = useSearchParams();
  const sessionReason = searchParams.get("reason");
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bannerMessage = useMemo(() => {
    if (sessionReason === "session-expired") {
      return "Your secure session ended, so we need to send a fresh sign-in link.";
    }

    return null;
  }, [sessionReason]);

  const handleVoiceSubmit = (text: string) => {
    if (step === 1) {
      setName(text.trim());
      setStep(2);
      setError(null);
    }
  };

  const handleSendLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    const normalizedName = name.trim();
    if (!normalizedName) {
      setError("Please tell Memvella what to call you first.");
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      localStorage.setItem(pendingNameStorageKey, normalizedName);
      localStorage.setItem(pendingEmailStorageKey, email.trim().toLowerCase());

      const callbackURL = `${window.location.origin}/onboarding/independent/verify`;
      const result = await authClient.signIn.magicLink({
        email: email.trim().toLowerCase(),
        name: normalizedName,
        callbackURL,
        newUserCallbackURL: callbackURL,
        errorCallbackURL: `${window.location.origin}/onboarding/independent?error=magic-link`,
      });

      if (result.error) {
        setError(
          result.error.message ??
            "Memvella could not send your secure sign-in link.",
        );
        return;
      }

      setStep(3);
    } catch (sendLinkError) {
      console.error(sendLinkError);
      setError("Memvella could not send your secure sign-in link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden bg-surface p-6 font-body text-on-surface relative selection:bg-primary-fixed selection:text-on-primary-fixed md:p-12">
      <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-10">
        {step === 1 ? (
          <SecondaryButton href="/" className="w-auto px-8">
            &larr; Exit
          </SecondaryButton>
        ) : (
          <SecondaryButton
            onClick={() => setStep(step === 3 ? 2 : 1)}
            className="w-auto px-8"
          >
            &larr; Back
          </SecondaryButton>
        )}

        <div className="flex gap-2">
          {[1, 2, 3].map((currentStep) => (
            <div
              key={currentStep}
              className={`h-2 w-12 rounded-full transition-all duration-500 ${
                step >= currentStep ? "bg-primary" : "bg-outline-variant/30"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 w-full max-w-3xl flex flex-col items-center justify-center mb-24 relative">
        {bannerMessage ? (
          <div className="mb-6 w-full max-w-xl rounded-3xl border border-blue-100 bg-blue-50 px-6 py-5 text-center text-lg leading-relaxed text-blue-900">
            {bannerMessage}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="w-full text-center animate-in slide-in-from-right-8 fade-in duration-500 space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] text-center mb-8">
              Hi there! What should I call you?
            </h1>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="w-full max-w-md animate-in slide-in-from-right-8 fade-in duration-500">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] text-center mb-8">
              Nice to meet you, {name}. Which email should receive your secure sign-in link?
            </h1>

            <FormCard
              as="form"
              onSubmit={handleSendLink}
              className="flex flex-col gap-6"
            >
              <div className="space-y-2">
                <label className="font-medium text-on-surface-variant ml-2 text-lg">
                  Email Address
                </label>
                <TextInput
                  type="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="hello@example.com"
                  disabled={isSubmitting}
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
                  {error}
                </div>
              ) : null}

              <PrimaryButton type="submit" disabled={isSubmitting} className="mt-4">
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin w-6 h-6 mr-2" />
                    Sending link...
                  </>
                ) : (
                  <>
                    Send Secure Link{" "}
                    <ArrowRight
                      size={24}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </PrimaryButton>
            </FormCard>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="w-full max-w-xl animate-in slide-in-from-right-8 fade-in duration-500">
            <FormCard className="flex flex-col gap-6 text-center">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a]">
                Check your email.
              </h1>
              <p className="text-lg leading-relaxed text-on-surface-variant">
                We sent a secure sign-in link to {email}. Open it on this device to
                finish your Independent Senior setup and enable Face ID / Touch ID.
              </p>
              <p className="text-base leading-relaxed text-on-surface-variant">
                In local development, Memvella writes the sign-in link to server logs
                when email delivery has not been configured yet.
              </p>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
                  {error}
                </div>
              ) : null}

              <PrimaryButton
                type="button"
                onClick={() => setStep(2)}
                className="justify-center"
              >
                Send another link
              </PrimaryButton>
            </FormCard>
          </div>
        ) : null}
      </div>

      {step === 1 ? (
        <VoiceInputPill onSubmit={handleVoiceSubmit} isProcessing={isSubmitting} />
      ) : null}
    </div>
  );
}

function IndependentSetupFallback() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-surface p-6">
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
