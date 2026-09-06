"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { performMemvellaTestAuth } from "@/lib/test-auth-client";
import { isMemvellaClientTestMode } from "@/lib/test-mode";
import { buildVerifyEmailPath } from "@/lib/family-auth";
import { FamilyAuthLayout } from "@/components/FamilyAuthLayout";
import { FormCard } from "@/components/ui/FormCard";
import { TextInput, PrimaryButton } from "@memvella/ui";

export default function OrganiserSetupPage() {
  const [name, setName] = useState("");
  const [seniorDisplayName, setSeniorDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const signUpError = isMemvellaClientTestMode()
        ? await performMemvellaTestAuth("sign-up", {
            name: name.trim(),
            email: email.trim(),
            password,
          })
            .then(() => null)
            .catch((error: unknown) => ({
              message:
                error instanceof Error
                  ? error.message
                  : "Sign-up failed. Please try again.",
            }))
        : await authClient.signUp
            .email({
              name: name.trim(),
              email: email.trim(),
              password,
              callbackURL: "/organiser/verify-email?verified=1&next=/circle",
            })
            .then(({ error }) => error);

      if (signUpError) {
        setError(signUpError.message ?? "Sign-up failed. Please try again.");
        return;
      }

      const pendingSeniorDisplayName = seniorDisplayName.trim();
      if (pendingSeniorDisplayName) {
        localStorage.setItem(
          "memvella_pendingSeniorDisplayName",
          pendingSeniorDisplayName,
        );
      } else {
        localStorage.removeItem("memvella_pendingSeniorDisplayName");
      }

      window.location.replace(
        isMemvellaClientTestMode()
          ? "/circle"
          : buildVerifyEmailPath(email, "/circle"),
      );
    } catch (signUpError) {
      console.error("Sign-up error:", signUpError);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FamilyAuthLayout backHref="/" backLabel="Back">
      <div className="space-y-5 md:space-y-8">
        <div>
          <h1 className="mb-2 text-center font-family text-3xl font-extrabold tracking-tight text-text-primary md:mb-4 md:text-5xl">
            Create your account
          </h1>
          <p className="mx-auto mb-4 max-w-sm text-center text-base text-text-secondary md:mb-6 md:text-lg">
            A few details, then you can add your first memory.
          </p>
        </div>

        <form onSubmit={handleSubmit} data-testid="organiser-onboarding-form">
          <FormCard className="flex flex-col space-y-4 md:space-y-6">
            <div className="space-y-1 md:space-y-2">
              <label
                className="font-family text-base font-bold md:text-lg"
                htmlFor="name"
              >
                What is your name?
              </label>
              <TextInput
                id="name"
                autoComplete="name"
                data-testid="organiser-name-input"
                type="text"
                placeholder="e.g. Sarah"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="space-y-1 md:space-y-2">
              <label
                className="font-family text-base font-bold md:text-lg"
                htmlFor="senior_display_name"
              >
                Who are you supporting?
              </label>
              <TextInput
                id="senior_display_name"
                data-testid="organiser-senior-name-input"
                type="text"
                placeholder="e.g. David"
                value={seniorDisplayName}
                onChange={(event) => setSeniorDisplayName(event.target.value)}
              />
              <p className="px-1 text-sm text-text-secondary">
                Optional. You can add their name later in Settings.
              </p>
            </div>

            <div className="space-y-1 md:space-y-2">
              <label
                className="font-family text-base font-bold md:text-lg"
                htmlFor="email"
              >
                Email address
              </label>
              <TextInput
                id="email"
                data-testid="organiser-email-input"
                autoComplete="email"
                type="email"
                placeholder="hello@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-1 md:space-y-2">
              <label
                className="font-family text-base font-bold md:text-lg"
                htmlFor="password"
              >
                Password
              </label>
              <TextInput
                id="password"
                data-testid="organiser-password-input"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
              />
              <p className="px-1 text-sm text-text-secondary">
                Minimum 8 characters.
              </p>
            </div>

            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-5 py-4"
              >
                <p className="text-sm font-medium text-status-alert">{error}</p>
              </div>
            ) : null}

            <PrimaryButton
              type="submit"
              disabled={isSubmitting}
              className="mt-4 md:mt-10"
              data-testid="organiser-submit-button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </PrimaryButton>

            <p className="text-center text-sm text-text-secondary">
              Already have an account?{" "}
              <Link
                href="/organiser/signin"
                data-testid="organiser-signin-link"
                className="font-semibold text-family-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </FormCard>
        </form>
      </div>
    </FamilyAuthLayout>
  );
}
