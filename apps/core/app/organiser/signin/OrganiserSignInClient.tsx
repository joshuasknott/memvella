"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { performMemvellaTestAuth } from "@/lib/test-auth-client";
import { isMemvellaClientTestMode } from "@/lib/test-mode";
import { FormCard } from "@/components/ui/FormCard";
import { TextInput, PrimaryButton } from "@memvella/ui";

function OrganiserAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-surface px-6 py-8 font-body text-text-primary md:py-12">
      <div className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-family-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-[#7a2e9e]/5 blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <Link
          href="/"
          className="mb-8 flex w-fit items-center gap-2 font-semibold text-family-primary transition-opacity hover:opacity-80"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.5} /> Back
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center pb-12">
          {children}
        </div>
      </div>
    </div>
  );
}

export function OrganiserSignInFallback() {
  return (
    <OrganiserAuthLayout>
      <div className="space-y-8">
        <div>
          <h1 className="mb-2 text-center font-family text-4xl font-extrabold tracking-tight text-[#1a1a1a] md:text-5xl">
            Welcome Back
          </h1>
          <p className="mx-auto mb-6 max-w-sm text-center text-lg text-text-secondary">
            Sign in to your Memvella account to continue.
          </p>
        </div>

        <FormCard className="space-y-6">
          <div className="space-y-4">
            <div className="h-12 animate-pulse rounded-xl bg-surface" />
            <div className="h-12 animate-pulse rounded-xl bg-surface" />
          </div>
          <div className="h-[72px] animate-pulse rounded-full bg-senior-primary/20" />
        </FormCard>
      </div>
    </OrganiserAuthLayout>
  );
}

export default function OrganiserSignInClient() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/circle";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const signInError = isMemvellaClientTestMode()
        ? await performMemvellaTestAuth("sign-in", {
            email: email.trim(),
            password,
          })
            .then(() => null)
            .catch((error: unknown) => ({
              message:
                error instanceof Error
                  ? error.message
                  : "Sign-in failed. Please check your details.",
            }))
        : await authClient.signIn.email({
            email: email.trim(),
            password,
          }).then(({ error }) => error);

      if (signInError) {
        setError(
          signInError.message ?? "Sign-in failed. Please check your details.",
        );
        return;
      }

      window.location.replace(nextPath);
    } catch (signInError) {
      console.error("Sign-in error:", signInError);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OrganiserAuthLayout>
      <div className="space-y-8">
        <div>
          <h1 className="mb-2 text-center font-family text-4xl font-extrabold tracking-tight text-[#1a1a1a] md:text-5xl">
            Welcome Back
          </h1>
          <p className="mx-auto mb-6 max-w-sm text-center text-lg text-text-secondary">
            Sign in to your Memvella account to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} data-testid="organiser-signin-form">
          <FormCard className="flex flex-col space-y-6">
          <div className="space-y-2">
            <label className="font-family text-lg font-bold" htmlFor="email">
              Email Address
            </label>
             <TextInput
               id="email"
               data-testid="organiser-signin-email-input"
               type="email"
              placeholder="hello@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="font-family text-lg font-bold" htmlFor="password">
              Password
            </label>
             <TextInput
               id="password"
               data-testid="organiser-signin-password-input"
               type="password"
              placeholder="........"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
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
            data-testid="organiser-signin-submit-button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </PrimaryButton>

            <p className="text-center text-sm text-text-secondary">
              Need an account?{" "}
              <Link
                href="/onboarding/organiser"
                data-testid="organiser-create-account-link"
                className="font-semibold text-family-primary hover:underline"
              >
                Create one
              </Link>
            </p>
          </FormCard>
        </form>
      </div>
    </OrganiserAuthLayout>
  );
}
