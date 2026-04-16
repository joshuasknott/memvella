"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { performMemvellaTestAuth } from "@/lib/test-auth-client";
import { isMemvellaClientTestMode } from "@/lib/test-mode";
import { FormCard } from "@/components/ui/FormCard";
import { TextInput, PrimaryButton, BrandLogo } from "@memvella/ui";

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
        : await authClient.signUp.email({
            name: name.trim(),
            email: email.trim(),
            password,
          }).then(({ error }) => error);

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

      window.location.replace("/circle");
    } catch (signUpError) {
      console.error("Sign-up error:", signUpError);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-surface px-6 py-8 font-body text-text-primary md:py-12">
      <div className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-family-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-[#7a2e9e]/5 blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <header className="mb-8 flex h-14 items-center justify-between relative">
          <Link
            href="/"
            className="flex w-fit items-center gap-2 font-semibold text-family-primary transition-opacity hover:opacity-80 z-10"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} /> Back
          </Link>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <BrandLogo standalone className="w-auto h-8 md:h-10 drop-shadow-sm" />
          </div>
          <div className="w-[84px]" aria-hidden="true" />
        </header>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center pb-12">
          <div className="space-y-8">
            <div>
              <h1 className="mb-4 text-center font-family text-4xl font-extrabold tracking-tight text-[#1a1a1a] md:text-5xl">
                Organiser Setup
              </h1>
              <p className="mx-auto mb-6 max-w-sm text-center text-lg text-text-secondary">
                Create your Organiser account and start your Circle.
              </p>
            </div>

            <form onSubmit={handleSubmit} data-testid="organiser-onboarding-form">
              <FormCard className="flex flex-col space-y-6">
              <div className="space-y-2">
                <label className="font-family text-lg font-bold" htmlFor="name">
                  What is your name?
                </label>
                <TextInput
                  id="name"
                  data-testid="organiser-name-input"
                  type="text"
                  placeholder="e.g. Sarah"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  className="font-family text-lg font-bold"
                  htmlFor="senior_display_name"
                >
                  Who should this Circle support?
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
                  Optional. You can update this from your Organiser dashboard.
                </p>
              </div>

              <div className="space-y-2">
                <label className="font-family text-lg font-bold" htmlFor="email">
                  Your Email Address
                </label>
                <TextInput
                  id="email"
                  data-testid="organiser-email-input"
                  type="email"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-family text-lg font-bold" htmlFor="password">
                  Create a Password
                </label>
                <TextInput
                  id="password"
                  data-testid="organiser-password-input"
                  type="password"
                  placeholder="........"
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
                <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                  <p className="text-sm font-medium text-status-alert">{error}</p>
                </div>
              ) : null}

              <PrimaryButton
                type="submit"
                disabled={isSubmitting}
                className="mt-10"
                data-testid="organiser-submit-button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Organiser Account"
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
        </div>
      </div>
    </div>
  );
}
