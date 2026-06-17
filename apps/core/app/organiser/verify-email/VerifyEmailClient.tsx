"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { sanitizeFamilyNextPath } from "@/lib/family-auth";
import { FamilyAuthLayout } from "@/components/FamilyAuthLayout";
import { FormCard } from "@/components/ui/FormCard";
import { PrimaryButton, SecondaryButton } from "@memvella/ui";

function buildVerificationCallback(nextPath: string) {
  const params = new URLSearchParams({
    verified: "1",
    next: nextPath,
  });
  return `/organiser/verify-email?${params.toString()}`;
}

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";
  const nextPath = sanitizeFamilyNextPath(searchParams.get("next"));
  const verified = searchParams.get("verified") === "1";
  const verificationError = searchParams.get("error");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) {
      setMessage("Return to sign in and enter your email address first.");
      return;
    }

    setIsSending(true);
    setMessage(null);
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: buildVerificationCallback(nextPath),
    });
    setIsSending(false);
    setMessage(
      error
        ? error.message ?? "We could not send another verification email."
        : "A fresh verification email is on its way.",
    );
  };

  return (
    <FamilyAuthLayout>
      <div className="space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-family-primary/10">
            {verified ? (
              <CheckCircle2 className="h-10 w-10 text-status-success" />
            ) : (
              <Mail className="h-10 w-10 text-family-primary" />
            )}
          </div>
          <h1 className="font-family text-4xl font-extrabold tracking-tight text-text-primary">
            {verified ? "Email verified" : "Check your email"}
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-lg leading-relaxed text-text-secondary">
            {verified
              ? "Your account is ready to use."
              : `Open the verification link${email ? ` sent to ${email}` : ""} to finish setting up your account.`}
          </p>
        </div>

        <FormCard className="flex flex-col gap-4 text-center">
          {verificationError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-status-alert">
              That verification link is invalid or has expired. Request a fresh link.
            </p>
          ) : null}
          {message ? (
            <p className="rounded-xl bg-surface-muted px-4 py-3 text-sm font-medium text-text-secondary" aria-live="polite">
              {message}
            </p>
          ) : null}

          {verified ? (
            <PrimaryButton href={nextPath} data-testid="verification-continue-button">
              Continue
            </PrimaryButton>
          ) : (
            <SecondaryButton
              type="button"
              onClick={() => void handleResend()}
              disabled={isSending}
              data-testid="verification-resend-button"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send another email"
              )}
            </SecondaryButton>
          )}

          <Link
            href="/organiser/signin"
            className="text-sm font-semibold text-family-primary hover:underline"
          >
            Back to sign in
          </Link>
        </FormCard>
      </div>
    </FamilyAuthLayout>
  );
}
