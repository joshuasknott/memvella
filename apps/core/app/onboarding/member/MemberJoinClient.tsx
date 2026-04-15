"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { BrandLogo, PrimaryButton, SecondaryButton, TextInput } from "@memvella/ui";
import { FormCard } from "@/components/ui/FormCard";

type AuthMode = "signin" | "create";

type InvitePreview = {
  code: string;
  circleName: string | null;
};

const CODE_LENGTH = 6;
const PENDING_MEMBER_INVITE_STORAGE_KEY = "memvella_pendingMemberInvite";

function resolveCircleName(circleName: string | null) {
  const trimmed = circleName?.trim();
  return trimmed ? trimmed : "this Circle";
}

function loadPendingInvitePreview() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(PENDING_MEMBER_INVITE_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<InvitePreview>;
    if (typeof parsed.code !== "string") {
      window.sessionStorage.removeItem(PENDING_MEMBER_INVITE_STORAGE_KEY);
      return null;
    }

    return {
      code: parsed.code,
      circleName: typeof parsed.circleName === "string" ? parsed.circleName : null,
    } satisfies InvitePreview;
  } catch {
    window.sessionStorage.removeItem(PENDING_MEMBER_INVITE_STORAGE_KEY);
    return null;
  }
}

function savePendingInvitePreview(invitePreview: InvitePreview | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!invitePreview) {
    window.sessionStorage.removeItem(PENDING_MEMBER_INVITE_STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(
    PENDING_MEMBER_INVITE_STORAGE_KEY,
    JSON.stringify(invitePreview),
  );
}

function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-surface px-6 py-8 font-body text-gray-900 md:py-12">
      <div className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-[#4e0078]/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-[#7a2e9e]/5 blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <header className="relative mb-8 flex h-14 items-center justify-between">
          <Link
            href="/"
            className="z-10 flex w-fit items-center gap-2 font-semibold text-[#4e0078] transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} /> Back
          </Link>
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <BrandLogo standalone animated className="h-8 w-auto drop-shadow-sm md:h-10" />
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

function CircleCodeStep({
  onReady,
  error,
}: {
  onReady: (preview: InvitePreview) => void;
  error: string | null;
}) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join("");
  const isComplete = code.length === CODE_LENGTH && !digits.includes("");
  const message = localError ?? error;

  const focusBox = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const clearInputs = () => {
    setDigits(Array(CODE_LENGTH).fill(""));
    window.setTimeout(() => focusBox(0), 0);
  };

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    setDigits(nextDigits);
    setLocalError(null);

    if (digit && index < CODE_LENGTH - 1) {
      focusBox(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      if (digits[index]) {
        const nextDigits = [...digits];
        nextDigits[index] = "";
        setDigits(nextDigits);
      } else if (index > 0) {
        const nextDigits = [...digits];
        nextDigits[index - 1] = "";
        setDigits(nextDigits);
        focusBox(index - 1);
      }
      setLocalError(null);
    } else if (event.key === "ArrowLeft" && index > 0) {
      focusBox(index - 1);
    } else if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      focusBox(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) {
      return;
    }

    const nextDigits = [...digits];
    for (let index = 0; index < pasted.length; index += 1) {
      nextDigits[index] = pasted[index];
    }
    setDigits(nextDigits);
    setLocalError(null);
    focusBox(Math.min(pasted.length, CODE_LENGTH - 1));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isComplete) {
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);

    try {
      const response = await fetch("/api/member-invite/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inviteCode: code }),
      });
      const payload = (await response.json()) as {
        status?: string;
        circleName?: string | null;
        message?: string;
        error?: string;
      };

      if (!response.ok || payload.status !== "ready") {
        setLocalError(payload.message ?? payload.error ?? "We could not check that Circle code.");
        clearInputs();
        return;
      }

      onReady({
        code,
        circleName: payload.circleName ?? null,
      });
    } catch (previewError) {
      console.error(previewError);
      setLocalError("We could not check that Circle code.");
      clearInputs();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-4 text-center font-headline text-4xl font-extrabold tracking-tight text-[#1a1a1a] md:text-5xl">
          Join a Circle
        </h1>
        <p className="mx-auto max-w-sm text-center text-lg text-on-surface-variant">
          Enter the 6-digit Circle code you were given.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <FormCard className="flex flex-col space-y-8">
        <div className="flex justify-center gap-3" role="group" aria-label="6-digit Circle code">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              aria-label={`Digit ${index + 1}`}
              maxLength={1}
              value={digit}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={handlePaste}
              onFocus={(event) => event.target.select()}
              disabled={isSubmitting}
              className={`h-16 w-12 rounded-2xl border-2 bg-white text-center text-2xl font-bold text-slate-900 shadow-sm outline-none transition-all focus:ring-2 focus:ring-[#4e0078]/50 disabled:opacity-50 ${
                message
                  ? "border-red-400"
                  : digit
                    ? "border-[#6B21A8]"
                    : "border-gray-200"
              }`}
            />
          ))}
        </div>

        {message ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-medium text-red-600">{message}</p>
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
                Checking code...
              </>
            ) : (
              "Continue"
            )}
          </PrimaryButton>
        </FormCard>
      </form>
    </div>
  );
}

