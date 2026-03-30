"use client";

import { useEffect, useRef, useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { FormCard } from "@/components/ui/FormCard";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { getDeviceFingerprint } from "@/lib/device-fingerprint";
import {
  saveSeniorRecoveryHint,
  saveSeniorSession,
} from "@/lib/senior-session-client";

const pendingNameStorageKey = "memvella_pending_independent_name";
const pendingEmailStorageKey = "memvella_pending_independent_email";

type FinalizedSession = {
  sessionToken: string;
  seniorProfileId: string;
  seniorName: string;
  recoveryEmail: string | null;
  hasPasskey: boolean;
};

type PasskeyErrorLike = Error & {
  code?: string;
  cause?: unknown;
};

async function quietlySignOutIndependentBootstrapSession() {
  try {
    await authClient.signOut();
  } catch (error) {
    console.warn("Better Auth sign-out after bootstrap failed:", error);
  }
}

function shouldSkipPasskeyEnrollment(error: unknown) {
  const passkeyError = error as PasskeyErrorLike;
  const nestedCause =
    typeof passkeyError === "object" && passkeyError !== null
      ? passkeyError.cause
      : null;
  const names = new Set(
    [passkeyError, nestedCause]
      .filter((value): value is Error => value instanceof Error)
      .map((value) => value.name),
  );

  return (
    passkeyError.code === "ERROR_CEREMONY_ABORTED" ||
    passkeyError.code === "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY" ||
    names.has("AbortError") ||
    names.has("NotAllowedError") ||
    names.has("NotSupportedError") ||
    names.has("SecurityError")
  );
}

export default function IndependentVerifyPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const finalizeMagicLinkSignIn = useMutation(
    api.independentAuth.finalizeMagicLinkSignIn,
  );

  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isEnrollingPasskey, setIsEnrollingPasskey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleCollisionMessage, setRoleCollisionMessage] = useState<string | null>(
    null,
  );
  const [finalizedSession, setFinalizedSession] =
    useState<FinalizedSession | null>(null);

  const hasStartedFinalizationRef = useRef(false);

  useEffect(() => {
    void getDeviceFingerprint("independent").then(setDeviceFingerprint);
  }, []);

  useEffect(() => {
    if (
      isSessionPending ||
      !session ||
      !deviceFingerprint ||
      hasStartedFinalizationRef.current
    ) {
      return;
    }

    hasStartedFinalizationRef.current = true;
    setIsFinalizing(true);
    setError(null);
    setRoleCollisionMessage(null);

    const pendingName = localStorage.getItem(pendingNameStorageKey)?.trim() ?? "";
    const recoveryEmail =
      localStorage.getItem(pendingEmailStorageKey)?.trim().toLowerCase() ??
      session.user.email ??
      null;

    void finalizeMagicLinkSignIn({
      displayName: pendingName || session.user.name || undefined,
      deviceFingerprint,
    })
      .then(async (result) => {
        if (result.status === "role_collision") {
          localStorage.removeItem(pendingNameStorageKey);
          localStorage.removeItem(pendingEmailStorageKey);
          await quietlySignOutIndependentBootstrapSession();
          setRoleCollisionMessage(result.message);
          return;
        }

        const nextSession = {
          sessionToken: result.sessionToken,
          seniorProfileId: result.seniorProfileId,
          seniorName: result.seniorName,
          recoveryEmail,
          hasPasskey: result.hasPasskey,
        };

        saveSeniorSession("independent", nextSession);
        saveSeniorRecoveryHint("independent", {
          seniorProfileId: result.seniorProfileId,
          seniorName: result.seniorName,
          recoveryEmail,
          hasPasskey: result.hasPasskey,
        });

        localStorage.removeItem(pendingNameStorageKey);
        localStorage.removeItem(pendingEmailStorageKey);
        setFinalizedSession(nextSession);

        if (result.hasPasskey) {
          await quietlySignOutIndependentBootstrapSession();
          router.replace("/independent");
        }
      })
      .catch((finalizationError) => {
        console.error(finalizationError);
        setError("Memvella could not finish your secure sign-in.");
        hasStartedFinalizationRef.current = false;
      })
      .finally(() => {
        setIsFinalizing(false);
      });
  }, [
    deviceFingerprint,
    finalizeMagicLinkSignIn,
    isSessionPending,
    router,
    session,
  ]);

  const handleEnablePasskey = async () => {
    if (!finalizedSession) {
      return;
    }

    setIsEnrollingPasskey(true);
    setError(null);

    try {
      const optionsResponse = await fetch(
        "/api/independent/passkey/register/options",
        {
          method: "POST",
        },
      );
      const optionsPayload = (await optionsResponse.json()) as {
        error?: string;
        optionsJSON?: Parameters<typeof startRegistration>[0]["optionsJSON"];
      };

      if (!optionsResponse.ok || !optionsPayload.optionsJSON) {
        throw new Error(
          optionsPayload.error ?? "Unable to start Face ID / Touch ID setup.",
        );
      }

      const responseJSON = await startRegistration({
        optionsJSON: optionsPayload.optionsJSON,
      });

      const verifyResponse = await fetch("/api/independent/passkey/register/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ responseJSON }),
      });
      const verifyPayload = (await verifyResponse.json()) as { error?: string };

      if (!verifyResponse.ok) {
        throw new Error(
          verifyPayload.error ?? "Unable to finish Face ID / Touch ID setup.",
        );
      }

      saveSeniorRecoveryHint("independent", {
        seniorProfileId: finalizedSession.seniorProfileId,
        seniorName: finalizedSession.seniorName,
        recoveryEmail: finalizedSession.recoveryEmail,
        hasPasskey: true,
      });
      saveSeniorSession("independent", {
        ...finalizedSession,
        hasPasskey: true,
      });

      await quietlySignOutIndependentBootstrapSession();
      router.replace("/independent");
    } catch (passkeyError) {
      if (shouldSkipPasskeyEnrollment(passkeyError)) {
        await quietlySignOutIndependentBootstrapSession();
        router.replace("/independent");
        return;
      }

      console.error(passkeyError);
      setError(
        passkeyError instanceof Error
          ? passkeyError.message
          : "Memvella could not finish Face ID / Touch ID setup.",
      );
    } finally {
      setIsEnrollingPasskey(false);
    }
  };

  const handleSkipPasskey = async () => {
    await quietlySignOutIndependentBootstrapSession();
    router.replace("/independent");
  };

  const handleUseDifferentEmail = async () => {
    localStorage.removeItem(pendingNameStorageKey);
    localStorage.removeItem(pendingEmailStorageKey);
    await quietlySignOutIndependentBootstrapSession();
    hasStartedFinalizationRef.current = false;
    router.replace("/onboarding/independent");
  };

  if (roleCollisionMessage) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-surface p-6 md:p-12">
        <FormCard className="flex w-full max-w-xl flex-col gap-6 p-8 text-center md:p-10">
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
            Use a Different Email
          </h1>
          <p className="text-lg leading-relaxed text-on-surface-variant">
            {roleCollisionMessage}
          </p>
          <SecondaryButton
            type="button"
            onClick={() => {
              void handleUseDifferentEmail();
            }}
            className="justify-center"
          >
            Try another email
          </SecondaryButton>
        </FormCard>
      </main>
    );
  }

  if (isSessionPending || isFinalizing || !deviceFingerprint || !finalizedSession) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-surface p-6">
        <FormCard className="flex w-full max-w-xl flex-col items-center gap-6 p-10 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#6B21A8]/20 border-t-[#6B21A8]" />
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">
            Preparing your secure session
          </h1>
          <p className="text-lg leading-relaxed text-on-surface-variant">
            Memvella is connecting this Independent Senior account to your FamilySpace.
          </p>
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
              {error}
            </div>
          ) : null}
        </FormCard>
      </main>
    );
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-surface p-6 md:p-12">
      <FormCard className="flex w-full max-w-xl flex-col gap-6 p-8 text-center md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a]">
          Enable Faster Access
        </h1>
        <p className="text-lg leading-relaxed text-on-surface-variant">
          Face ID or Touch ID lets {finalizedSession.seniorName} reopen Memvella on
          this device without waiting for another sign-in link.
        </p>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : null}

        <PrimaryButton
          type="button"
          onClick={handleEnablePasskey}
          disabled={isEnrollingPasskey}
          className="justify-center"
        >
          {isEnrollingPasskey ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Enabling Face ID / Touch ID...
            </>
          ) : (
            "Enable Face ID / Touch ID"
          )}
        </PrimaryButton>

        <SecondaryButton
          type="button"
          onClick={handleSkipPasskey}
          className="justify-center"
        >
          Skip for now
        </SecondaryButton>
      </FormCard>
    </main>
  );
}
