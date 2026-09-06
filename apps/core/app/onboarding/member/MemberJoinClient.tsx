"use client";

import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { api } from "@memvella/backend";
import { authClient } from "@/lib/auth-client";
import { performMemvellaTestAuth } from "@/lib/test-auth-client";
import { isMemvellaClientTestMode } from "@/lib/test-mode";
import {
  buildVerifyEmailPath,
  isEmailNotVerifiedError,
} from "@/lib/family-auth";
import { PrimaryButton, SecondaryButton, TextInput } from "@memvella/ui";
import { FamilyAuthLayout } from "@/components/FamilyAuthLayout";
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
  return trimmed ? trimmed : "this Workspace";
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
      circleName:
        typeof parsed.circleName === "string" ? parsed.circleName : null,
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
    <FamilyAuthLayout backHref="/" backLabel="Back">
      {children}
    </FamilyAuthLayout>
  );
}

export function MemberJoinFallback() {
  return (
    <MemberLayout>
      <div className="space-y-8">
        <div>
          <div className="mx-auto mb-4 h-10 w-48 animate-pulse rounded-xl bg-surface" />
          <div className="mx-auto h-6 w-64 animate-pulse rounded-xl bg-surface" />
        </div>
        <FormCard className="space-y-6">
          <div className="space-y-4">
            <div className="h-12 animate-pulse rounded-xl bg-surface" />
            <div className="h-12 animate-pulse rounded-xl bg-surface" />
          </div>
          <div className="h-[72px] animate-pulse rounded-full bg-senior-primary/20" />
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

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
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
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);
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
        setLocalError(
          payload.message ??
            payload.error ??
            "We could not check that invite code.",
        );
        clearInputs();
        return;
      }

      onReady({
        code,
        circleName: payload.circleName ?? null,
      });
    } catch (previewError) {
      console.error(previewError);
      setLocalError("We could not check that invite code.");
      clearInputs();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-4 text-center font-family text-4xl font-extrabold tracking-tight text-text-primary md:text-5xl">
          Join a Workspace
        </h1>
        <p className="mx-auto max-w-sm text-center text-lg text-text-secondary">
          Enter the 6-digit invite code you were given.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <FormCard
          className="flex flex-col space-y-8"
          data-testid="member-invite-code-form"
        >
          <div
            className="flex justify-center gap-3"
            role="group"
            aria-label="6-digit invite code"
          >
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                data-testid={`member-code-digit-${index}`}
                inputMode="numeric"
                aria-label={`Digit ${index + 1}`}
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                onFocus={(event) => event.target.select()}
                disabled={isSubmitting}
                className={`h-12 w-12 rounded-xl border-2 bg-surface text-center text-lg font-bold text-text-primary shadow-sm outline-none transition-all focus:ring-2 focus:ring-family-primary/50 disabled:opacity-50 ${
                  message
                    ? "border-red-400"
                    : digit
                      ? "border-senior-primary"
                      : "border-border"
                }`}
              />
            ))}
          </div>

          {message ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
              <p className="text-sm font-medium text-status-alert">{message}</p>
            </div>
          ) : null}

          <PrimaryButton
            type="submit"
            disabled={!isComplete || isSubmitting}
            className={!isComplete ? "opacity-40" : ""}
            data-testid="member-code-continue-button"
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
        <h1 className="mb-4 text-center font-family text-4xl font-extrabold tracking-tight text-text-primary md:text-5xl">
          You&apos;re almost in.
        </h1>
        <p className="mx-auto max-w-sm text-center text-lg text-text-secondary">
          You&apos;re joining{" "}
          <strong>{resolveCircleName(invitePreview.circleName)}</strong> as a
          Supporter.
        </p>
      </div>

      <FormCard className="flex flex-col gap-5">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-medium text-status-alert">{error}</p>
          </div>
        ) : null}

        {hasCurrentSession ? (
          <>
            <p className="text-center text-base leading-relaxed text-text-secondary">
              This account can&apos;t join that Workspace. Sign out to use a
              different account.
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
            <PrimaryButton
              type="button"
              onClick={onCreateAccount}
              data-testid="member-create-account-button"
            >
              Create account
            </PrimaryButton>
            <SecondaryButton
              type="button"
              onClick={onExistingAccount}
              data-testid="member-existing-account-button"
            >
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
                    : "We could not create your account.",
              }))
          : await authClient.signUp
              .email({
                name: name.trim(),
                email: email.trim(),
                password,
                callbackURL: "/onboarding/member?verified=1",
              })
              .then(({ error }) => error);
        if (signUpError) {
          setError(signUpError.message ?? "We could not create your account.");
          return;
        }
        if (!isMemvellaClientTestMode()) {
          window.location.replace(
            buildVerifyEmailPath(email, "/onboarding/member"),
          );
          return;
        }
      } else {
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
                    : "Please check your email and password.",
              }))
          : await authClient.signIn
              .email({
                email: email.trim(),
                password,
              })
              .then(({ error }) => error);
        if (signInError) {
          if (isEmailNotVerifiedError(signInError)) {
            window.location.replace(
              buildVerifyEmailPath(email, "/onboarding/member"),
            );
            return;
          }
          setError(
            signInError.message ?? "Please check your email and password.",
          );
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
        <h1 className="mb-4 text-center font-family text-4xl font-extrabold tracking-tight text-text-primary md:text-5xl">
          {isCreate ? "Create your account" : "Sign in"}
        </h1>
        <p className="mx-auto max-w-sm text-center text-lg text-text-secondary">
          {isCreate
            ? `Create your account to join ${resolveCircleName(invitePreview.circleName)} as a Supporter.`
            : `Sign in to join ${resolveCircleName(invitePreview.circleName)}.`}
        </p>
      </div>

      <form onSubmit={handleSubmit} data-testid="member-auth-form">
        <FormCard className="flex flex-col space-y-6">
          {isCreate ? (
            <div className="space-y-2">
              <label
                className="font-family text-lg font-bold"
                htmlFor="member-name"
              >
                Your name
              </label>
              <TextInput
                id="member-name"
                data-testid="member-name-input"
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
            <label
              className="font-family text-lg font-bold"
              htmlFor="member-email"
            >
              Email address
            </label>
            <TextInput
              id="member-email"
              data-testid="member-email-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="hello@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              className="font-family text-lg font-bold"
              htmlFor="member-password"
            >
              Password
            </label>
            <TextInput
              id="member-password"
              data-testid="member-password-input"
              type="password"
              autoComplete={isCreate ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="........"
              required
              minLength={8}
            />
            {isCreate ? (
              <p className="px-1 text-sm text-text-secondary">
                Minimum 8 characters.
              </p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
              <p className="text-sm font-medium text-status-alert">{error}</p>
            </div>
          ) : null}

          <PrimaryButton
            type="submit"
            disabled={isSubmitting}
            data-testid="member-auth-submit-button"
          >
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
            className="text-center text-sm font-semibold text-family-primary hover:underline"
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
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-family-primary/10">
        <Loader2 className="h-10 w-10 animate-spin text-family-primary" />
      </div>
      <div>
        <h1 className="mb-3 font-family text-3xl font-extrabold tracking-tight text-text-primary md:text-4xl">
          Joining the Workspace
        </h1>
        <p className="text-lg leading-relaxed text-text-secondary">
          Adding you to{" "}
          <strong>{resolveCircleName(invitePreview.circleName)}</strong> as a
          Supporter.
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
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-family-primary/10">
        <CheckCircle2
          className="h-12 w-12 text-family-primary"
          strokeWidth={1.5}
        />
      </div>

      <div>
        <h1 className="mb-3 font-family text-4xl font-extrabold tracking-tight text-text-primary md:text-5xl">
          You&apos;ve joined the Workspace.
        </h1>
        <p className="mx-auto max-w-xs text-lg text-text-secondary">
          You can now see updates and help out.
        </p>
      </div>

      <div className="flex h-10 items-center gap-2 text-sm text-text-secondary">
        <Loader2 className="h-4 w-4 animate-spin" />
        Taking you to the Workspace...
      </div>
    </div>
  );
}

export default function MemberJoinClient() {
  const { data: session } = authClient.useSession();
  const redeemMemberInviteCode = useMutation(
    api.circleInvites.redeemMemberInviteCode,
  );

  const [invitePreview, setInvitePreview] = useState<InvitePreview | null>(
    null,
  );
  const [hasLoadedPendingInvite, setHasLoadedPendingInvite] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isAwaitingAccountSession, setIsAwaitingAccountSession] =
    useState(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoinedSuccessfully, setHasJoinedSuccessfully] = useState(false);
  const redeemInFlightRef = useRef(false);

  useEffect(() => {
    setInvitePreview(loadPendingInvitePreview());
    setHasLoadedPendingInvite(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedPendingInvite) {
      return;
    }

    savePendingInvitePreview(invitePreview);
  }, [hasLoadedPendingInvite, invitePreview]);

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
      redeemInFlightRef.current ||
      hasJoinedSuccessfully ||
      joinError ||
      isSwitchingAccount
    ) {
      return;
    }

    let isCancelled = false;

    const redeemInvite = async () => {
      redeemInFlightRef.current = true;
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
            : "We could not join that Workspace right now.",
        );
      } finally {
        redeemInFlightRef.current = false;
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

  if (!hasLoadedPendingInvite) {
    return <MemberJoinFallback />;
  }

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

      {!hasJoinedSuccessfully &&
      !showJoiningState &&
      invitePreview !== null &&
      authMode === null ? (
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

      {!hasJoinedSuccessfully &&
      !showJoiningState &&
      invitePreview !== null &&
      authMode !== null ? (
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