function CircleConfirmationStep({
  invitePreview,
  onCreateAccount,
  onExistingAccount,
  error,
  hasCurrentSession,
  onUseDifferentAccount,
}: {
  invitePreview: InvitePreview;
  onCreateAccount: () => void;
  onExistingAccount: () => void;
  error: string | null;
  hasCurrentSession: boolean;
  onUseDifferentAccount: () => Promise<void>;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-4 text-center font-headline text-4xl font-extrabold tracking-tight text-[#1a1a1a] md:text-5xl">
          You&apos;re almost in.
        </h1>
        <p className="mx-auto max-w-sm text-center text-lg text-on-surface-variant">
          You&apos;re joining <strong>{resolveCircleName(invitePreview.circleName)}</strong> as a Member.
        </p>
      </div>

      <FormCard className="flex flex-col gap-5">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        ) : null}

        {hasCurrentSession ? (
          <>
            <p className="text-center text-base leading-relaxed text-on-surface-variant">
              This account can&apos;t join that Circle. Sign out to use a different Member account.
            </p>
            <SecondaryButton
              type="button"
              onClick={() => {
                void onUseDifferentAccount();
              }}
            >
              Use a different account
            </SecondaryButton>
          </>
        ) : (
          <>
            <PrimaryButton type="button" onClick={onCreateAccount}>
              Create account
            </PrimaryButton>
            <SecondaryButton type="button" onClick={onExistingAccount}>
              I already have an account
            </SecondaryButton>
          </>
        )}
      </FormCard>
    </div>
  );
}

function MemberAuthStep({
  invitePreview,
  mode,
  onBack,
  onSuccess,
}: {
  invitePreview: InvitePreview;
  mode: AuthMode;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCreate = mode === "create";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
    setError(null);

    try {
      if (isCreate) {
        const { error: signUpError } = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
        });
        if (signUpError) {
          setError(signUpError.message ?? "We could not create your account.");
          return;
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email: email.trim(),
          password,
        });
        if (signInError) {
          setError(signInError.message ?? "Please check your email and password.");
          return;
        }
      }

      onSuccess();
    } catch (authError) {
      console.error(authError);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-4 text-center font-headline text-4xl font-extrabold tracking-tight text-[#1a1a1a] md:text-5xl">
          {isCreate ? "Create your account" : "Sign in"}
        </h1>
        <p className="mx-auto max-w-sm text-center text-lg text-on-surface-variant">
          {isCreate
            ? `Create your Member account to join ${resolveCircleName(invitePreview.circleName)}.`
            : `Sign in to join ${resolveCircleName(invitePreview.circleName)}.`}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <FormCard className="flex flex-col space-y-6">
        {isCreate ? (
          <div className="space-y-2">
            <label className="font-headline text-lg font-bold" htmlFor="member-name">
              Your name
            </label>
            <TextInput
              id="member-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Emma"
              required
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="font-headline text-lg font-bold" htmlFor="member-email">
            Email address
          </label>
          <TextInput
            id="member-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="hello@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="font-headline text-lg font-bold" htmlFor="member-password">
            Password
          </label>
          <TextInput
            id="member-password"
            type="password"
            autoComplete={isCreate ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="........"
            required
            minLength={8}
          />
          {isCreate ? (
            <p className="px-1 text-sm text-gray-500">Minimum 8 characters.</p>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        ) : null}

        <PrimaryButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {isCreate ? "Creating account..." : "Signing in..."}
            </>
          ) : isCreate ? (
            "Create account"
          ) : (
            "Sign in"
          )}
        </PrimaryButton>

          <button
            type="button"
            onClick={onBack}
            className="text-center text-sm font-semibold text-[#4e0078] hover:underline"
          >
            Back
          </button>
        </FormCard>
      </form>
    </div>
  );
}

function JoiningStep({ invitePreview }: { invitePreview: InvitePreview }) {
  return (
    <FormCard className="flex flex-col items-center gap-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#4e0078]/10">
        <Loader2 className="h-10 w-10 animate-spin text-[#4e0078]" />
      </div>
      <div>
        <h1 className="mb-3 font-headline text-3xl font-extrabold tracking-tight text-[#1a1a1a] md:text-4xl">
          Joining your Circle
        </h1>
        <p className="text-lg leading-relaxed text-on-surface-variant">
          Adding you to <strong>{resolveCircleName(invitePreview.circleName)}</strong> as a Member.
        </p>
      </div>
    </FormCard>
  );
}

function SuccessStep() {
  const router = useRouter();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      router.replace("/circle");
    }, 2500);

    return () => window.clearTimeout(timeoutId);
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
        Taking you to your Circle...
      </div>
    </div>
  );
}

