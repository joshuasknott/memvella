"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { FormCard } from "@/components/ui/FormCard";
import { TextInput } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/Button";
import BrandLogo from "@/components/BrandLogo";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "auth" | "code" | "success";
type AuthMode = "signin" | "create";

// ─── Shared layout ────────────────────────────────────────────────────────────

function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-surface px-6 py-8 font-body text-gray-900 md:py-12">
      <div className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-[#4e0078]/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-[#7a2e9e]/5 blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <header className="mb-8 flex h-14 items-center justify-between relative">
          <Link
            href="/"
            className="flex w-fit items-center gap-2 font-semibold text-[#4e0078] transition-opacity hover:opacity-80 z-10"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} /> Back
          </Link>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <BrandLogo standalone animated className="w-auto h-8 md:h-10 drop-shadow-sm" />
          </div>
          <div className="w-[84px]" aria-hidden="true" />
        </header>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center pb-12">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Loading skeleton (Suspense fallback) ─────────────────────────────────────

export function MemberJoinFallback() {
  return (
    <MemberLayout>
      <div className="space-y-8">
        <div>
          <div className="mx-auto mb-4 h-10 w-48 animate-pulse rounded-2xl bg-surface-container-low" />
          <div className="mx-auto h-6 w-64 animate-pulse rounded-xl bg-surface-container-low" />
        </div>
        <FormCard className="space-y-6">
          <div className="space-y-4">
            <div className="h-16 animate-pulse rounded-2xl bg-surface-container-low" />
            <div className="h-16 animate-pulse rounded-2xl bg-surface-container-low" />
          </div>
          <div className="h-[72px] animate-pulse rounded-full bg-[#6B21A8]/20" />
        </FormCard>
      </div>
    </MemberLayout>
  );
}

// ─── Step 1: Auth ─────────────────────────────────────────────────────────────

function AuthStep({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCreate = mode === "create";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (isCreate && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isCreate) {
        const { error: signUpError } = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
        });
        if (signUpError) {
          setError(signUpError.message ?? "Sign-up failed. Please try again.");
          return;
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email: email.trim(),
          password,
        });
        if (signInError) {
          setError(signInError.message ?? "Sign-in failed. Please check your details.");
          return;
        }
      }

      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(isCreate ? "signin" : "create");
    setError(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-4 text-center font-headline text-4xl font-extrabold tracking-tight text-[#1a1a1a] md:text-5xl">
          Join a Circle
        </h1>
        <p className="mx-auto max-w-sm text-center text-lg text-on-surface-variant">
          {isCreate
            ? "Create your Member account, then enter the code from your Organiser."
            : "Sign in, then enter the code from your Organiser."}
        </p>
      </div>

      <FormCard as="form" className="flex flex-col space-y-6" onSubmit={handleSubmit}>
        {isCreate && (
          <div className="space-y-2">
            <label className="font-headline text-lg font-bold" htmlFor="member-name">
              Your name
            </label>
            <TextInput
              id="member-name"
              type="text"
              placeholder="e.g. Emma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={isCreate}
              autoComplete="name"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="font-headline text-lg font-bold" htmlFor="member-email">
            Email address
          </label>
          <TextInput
            id="member-email"
            type="email"
            placeholder="hello@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <label className="font-headline text-lg font-bold" htmlFor="member-password">
            Password
          </label>
          <TextInput
            id="member-password"
            type="password"
            placeholder="········"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={isCreate ? "new-password" : "current-password"}
          />
          {isCreate && (
            <p className="px-1 text-sm text-gray-500">Minimum 8 characters.</p>
          )}
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        ) : null}

        <PrimaryButton type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {isCreate ? "Creating account…" : "Signing in…"}
            </>
          ) : isCreate ? (
            "Create Account"
          ) : (
            "Sign In"
          )}
        </PrimaryButton>

        <p className="text-center text-sm text-gray-500">
          {isCreate ? "Already have an account? " : "Need an account? "}
          <button
            type="button"
            onClick={toggleMode}
            className="font-semibold text-[#4e0078] hover:underline"
          >
            {isCreate ? "Sign in" : "Create one"}
          </button>
        </p>
      </FormCard>
    </div>
  );
}

