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
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-800">
              {isOrganiser ? "Organiser profile" : "Member profile"}
            </p>
            <h1 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-gray-900">
              My Account
            </h1>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
              Display name
            </p>
            <p className="mt-2 text-lg font-bold text-gray-900">{organiserName}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
              Email
            </p>
            <p className="mt-2 text-lg font-bold text-gray-900">
              {session?.user?.email ?? "No email available"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
              Role
            </p>
            <p className="mt-2 text-lg font-bold text-gray-900">
              {isOrganiser ? "Organiser" : role === "member" ? "Member" : "Family account"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
              Circle
            </p>
            <p className="mt-2 text-lg font-bold text-gray-900">
              {seniorDisplayName}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Senior mode: {profile?.seniorMode ?? "not linked yet"}
            </p>
          </div>
        </div>
      </section>

      {isOrganiser ? (
        <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-800">
            <Shield className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-headline text-2xl font-bold text-gray-900">
              Tablet access
            </h2>
            <p className="mt-2 text-base leading-relaxed text-gray-600">
              Review the active Tablet User device sessions tied to this Circle and revoke them if a device should no longer stay signed in.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {isLoadingSessions ? (
            <div className="flex items-center justify-center rounded-2xl bg-slate-50 px-4 py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
            </div>
          ) : resolvedAssistedSessions.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm font-medium text-slate-600">
              No active Tablet User device sessions are connected right now.
            </div>
          ) : (
            resolvedAssistedSessions.map(
              (sessionItem: (typeof resolvedAssistedSessions)[number]) => (
                <div
                  key={sessionItem.id}
                  className="rounded-2xl border border-gray-100 bg-slate-50 px-4 py-4"
                >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-purple-800 shadow-sm">
                    <Smartphone className="h-5 w-5" />
                  </div>
                    <div>
                      <p className="text-base font-bold text-gray-900">
                        Tablet User device
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
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
          className="mt-5 inline-flex min-h-[56px] items-center justify-center rounded-full bg-slate-900 px-5 text-base font-semibold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Revoke all tablet sessions
        </button>
        </section>
      ) : null}

      {isIndependentRecoveryMode ? (
        <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1D4ED8]">
              <KeyRound className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-headline text-2xl font-bold text-gray-900">
                Independent access help
              </h2>
              <p className="mt-2 text-base leading-relaxed text-gray-600">
                Help {seniorDisplayName} recover access explicitly. These actions do not sign you in as them.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-relaxed text-slate-700">
            Trusted devices: {organiserRecoveryOverview?.trustedDevices.length ?? 0}
            <br />
            Active recovery codes: {organiserRecoveryOverview?.recoveryCodes.activeCount ?? 0}
          </div>

          <div className="mt-5 space-y-3">
            {organiserRecoveryOverview === undefined ? (
              <div className="flex items-center justify-center rounded-2xl bg-slate-50 px-4 py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
              </div>
            ) : resolvedTrustedDevices.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm font-medium text-slate-600">
                No trusted devices are active right now.
              </div>
            ) : (
              resolvedTrustedDevices.map((device) => (
                <div
                  key={device.id}
                  className="rounded-2xl border border-gray-100 bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-bold text-gray-900">
                        {device.backedUp || device.deviceType === "multiDevice"
                          ? "Synced trusted device"
                          : "Trusted device"}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Last used {formatDateTime(device.lastUsedAt ?? device.createdAt)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        void handleRevokeTrustedDevice(device.id);
                      }}
                      className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-red-200 bg-white px-4 text-sm font-semibold text-red-600"
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
              className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-[#1D4ED8] px-5 text-base font-semibold text-white transition-transform active:scale-95"
            >
              Create fresh recovery codes
            </button>
            <button
              type="button"
              onClick={() => {
                void handleRevokeAllTrustedDevices();
              }}
              className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-slate-900 px-5 text-base font-semibold text-white transition-transform active:scale-95"
            >
              Revoke all trusted devices
            </button>
          </div>

          {generatedRecoveryCodes ? (
            <div className="mt-5 rounded-3xl border border-[#1D4ED8]/10 bg-blue-50/60 p-5">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#1D4ED8]">
                Share directly with {seniorDisplayName}
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {generatedRecoveryCodes.map((code) => (
                  <div
                    key={code}
                    className="rounded-2xl bg-white px-4 py-4 text-center text-lg font-bold tracking-[0.12em] text-slate-900 shadow-sm"
                  >
                    {code}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                These codes are shown once. The older set no longer works.
              </p>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