export default function MemberJoinClient() {
  const { data: session } = authClient.useSession();
  const redeemMemberInviteCode = useMutation(api.circleInvites.redeemMemberInviteCode);

  const [invitePreview, setInvitePreview] = useState<InvitePreview | null>(() =>
    loadPendingInvitePreview(),
  );
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isAwaitingAccountSession, setIsAwaitingAccountSession] = useState(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoinedSuccessfully, setHasJoinedSuccessfully] = useState(false);

  useEffect(() => {
    savePendingInvitePreview(invitePreview);
  }, [invitePreview]);

  useEffect(() => {
    if (isSwitchingAccount && !session) {
      setIsSwitchingAccount(false);
      setJoinError(null);
      setAuthMode("signin");
    }
  }, [isSwitchingAccount, session]);

  useEffect(() => {
    if (
      !invitePreview ||
      !session ||
      isJoining ||
      hasJoinedSuccessfully ||
      joinError ||
      isSwitchingAccount
    ) {
      return;
    }

    let isCancelled = false;

    const redeemInvite = async () => {
      setIsJoining(true);
      setJoinError(null);
      setCodeError(null);

      try {
        const result = await redeemMemberInviteCode({
          inviteCode: invitePreview.code,
        });

        if (isCancelled) {
          return;
        }

        if (result.status === "joined" || result.status === "already_joined") {
          savePendingInvitePreview(null);
          setHasJoinedSuccessfully(true);
          return;
        }

        if (
          result.status === "invalid_code" ||
          result.status === "expired" ||
          result.status === "revoked" ||
          result.status === "already_used"
        ) {
          setInvitePreview(null);
          setAuthMode(null);
          setCodeError(result.message);
          setJoinError(null);
          return;
        }

        setJoinError(result.message);
      } catch (redeemError) {
        console.error(redeemError);
        setJoinError(
          redeemError instanceof Error
            ? redeemError.message
            : "We could not join that Circle right now.",
        );
      } finally {
        if (!isCancelled) {
          setIsJoining(false);
          setIsAwaitingAccountSession(false);
        }
      }
    };

    void redeemInvite();

    return () => {
      isCancelled = true;
    };
  }, [
    hasJoinedSuccessfully,
    invitePreview,
    isJoining,
    isSwitchingAccount,
    joinError,
    redeemMemberInviteCode,
    session,
  ]);

  const handleUseDifferentAccount = async () => {
      setIsSwitchingAccount(true);
    await authClient.signOut();
    setIsAwaitingAccountSession(false);
  };

  const showJoiningState =
    invitePreview !== null &&
    !hasJoinedSuccessfully &&
    (isJoining ||
      isAwaitingAccountSession ||
      (!!session && joinError === null && !isSwitchingAccount));

  return (
    <MemberLayout>
      {hasJoinedSuccessfully ? <SuccessStep /> : null}

      {!hasJoinedSuccessfully && showJoiningState && invitePreview ? (
        <JoiningStep invitePreview={invitePreview} />
      ) : null}

      {!hasJoinedSuccessfully && !showJoiningState && invitePreview === null ? (
        <CircleCodeStep
          error={codeError}
          onReady={(nextPreview) => {
            setInvitePreview(nextPreview);
            setAuthMode(null);
            setCodeError(null);
            setJoinError(null);
          }}
        />
      ) : null}

      {!hasJoinedSuccessfully && !showJoiningState && invitePreview !== null && authMode === null ? (
        <CircleConfirmationStep
          invitePreview={invitePreview}
          error={joinError}
          hasCurrentSession={Boolean(session) || isSwitchingAccount}
          onCreateAccount={() => {
            setAuthMode("create");
            setJoinError(null);
          }}
          onExistingAccount={() => {
            setAuthMode("signin");
            setJoinError(null);
          }}
          onUseDifferentAccount={handleUseDifferentAccount}
        />
      ) : null}

      {!hasJoinedSuccessfully && !showJoiningState && invitePreview !== null && authMode !== null ? (
        <MemberAuthStep
          invitePreview={invitePreview}
          mode={authMode}
          onBack={() => {
            setAuthMode(null);
          }}
          onSuccess={() => {
            savePendingInvitePreview(invitePreview);
            setIsAwaitingAccountSession(true);
            window.location.reload();
          }}
        />
      ) : null}
    </MemberLayout>
  );
}