// ─── Step 2: Code entry ───────────────────────────────────────────────────────

const CODE_LENGTH = 6;

function CodeStep({ onSuccess }: { onSuccess: () => void }) {
  const redeemMemberInviteCode = useMutation(
    api.familyInvites.redeemMemberInviteCode,
  );
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join("");
  const isComplete = code.length === CODE_LENGTH && !digits.includes("");

  const focusBox = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    // Accept only digits
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
    // Focus the box after the last pasted digit
    focusBox(Math.min(pasted.length, CODE_LENGTH - 1));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isComplete) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await redeemMemberInviteCode({
        inviteCode: code,
      });

      if (result.status === "joined" || result.status === "already_joined") {
        onSuccess();
        return;
      }

      setError(result.message);

      if (
        result.status === "invalid_code" ||
        result.status === "expired" ||
        result.status === "revoked" ||
        result.status === "already_used"
      ) {
        setDigits(Array(CODE_LENGTH).fill(""));
        focusBox(0);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while joining the Circle. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-4 text-center font-headline text-4xl font-extrabold tracking-tight text-[#1a1a1a] md:text-5xl">
          Enter your Circle code
        </h1>
        <p className="mx-auto max-w-sm text-center text-lg text-on-surface-variant">
          Ask the Organiser for the 6-digit code.
        </p>
      </div>

      <FormCard as="form" className="flex flex-col space-y-8" onSubmit={handleSubmit}>
        {/* Code boxes */}
        <div className="flex justify-center gap-3" role="group" aria-label="6-digit Circle code">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              id={`circle-code-${index}`}
              type="text"
              inputMode="numeric"
              aria-label={`Digit ${index + 1}`}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
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
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        ) : null}

        <PrimaryButton
          type="submit"
          disabled={!isComplete || isSubmitting}
          className={!isComplete ? "opacity-40" : ""}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Joining…
            </>
          ) : (
            "Join the Circle"
          )}
        </PrimaryButton>

        <p className="text-center text-sm text-gray-500">
          Wrong account?{" "}
          <button
            type="button"
            onClick={async () => {
              await authClient.signOut();
              window.location.reload();
            }}
            className="font-semibold text-[#4e0078] hover:underline"
          >
            Sign out
          </button>
        </p>
      </FormCard>
    </div>
  );
}

// ─── Step 3: Success ──────────────────────────────────────────────────────────

function SuccessStep() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/supporter"), 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#4e0078]/10">
        <CheckCircle2 className="h-12 w-12 text-[#4e0078]" strokeWidth={1.5} />
      </div>

      <div>
        <h1 className="mb-3 font-headline text-4xl font-extrabold tracking-tight text-[#1a1a1a] md:text-5xl">
          You&apos;ve joined the Circle.
        </h1>
        <p className="mx-auto max-w-xs text-lg text-on-surface-variant">
          You can now see updates and help out.
        </p>
      </div>

      <div className="flex h-10 items-center gap-2 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Taking you to your dashboard…
      </div>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export default function MemberJoinClient() {
  const { data: session } = authClient.useSession();
  const [isAuthComplete, setIsAuthComplete] = useState(false);
  const [hasJoinedSuccessfully, setHasJoinedSuccessfully] = useState(false);

  const step: Step = hasJoinedSuccessfully
    ? "success"
    : session || isAuthComplete
      ? "code"
      : "auth";

  return (
    <MemberLayout>
      {step === "auth" && (
        <AuthStep onSuccess={() => setIsAuthComplete(true)} />
      )}
      {step === "code" && (
        <CodeStep onSuccess={() => setHasJoinedSuccessfully(true)} />
      )}
      {step === "success" && (
        <SuccessStep />
      )}
    </MemberLayout>
  );
}
