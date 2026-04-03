"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { FormCard } from "@/components/ui/FormCard";
import { TextInput } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/Button";
import BrandLogo from "@/components/BrandLogo";

export default function SupporterSetupPage() {
  const router = useRouter();

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
      const { error: signUpError } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (signUpError) {
        setError(signUpError.message ?? "Sign-up failed. Please try again.");
        return;
      }

      if (seniorDisplayName.trim()) {
        localStorage.setItem(
          "memvella_pendingSeniorDisplayName",
          seniorDisplayName.trim(),
        );
      }

      router.push("/supporter");
    } catch (signUpError) {
      console.error("Sign-up error:", signUpError);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-surface px-6 py-8 font-body text-gray-900 md:py-12">
      <div className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-[#4e0078]/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-[#7a2e9e]/5 blur-3xl" />

      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-0 hidden md:block">
        <BrandLogo standalone animated className="w-auto h-16 opacity-20" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <Link
          href="/"
          className="mb-8 flex w-fit items-center gap-2 font-semibold text-[#4e0078] transition-opacity hover:opacity-80"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.5} /> Back
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center pb-12">
          <div className="space-y-8">
            <div>
              <h1 className="mb-4 text-center font-headline text-4xl font-extrabold tracking-tight text-[#1a1a1a] md:text-5xl">
                Supporter Setup
              </h1>
              <p className="mx-auto mb-6 max-w-sm text-center text-lg text-on-surface-variant">
                Create your Admin account and start your Circle.
              </p>
            </div>

            <FormCard
              as="form"
              className="flex flex-col space-y-6"
              onSubmit={handleSubmit}
            >
              <div className="space-y-2">
                <label className="font-headline text-lg font-bold" htmlFor="name">
                  What is your name?
                </label>
                <TextInput
                  id="name"
                  type="text"
                  placeholder="e.g. Sarah"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  className="font-headline text-lg font-bold"
                  htmlFor="senior_display_name"
                >
                  Who should this Circle support?
                </label>
                <TextInput
                  id="senior_display_name"
                  type="text"
                  placeholder="e.g. David"
                  value={seniorDisplayName}
                  onChange={(event) => setSeniorDisplayName(event.target.value)}
                />
                <p className="px-1 text-sm text-gray-500">
                  Optional. You can update this from your Admin dashboard.
                </p>
              </div>

              <div className="space-y-2">
                <label className="font-headline text-lg font-bold" htmlFor="email">
                  Your Email Address
                </label>
                <TextInput
                  id="email"
                  type="email"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-headline text-lg font-bold" htmlFor="password">
                  Create a Password
                </label>
                <TextInput
                  id="password"
                  type="password"
                  placeholder="........"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                />
                <p className="px-1 text-sm text-gray-500">
                  Minimum 8 characters.
                </p>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                  <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
              ) : null}

              <PrimaryButton type="submit" disabled={isSubmitting} className="mt-10">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Supporter Account"
                )}
              </PrimaryButton>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  href="/supporter/signin"
                  className="font-semibold text-[#4e0078] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </FormCard>
          </div>
        </div>
      </div>
    </div>
  );
}
