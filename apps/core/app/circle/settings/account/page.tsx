"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { KeyRound, Loader2, Shield, Smartphone, User } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { useCircleProfile } from "@/lib/use-circle-profile";

function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AccountSettingsPage() {
  const { data: session } = authClient.useSession();
  const { toast } = useToast();
  const { organiserName, seniorDisplayName, profile, isOrganiser, role } =
    useCircleProfile();
  const [generatedRecoveryCodes, setGeneratedRecoveryCodes] = useState<string[] | null>(null);
  const assistedSessions = useQuery(
    api.sessions.listAssistedDeviceSessions,
    isOrganiser ? undefined : "skip",
  );
  const organiserRecoveryOverview = useQuery(
    api.independentAccess.getOrganiserIndependentRecoveryOverview,
    isOrganiser && profile?.seniorMode === "independent" ? {} : "skip",
  );
  const revokeAllAssistedDeviceSessions = useMutation(
    api.sessions.revokeAllAssistedDeviceSessions,
  );
  const revokeTrustedDevice = useMutation(
    api.independentAccess.revokeIndependentTrustedDeviceForOrganiser,
  );
  const revokeAllTrustedDevices = useMutation(
    api.independentAccess.revokeAllIndependentTrustedDevicesForOrganiser,
  );
  const rotateRecoveryCodes = useMutation(
    api.independentAccess.rotateIndependentRecoveryCodesForOrganiser,
  );

  const isLoadingSessions = isOrganiser && assistedSessions === undefined;
  const resolvedAssistedSessions = assistedSessions ?? [];
  const isIndependentRecoveryMode = isOrganiser && profile?.seniorMode === "independent";
  const resolvedTrustedDevices = organiserRecoveryOverview?.trustedDevices ?? [];

  const handleRevokeAll = async () => {
    try {
      const result = await revokeAllAssistedDeviceSessions({});
      toast({
        tone: "success",
        title: "Assisted device access updated",
        description:
          result.revokedCount > 0
            ? `${result.revokedCount} Tablet User device session${result.revokedCount === 1 ? "" : "s"} were revoked.`
            : "No active Tablet User device sessions were found.",
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Assisted device access did not update",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
    }
  };

  const handleRevokeTrustedDevice = async (passkeyId: (typeof resolvedTrustedDevices)[number]["id"]) => {
    try {
      await revokeTrustedDevice({ passkeyId });
      toast({
        tone: "success",
        title: "Trusted device removed",
        description: "That device will need recovery help before it can sign in again.",
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Trusted device not removed",
        description:
          error instanceof Error ? error.message : "Please try again in a moment.",
      });
    }
  };

  const handleRevokeAllTrustedDevices = async () => {
    try {
      const result = await revokeAllTrustedDevices({});
      toast({
        tone: "success",
        title: "Independent access updated",
        description:
          result.revokedCount > 0
            ? `${result.revokedCount} trusted device${result.revokedCount === 1 ? "" : "s"} were removed.`
            : "No trusted devices were active.",
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Independent access did not update",
        description:
          error instanceof Error ? error.message : "Please try again in a moment.",
      });
    }
  };

  const handleRotateRecoveryCodes = async () => {
    try {
      const result = await rotateRecoveryCodes({});
      setGeneratedRecoveryCodes(result.codes);
      toast({
        tone: "success",
        title: "New recovery codes ready",
        description: "The older recovery code set no longer works.",
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Recovery codes not created",
        description:
          error instanceof Error ? error.message : "Please try again in a moment.",
      });
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 px-4 pb-8">
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface-muted">
            <User className="h-8 w-8 text-text-secondary" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-family-accent">
              {isOrganiser ? "Organiser profile" : "Member profile"}
            </p>
            <h1 className="mt-2 font-family text-3xl font-extrabold tracking-tight text-text-primary">
              My Account
            </h1>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-surface-muted px-4 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-text-tertiary">
              Display name
            </p>
            <p className="mt-2 text-lg font-bold text-text-primary">{organiserName}</p>
          </div>
          <div className="rounded-xl bg-surface-muted px-4 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-text-tertiary">
              Email
            </p>
            <p className="mt-2 text-lg font-bold text-text-primary">
              {session?.user?.email ?? "No email available"}
            </p>
          </div>
          <div className="rounded-xl bg-surface-muted px-4 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-text-tertiary">
              Role
            </p>
            <p className="mt-2 text-lg font-bold text-text-primary">
              {isOrganiser ? "Organiser" : role === "member" ? "Member" : "Family account"}
            </p>
          </div>
          <div className="rounded-xl bg-surface-muted px-4 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-text-tertiary">
              Circle
            </p>
            <p className="mt-2 text-lg font-bold text-text-primary">
              {seniorDisplayName}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Senior mode: {profile?.seniorMode ?? "not linked yet"}
            </p>
          </div>
        </div>
      </section>

      {isOrganiser ? (
        <section className="rounded-xl border border-family-primary/15 bg-surface p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-family-primary/10 text-family-primary">
            <Shield className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-family text-lg font-bold text-text-primary">
              Tablet access
            </h2>
            <p className="mt-2 text-base leading-relaxed text-text-secondary">
              Review the active Tablet User device sessions tied to this Circle and revoke them if a device should no longer stay signed in.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {isLoadingSessions ? (
            <div className="flex items-center justify-center rounded-xl bg-surface-muted px-4 py-6">
              <Loader2 className="h-5 w-5 animate-spin text-family-primary/50" />
            </div>
          ) : resolvedAssistedSessions.length === 0 ? (
            <div className="rounded-xl bg-surface-muted px-4 py-4 text-sm font-medium text-text-secondary">
              No active Tablet User device sessions are connected right now.
            </div>
          ) : (
            resolvedAssistedSessions.map(
              (sessionItem: (typeof resolvedAssistedSessions)[number]) => (
                <div
                  key={sessionItem.id}
                  className="rounded-xl border border-border bg-surface-muted px-4 py-4"
                >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-family-primary shadow-sm">
                    <Smartphone className="h-5 w-5" />
                  </div>
                    <div>
                      <p className="text-base font-bold text-text-primary">
                        Tablet User device
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        Last active {formatDateTime(sessionItem.lastValidatedAt)}
                    </p>
                  </div>
                </div>
                </div>
              ),
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            void handleRevokeAll();
          }}
          disabled={isLoadingSessions || resolvedAssistedSessions.length === 0}
          className="mt-5 inline-flex min-h-[56px] items-center justify-center rounded-full bg-surface-inverse px-5 text-base font-semibold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Revoke all tablet sessions
        </button>
        </section>
      ) : null}

      {isIndependentRecoveryMode ? (
        <section className="rounded-xl border border-family-accent/15 bg-surface p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-family-accent/10 text-family-accent">
              <KeyRound className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-family text-lg font-bold text-text-primary">
                Independent access help
              </h2>
              <p className="mt-2 text-base leading-relaxed text-text-secondary">
                Help {seniorDisplayName} recover access explicitly. These actions do not sign you in as them.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-surface-muted px-4 py-4 text-sm leading-relaxed text-text-secondary">
            Trusted devices: {organiserRecoveryOverview?.trustedDevices.length ?? 0}
            <br />
            Active recovery codes: {organiserRecoveryOverview?.recoveryCodes.activeCount ?? 0}
          </div>

          <div className="mt-5 space-y-3">
            {organiserRecoveryOverview === undefined ? (
              <div className="flex items-center justify-center rounded-xl bg-surface-muted px-4 py-6">
                <Loader2 className="h-5 w-5 animate-spin text-family-primary/50" />
              </div>
            ) : resolvedTrustedDevices.length === 0 ? (
              <div className="rounded-xl bg-surface-muted px-4 py-4 text-sm font-medium text-text-secondary">
                No trusted devices are active right now.
              </div>
            ) : (
              resolvedTrustedDevices.map((device) => (
                <div
                  key={device.id}
                  className="rounded-xl border border-border bg-surface-muted px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-bold text-text-primary">
                        {device.backedUp || device.deviceType === "multiDevice"
                          ? "Synced trusted device"
                          : "Trusted device"}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        Last used {formatDateTime(device.lastUsedAt ?? device.createdAt)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        void handleRevokeTrustedDevice(device.id);
                      }}
                      className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-red-200 bg-surface px-4 text-sm font-semibold text-status-alert"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                void handleRotateRecoveryCodes();
              }}
              className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-family-accent px-5 text-base font-semibold text-white transition-transform active:scale-95"
            >
              Create fresh recovery codes
            </button>
            <button
              type="button"
              onClick={() => {
                void handleRevokeAllTrustedDevices();
              }}
              className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-surface-inverse px-5 text-base font-semibold text-white transition-transform active:scale-95"
            >
              Revoke all trusted devices
            </button>
          </div>

          {generatedRecoveryCodes ? (
            <div className="mt-5 rounded-xl border border-family-accent/10 bg-family-accent/10 p-5">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-family-accent">
                Share directly with {seniorDisplayName}
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {generatedRecoveryCodes.map((code) => (
                  <div
                    key={code}
                    className="rounded-xl bg-surface px-4 py-4 text-center text-lg font-bold tracking-[0.12em] text-text-primary shadow-sm"
                  >
                    {code}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                These codes are shown once. The older set no longer works.
              </p>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
