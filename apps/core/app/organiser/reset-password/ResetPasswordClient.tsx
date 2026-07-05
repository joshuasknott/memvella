"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { FamilyAuthLayout } from "@/components/FamilyAuthLayout";
import { FormCard } from "@/components/ui/FormCard";
import { PrimaryButton, TextInput } from "@memvella/ui";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const invalidLink = !token || searchParams.get("error") !== null;
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const result = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message ?? "That reset link is invalid or has expired.");
      return;
    }

    setIsComplete(true);
  };

  return (
    <FamilyAuthLayout>
      <div className="space-y-8">
        <div className="text-center">
          {isComplete ? (
            <CheckCircle2 className="mx-auto mb-5 h-16 w-16 text-status-success" />
          ) : null}
          <h1 className="font-family text-4xl font-extrabold tracking-tight text-text-primary">
            {isComplete ? "Password updated" : "Choose a new password"}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <FormCard className="flex flex-col gap-6">
            {isComplete ? (
              <PrimaryButton href="/organiser/signin" data-testid="password-reset-signin-button">
                Sign in
              </PrimaryButton>
            ) : invalidLink ? (
              <>
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-status-alert">
                  <span data-testid="password-reset-invalid-link">
                    This reset link is invalid or has expired.
                  </span>
                </p>
                <PrimaryButton href="/organiser/forgot-password">
                  Request another link
                </PrimaryButton>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="new-password" className="font-family text-lg font-bold">
                    New password
                  </label>
                  <TextInput
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    required
                    data-testid="new-password-input"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="font-family text-lg font-bold">
                    Confirm password
                  </label>
                  <TextInput
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    minLength={8}
                    required
                    data-testid="confirm-password-input"
                  />
                </div>
                {error ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-status-alert">
                    {error}
                  </p>
                ) : null}
                <PrimaryButton type="submit" disabled={isSubmitting} data-testid="password-reset-submit-button">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update password"
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
