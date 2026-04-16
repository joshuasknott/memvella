"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, KeyRound, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@memvella/ui";
import { FormCard } from "@/components/ui/FormCard";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { registerIndependentPasskey } from "@/lib/independent-passkey-client";
import { useSeniorDashboardSession } from "@/lib/use-senior-dashboard-session";

function formatDateTime(timestamp: number | null) {
  if (!timestamp) {
    return "Not used yet";
  }

  return new Date(timestamp).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function describeTrustedDevice(device: {
  deviceType: string;
  backedUp: boolean;
  isCurrentDevice: boolean;
}) {
  if (device.isCurrentDevice) {
    return "This device";
  }

  return device.backedUp || device.deviceType === "multiDevice"
    ? "Synced device"
    : "Saved device";
}

export default function IndependentSecurityPage() {
  const { toast } = useToast();
  const { sessionState, deviceFingerprint } = useSeniorDashboardSession("independent");
  const securityOverview = useQuery(
    api.independentAccess.getIndependentSecurityOverview,
    sessionState?.sessionToken && deviceFingerprint
      ? {
          sessionToken: sessionState.sessionToken,
          deviceFingerprint,
        }
      : "skip",
  );
  const rotateRecoveryCodes = useMutation(api.independentAccess.rotateIndependentRecoveryCodes);
  const revokeTrustedDevice = useMutation(api.independentAccess.revokeIndependentTrustedDevice);

  const [generatedRecoveryCodes, setGeneratedRecoveryCodes] = useState<string[] | null>(null);
  const [isAddingPasskey, setIsAddingPasskey] = useState(false);
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false);
  const [revokingDeviceId, setRevokingDeviceId] = useState<string | null>(null);

  if (!sessionState?.sessionToken || !deviceFingerprint) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-surface p-6 md:p-12">
        <FormCard className="w-full max-w-xl space-y-5 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
            Sign in again first
          </h1>
          <p className="text-lg leading-relaxed text-on-surface-variant">
            Open your profile with a passkey or a recovery code before changing security settings.
          </p>
          <PrimaryButton href="/independent">Back to profile</PrimaryButton>
        </FormCard>
      </main>
    );
  }

  const handleAddPasskey = async () => {
    setIsAddingPasskey(true);

    try {
      await registerIndependentPasskey({
        sessionToken: sessionState.sessionToken,
        deviceFingerprint,
      });
      toast({
        tone: "success",
        title: "Passkey added",
        description: "This device can now use a passkey to sign in.",
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Passkey not added",
        description:
          error instanceof Error ? error.message : "Please try again in a moment.",
      });
    } finally {
      setIsAddingPasskey(false);
    }
  };

  const handleGenerateCodes = async () => {
    setIsGeneratingCodes(true);

    try {
      const result = await rotateRecoveryCodes({
        sessionToken: sessionState.sessionToken,
        deviceFingerprint,
      });
      setGeneratedRecoveryCodes(result.codes);
      toast({
        tone: "success",
        title: "Recovery codes ready",
        description: "Your older recovery code set no longer works.",
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Recovery codes not created",
        description:
          error instanceof Error ? error.message : "Please try again in a moment.",
      });
    } finally {
      setIsGeneratingCodes(false);
    }
  };

  const handleRevokeDevice = async (passkeyId: Id<"independentSeniorPasskeys">) => {
    setRevokingDeviceId(passkeyId);

    try {
      await revokeTrustedDevice({
        sessionToken: sessionState.sessionToken,
        deviceFingerprint,
        passkeyId,
      });
      toast({
        tone: "success",
        title: "Trusted device removed",
        description: "That device will need a recovery code or a fresh passkey next time.",
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Trusted device not removed",
        description:
          error instanceof Error ? error.message : "Please try again in a moment.",
      });
    } finally {
      setRevokingDeviceId(null);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-surface px-6 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/independent"
            className="flex items-center gap-2 font-semibold text-family-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-family-primary/70">
            Security
          </p>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
            Security settings
          </h1>
          <p className="mt-2 text-lg leading-relaxed text-on-surface-variant">
            Manage trusted devices, recovery codes, and help options for {securityOverview?.seniorName ?? "your profile"}.
          </p>
        </div>

        <FormCard className="space-y-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-family-primary/10 text-family-primary">
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-headline text-2xl font-bold text-gray-900">
                Trusted devices
              </h2>
              <p className="mt-2 text-base leading-relaxed text-gray-600">
                Add a passkey on this device or remove devices you no longer trust.
              </p>
            </div>
          </div>

          <PrimaryButton
            type="button"
            onClick={() => {
              void handleAddPasskey();
            }}
            disabled={isAddingPasskey}
            className="justify-center"
          >
            {isAddingPasskey ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating passkey...
              </>
            ) : (
              "Add a passkey on this device"
            )}
          </PrimaryButton>

          <div className="space-y-3">
            {securityOverview === undefined ? (
              <div className="flex items-center justify-center rounded-2xl bg-surface-muted px-4 py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
              </div>
            ) : securityOverview.trustedDevices.length === 0 ? (
              <div className="rounded-2xl bg-surface-muted px-4 py-4 text-sm font-medium text-text-secondary">
                No trusted devices are saved right now.
              </div>
            ) : (
              securityOverview.trustedDevices.map((device) => (
                <div
                  key={device.id}
                  className="rounded-2xl border border-gray-100 bg-surface-muted px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-bold text-gray-900">
                        {describeTrustedDevice(device)}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Last used {formatDateTime(device.lastUsedAt)}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {device.backedUp
                          ? "This passkey can be available on another device you trust."
                          : "This passkey stays only on the device where it was created."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        void handleRevokeDevice(device.id);
                      }}
                      disabled={revokingDeviceId === device.id}
                      className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 disabled:opacity-60"
                    >
                      {revokingDeviceId === device.id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </FormCard>

        <FormCard className="space-y-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-family-accent/10 text-family-accent">
              <KeyRound className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-headline text-2xl font-bold text-gray-900">
                Recovery codes
              </h2>
              <p className="mt-2 text-base leading-relaxed text-gray-600">
                Keep a written set of codes somewhere safe in case you cannot use a trusted device.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-muted px-4 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-text-tertiary">
              Active codes
            </p>
            <p className="mt-2 text-lg font-bold text-gray-900">
              {securityOverview?.recoveryCodes.activeCount ?? 0}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {securityOverview?.recoveryCodes.lastGeneratedAt
                ? `Last created ${formatDateTime(securityOverview.recoveryCodes.lastGeneratedAt)}`
                : "No recovery codes have been created yet."}
            </p>
          </div>

          <PrimaryButton
            type="button"
            onClick={() => {
              void handleGenerateCodes();
            }}
            disabled={isGeneratingCodes}
            className="justify-center"
          >
            {isGeneratingCodes ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating recovery codes...
              </>
            ) : (
              "Create new recovery codes"
            )}
          </PrimaryButton>

          {generatedRecoveryCodes ? (
            <div className="rounded-3xl border border-family-accent/10 bg-family-accent/10 p-5">
              <div className="mb-3 flex items-center gap-2 text-family-accent">
                <ShieldCheck className="h-5 w-5" />
                <p className="text-sm font-bold uppercase tracking-[0.2em]">Shown once</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {generatedRecoveryCodes.map((code) => (
                  <div
                    key={code}
                    className="rounded-2xl bg-white px-4 py-4 text-center text-lg font-bold tracking-[0.12em] text-text-primary shadow-sm"
                  >
                    {code}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                Store these somewhere safe. Your older recovery code set no longer works.
              </p>
            </div>
          ) : null}
        </FormCard>

        <FormCard className="space-y-4">
          <h2 className="font-headline text-2xl font-bold text-gray-900">Recovery help</h2>
          <p className="text-base leading-relaxed text-gray-600">
            If you lose a device, use a recovery code on a new one or ask your Organiser for help revoking lost access and creating a fresh recovery code set.
          </p>
          <SecondaryButton href="/independent/recover" className="justify-center">
            Open recovery screen
          </SecondaryButton>
        </FormCard>
      </div>
    </main>
  );
}
