"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Shield, Smartphone, User } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@memvella/backend";
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
  const [isSigningOut, setIsSigningOut] = useState(false);
  const assistedSessions = useQuery(
    api.sessions.listAssistedDeviceSessions,
    isOrganiser ? undefined : "skip",
  );
  const revokeAllAssistedDeviceSessions = useMutation(
    api.sessions.revokeAllAssistedDeviceSessions,
  );

  const isLoadingSessions = isOrganiser && assistedSessions === undefined;
  const resolvedAssistedSessions = assistedSessions ?? [];

  const handleRevokeAll = async () => {
    try {
      const result = await revokeAllAssistedDeviceSessions({});
      toast({
        tone: "success",
        title: "Companion tablet access updated",
        description:
          result.revokedCount > 0
            ? `${result.revokedCount} companion tablet session${result.revokedCount === 1 ? "" : "s"} were revoked.`
            : "No active companion tablet sessions were found.",
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Companion tablet access did not update",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    localStorage.removeItem("memvella_pendingSeniorDisplayName");
    const result = await authClient.signOut();
    if (result.error) {
      setIsSigningOut(false);
      toast({
        tone: "error",
        title: "Sign out failed",
        description: result.error.message ?? "Please try again.",
      });
      return;
    }

    window.location.replace("/organiser/signin");
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
              {isOrganiser ? "Workspace owner profile" : "Supporter profile"}
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
              {isOrganiser ? "Workspace owner" : role === "member" ? "Supporter" : "Account"}
            </p>
          </div>
          <div className="rounded-xl bg-surface-muted px-4 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-text-tertiary">
              Workspace
            </p>
            <p className="mt-2 text-lg font-bold text-text-primary">
              {seniorDisplayName}
            </p>
            {profile ? null : (
              <p className="mt-1 text-sm text-text-secondary">
                Senior profile is still being prepared.
              </p>
            )}
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
              Review the active companion tablet sessions tied to this Workspace and revoke them if a device should no longer stay connected.
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
              No active companion tablet sessions are connected right now.
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
                        Companion tablet
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

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="font-family text-lg font-bold text-text-primary">
          Account session
        </h2>
        <p className="mt-2 text-base leading-relaxed text-text-secondary">
          Sign out of this account on this device.
        </p>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={isSigningOut}
          className="mt-5 inline-flex min-h-[56px] items-center justify-center rounded-full bg-surface-inverse px-5 text-base font-semibold text-white disabled:opacity-60"
          data-testid="family-account-signout-button"
        >
          {isSigningOut ? "Signing out..." : "Sign out"}
        </button>
      </section>
    </div>
  );
}
