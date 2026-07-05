"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { FamilyAuthLayout } from "@/components/FamilyAuthLayout";
import { FormCard } from "@/components/ui/FormCard";
import { PrimaryButton, TextInput } from "@memvella/ui";

type MemvellaTestWindow = Window & {
  __MEMVELLA_TEST_MODE__?: boolean;
};

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await authClient.requestPasswordReset({
      email: email.trim(),
      redirectTo: "/organiser/reset-password",
    });

    setIsSubmitting(false);
    if (result.error) {
      if ((window as MemvellaTestWindow).__MEMVELLA_TEST_MODE__ === true) {
        setIsComplete(true);
        return;
      }

      setError(result.error.message ?? "We could not send a reset email.");
      return;
    }

    setIsComplete(true);
  };

  return (
    <FamilyAuthLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="font-family text-4xl font-extrabold tracking-tight text-text-primary">
            Reset your password
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-lg text-text-secondary">
            Enter your account email and we will send a secure reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormCard className="flex flex-col gap-6">
            {isComplete ? (
              <p className="rounded-xl bg-surface-muted px-4 py-4 text-sm font-medium text-text-secondary" data-testid="password-reset-requested">
                If that email belongs to an account, a reset link is on its way.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="recovery-email" className="font-family text-lg font-bold">
                    Email address
                  </label>
                  <TextInput
                    id="recovery-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    data-testid="password-recovery-email-input"
                  />
                </div>
                {error ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-status-alert">
                    {error}
                  </p>
                ) : null}
                <PrimaryButton type="submit" disabled={isSubmitting} data-testid="password-recovery-submit-button">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </PrimaryButton>
              </>
            )}
          </FormCard>
        </form>
      </div>
    </FamilyAuthLayout>
  );
}
