"use client";

import { useMutation, useQuery } from "convex/react";
import { Loader2, Shield, Smartphone, User } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { useFamilySpaceProfile } from "@/lib/use-family-space-profile";

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
  const { supporterName, seniorDisplayName, profile } = useFamilySpaceProfile();
  const assistedSessions = useQuery(api.supporter.listAssistedDeviceSessions);
  const revokeAllAssistedDeviceSessions = useMutation(
    api.supporter.revokeAllAssistedDeviceSessions,
  );

  const isLoadingSessions = assistedSessions === undefined;

  const handleRevokeAll = async () => {
    try {
      const result = await revokeAllAssistedDeviceSessions({});
      toast({
        tone: "success",
        title: "Assisted device access updated",
        description:
          result.revokedCount > 0
            ? `${result.revokedCount} Assisted Senior device session${result.revokedCount === 1 ? "" : "s"} were revoked.`
            : "No active Assisted Senior device sessions were found.",
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

  return (
    <div className="flex w-full flex-col gap-6 px-4 pb-8">
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-800">
              Organiser profile
            </p>
            <h1 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-gray-900">
              Account
            </h1>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
              Organiser name
            </p>
            <p className="mt-2 text-lg font-bold text-gray-900">{supporterName}</p>
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

      <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-800">
            <Shield className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-headline text-2xl font-bold text-gray-900">
              Assisted device access
            </h2>
            <p className="mt-2 text-base leading-relaxed text-gray-600">
              Review the active Assisted Senior tablet sessions tied to this Circle and revoke them if a device should no longer stay signed in.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {isLoadingSessions ? (
            <div className="flex items-center justify-center rounded-2xl bg-slate-50 px-4 py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
            </div>
          ) : assistedSessions.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm font-medium text-slate-600">
              No active Assisted Senior device sessions are connected right now.
            </div>
          ) : (
            assistedSessions.map((sessionItem) => (
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
                      Assisted Senior tablet
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Last active {formatDateTime(sessionItem.lastValidatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            void handleRevokeAll();
          }}
          disabled={isLoadingSessions || (assistedSessions?.length ?? 0) === 0}
          className="mt-5 inline-flex min-h-[56px] items-center justify-center rounded-full bg-slate-900 px-5 text-base font-semibold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Revoke all Assisted device sessions
        </button>
      </section>
    </div>
  );
}
