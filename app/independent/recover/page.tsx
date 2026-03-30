"use client";

import { useEffect, useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { FormCard } from "@/components/ui/FormCard";
import { TextInput } from "@/components/ui/Input";
import { authClient } from "@/lib/auth-client";
import { getDeviceFingerprint } from "@/lib/device-fingerprint";
import {
  clearSeniorSession,
  type SeniorRecoveryHint,
  loadSeniorRecoveryHint,
  saveSeniorRecoveryHint,
  saveSeniorSession,
} from "@/lib/senior-session-client";

export default function IndependentRecoveryPage() {
  const router = useRouter();
  const [recoveryHint, setRecoveryHint] = useState<SeniorRecoveryHint | null>(null);
  const [email, setEmail] = useState("");
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [isUsingPasskey, setIsUsingPasskey] = useState(false);

  useEffect(() => {
    clearSeniorSession("independent");
    const nextRecoveryHint = loadSeniorRecoveryHint("independent");
    setRecoveryHint(nextRecoveryHint);
    setEmail(nextRecoveryHint?.recoveryEmail ?? "");
    void getDeviceFingerprint("independent").then(setDeviceFingerprint);
  }, []);

  const handleSendLink = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsSendingLink(true);
    setError(null);

    try {
      localStorage.setItem("memvella_pending_independent_email", email.trim().toLowerCase());
      const callbackURL = `${window.location.origin}/onboarding/independent/verify`;
      const result = await authClient.signIn.magicLink({
        email: email.trim().toLowerCase(),
        callbackURL,
        newUserCallbackURL: callbackURL,
        errorCallbackURL: `${window.location.origin}/independent/recover?error=magic-link`,
      });

      if (result.error) {
        throw new Error(
          result.error.message ??
            "Memvella could not send your secure sign-in link.",
        );
      }

      const nextRecoveryHint = {
        ...recoveryHint,
        recoveryEmail: email.trim().toLowerCase(),
      };
      saveSeniorRecoveryHint("independent", nextRecoveryHint);
      setRecoveryHint(nextRecoveryHint);
      router.replace("/onboarding/independent?reason=session-expired");
    } catch (sendLinkError) {
      console.error(sendLinkError);
      setError(
        sendLinkError instanceof Error
          ? sendLinkError.message
          : "Memvella could not send your secure sign-in link.",
      );
    } finally {
      setIsSendingLink(false);
    }
  };

  const handlePasskeyRecovery = async () => {
    if (!recoveryHint?.seniorProfileId || !deviceFingerprint) {
      return;
    }

    setIsUsingPasskey(true);
    setError(null);

    try {
      const optionsResponse = await fetch(
        "/api/independent/passkey/authenticate/options",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ seniorProfileId: recoveryHint.seniorProfileId }),
        },
      );
      const optionsPayload = (await optionsResponse.json()) as {
        error?: string;
        optionsJSON?: Parameters<typeof startAuthentication>[0]["optionsJSON"];
      };

      if (!optionsResponse.ok || !optionsPayload.optionsJSON) {
        throw new Error(
          optionsPayload.error ?? "Unable to prepare Face ID / Touch ID sign-in.",
        );
      }

      const responseJSON = await startAuthentication({
        optionsJSON: optionsPayload.optionsJSON,
      });

      const verifyResponse = await fetch(
        "/api/independent/passkey/authenticate/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seniorProfileId: recoveryHint.seniorProfileId,
            deviceFingerprint,
            responseJSON,
          }),
        },
      );
      const verifyPayload = (await verifyResponse.json()) as {
        error?: string;
        sessionToken?: string;
        seniorProfileId?: string;
        seniorName?: string;
      };

      if (!verifyResponse.ok || !verifyPayload.sessionToken) {
        throw new Error(
          verifyPayload.error ?? "Unable to finish Face ID / Touch ID sign-in.",
        );
      }

      saveSeniorSession("independent", {
        sessionToken: verifyPayload.sessionToken,
        seniorProfileId: verifyPayload.seniorProfileId,
        seniorName: verifyPayload.seniorName,
        recoveryEmail: recoveryHint.recoveryEmail ?? email.trim().toLowerCase(),
        hasPasskey: true,
      });
      const nextRecoveryHint = {
        seniorProfileId: verifyPayload.seniorProfileId,
        seniorName: verifyPayload.seniorName,
        recoveryEmail: recoveryHint.recoveryEmail ?? email.trim().toLowerCase(),
        hasPasskey: true,
      };
      saveSeniorRecoveryHint("independent", nextRecoveryHint);
      setRecoveryHint(nextRecoveryHint);

      router.replace("/independent");
    } catch (passkeyError) {
      console.error(passkeyError);
      setError(
        passkeyError instanceof Error
          ? passkeyError.message
          : "Unable to finish Face ID / Touch ID sign-in.",
      );
    } finally {
      setIsUsingPasskey(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-surface p-6 md:p-12">
      <FormCard className="flex w-full max-w-xl flex-col gap-6 p-8 md:p-10">
        <h1 className="text-center text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a]">
          Restore Independent Senior access
        </h1>
        <p className="text-center text-lg leading-relaxed text-on-surface-variant">
          Reopen your FamilySpace with a secure sign-in link or Face ID / Touch ID.
        </p>

        {recoveryHint?.hasPasskey && recoveryHint.seniorProfileId ? (
          <PrimaryButton
            type="button"
            onClick={handlePasskeyRecovery}
            disabled={isUsingPasskey || !deviceFingerprint}
            className="justify-center"
          >
            {isUsingPasskey ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Checking Face ID / Touch ID...
              </>
            ) : (
              "Use Face ID / Touch ID"
            )}
          </PrimaryButton>
        ) : null}

        <div className="space-y-3">
          <label className="font-headline text-lg font-bold" htmlFor="recovery_email">
            Email Address
          </label>
          <TextInput
            id="recovery_email"
            type="email"
            placeholder="hello@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : null}

        <SecondaryButton
          type="button"
          onClick={handleSendLink}
          disabled={isSendingLink}
          className="justify-center"
        >
          {isSendingLink ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Sending secure link...
            </>
          ) : (
            "Send secure link"
          )}
        </SecondaryButton>

        <p className="text-center text-base leading-relaxed text-on-surface-variant">
          In local development, Memvella writes the secure sign-in link to server
          logs when email delivery has not been configured yet.
        </p>
      </FormCard>
    </main>
  );
}
